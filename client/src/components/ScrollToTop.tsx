import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollToTop } = useSmoothScroll();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gold/90 text-white shadow-lg hover:bg-gold transition-all duration-300 hover:scale-110 backdrop-blur-sm"
      aria-label="ページトップへ戻る"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
