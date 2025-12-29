import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Pencil, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  compressVideo,
  needsCompression,
  formatFileSize,
  type CompressionProgress,
} from "@/lib/videoCompressor";

// Tier configuration
const TIER_CONFIG = {
  tier1: { name: "Droplet", label: "雫", color: "badge-tier-1" },
  tier2: { name: "Ripple", label: "波紋", color: "badge-tier-2" },
  tier3: { name: "Stream", label: "水流", color: "badge-tier-3" },
  tier4: { name: "Deep", label: "深海", color: "badge-tier-4" },
  tier5: { name: "Genesis", label: "源泉", color: "badge-tier-5" },
};

type TierKey = keyof typeof TIER_CONFIG;
type Position = "left" | "center" | "right";

interface PortfolioItemEditorProps {
  position: Position;
  defaultTier?: TierKey;
  defaultTitle?: string;
  defaultSubtitle?: string;
}

// Portfolio Item Display Component
interface PortfolioItemDisplayProps {
  position: Position;
  defaultTier?: TierKey;
  defaultTitle?: string;
  defaultSubtitle?: string;
}

export function PortfolioItemDisplay({
  position,
  defaultTier = "tier1",
  defaultTitle = "",
  defaultSubtitle = "",
}: PortfolioItemDisplayProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const { data: item, isLoading } = trpc.portfolio.getByPosition.useQuery(
    { position },
    { staleTime: 30000 }
  );
  
  const displayTier = item?.tier as TierKey || defaultTier;
  const displayTitle = item?.title || defaultTitle;
  const displaySubtitle = item?.subtitle || defaultSubtitle;
  const videoUrl = item?.videoUrl;
  const thumbnailUrl = item?.thumbnailUrl;
  
  const tierConfig = TIER_CONFIG[displayTier];
  
  if (isLoading) {
    return (
      <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative group">
      {/* Admin Edit Button */}
      {isAdmin && (
        <PortfolioItemEditor
          position={position}
          defaultTier={defaultTier}
          defaultTitle={defaultTitle}
          defaultSubtitle={defaultSubtitle}
        />
      )}
      
      {/* Card */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Video or Thumbnail */}
        {videoUrl ? (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-sm">動画未設定</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {/* Tier Badge */}
          <div className={`${tierConfig.color} inline-block px-3 py-1 rounded-full text-xs font-medium mb-3`}>
            Tier {displayTier.slice(-1)}: {tierConfig.name}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold mb-1 line-clamp-2">
            {displayTitle || "タイトル未設定"}
          </h3>
          
          {/* Subtitle */}
          {displaySubtitle && (
            <p className="text-sm text-white/80 line-clamp-2">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function PortfolioItemEditor({
  position,
  defaultTier = "tier1",
  defaultTitle = "",
  defaultSubtitle = "",
}: PortfolioItemEditorProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [tier, setTier] = useState<TierKey>(defaultTier);
  const [title, setTitle] = useState(defaultTitle);
  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Compression state
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Refs for file inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch existing data
  const { data: existingItem, refetch } = trpc.portfolio.getByPosition.useQuery(
    { position },
    { enabled: isOpen }
  );
  
  // Upsert mutation
  const upsertMutation = trpc.portfolio.upsert.useMutation({
    onSuccess: () => {
      toast.success("制作実績を更新しました");
      refetch();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Upload mutation
  const uploadMutation = trpc.upload.complete.useMutation();
  
  // Load existing data when dialog opens
  useEffect(() => {
    if (existingItem) {
      setTier(existingItem.tier as TierKey);
      setTitle(existingItem.title);
      setSubtitle(existingItem.subtitle || "");
      setVideoUrl(existingItem.videoUrl || "");
      setThumbnailUrl(existingItem.thumbnailUrl || "");
    } else {
      setTier(defaultTier);
      setTitle(defaultTitle);
      setSubtitle(defaultSubtitle);
      setVideoUrl("");
      setThumbnailUrl("");
    }
  }, [existingItem, defaultTier, defaultTitle, defaultSubtitle]);
  
  // Handle file upload with compression support
  const handleFileUpload = async (file: File, type: "video" | "thumbnail") => {
    setIsUploading(true);
    setCompressionProgress(null);
    setUploadProgress(0);
    
    try {
      let fileToUpload: File | Blob = file;
      let contentType = file.type;
      let fileName = file.name;
      
      // Check if video needs compression
      if (type === "video" && needsCompression(file)) {
        toast.info(`大きなファイル (${formatFileSize(file.size)}) を圧縮しています...`);
        
        const result = await compressVideo(file, (progress) => {
          setCompressionProgress(progress);
        });
        
        fileToUpload = result.blob;
        contentType = "video/webm";
        fileName = file.name.replace(/\.[^.]+$/, ".webm");
        
        toast.success(
          `圧縮完了: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}`
        );
      }
      
      setCompressionProgress(null);
      setUploadProgress(10);
      
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileToUpload);
      });
      
      setUploadProgress(50);
      
      const key = `portfolio/${position}/${type}-${Date.now()}.${fileName.split(".").pop()}`;
      const { url } = await uploadMutation.mutateAsync({
        key,
        data: base64,
        contentType,
      });
      
      setUploadProgress(100);
      
      if (type === "video") {
        setVideoUrl(url);
      } else {
        setThumbnailUrl(url);
      }
      
      toast.success(`${type === "video" ? "動画" : "サムネイル"}をアップロードしました`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
      setCompressionProgress(null);
      setUploadProgress(0);
    }
  };
  
  // Handle save
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }
    
    upsertMutation.mutate({
      position,
      tier,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      videoUrl: videoUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });
  };
  
  if (!isAdmin) return null;
  
  const tierConfig = TIER_CONFIG[tier];
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white shadow-sm"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>制作実績を編集</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Tier Selection */}
          <div className="space-y-2">
            <Label>Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as TierKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIER_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className={`${config.color} px-2 py-0.5 rounded text-xs mr-2`}>
                      Tier {key.slice(-1)}
                    </span>
                    {config.name}（{config.label}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Tier Preview */}
            <div className={`${tierConfig.color} inline-block px-3 py-1 rounded-full text-xs font-medium`}>
              Tier {tier.slice(-1)}: {tierConfig.name}（{tierConfig.label}）
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Label>タイトル</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: モーションロゴ「一休百福」"
            />
          </div>
          
          {/* Subtitle */}
          <div className="space-y-2">
            <Label>サブタイトル（説明）</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="例: ロゴアニメーション / 8秒 / 音の可視化"
            />
          </div>
          
          {/* Video Upload */}
          <div className="space-y-2">
            <Label>動画</Label>
            <p className="text-xs text-muted-foreground">
              大きなファイル（500MB以上）は自動的に圧縮されます。1GB以上のファイルもアップロード可能です。
            </p>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "video");
              }}
            />
            
            {/* Compression Progress */}
            {compressionProgress && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>{compressionProgress.message}</span>
                  <span>{compressionProgress.progress}%</span>
                </div>
                <Progress value={compressionProgress.progress} />
              </div>
            )}
            
            {/* Upload Progress */}
            {isUploading && !compressionProgress && uploadProgress > 0 && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>アップロード中...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
            
            {videoUrl ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  controls
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setVideoUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-2" />
                    動画をアップロード
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>サムネイル</Label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "thumbnail");
              }}
            />
            
            {thumbnailUrl ? (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setThumbnailUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-2" />
                    サムネイルをアップロード
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Save Button */}
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={upsertMutation.isPending || isUploading}
          >
            {upsertMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
