import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

interface VideoItem {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  allVideos?: VideoItem[];
  currentVideoId?: number;
  onNavigate?: (videoId: number) => void;
}

export function VideoModal({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title,
  allVideos = [],
  currentVideoId,
  onNavigate
}: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRelatedVideos, setShowRelatedVideos] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentIndex = allVideos.findIndex(v => v.id === currentVideoId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allVideos.length - 1;
  const previousVideo = hasPrevious ? allVideos[currentIndex - 1] : null;
  const nextVideo = hasNext ? allVideos[currentIndex + 1] : null;

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setShowRelatedVideos(false);
    }
  }, [isOpen, videoUrl]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    if (isOpen) {
      resetControlsTimeout();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, resetControlsTimeout]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!modalRef.current) return;
    if (!isFullscreen) {
      try {
        await modalRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Exit fullscreen error:", err);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "Escape":
          onClose();
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "ArrowLeft":
          if (e.shiftKey && hasPrevious && previousVideo && onNavigate) {
            onNavigate(previousVideo.id);
          } else if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
        case "ArrowRight":
          if (e.shiftKey && hasNext && nextVideo && onNavigate) {
            onNavigate(nextVideo.id);
          } else if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case "r":
        case "R":
          setShowRelatedVideos(prev => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, togglePlay, toggleMute, toggleFullscreen, hasPrevious, hasNext, previousVideo, nextVideo, onNavigate]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (hasNext && nextVideo && onNavigate) {
      onNavigate(nextVideo.id);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseMove={resetControlsTimeout}
    >
      <div ref={modalRef} className="relative w-full h-full flex flex-col items-center justify-center">
        <button onClick={onClose} className={`absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <X className="w-6 h-6" />
        </button>

        <div className={`absolute top-4 left-4 z-50 text-white transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <h2 className="text-xl font-bold">{title}</h2>
          {allVideos.length > 1 && <p className="text-sm text-gray-400">{currentIndex + 1} / {allVideos.length}</p>}
        </div>

        {allVideos.length > 1 && onNavigate && (
          <>
            {hasPrevious && previousVideo && (
              <button onClick={() => onNavigate(previousVideo.id)} className={`absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`} title="前の動画 (Shift+←)">
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {hasNext && nextVideo && (
              <button onClick={() => onNavigate(nextVideo.id)} className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`} title="次の動画 (Shift+→)">
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </>
        )}

        {allVideos.length > 1 && (
          <button onClick={() => setShowRelatedVideos(!showRelatedVideos)} className={`absolute top-4 right-16 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`} title="関連動画 (R)">
            <Grid className="w-6 h-6" />
          </button>
        )}

        {showRelatedVideos && allVideos.length > 1 && (
          <div className="absolute right-0 top-16 bottom-20 w-80 bg-black/80 backdrop-blur-sm overflow-y-auto z-40 p-4">
            <h3 className="text-white font-bold mb-4">関連動画</h3>
            <div className="space-y-3">
              {allVideos.map((video, index) => (
                <button key={video.id} onClick={() => { if (onNavigate) { onNavigate(video.id); setShowRelatedVideos(false); } }} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${video.id === currentVideoId ? "bg-gold/30 border border-gold" : "hover:bg-white/10"}`}>
                  <div className="relative w-24 h-14 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                    {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Play className="w-6 h-6 text-gray-500" /></div>}
                    <span className="absolute bottom-1 left-1 text-xs text-white bg-black/70 px-1 rounded">{index + 1}</span>
                  </div>
                  <span className="text-white text-sm text-left line-clamp-2">{video.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative max-w-[90vw] max-h-[80vh]">
          <video ref={videoRef} src={videoUrl} className="max-w-full max-h-[80vh] cursor-pointer" onClick={togglePlay} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleVideoEnded} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
              <div className="p-4 rounded-full bg-black/50 text-white"><Play className="w-16 h-16" /></div>
            </div>
          )}
        </div>

        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <div className="mb-4">
            <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gold" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="p-2 rounded-full hover:bg-white/10 text-white">{isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}</button>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-2 rounded-full hover:bg-white/10 text-white">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
                <input type="range" min={0} max={1} step={0.1} value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-gold" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-white/10 text-white">{isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}</button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">スペース: 再生/停止 | M: ミュート | F: 全画面 | ←→: 10秒スキップ | Shift+←→: 前後の動画 | R: 関連動画 | Esc: 閉じる</div>
        </div>
      </div>
    </div>
  );
}
