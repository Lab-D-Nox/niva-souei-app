import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, MessageCircle, Heart, Mail, AlertCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

type NotificationType = "like" | "comment" | "inquiry" | "system" | "mention";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-pink-500" />,
  comment: <MessageCircle className="h-4 w-4 text-blue-500" />,
  inquiry: <Mail className="h-4 w-4 text-green-500" />,
  system: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  mention: <MessageCircle className="h-4 w-4 text-purple-500" />,
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery(
    { limit: 20 },
    { enabled: open }
  );
  
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery();

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
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    setOpen(false);
  };

  const getNotificationLink = (notification: typeof notifications[0]): string | null => {
    if (notification.workId) {
      return `/works/${notification.workId}`;
    }
    if (notification.inquiryId) {
      return `/admin/inquiries`;
    }
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">通知</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              すべて既読
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">通知はありません</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const link = getNotificationLink(notification);
                const content = (
                  <div
                    className={`flex gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {notificationIcons[notification.type as NotificationType] || notificationIcons.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
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
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate({ id: notification.id });
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate({ id: notification.id });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );

                return link ? (
                  <Link key={notification.id} href={link}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id}>{content}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t px-4 py-2">
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setOpen(false)}>
              すべての通知を見る
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
