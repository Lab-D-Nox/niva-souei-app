import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
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
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  X,
  Sparkles,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Globe,
} from "lucide-react";

const typeOptions = [
  { value: "image", label: "画像", icon: ImageIcon },
  { value: "video", label: "動画", icon: Video },
  { value: "audio", label: "音声", icon: Music },
  { value: "text", label: "テキスト", icon: FileText },
  { value: "web", label: "Webサイト", icon: Globe },
];

const audioSubtypeOptions = [
  { value: "music", label: "音楽" },
  { value: "bgm", label: "BGM" },
  { value: "voice", label: "ボイス" },
  { value: "sfx", label: "効果音" },
  { value: "podcast", label: "ポッドキャスト" },
];

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

export default function WorkNew() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [type, setType] = useState("image");
  const [audioSubtype, setAudioSubtype] = useState("music");
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
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [suggestingTags, setSuggestingTags] = useState(false);

  const { data: tagsData } = trpc.tags.list.useQuery();
  const { data: toolsData } = trpc.tools.list.useQuery();

  const createTagMutation = trpc.tags.create.useMutation();
  const uploadMutation = trpc.upload.complete.useMutation();
  const createWorkMutation = trpc.works.create.useMutation({
    onSuccess: (data) => {
      toast.success("作品を投稿しました");
      navigate(`/works/${data.id}`);
    },
    onError: (err) => {
      toast.error(err.message || "投稿に失敗しました");
    },
  });

  const tagSuggestionMutation = trpc.works.generateTagSuggestions.useMutation({
    onSuccess: (data) => {
      if (data.tags && data.tags.length > 0) {
        setCustomTags((prev) => Array.from(new Set([...prev, ...data.tags])));
        toast.success("タグを提案しました");
      }
    },
    onError: () => {
      toast.error("タグ提案に失敗しました");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setThumbnailFile(selectedFile);
    }
  };

  const handleSuggestTags = async () => {
    if (!title) {
      toast.error("タイトルを入力してください");
      return;
    }
    setSuggestingTags(true);
    try {
      await tagSuggestionMutation.mutateAsync({
        title,
        description,
        type: type as any,
      });
    } finally {
      setSuggestingTags(false);
    }
  };

  const addCustomTag = () => {
    if (newTagInput.trim() && !customTags.includes(newTagInput.trim())) {
      setCustomTags([...customTags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag));
  };

  const uploadFile = async (file: File): Promise<string> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1];
          const key = `works/${user?.id}/${Date.now()}-${file.name}`;
          const result = await uploadMutation.mutateAsync({
            key,
            data: base64,
            contentType: file.type,
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

    setUploading(true);
    try {
      let mediaUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      // Upload media file
      if (file) {
        mediaUrl = await uploadFile(file);
      }

      // Upload thumbnail
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile);
      }

      // Create tags for custom tags
      const tagIds = [...selectedTags];
      for (const tagName of customTags) {
        const result = await createTagMutation.mutateAsync({ name: tagName });
        tagIds.push(result.id);
      }

      // Create work
      await createWorkMutation.mutateAsync({
        type: type as any,
        audioSubtype: type === "audio" ? (audioSubtype as any) : undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl,
        mediaUrl,
        externalUrl: type === "web" ? externalUrl : undefined,
        textContent: type === "text" ? textContent : undefined,
        origin: origin as any,
        serviceTier: serviceTier !== "none" ? (serviceTier as any) : undefined,
        promptText: promptText.trim() || undefined,
        negativePrompt: negativePrompt.trim() || undefined,
        promptVisibility: promptVisibility ? "public" : "private",
        lyrics: type === "audio" && (audioSubtype === "music" || audioSubtype === "bgm") ? lyrics : undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        toolIds: selectedTools.length > 0 ? selectedTools : undefined,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
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
            <Button asChild>
              <a href={getLoginUrl()}>ログイン</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (user.role !== "admin") {
    return (
      <Layout>
        <div className="section">
          <div className="container text-center">
            <h1 className="text-2xl font-medium mb-4">投稿権限がありません</h1>
            <p className="text-muted-foreground">
              現在、作品の投稿は管理者のみに制限されています。
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section">
        <div className="container max-w-3xl">
          <h1 className="text-3xl font-medium mb-8">新規作品を投稿</h1>

          <div className="space-y-8">
            {/* Type Selection */}
            <div>
              <Label className="mb-3 block">作品タイプ</Label>
              <div className="grid grid-cols-5 gap-2">
                {typeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        type === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Subtype */}
            {type === "audio" && (
              <div>
                <Label className="mb-2 block">音声タイプ</Label>
                <Select value={audioSubtype} onValueChange={setAudioSubtype}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audioSubtypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div>
              <Label htmlFor="title" className="mb-2 block">
                タイトル <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="作品のタイトル"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="mb-2 block">
                説明
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="作品の説明"
                rows={4}
              />
            </div>

            {/* File Upload */}
            {(type === "image" || type === "video" || type === "audio") && (
              <div>
                <Label className="mb-2 block">メディアファイル</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        クリックしてファイルを選択
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    type === "image"
                      ? "image/*"
                      : type === "video"
                      ? "video/*"
                      : "audio/*"
                  }
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Thumbnail */}
            <div>
              <Label className="mb-2 block">サムネイル画像</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {thumbnailFile ? (
                  <div className="flex items-center justify-center gap-2">
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
                    <span className="text-sm text-muted-foreground">
                      サムネイルを選択
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* External URL (for Web type) */}
            {type === "web" && (
              <div>
                <Label htmlFor="externalUrl" className="mb-2 block">
                  外部URL
                </Label>
                <Input
                  id="externalUrl"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Text Content (for Text type) */}
            {type === "text" && (
              <div>
                <Label htmlFor="textContent" className="mb-2 block">
                  テキスト内容
                </Label>
                <Textarea
                  id="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="テキスト作品の内容"
                  rows={10}
                />
              </div>
            )}

            {/* Origin and Service Tier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">作品区分</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger>
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
                <Label className="mb-2 block">サービス種別</Label>
                <Select value={serviceTier} onValueChange={setServiceTier}>
                  <SelectTrigger>
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

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="prompt">プロンプト</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">公開する</span>
                  <Switch
                    checked={promptVisibility}
                    onCheckedChange={setPromptVisibility}
                  />
                </div>
              </div>
              <Textarea
                id="prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="使用したプロンプト"
                rows={4}
              />
            </div>

            {/* Negative Prompt */}
            <div>
              <Label htmlFor="negativePrompt" className="mb-2 block">
                ネガティブプロンプト
              </Label>
              <Textarea
                id="negativePrompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="ネガティブプロンプト（任意）"
                rows={2}
              />
            </div>

            {/* Lyrics (for Music) */}
            {type === "audio" && (audioSubtype === "music" || audioSubtype === "bgm") && (
              <div>
                <Label htmlFor="lyrics" className="mb-2 block">
                  歌詞
                </Label>
                <Textarea
                  id="lyrics"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="歌詞（任意）"
                  rows={6}
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>タグ</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags || !title}
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
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagsData.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Custom Tags */}
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {customTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeCustomTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="新しいタグを追加"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                />
                <Button variant="outline" onClick={addCustomTag}>
                  追加
                </Button>
              </div>
            </div>

            {/* Tools */}
            {toolsData && toolsData.length > 0 && (
              <div>
                <Label className="mb-2 block">使用ツール</Label>
                <div className="flex flex-wrap gap-2">
                  {toolsData.map((tool: any) => (
                    <Badge
                      key={tool.id}
                      variant={selectedTools.includes(tool.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTools((prev) =>
                          prev.includes(tool.id)
                            ? prev.filter((id) => id !== tool.id)
                            : [...prev, tool.id]
                        );
                      }}
                    >
                      {tool.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button onClick={handleSubmit} disabled={uploading || !title.trim()}>
                {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                投稿する
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
