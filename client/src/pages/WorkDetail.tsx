import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  ExternalLink,
  Copy,
  ChevronRight,
  Play,
  Pause,
  Music,
  FileText,
  Globe,
  Image as ImageIcon,
  ArrowLeft,
  Send,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const typeLabels: Record<string, string> = {
  image: "画像",
  video: "動画",
  audio: "音声",
  text: "テキスト",
  web: "Webサイト",
};

const serviceTierLabels: Record<string, { name: string; japanese: string; price: string }> = {
  tier1: { name: "Droplet", japanese: "雫", price: "¥50,000〜" },
  tier2: { name: "Ripple", japanese: "波紋", price: "¥150,000〜" },
  tier3: { name: "Stream", japanese: "水流", price: "¥300,000〜" },
  tier4: { name: "Deep", japanese: "深海", price: "¥600,000〜" },
  tier5: { name: "Genesis", japanese: "源泉", price: "¥1,000,000〜" },
};

const tierColors: Record<string, string> = {
  tier1: "bg-sky-100 text-sky-800 border-sky-200",
  tier2: "bg-teal-100 text-teal-800 border-teal-200",
  tier3: "bg-blue-100 text-blue-800 border-blue-200",
  tier4: "bg-indigo-100 text-indigo-800 border-indigo-200",
  tier5: "bg-gold/20 text-gold border-gold/30",
};

