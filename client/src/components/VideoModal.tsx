import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  subtitle?: string;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVideo: VideoItem;
  allVideos?: VideoItem[];
  onVideoChange?: (video: VideoItem) => void;
}

export function VideoModal({ 
  isOpen, 
  onClose, 
  currentVideo,
  allVideos = [],
  onVideoChange,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRelatedVideos, setShowRelatedVideos] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current index and navigation info
  const currentIndex = allVideos.findIndex(v => v.id === currentVideo.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allVideos.length - 1;
  const previousVideo = hasPrevious ? allVideos[currentIndex - 1] : null;
  const nextVideo = hasNext ? allVideos[currentIndex + 1] : null;

  // Reset state when video changes
  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setShowRelatedVideos(false);
      // Auto-play when modal opens
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay might be blocked
      });
    }
  }, [isOpen, currentVideo.videoUrl]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "ArrowLeft":
          if (e.shiftKey && hasPrevious && previousVideo) {
            // Shift + Left: Previous video
            handleVideoChange(previousVideo);
          } else if (videoRef.current) {
            // Left: Seek back 10 seconds
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case "ArrowRight":
          if (e.shiftKey && hasNext && nextVideo) {
            // Shift + Right: Next video
            handleVideoChange(nextVideo);
          } else if (videoRef.current) {
            // Right: Seek forward 10 seconds
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          }
          break;
        case "r":
          setShowRelatedVideos(!showRelatedVideos);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, duration, onClose, hasPrevious, hasNext, previousVideo, nextVideo, showRelatedVideos]);

  // Auto-hide controls
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showRelatedVideos) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, isPlaying, showRelatedVideos]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleVideoChange = (video: VideoItem) => {
    if (onVideoChange) {
      onVideoChange(video);
    }
    setShowRelatedVideos(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Auto-play next video if available
    if (hasNext && nextVideo) {
      setTimeout(() => {
        handleVideoChange(nextVideo);
      }, 1500);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-4 right-4 z-20 text-white hover:bg-white/20 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        >
          <X className="h-8 w-8" />
        </Button>

        {/* Title and Video Counter */}
        <div
          className={`absolute top-4 left-4 z-20 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-white text-xl font-bold">
            {currentVideo.title}
          </div>
          {allVideos.length > 1 && (
            <div className="text-white/60 text-sm mt-1">
              {currentIndex + 1} / {allVideos.length}
            </div>
          )}
        </div>

        {/* Previous Video Button */}
        {hasPrevious && previousVideo && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-16 w-16 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => handleVideoChange(previousVideo)}
          >
            <ChevronLeft className="h-12 w-12" />
          </Button>
        )}

        {/* Next Video Button */}
        {hasNext && nextVideo && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-16 w-16 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => handleVideoChange(nextVideo)}
          >
            <ChevronRight className="h-12 w-12" />
          </Button>
        )}

        {/* Video Container */}
        <div className="relative max-w-[90vw] max-h-[80vh] w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={currentVideo.videoUrl}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            playsInline
          />

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors">
                <Play className="h-16 w-16 text-white" fill="white" />
              </div>
            </div>
          )}
        </div>

        {/* Related Videos Panel */}
        {showRelatedVideos && allVideos.length > 1 && (
          <div className="absolute bottom-32 left-0 right-0 z-20 px-6">
            <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-white text-sm font-medium mb-3">関連動画</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allVideos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoChange(video)}
                    className={`flex-shrink-0 group relative ${
                      video.id === currentVideo.id ? "ring-2 ring-gold" : ""
                    }`}
                  >
                    <div className="w-32 h-20 bg-gray-800 rounded-lg overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                          <Play className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                    <div className="mt-1 text-xs text-white/80 truncate max-w-[128px]">
                      {video.title}
                    </div>
                    {video.id === currentVideo.id && (
                      <div className="absolute top-1 left-1 bg-gold text-black text-xs px-1.5 py-0.5 rounded">
                        再生中
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Previous */}
              {allVideos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={() => previousVideo && handleVideoChange(previousVideo)}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              {/* Next */}
              {allVideos.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                  onClick={() => nextVideo && handleVideoChange(nextVideo)}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Related Videos Toggle */}
              {allVideos.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-white/20 text-xs ${showRelatedVideos ? 'bg-white/20' : ''}`}
                  onClick={() => setShowRelatedVideos(!showRelatedVideos)}
                >
                  関連動画
                </Button>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div
          className={`absolute ${showRelatedVideos ? 'bottom-56' : 'bottom-24'} left-1/2 -translate-x-1/2 text-white/50 text-xs transition-all duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          スペース: 再生/停止 | M: ミュート | F: 全画面 | ←→: 10秒スキップ | Shift+←→: 前後の動画 | R: 関連動画 | Esc: 閉じる
        </div>
      </div>
    </div>
  );
}
