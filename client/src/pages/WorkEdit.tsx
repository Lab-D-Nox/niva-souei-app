import { useState, useRef, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Loader2,
  Upload,
  X,
  Sparkles,
  ArrowLeft,
  Trash2,
  Save,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  generateThumbnail,
  generateThumbnailFromUrl,
  type ThumbnailGenerationProgress,
} from "@/lib/thumbnailGenerator";

const originOptions = [
  { value: "personal", label: "個人作品" },
  { value: "client", label: "受注作品" },
];

const serviceTierOptions = [
  { value: "none", label: "なし" },
  { value: "tier1", label: "Tier 1: Droplet（雫）- ¥50,000〜" },
  { value: "tier2", label: "Tier 2: Ripple（波紋）- ¥150,000〜" },
  { value: "tier3", label: "Tier 3: Stream（水流）- ¥300,000〜" },
  { value: "tier4", label: "Tier 4: Deep（深海）- ¥600,000〜" },
  { value: "tier5", label: "Tier 5: Genesis（源泉）- ¥1,000,000〜" },
];

export default function WorkEdit() {
  const { id } = useParams<{ id: string }>();
  const workId = parseInt(id || "0");
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("personal");
  const [serviceTier, setServiceTier] = useState("none");
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [promptVisibility, setPromptVisibility] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);
  
  // Thumbnail state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailProgress, setThumbnailProgress] = useState<ThumbnailGenerationProgress | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [generatedThumbnailBlob, setGeneratedThumbnailBlob] = useState<Blob | null>(null);
  const [generatedThumbnailPreview, setGeneratedThumbnailPreview] = useState<string | null>(null);

  const { data: work, isLoading: workLoading, error } = trpc.works.getById.useQuery(
    { id: workId },
    { enabled: workId > 0 }
  );
  const { data: tagsData } = trpc.tags.list.useQuery();
  const { data: toolsData } = trpc.tools.list.useQuery();

  const createTagMutation = trpc.tags.create.useMutation();
  const updateWorkMutation = trpc.works.update.useMutation({
    onSuccess: () => {
      toast.success("作品を更新しました");
      navigate(`/works/${workId}`);
    },
    onError: (err) => {
      toast.error(err.message || "更新に失敗しました");
    },
  });
  const deleteWorkMutation = trpc.works.delete.useMutation({
    onSuccess: () => {
      toast.success("作品を削除しました");
      navigate("/works");
    },
    onError: (err) => {
      toast.error(err.message || "削除に失敗しました");
    },
  });
  const suggestTagsMutation = trpc.works.generateTagSuggestions.useMutation();

  // Initialize form with work data
  useEffect(() => {
    if (work) {
      setTitle(work.title || "");
      setDescription(work.description || "");
      setOrigin(work.origin || "personal");
      setServiceTier(work.serviceTier || "none");
      setPromptText(work.promptText || "");
      setNegativePrompt(work.negativePrompt || "");
      setPromptVisibility(work.promptVisibility === "public");
      setLyrics(work.lyrics || "");
      setExternalUrl(work.externalUrl || "");
      setTextContent(work.textContent || "");
      setSelectedTags(work.tags?.map((t: any) => t.id) || []);
      setSelectedTools(work.tools?.map((t: any) => t.id) || []);
    }
  }, [work]);

  const handleSuggestTags = async () => {
    if (!title) {
      toast.error("タイトルを入力してください");
      return;
    }
    setSuggestingTags(true);
    try {
      const result = await suggestTagsMutation.mutateAsync({
        title,
        description,
        type: work?.type || "image",
      });
      if (result.tags && result.tags.length > 0) {
        setCustomTags((prev) => Array.from(new Set([...prev, ...result.tags])));
        toast.success(`${result.tags.length}個のタグを提案しました`);
      }
    } catch (err) {
      toast.error("タグの提案に失敗しました");
    } finally {
      setSuggestingTags(false);
    }
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim() && !customTags.includes(newTagInput.trim())) {
      setCustomTags([...customTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const handleToggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleToggleTool = (toolId: number) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  // Upload mutation for thumbnail
  const uploadMutation = trpc.upload.complete.useMutation();

  // Handle thumbnail file change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setThumbnailFile(selectedFile);
      setGeneratedThumbnailBlob(null);
      setGeneratedThumbnailPreview(null);
    }
  };

  // Generate thumbnail from existing video URL
  const handleGenerateThumbnailFromUrl = async () => {
    if (!work?.mediaUrl) {
      toast.error('動画がアップロードされていません');
      return;
    }

    setIsGeneratingThumbnail(true);
    setThumbnailProgress(null);

    try {
      const result = await generateThumbnailFromUrl(work.mediaUrl, (progress) => {
        setThumbnailProgress(progress);
      });

      setGeneratedThumbnailBlob(result.blob);
      setGeneratedThumbnailPreview(result.dataUrl);
      setThumbnailFile(null);

      toast.success(`サムネイルを自動生成しました（${result.timestamp.toFixed(1)}秒時点）`);
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      toast.error('サムネイルの自動生成に失敗しました');
    } finally {
      setIsGeneratingThumbnail(false);
      setThumbnailProgress(null);
    }
  };

  // Upload file helper
  const uploadFile = async (file: File | Blob, filename: string): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const key = `works/${user?.id}/${Date.now()}-${filename}`;
          const result = await uploadMutation.mutateAsync({
            key,
            data: base64,
            contentType: file instanceof File ? file.type : 'image/jpeg',
          });
          resolve(result.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload new thumbnail if provided
      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, thumbnailFile.name);
      } else if (generatedThumbnailBlob) {
        thumbnailUrl = await uploadFile(generatedThumbnailBlob, `thumbnail-auto-${Date.now()}.jpg`);
      }

      // Create custom tags first
      const newTagIds: number[] = [];
      for (const tagName of customTags) {
        const existingTag = tagsData?.find(
          (t: any) => t.name.toLowerCase() === tagName.toLowerCase()
        );
        if (existingTag) {
          newTagIds.push(existingTag.id);
        } else {
          const newTag = await createTagMutation.mutateAsync({ name: tagName });
          newTagIds.push(newTag.id);
        }
      }

      const allTagIds = Array.from(new Set([...selectedTags, ...newTagIds]));

      await updateWorkMutation.mutateAsync({
        ...(thumbnailUrl && { thumbnailUrl }),
        id: workId,
        title,
        description: description || undefined,
        origin: origin as "personal" | "client",
        serviceTier: serviceTier === "none" ? undefined : (serviceTier as "tier1" | "tier2" | "tier3" | "tier4" | "tier5"),
        promptText: promptText || undefined,
        negativePrompt: negativePrompt || undefined,
        promptVisibility: promptVisibility ? "public" : "private",
        lyrics: lyrics || undefined,
        externalUrl: externalUrl || undefined,
        textContent: textContent || undefined,
        tagIds: allTagIds,
        toolIds: selectedTools,
      });
    } catch (err) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkMutation.mutateAsync({ id: workId });
    } catch (err) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
    }
  };

  // Check authorization
  const isOwner = user && work && (work.owner?.id === user.id || user.role === "admin");

  if (authLoading || workLoading) {
    return (
      <Layout>
        <div className="section">
          <div className="container flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="section">
          <div className="container text-center">
            <h1 className="text-2xl font-medium mb-4">ログインが必要です</h1>
            <p className="text-muted-foreground mb-6">
              作品を編集するにはログインしてください。
            </p>
            <Button asChild>
              <Link href="/works">作品一覧に戻る</Link>
            </Button>
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

  if (!isOwner) {
    return (
      <Layout>
        <div className="section">
          <div className="container text-center">
            <h1 className="text-2xl font-medium mb-4">編集権限がありません</h1>
            <p className="text-muted-foreground mb-6">
              この作品を編集する権限がありません。
            </p>
            <Button asChild>
              <Link href={`/works/${workId}`}>作品に戻る</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href={`/works/${workId}`}
                className="inline-flex items-center text-muted-foreground hover:text-foreground mb-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                作品に戻る
              </Link>
              <h1 className="text-2xl md:text-3xl font-medium">作品を編集</h1>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
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
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h2 className="text-lg font-medium mb-4">基本情報</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="作品のタイトル"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="作品の説明"
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Section - Only for video type */}
            {work.type === 'video' && (
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">サムネイル</h2>
                  {work.mediaUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateThumbnailFromUrl}
                      disabled={isGeneratingThumbnail}
                    >
                      {isGeneratingThumbnail ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      動画から自動生成
                    </Button>
                  )}
                </div>

                {/* Current thumbnail */}
                {work.thumbnailUrl && !generatedThumbnailPreview && !thumbnailFile && (
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">現在のサムネイル</Label>
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-border">
                      <img
                        src={work.thumbnailUrl}
                        alt="現在のサムネイル"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Thumbnail Generation Progress */}
                {thumbnailProgress && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4 animate-pulse" />
                        {thumbnailProgress.message}
                      </span>
                      <span>{thumbnailProgress.progress}%</span>
                    </div>
                    <Progress value={thumbnailProgress.progress} />
                  </div>
                )}

                {/* Auto-generated thumbnail preview */}
                {generatedThumbnailPreview && !thumbnailFile && (
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">新しいサムネイル（自動生成）</Label>
                    <div className="relative">
                      <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-primary/50">
                        <img
                          src={generatedThumbnailPreview}
                          alt="自動生成サムネイル"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-primary/90 text-primary-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Wand2 className="h-3 w-3" />
                          自動生成
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setGeneratedThumbnailBlob(null);
                          setGeneratedThumbnailPreview(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        キャンセル
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manual thumbnail upload */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    {generatedThumbnailPreview ? 'または手動でアップロード' : '新しいサムネイルをアップロード'}
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {thumbnailFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{thumbnailFile.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setThumbnailFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            クリックしてファイルを選択
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Classification */}
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h2 className="text-lg font-medium mb-4">分類</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>作品種別</Label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {originOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>サービス種別</Label>
                  <Select value={serviceTier} onValueChange={setServiceTier}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTierOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">プロンプト設定</h2>
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    {promptVisibility ? '🔓 公開' : '🔒 非公開'}
                  </span>
                  <Switch
                    id="prompt-visibility"
                    checked={promptVisibility}
                    onCheckedChange={setPromptVisibility}
                  />
                </div>
              </div>
              
              {/* Visibility explanation */}
              <div className={`mb-4 p-3 rounded-lg text-sm ${promptVisibility ? 'bg-gold/10 border border-gold/30' : 'bg-muted/50 border border-border'}`}>
                {promptVisibility ? (
                  <p className="text-gold">
                    ✅ プロンプトは公開されます。他のユーザーがプロンプトを確認・コピーできます。
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    🔒 プロンプトは非公開です。他のユーザーには「ロックされています」と表示されます。
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="promptText" className="flex items-center gap-2">
                    <span className="text-gold">Positive</span> プロンプト
                  </Label>
                  <Textarea
                    id="promptText"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="使用したプロンプトを入力..."
                    className="mt-1 font-mono text-sm"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    空欄の場合、「プロンプト未設定」と表示されます
                  </p>
                </div>
                <div>
                  <Label htmlFor="negativePrompt" className="flex items-center gap-2">
                    <span className="text-destructive/70">Negative</span> プロンプト
                  </Label>
                  <Textarea
                    id="negativePrompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="ネガティブプロンプトを入力..."
                    className="mt-1 font-mono text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Type-specific content */}
            {work.type === "audio" && (
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h2 className="text-lg font-medium mb-4">歌詞</h2>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="歌詞を入力（任意）"
                  rows={6}
                />
              </div>
            )}

            {work.type === "text" && (
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h2 className="text-lg font-medium mb-4">テキストコンテンツ</h2>
                <Textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="テキストコンテンツ"
                  rows={10}
                />
              </div>
            )}

            {work.type === "web" && (
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h2 className="text-lg font-medium mb-4">外部URL</h2>
                <Input
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* Tags */}
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">タグ</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags}
                >
                  {suggestingTags ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  AIで提案
                </Button>
              </div>

              {/* Existing Tags */}
              {tagsData && tagsData.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    既存のタグから選択
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {tagsData.map((tag: any) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleToggleTag(tag.id)}
                      >
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Tags */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  新しいタグを追加
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="タグ名"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomTag()}
                  />
                  <Button variant="outline" onClick={handleAddCustomTag}>
                    追加
                  </Button>
                </div>
                {customTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="pr-1">
                        #{tag}
                        <button
                          onClick={() => handleRemoveCustomTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tools */}
            {toolsData && toolsData.length > 0 && (
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h2 className="text-lg font-medium mb-4">使用ツール</h2>
                <p className="text-sm text-muted-foreground mb-4">この作品の制作に使用したAIツールを選択してください</p>
                
                {/* カテゴリー別にグループ化 */}
                {(() => {
                  // カテゴリー名の日本語マッピング
                  const categoryLabels: Record<string, string> = {
                    'text': 'テキスト生成',
                    'image': '画像生成',
                    'video': '動画生成',
                    'audio': '音声・音楽生成',
                    'code': 'コード・開発',
                    'other': 'その他',
                    '': '未分類',
                  };
                  
                  // カテゴリー順序
                  const categoryOrder = ['text', 'image', 'video', 'audio', 'code', 'other', ''];
                  
                  // ツールをカテゴリー別にグループ化
                  const groupedTools = toolsData.reduce((acc: Record<string, any[]>, tool: any) => {
                    const category = tool.category || '';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(tool);
                    return acc;
                  }, {} as Record<string, any[]>);
                  
                  // カテゴリー順にソート
                  const sortedCategories = Object.keys(groupedTools).sort((a, b) => {
                    const indexA = categoryOrder.indexOf(a);
                    const indexB = categoryOrder.indexOf(b);
                    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                  });
                  
                  return (
                    <div className="space-y-6">
                      {sortedCategories.map((category) => (
                        <div key={category || 'uncategorized'}>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold"></span>
                            {categoryLabels[category] || category || '未分類'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {groupedTools[category].map((tool: any) => (
                              <Badge
                                key={tool.id}
                                variant={selectedTools.includes(tool.id) ? "default" : "outline"}
                                className="cursor-pointer transition-all hover:scale-105"
                                onClick={() => handleToggleTool(tool.id)}
                              >
                                {tool.iconUrl && (
                                  <img
                                    src={tool.iconUrl}
                                    alt=""
                                    className="w-4 h-4 mr-1"
                                  />
                                )}
                                {tool.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/works/${workId}`}>キャンセル</Link>
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存する
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
