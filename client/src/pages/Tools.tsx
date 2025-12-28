import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2, Wrench } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";

const categoryLabels: Record<string, string> = {
  text: "テキスト",
  image: "画像生成",
  video: "動画生成",
  audio: "音声・音楽",
  editing: "編集・加工",
  coding: "コーディング",
  other: "その他",
};

// カテゴリの表示順序
const categoryOrder = ["text", "image", "video", "audio", "editing", "coding", "other"];

// モノクロ/ゴールドライン統一のバッジカラー
const categoryColors: Record<string, string> = {
  text: "bg-gold/20 text-gold border border-gold/30",
  image: "bg-white/10 text-white/90 border border-white/20",
  video: "bg-gold/10 text-gold/90 border border-gold/20",
  audio: "bg-white/5 text-white/80 border border-white/10",
  editing: "bg-gold/15 text-gold border border-gold/25",
  coding: "bg-white/8 text-white/85 border border-white/15",
  other: "bg-white/5 text-white/70 border border-white/10",
};

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function Tools() {
  const { data: tools, isLoading } = trpc.tools.list.useQuery();
  const headerReveal = useScrollReveal();

  // Group tools by category
  const groupedTools = tools?.reduce((acc: Record<string, any[]>, tool: any) => {
    const category = tool.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Layout>
      <div className="section">
        <div className="container">
          {/* Header */}
          <div 
            ref={headerReveal.ref}
            className={`text-center mb-16 transition-all duration-1000 ${headerReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
          >
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              AI Tools Arsenal
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2B3A42] mb-6 flex items-center justify-center gap-4">
              <Wrench className="h-8 w-8 md:h-10 md:w-10 text-gold" />
              使用AIツール
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Nivaの想映で使用しているAIツールの一覧です。
              各ツールの特徴を活かし、最適な表現を追求しています。
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : !tools || tools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                ツール情報はまだ登録されていません
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {categoryOrder
                .filter(cat => groupedTools?.[cat])
                .map((category, categoryIndex) => {
                  const categoryTools = groupedTools?.[category] || [];
                  return (
                    <div key={category}>
                      <h2 className="text-xl font-medium mb-8 flex items-center gap-3">
                        <Badge className={`${categoryColors[category]} px-4 py-1.5 text-sm`}>
                          {categoryLabels[category] || category}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {categoryTools.length} tools
                        </span>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryTools.map((tool: any, toolIndex: number) => (
                          <div
                            key={tool.id}
                            className="group glass-card p-6 hover-lift"
                            style={{ animationDelay: `${toolIndex * 50}ms` }}
                          >
                            <div className="flex items-start gap-4 mb-4">
                              {tool.iconUrl ? (
                                <img
                                  src={tool.iconUrl}
                                  alt={tool.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-white/10"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center border border-gold/30">
                                  <span className="text-lg font-bold text-gold">
                                    {tool.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-medium text-lg text-foreground">{tool.name}</h3>
                                {tool.url && (
                                  <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gold/70 hover:text-gold transition-colors inline-flex items-center gap-1"
                                  >
                                    公式サイト
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            {tool.description && (
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {tool.description}
                              </p>
                            )}

                            <Link href={`/works?tool=${tool.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all"
                              >
                                このツールを使った作品を見る
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Note Section */}
          <div className="mt-20 glass-card p-8 md:p-12 text-center border-glow">
            <h3 className="text-xl font-medium mb-4 gradient-text">ツールは手段であり、主役ではない</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AIツールは想いを形にするための道具です。
              どのツールを使うかよりも、何を伝えたいかが大切。
              最適なツールを選び、組み合わせることで、
              あなたの想いを最も効果的に表現します。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
