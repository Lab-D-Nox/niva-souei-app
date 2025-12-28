import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Heart, Eye, MessageCircle, Play, Music, FileText, Globe, Image as ImageIcon, Volume2, Pause, VolumeX, Volume1, Loader2 } from "lucide-react";
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

// Helper function to check if URL is audio
function isAudioUrl(url: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  const lowerUrl = url.toLowerCase();
  return audioExtensions.some(ext => lowerUrl.includes(ext));
}

// Loading spinner component with water droplet animation
function LoadingSpinner({ type }: { type: 'video' | 'audio' }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        {/* Animated water droplet loader */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            {type === 'video' ? (
              <Play className="h-5 w-5 text-gold" />
            ) : (
              <Music className="h-5 w-5 text-gold" />
            )}
          </div>
        </div>
        {/* Loading text with pulse animation */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/80 font-medium">読み込み中</span>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-gold animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Volume control component
function VolumeControl({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onMuteToggle,
  isVisible 
}: { 
  volume: number; 
  isMuted: boolean; 
  onVolumeChange: (volume: number) => void; 
  onMuteToggle: () => void;
  isVisible: boolean;
}) {
  const [showSlider, setShowSlider] = useState(false);
  
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  
  return (
    <div 
      className={cn(
        "absolute bottom-3 left-3 z-20 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-black/70 backdrop-blur-sm">
        {/* Mute button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMuteToggle();
          }}
          className="w-6 h-6 flex items-center justify-center text-white hover:text-gold transition-colors"
          title={isMuted ? "ミュート解除" : "ミュート"}
        >
          <VolumeIcon className="h-4 w-4" />
        </button>
        
        {/* Volume slider */}
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300",
            showSlider ? "w-16 opacity-100" : "w-0 opacity-0"
          )}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onVolumeChange(parseFloat(e.target.value));
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gold
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-gold
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// Video preview component with hover autoplay and volume control
function VideoPreview({ 
  src, 
  alt, 
  thumbnailUrl,
  isHovered 
}: { 
  src: string; 
  alt: string; 
  thumbnailUrl?: string | null;
  isHovered: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(thumbnailUrl || null);
  const [error, setError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.3);

  // Extract first frame for thumbnail if no thumbnailUrl provided
  useEffect(() => {
    if (thumbnailUrl) return; // Skip if thumbnail already provided
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const handleLoadedData = () => {
      video.currentTime = 0.1;
      setVideoLoaded(true);
    };

    const handleSeeked = () => {
      if (thumbnail) return; // Only capture once
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
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
  }, [src, thumbnailUrl, thumbnail]);

  // Handle hover play/pause with loading state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      // Show loading if video is not ready yet
      if (!videoLoaded) {
        setIsLoading(true);
      }
      
      if (videoLoaded) {
        setIsLoading(false);
        video.currentTime = 0;
        video.muted = isMuted;
        video.volume = volume;
        video.play().catch(() => {
          // Autoplay might be blocked, ignore error
        });
      }
    } else {
      setIsLoading(false);
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered, videoLoaded]);

  // When video becomes loaded while hovering, hide loading
  useEffect(() => {
    if (videoLoaded && isHovered) {
      setIsLoading(false);
    }
  }, [videoLoaded, isHovered]);

  // Update video mute/volume state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

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
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isHovered && videoLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
        )}
        muted={isMuted}
        playsInline
        loop
        preload="metadata"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Thumbnail overlay - hide when video is playing */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isHovered && videoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted animate-pulse">
            <Play className="h-12 w-12" />
          </div>
        )}
      </div>

      {/* Loading spinner */}
      {isLoading && isHovered && <LoadingSpinner type="video" />}

      {/* Volume control */}
      <VolumeControl
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        isVisible={isHovered && videoLoaded && !isLoading}
      />
    </>
  );
}

