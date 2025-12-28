import { useEffect, useCallback, useRef } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function ClickRippleProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const idCounterRef = useRef(0);

  const createRipple = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const id = idCounterRef.current++;
    const x = e.clientX;
    const y = e.clientY;

    // Create ripple element
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Create multiple rings for water effect
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div");
      ring.className = "ripple-ring";
      ring.style.animationDelay = `${i * 0.1}s`;
      ripple.appendChild(ring);
    }

    container.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 1500);
  }, []);

  useEffect(() => {
    document.addEventListener("click", createRipple);
    return () => {
      document.removeEventListener("click", createRipple);
    };
  }, [createRipple]);

  return (
    <div ref={containerRef} className="click-ripple-container">
      {children}
    </div>
  );
}
