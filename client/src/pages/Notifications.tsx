import { Layout } from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { 
  Bell, Check, CheckCheck, MessageCircle, Heart, Mail, 
  AlertCircle, Trash2, Settings, ArrowLeft 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { usePushNotifications } from "@/hooks/usePushNotifications";

type NotificationType = "like" | "comment" | "inquiry" | "system" | "mention";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="h-5 w-5 text-pink-500" />,
  comment: <MessageCircle className="h-5 w-5 text-blue-500" />,
  inquiry: <Mail className="h-5 w-5 text-green-500" />,
  system: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  mention: <MessageCircle className="h-5 w-5 text-purple-500" />,
};

export default function Notifications() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const { data: emailSettings } = trpc.notifications.getEmailSettings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("すべての通知を既読にしました");
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("通知を削除しました");
    },
  });

  const updateEmailSettingsMutation = trpc.notifications.updateEmailSettings.useMutation({
    onSuccess: () => {
      utils.notifications.getEmailSettings.invalidate();
      toast.success("設定を保存しました");
    },
  });

  const getNotificationLink = (notification: typeof notifications[0]): string | null => {
    if (notification.workId) {
      return `/works/${notification.workId}`;
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">ログインが必要です</h1>
            <p className="text-muted-foreground mb-6">
              通知を確認するにはログインしてください。
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>ログイン</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">通知</h1>
                <p className="text-muted-foreground text-sm">
                  {unreadNotifications.length}件の未読通知
                </p>
              </div>
            </div>
            {unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                すべて既読
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="unread">
                未読 {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-1" />
                設定
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : notifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">通知はありません</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => markAsReadMutation.mutate({ id: notification.id })}
                      onDelete={() => deleteMutation.mutate({ id: notification.id })}
                      link={getNotificationLink(notification)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Check className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">未読の通知はありません</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => markAsReadMutation.mutate({ id: notification.id })}
                      onDelete={() => deleteMutation.mutate({ id: notification.id })}
                      link={getNotificationLink(notification)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>通知設定</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Push Notifications */}
                  <PushNotificationSettings />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">メール通知</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-comment" className="flex flex-col gap-1">
                          <span>新しいコメント</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            作品にコメントがついた時
                          </span>
                        </Label>
                        <Switch
                          id="email-comment"
                          checked={emailSettings?.onNewComment ?? true}
                          onCheckedChange={(checked) =>
                            updateEmailSettingsMutation.mutate({ onNewComment: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-like" className="flex flex-col gap-1">
                          <span>新しいいいね</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            作品にいいねがついた時
                          </span>
                        </Label>
                        <Switch
                          id="email-like"
                          checked={emailSettings?.onNewLike ?? false}
                          onCheckedChange={(checked) =>
                            updateEmailSettingsMutation.mutate({ onNewLike: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-inquiry" className="flex flex-col gap-1">
                          <span>新しいお問い合わせ</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            新しい依頼が届いた時（管理者のみ）
                          </span>
                        </Label>
                        <Switch
                          id="email-inquiry"
                          checked={emailSettings?.onNewInquiry ?? true}
                          onCheckedChange={(checked) =>
                            updateEmailSettingsMutation.mutate({ onNewInquiry: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-system" className="flex flex-col gap-1">
                          <span>システム通知</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            重要なお知らせやアップデート
                          </span>
                        </Label>
                        <Switch
                          id="email-system"
                          checked={emailSettings?.onSystemUpdates ?? true}
                          onCheckedChange={(checked) =>
                            updateEmailSettingsMutation.mutate({ onSystemUpdates: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

function PushNotificationSettings() {
  const { isSupported, isSubscribed, isLoading, permission, toggle } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">プッシュ通知</h3>
        <p className="text-sm text-muted-foreground">
          お使いのブラウザはプッシュ通知に対応していません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">プッシュ通知</h3>
      <div className="flex items-center justify-between">
        <Label htmlFor="push-notifications" className="flex flex-col gap-1">
          <span>ブラウザ通知</span>
          <span className="text-xs text-muted-foreground font-normal">
            {permission === 'denied' 
              ? '通知がブロックされています。ブラウザの設定から許可してください。'
              : '新しい通知をブラウザで受け取る'}
          </span>
        </Label>
        <Switch
          id="push-notifications"
          checked={isSubscribed}
          onCheckedChange={toggle}
          disabled={isLoading || permission === 'denied'}
        />
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
  };
  onMarkAsRead: () => void;
  onDelete: () => void;
  link: string | null;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, link }: NotificationItemProps) {
  const content = (
    <Card className={`transition-colors ${!notification.isRead ? "bg-primary/5 border-primary/20" : ""}`}>
      <CardContent className="flex gap-4 p-4">
        <div className="flex-shrink-0 mt-1">
          {notificationIcons[notification.type as NotificationType] || notificationIcons.system}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${!notification.isRead ? "font-medium" : ""}`}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-start gap-1">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead();
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
