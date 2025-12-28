import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";

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

const categoryColors: Record<string, string> = {
  text: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  image: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  video: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  audio: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  editing: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  coding: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function Tools() {
  const { data: tools, isLoading } = trpc.tools.list.useQuery();

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
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
              AI Tools
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-primary mb-4">使用AIツール</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nivaの想映で使用しているAIツールの一覧です。
              各ツールの特徴を活かし、最適な表現を追求しています。
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !tools || tools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                ツール情報はまだ登録されていません
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {categoryOrder
                .filter(cat => groupedTools?.[cat])
                .map((category) => {
                  const categoryTools = groupedTools?.[category] || [];
                  return (
                    <div key={category}>
                      <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                        <Badge className={categoryColors[category]}>
                          {categoryLabels[category] || category}
                        </Badge>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryTools.map((tool: any) => (
                          <div
                            key={tool.id}
                            className="group bg-card rounded-xl p-6 border border-border/50 hover-lift"
                          >
                            <div className="flex items-start gap-4 mb-4">
                              {tool.iconUrl ? (
                                <img
                                  src={tool.iconUrl}
                                  alt={tool.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                  <span className="text-lg font-bold text-muted-foreground">
                                    {tool.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-medium text-lg">{tool.name}</h3>
                                {tool.url && (
                                  <a
                                    href={tool.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                                  >
                                    公式サイト
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            {tool.description && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {tool.description}
                              </p>
                            )}

                            <Link href={`/works?tool=${tool.id}`}>
                              <Button variant="outline" size="sm" className="w-full">
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
          <div className="mt-16 bg-muted/50 rounded-xl p-8 text-center">
            <h3 className="text-lg font-medium mb-3">ツールは手段であり、主役ではない</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
