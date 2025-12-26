import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { WorkCard, WorkCardSkeleton } from "@/components/WorkCard";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Edit, Image, Heart, PenTool } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const { data: myWorks, isLoading: worksLoading } = trpc.user.getMyWorks.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: likedWorks, isLoading: likesLoading } = trpc.user.getLikedWorks.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("プロフィールを更新しました");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("更新に失敗しました");
    },
  });

  const handleEditStart = () => {
    setName(user?.name || "");
    setBio((user as any)?.bio || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate({ name, bio });
  };

  if (loading) {
    return (
      <Layout>
        <div className="section">
          <div className="container">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="section">
          <div className="container text-center">
            <h1 className="text-2xl font-medium mb-4">ログインが必要です</h1>
            <p className="text-muted-foreground mb-6">
              プロフィールを表示するにはログインしてください
            </p>
            <Button asChild>
              <a href={getLoginUrl()}>ログイン</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section">
        <div className="container">
          {/* Profile Header */}
          <div className="bg-card rounded-xl p-8 border border-border/50 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={(user as any).avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">名前</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="名前を入力"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">自己紹介</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="自己紹介を入力"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        保存
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-medium mb-2">{user.name || "名前未設定"}</h1>
                    <p className="text-muted-foreground mb-4">
                      {(user as any).bio || "自己紹介はまだありません"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{user.email}</span>
                      {user.role === "admin" && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEditStart}>
                      <Edit className="h-4 w-4 mr-2" />
                      プロフィールを編集
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="works">
            <TabsList className="mb-6">
              {user.role === "admin" && (
                <TabsTrigger value="works" className="gap-2">
                  <Image className="h-4 w-4" />
                  投稿した作品
                </TabsTrigger>
              )}
              <TabsTrigger value="likes" className="gap-2">
                <Heart className="h-4 w-4" />
                いいねした作品
              </TabsTrigger>
            </TabsList>

            {user.role === "admin" && (
              <TabsContent value="works">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium">投稿した作品</h2>
                  <Button onClick={() => navigate("/works/new")}>
                    <PenTool className="h-4 w-4 mr-2" />
                    新規投稿
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {worksLoading
                    ? Array.from({ length: 3 }).map((_, i) => <WorkCardSkeleton key={i} />)
                    : myWorks?.map((work: any) => (
                        <WorkCard key={work.id} work={work} />
                      ))}
                </div>

                {!worksLoading && (!myWorks || myWorks.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    まだ作品を投稿していません
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="likes">
              <h2 className="text-xl font-medium mb-6">いいねした作品</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likesLoading
                  ? Array.from({ length: 3 }).map((_, i) => <WorkCardSkeleton key={i} />)
                  : likedWorks?.map((work: any) => (
                      <WorkCard key={work.id} work={work} />
                    ))}
              </div>

              {!likesLoading && (!likedWorks || likedWorks.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  まだいいねした作品はありません
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
