import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Heart, Eye, MessageCircle, Play, Music, FileText, Globe, Image as ImageIcon, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  work: {
    id: number;
    type: string;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    mediaUrl?: string | null;
    origin: string;
    serviceTier?: string | null;
    likeCount: number;
    commentCount: number;
    viewCount: number;
  };
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Play className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  web: <Globe className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  image: "画像",
  video: "動画",
  audio: "音声",
  text: "テキスト",
  web: "Webサイト",
};

const serviceTierLabels: Record<string, string> = {
  spot: "Spot Concept",
  standard: "Standard Translation",
  grand: "Grand Story",
};

// Helper function to check if URL is an image
function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

// Helper function to check if URL is a video
function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

// Component to extract video first frame as thumbnail
function VideoThumbnail({ src, alt }: { src: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const handleLoadedData = () => {
      // Seek to first frame
      video.currentTime = 0.1;
    };

    const handleSeeked = () => {
      try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setThumbnail(dataUrl);
        }
      } catch (e) {
        console.error('Failed to capture video frame:', e);
        setError(true);
      }
    };

    const handleError = () => {
      setError(true);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
        <Play className="h-12 w-12" />
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        className="hidden"
        muted
        playsInline
        crossOrigin="anonymous"
        preload="metadata"
      />
      <canvas ref={canvasRef} className="hidden" />
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted animate-pulse">
          <Play className="h-12 w-12" />
        </div>
      )}
    </>
  );
}

// Audio placeholder component
function AudioThumbnail() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gold/20 to-gold/5">
      <div className="relative">
        <div className="absolute inset-0 animate-ping opacity-20">
          <Volume2 className="h-16 w-16 text-gold" />
        </div>
        <Music className="h-16 w-16 text-gold" />
      </div>
      <div className="flex gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-gold/60 rounded-full animate-pulse"
            style={{
              height: `${12 + Math.random() * 20}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function WorkCard({ work, className }: WorkCardProps) {
  // Determine what to show as thumbnail
  const renderThumbnail = () => {
    // 1. If thumbnailUrl is set, use it
    if (work.thumbnailUrl) {
      return (
        <img
          src={work.thumbnailUrl}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      );
    }

    // 2. If no thumbnail, check mediaUrl based on work type
    if (work.mediaUrl) {
      // For image type or if mediaUrl is an image
      if (work.type === 'image' || isImageUrl(work.mediaUrl)) {
        return (
          <img
            src={work.mediaUrl}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        );
      }

      // For video type or if mediaUrl is a video
      if (work.type === 'video' || isVideoUrl(work.mediaUrl)) {
        return <VideoThumbnail src={work.mediaUrl} alt={work.title} />;
      }
    }

    // 3. For audio type, show audio placeholder
    if (work.type === 'audio') {
      return <AudioThumbnail />;
    }

    // 4. Default fallback - show type icon
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        {typeIcons[work.type] || <ImageIcon className="h-12 w-12" />}
      </div>
    );
  };

  return (
    <Link href={`/works/${work.id}`}>
      <article
        className={cn(
          "group bg-card rounded-xl overflow-hidden border border-border/50 cursor-pointer",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-2 hover:shadow-xl hover:shadow-gold/10",
          "hover:border-gold/30",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {renderThumbnail()}
          
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {typeIcons[work.type]}
              <span className="ml-1">{typeLabels[work.type]}</span>
            </Badge>
          </div>
          
          {/* Play icon overlay for video */}
          {work.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-gold/80 flex items-center justify-center">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                work.origin === "client" ? "badge-client" : "badge-personal"
              )}
            >
              {work.origin === "client" ? "受注作品" : "個人作品"}
            </Badge>
            {work.serviceTier && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  work.serviceTier === "spot" && "badge-spot",
                  work.serviceTier === "standard" && "badge-standard",
                  work.serviceTier === "grand" && "badge-grand"
                )}
              >
                {serviceTierLabels[work.serviceTier]}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {work.title}
          </h3>

          {/* Description */}
          {work.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {work.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {work.likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {work.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {work.viewCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Skeleton for loading state
export function WorkCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-5 w-24 bg-muted rounded" />
        </div>
        <div className="h-6 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-full bg-muted rounded mb-1" />
        <div className="h-4 w-2/3 bg-muted rounded mb-3" />
        <div className="flex gap-4">
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