// Audio preview component with hover autoplay and volume control
function AudioPreview({ 
  src, 
  thumbnailUrl,
  isHovered 
}: { 
  src: string; 
  thumbnailUrl?: string | null;
  isHovered: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);

  // Handle audio loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setAudioLoaded(true);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [src]);

  // Handle hover play/pause with loading state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isHovered) {
      // Show loading if audio is not ready yet
      if (!audioLoaded) {
        setIsLoading(true);
      }
      
      if (audioLoaded) {
        audio.currentTime = 0;
        audio.volume = isMuted ? 0 : volume;
        audio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(() => {
          // Autoplay might be blocked
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    } else {
      setIsLoading(false);
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isHovered, audioLoaded]);

  // Update audio volume state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // Generate random bar heights for visualization (static when not playing)
  const [barHeights] = useState(() => 
    [...Array(12)].map(() => 8 + Math.random() * 24)
  );

  return (
    <div className="w-full h-full relative">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
      />
      
      {/* Background - use thumbnail if available */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Audio thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gold/20 via-gold/10 to-gold/5" />
      )}
      
      {/* Overlay content */}
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
        thumbnailUrl ? "bg-black/40" : ""
      )}>
        {/* Music icon with animation */}
        <div className="relative mb-4">
          {isPlaying && (
            <div className="absolute inset-0 animate-ping opacity-30">
              <Volume2 className="h-12 w-12 text-gold" />
            </div>
          )}
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
            isPlaying 
              ? "bg-gold/80 scale-110" 
              : "bg-black/40 backdrop-blur-sm group-hover:bg-gold/60"
          )}>
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white fill-white" />
            ) : (
              <Music className="h-8 w-8 text-white" />
            )}
          </div>
        </div>
        
        {/* Audio visualizer bars */}
        <div className="flex items-end gap-0.5 h-8">
          {barHeights.map((height, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-150",
                isPlaying ? "bg-gold" : "bg-gold/40"
              )}
              style={{
                height: isPlaying 
                  ? `${8 + Math.sin((Date.now() / 200) + i) * 12 + Math.random() * 8}px`
                  : `${height * 0.4}px`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
        
        {/* Progress bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-gold transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Playing indicator */}
        {isPlaying && !isLoading && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
              <div className="flex gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-gold rounded-full animate-pulse"
                    style={{
                      height: '10px',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-white ml-1">再生中</span>
            </div>
          </div>
        )}
      </div>

      {/* Loading spinner */}
      {isLoading && isHovered && <LoadingSpinner type="audio" />}

      {/* Volume control */}
      <VolumeControl
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        isVisible={isPlaying && !isLoading}
      />
    </div>
  );
}

// Audio placeholder component (static, no preview)
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
  const [isHovered, setIsHovered] = useState(false);

  // Determine what to show as thumbnail
  const renderThumbnail = () => {
    // For video type - use VideoPreview with hover autoplay
    if (work.type === 'video' && work.mediaUrl) {
      return (
        <VideoPreview 
          src={work.mediaUrl} 
          alt={work.title} 
          thumbnailUrl={work.thumbnailUrl}
          isHovered={isHovered}
        />
      );
    }

    // For audio type - use AudioPreview with hover autoplay
    if (work.type === 'audio' && work.mediaUrl) {
      return (
        <AudioPreview 
          src={work.mediaUrl} 
          thumbnailUrl={work.thumbnailUrl}
          isHovered={isHovered}
        />
      );
    }

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

      // For video URL (non-video type)
      if (isVideoUrl(work.mediaUrl)) {
        return (
          <VideoPreview 
            src={work.mediaUrl} 
            alt={work.title} 
            thumbnailUrl={work.thumbnailUrl}
            isHovered={isHovered}
          />
        );
      }

      // For audio URL (non-audio type)
      if (isAudioUrl(work.mediaUrl)) {
        return (
          <AudioPreview 
            src={work.mediaUrl} 
            thumbnailUrl={work.thumbnailUrl}
            isHovered={isHovered}
          />
        );
      }
    }

    // 3. For audio type without mediaUrl, show audio placeholder
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {renderThumbnail()}
          
          {/* Type badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {typeIcons[work.type]}
              <span className="ml-1">{typeLabels[work.type]}</span>
            </Badge>
          </div>
          
          {/* Play icon overlay for video - only show when not hovering */}
          {work.type === 'video' && !isHovered && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Play className="h-8 w-8 text-white fill-white ml-1" />
              </div>
            </div>
          )}
          
          {/* Playing indicator for video */}
          {work.type === 'video' && isHovered && (
            <div className="absolute bottom-3 right-3 z-10">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <div className="flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-white rounded-full animate-pulse"
                      style={{
                        height: '12px',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-white ml-1">再生中</span>
              </div>
            </div>
          )}
          
          {/* Overlay on hover - only for non-video and non-audio */}
          {work.type !== 'video' && work.type !== 'audio' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
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
