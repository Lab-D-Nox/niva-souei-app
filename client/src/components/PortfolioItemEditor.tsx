import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Pencil, Upload, X, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

interface PortfolioItem {
  id?: number;
  position: Position;
  tier: TierKey;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
}

interface PortfolioItemEditorProps {
  position: Position;
  defaultTier?: TierKey;
  defaultTitle?: string;
  defaultSubtitle?: string;
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
  
  // Handle file upload
  const handleFileUpload = async (file: File, type: "video" | "thumbnail") => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const key = `portfolio/${position}/${type}-${Date.now()}.${file.name.split(".").pop()}`;
      const { url } = await uploadMutation.mutateAsync({
        key,
        data: base64,
        contentType: file.type,
      });
      
      if (type === "video") {
        setVideoUrl(url);
      } else {
        setThumbnailUrl(url);
      }
      
      toast.success(`${type === "video" ? "動画" : "サムネイル"}をアップロードしました`);
    } catch (error) {
      toast.error("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
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

// Portfolio Item Display Component
interface PortfolioItemDisplayProps {
  position: Position;
  defaultTier: TierKey;
  defaultTitle: string;
  defaultSubtitle: string;
}

export function PortfolioItemDisplay({
  position,
  defaultTier,
  defaultTitle,
  defaultSubtitle,
}: PortfolioItemDisplayProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fetch portfolio item
  const { data: item } = trpc.portfolio.getByPosition.useQuery({ position });
  
  // Use fetched data or defaults
  const tier = (item?.tier as TierKey) || defaultTier;
  const title = item?.title || defaultTitle;
  const subtitle = item?.subtitle || defaultSubtitle;
  const videoUrl = item?.videoUrl;
  const thumbnailUrl = item?.thumbnailUrl;
  
  const tierConfig = TIER_CONFIG[tier];
  
  // Handle video preview on hover
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      if (isHovering) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovering, videoUrl]);
  
  return (
    <div 
      className="glass-card p-6 hover-lift relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Admin Edit Button */}
      {isAdmin && (
        <PortfolioItemEditor
          position={position}
          defaultTier={defaultTier}
          defaultTitle={defaultTitle}
          defaultSubtitle={defaultSubtitle}
        />
      )}
      
      {/* Tier Badge */}
      <div className={`${tierConfig.color} inline-block px-3 py-1 rounded-full text-xs font-medium mb-4`}>
        Tier {tier.slice(-1)}: {tierConfig.name}（{tierConfig.label}）
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-serif text-[#2B3A42] mb-2">{title}</h3>
      
      {/* Subtitle */}
      <p className="text-sm text-[#5A6B75] mb-4">{subtitle}</p>
      
      {/* Media Display */}
      <div className="aspect-video bg-[#2B3A42]/5 rounded-lg flex items-center justify-center overflow-hidden relative">
        {videoUrl ? (
          <>
            {/* Video */}
            <video
              ref={videoRef}
              src={videoUrl}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovering ? "opacity-100" : "opacity-0"
              }`}
              muted
              loop
              playsInline
            />
            
            {/* Thumbnail or First Frame */}
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isHovering ? "opacity-0" : "opacity-100"
                }`}
              />
            ) : (
              <video
                src={videoUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isHovering ? "opacity-0" : "opacity-100"
                }`}
              />
            )}
            
            {/* Play indicator */}
            {!isHovering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-5 w-5 text-[#2B3A42] ml-1" />
                </div>
              </div>
            )}
          </>
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#5A6B75] text-sm">Coming Soon</span>
        )}
      </div>
    </div>
  );
}
