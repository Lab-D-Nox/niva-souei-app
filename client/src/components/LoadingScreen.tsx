import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDisplayTime?: number;
}

export function LoadingScreen({ onLoadingComplete, minDisplayTime = 2000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onLoadingComplete?.();
      }, 500); // フェードアウト時間
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Nのロゴ + 水滴アニメーション */}
        <div className="relative w-32 h-32">
          {/* N の文字（SVG） */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* グラデーション定義 */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A962" />
                <stop offset="50%" stopColor="#E8D5A3" />
                <stop offset="100%" stopColor="#C9A962" />
              </linearGradient>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8D5E5" />
                <stop offset="100%" stopColor="#7EC8E3" />
              </linearGradient>
              {/* グロー効果 */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* N の左縦線 */}
            <path
              d="M 20 80 L 20 20"
              stroke="url(#goldGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
              className="animate-draw-line"
            />

            {/* N の斜め線 */}
            <path
              d="M 20 20 L 60 80"
              stroke="url(#goldGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
              className="animate-draw-diagonal"
            />

            {/* N の右縦線（水滴に繋がる） */}
            <path
              d="M 60 80 L 60 35"
              stroke="url(#blueGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#glow)"
              className="animate-draw-right"
            />
          </svg>

          {/* 落ちる水滴 */}
          <div className="absolute right-[18%] top-[30%] animate-droplet">
            <svg
              width="24"
              height="32"
              viewBox="0 0 24 32"
              className="drop-shadow-[0_0_8px_rgba(168,213,229,0.8)]"
            >
              <defs>
                <linearGradient id="dropletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A8D5E5" />
                  <stop offset="50%" stopColor="#7EC8E3" />
                  <stop offset="100%" stopColor="#5BB5D5" />
                </linearGradient>
              </defs>
              <path
                d="M12 0 C12 0 24 16 24 22 C24 27.5 18.6 32 12 32 C5.4 32 0 27.5 0 22 C0 16 12 0 12 0 Z"
                fill="url(#dropletGradient)"
              />
              {/* 水滴のハイライト */}
              <ellipse cx="8" cy="20" rx="3" ry="4" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        </div>

        {/* 波紋エフェクト */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8">
          <div className="relative w-40 h-20">
            <div className="absolute inset-0 animate-ripple-1">
              <div className="w-full h-full rounded-[50%] border-2 border-[#A8D5E5]/40" />
            </div>
            <div className="absolute inset-0 animate-ripple-2">
              <div className="w-full h-full rounded-[50%] border-2 border-[#A8D5E5]/30" />
            </div>
            <div className="absolute inset-0 animate-ripple-3">
              <div className="w-full h-full rounded-[50%] border-2 border-[#A8D5E5]/20" />
            </div>
          </div>
        </div>

        {/* テキスト */}
        <div className="mt-16 text-center">
          <p className="text-[#C9A962] text-sm tracking-[0.3em] font-light animate-pulse-slow">
            LOADING
          </p>
        </div>
      </div>

      {/* カスタムアニメーション用スタイル */}
      <style>{`
        @keyframes draw-line {
          0% { stroke-dasharray: 60; stroke-dashoffset: 60; }
          100% { stroke-dasharray: 60; stroke-dashoffset: 0; }
        }
        
        @keyframes draw-diagonal {
          0% { stroke-dasharray: 85; stroke-dashoffset: 85; }
          100% { stroke-dasharray: 85; stroke-dashoffset: 0; }
        }
        
        @keyframes draw-right {
          0% { stroke-dasharray: 45; stroke-dashoffset: 45; }
          100% { stroke-dasharray: 45; stroke-dashoffset: 0; }
        }
        
        @keyframes droplet-fall {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          70% {
            transform: translateY(60px) scale(1);
            opacity: 1;
          }
          85% {
            transform: translateY(65px) scale(1.2, 0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(60px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0.3);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-draw-line {
          animation: draw-line 0.6s ease-out forwards;
        }
        
        .animate-draw-diagonal {
          animation: draw-diagonal 0.6s ease-out 0.3s forwards;
          stroke-dasharray: 85;
          stroke-dashoffset: 85;
        }
        
        .animate-draw-right {
          animation: draw-right 0.4s ease-out 0.6s forwards;
          stroke-dasharray: 45;
          stroke-dashoffset: 45;
        }
        
        .animate-droplet {
          animation: droplet-fall 1.5s ease-in infinite;
          animation-delay: 1s;
        }
        
        .animate-ripple-1 {
          animation: ripple 2s ease-out infinite;
          animation-delay: 1.8s;
        }
        
        .animate-ripple-2 {
          animation: ripple 2s ease-out infinite;
          animation-delay: 2.1s;
        }
        
        .animate-ripple-3 {
          animation: ripple 2s ease-out infinite;
          animation-delay: 2.4s;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