// Generate a fingerprint for anonymous likes
function getFingerprint(): string {
  let fp = localStorage.getItem("anon_fingerprint");
  if (!fp) {
    fp = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("anon_fingerprint", fp);
  }
  return fp;
}

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const workId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);
  const [localLiked, setLocalLiked] = useState<boolean | null>(null);

  const fingerprint = getFingerprint();
  const utils = trpc.useUtils();

  const { data: work, isLoading, error, refetch: refetchWork } = trpc.works.getById.useQuery(
    { id: workId },
    { enabled: workId > 0 }
  );

  const { data: likeStatus, refetch: refetchLikeStatus } = trpc.likes.check.useQuery(
    { workId, fingerprint },
    { enabled: workId > 0 }
  );

  const { data: comments, refetch: refetchComments } = trpc.comments.list.useQuery(
    { workId },
    { enabled: workId > 0 }
  );

  // Initialize local state when work data loads
  useEffect(() => {
    if (work) {
      setLocalLikeCount(work.likeCount);
    }
  }, [work]);

  useEffect(() => {
    if (likeStatus !== undefined) {
      setLocalLiked(likeStatus.liked);
    }
  }, [likeStatus]);

  const likeMutation = trpc.likes.toggle.useMutation({
    onMutate: async () => {
      // Optimistic update
      const wasLiked = localLiked;
      const prevCount = localLikeCount ?? 0;
      
      setLocalLiked(!wasLiked);
      setLocalLikeCount(wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
      
      return { wasLiked, prevCount };
    },
    onSuccess: (data) => {
      toast.success(data.liked ? "いいねしました" : "いいねを取り消しました");
      // Refetch to get accurate counts from server
      refetchWork();
      refetchLikeStatus();
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        setLocalLiked(context.wasLiked);
        setLocalLikeCount(context.prevCount);
      }
      toast.error("エラーが発生しました");
    },
  });

  const commentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      refetchWork();
      toast.success("コメントを投稿しました");
    },
    onError: (err) => {
      toast.error(err.message || "コメントの投稿に失敗しました");
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      refetchComments();
      refetchWork();
      toast.success("コメントを削除しました");
    },
    onError: (err) => {
      toast.error(err.message || "コメントの削除に失敗しました");
    },
  });

  const handleLike = () => {
    if (likeMutation.isPending) return;
    likeMutation.mutate({ workId, fingerprint: isAuthenticated ? undefined : fingerprint });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await commentMutation.mutateAsync({ workId, body: commentText.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteCommentMutation.mutateAsync({ id: commentId, workId });
  };

  const deleteWorkMutation = trpc.works.delete.useMutation({
    onSuccess: () => {
      toast.success("作品を削除しました");
      window.location.href = "/works";
    },
    onError: (err) => {
      toast.error(err.message || "削除に失敗しました");
    },
  });

  const handleDeleteWork = async () => {
    await deleteWorkMutation.mutateAsync({ id: workId });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: work?.title, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("URLをコピーしました");
    }
  };

  const copyPrompt = async () => {
    if (work?.promptText) {
      await navigator.clipboard.writeText(work.promptText);
      toast.success("プロンプトをコピーしました");
    }
  };

  // Determine displayed values (use local state for optimistic updates)
  const displayedLikeCount = localLikeCount ?? work?.likeCount ?? 0;
  const displayedLiked = localLiked ?? likeStatus?.liked ?? false;

  if (isLoading) {
    return (
      <Layout>
        <div className="section">
          <div className="container">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-muted rounded mb-4" />
              <div className="aspect-video bg-muted rounded-xl mb-8" />
              <div className="h-10 w-3/4 bg-muted rounded mb-4" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !work) {
    return (
      <Layout>
        <div className="section">
          <div className="container text-center">
            <h1 className="text-2xl font-medium mb-4">作品が見つかりません</h1>
            <Button asChild>
              <Link href="/works">作品一覧に戻る</Link>
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
          {/* Back Button */}
          <Link href="/works" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            作品一覧に戻る
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Media Display */}
              <div className="bg-card rounded-xl overflow-hidden border border-border/50 mb-6">
                {work.type === "image" && work.mediaUrl && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={work.mediaUrl}
                        alt={work.title}
                        className="w-full cursor-zoom-in"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <img src={work.mediaUrl} alt={work.title} className="w-full" />
                    </DialogContent>
                  </Dialog>
                )}

                {work.type === "video" && work.mediaUrl && (
                  <video
                    src={work.mediaUrl}
                    controls
                    className="w-full"
                    poster={work.thumbnailUrl || undefined}
                  />
                )}

                {work.type === "audio" && work.mediaUrl && (
                  <div className="p-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-[oklch(0.65_0.2_230)] flex items-center justify-center">
                        <Music className="h-16 w-16 text-white" />
                      </div>
                    </div>
                    <audio src={work.mediaUrl} controls className="w-full" />
                    
                    {/* Lyrics Toggle */}
                    {work.lyrics && (
                      <div className="mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setShowLyrics(!showLyrics)}
                          className="w-full"
                        >
                          {showLyrics ? "歌詞を隠す" : "歌詞を表示"}
                        </Button>
                        {showLyrics && (
                          <div className="mt-4 p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                            {work.lyrics}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {work.type === "text" && (
                  <div className="p-8 prose prose-sm max-w-none">
                    {work.textContent || work.description}
                  </div>
                )}

                {work.type === "web" && work.externalUrl && (
                  <div className="p-8 text-center">
                    <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">外部Webサイト</p>
                    <Button asChild>
                      <a href={work.externalUrl} target="_blank" rel="noopener noreferrer">
                        サイトを開く
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}

                {!work.mediaUrl && !work.textContent && !work.externalUrl && work.thumbnailUrl && (
                  <img src={work.thumbnailUrl} alt={work.title} className="w-full" />
                )}
              </div>

              {/* Title and Meta */}
              <div className="mb-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{typeLabels[work.type]}</Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      work.origin === "client" ? "badge-client" : "badge-personal"
                    )}
                  >
                    {work.origin === "client" ? "受注作品" : "個人作品"}
                  </Badge>
                  {work.serviceTier && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium",
                        tierColors[work.serviceTier]
                      )}
                    >
                      Tier {work.serviceTier.replace("tier", "")}: {serviceTierLabels[work.serviceTier].name}（{serviceTierLabels[work.serviceTier].japanese}）
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-medium mb-4">{work.title}</h1>

                {work.description && (
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {work.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {work.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {displayedLikeCount} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {work.commentCount} comments
                  </span>
                  <span>
                    {format(new Date(work.createdAt), "yyyy年M月d日", { locale: ja })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Button
                  variant={displayedLiked ? "default" : "outline"}
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={cn("h-4 w-4 mr-2", displayedLiked && "fill-current")} />
                  {displayedLiked ? "いいね済み" : "いいね"}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  シェア
                </Button>
                
                {/* Edit/Delete buttons for owner */}
                {user && work.owner && (user.id === work.owner.id || user.role === 'admin') && (
                  <>
                    <Button variant="outline" asChild>
                      <Link href={`/works/${workId}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        編集
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>作品を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消せません。作品とそれに関連するすべてのデータ（いいね、コメント）が完全に削除されます。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteWork}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>

              {/* Prompt Section */}
              {work.promptText && (
                <div className="bg-card rounded-xl p-6 border border-border/50 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">プロンプト</h3>
                    <Button variant="ghost" size="sm" onClick={copyPrompt}>
                      <Copy className="h-4 w-4 mr-2" />
                      コピー
                    </Button>
                  </div>
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {work.promptText}
                  </pre>
                  {work.negativePrompt && (
                    <>
                      <h4 className="font-medium mt-4 mb-2 text-sm">Negative Prompt</h4>
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {work.negativePrompt}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* Tags */}
              {work.tags && work.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-3">タグ</h3>
                  <div className="flex flex-wrap gap-2">
                    {work.tags.map((tag: any) => (
                      <Link key={tag.id} href={`/works?tag=${tag.id}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          #{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              {work.tools && work.tools.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-medium mb-3">使用ツール</h3>
                  <div className="flex flex-wrap gap-2">
                    {work.tools.map((tool: any) => (
                      <a
                        key={tool.id}
                        href={tool.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border/50 rounded-lg text-sm hover:border-primary/50 transition-colors"
                      >
                        {tool.iconUrl && (
                          <img src={tool.iconUrl} alt="" className="w-4 h-4" />
                        )}
                        {tool.name}
                        {tool.url && <ExternalLink className="h-3 w-3" />}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-medium mb-4">
                  コメント ({comments?.length || 0})
                </h3>

                {/* Comment Form */}
                {isAuthenticated ? (
                  <div className="mb-6">
                    <Textarea
                      placeholder="コメントを入力..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!commentText.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      投稿
                    </Button>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      コメントを投稿するにはログインが必要です
                    </p>
                    <Button asChild size="sm">
                      <a href={getLoginUrl()}>ログイン</a>
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar || undefined} />
                        <AvatarFallback>
                          {comment.userName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {comment.userName || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "yyyy/M/d HH:mm")}
                            </span>
                          </div>
                          {/* Delete button for comment owner or admin */}
                          {user && (user.id === comment.userId || user.role === 'admin') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>コメントを削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    この操作は取り消せません。コメントは完全に削除されます。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    削除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <p className="text-sm">{comment.body}</p>
                      </div>
                    </div>
                  ))}

                  {(!comments || comments.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      まだコメントはありません
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* CTA Cards */}
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h3 className="font-medium mb-4">次のアクション</h3>
                  <div className="space-y-3">
                    <Link href="/links" className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                        <span className="text-sm font-medium">SNSを見に行く</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                    <Link href="/contact" className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        <span className="text-sm font-medium">Nivaに依頼する</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                    <Link href="/tools" className="block">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                        <span className="text-sm font-medium">使用AIツールを見る</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Creator Info */}
                {work.owner && (
                  <div className="bg-card rounded-xl p-6 border border-border/50">
                    <h3 className="font-medium mb-4">クリエイター</h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={work.owner.avatar || undefined} />
                        <AvatarFallback>
                          {work.owner.name?.charAt(0)?.toUpperCase() || "N"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{work.owner.name || "Niva"}</p>
                        <p className="text-sm text-muted-foreground">Creator</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
