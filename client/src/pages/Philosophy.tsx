import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Eye, Heart, Lightbulb } from "lucide-react";

export default function Philosophy() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background -z-10" />
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[oklch(0.65_0.2_230)]/10 rounded-full blur-3xl" />
        </div>

        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-4">
              Philosophy
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">
              <span className="gradient-text">Nivaの想映</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              想い/意図を、AIで"伝わる映像"として可視化・翻訳する表現活動
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container max-w-4xl">
          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-16">
            <blockquote className="text-xl border-l-4 border-primary pl-6 italic text-muted-foreground">
              「想映」とは、想いを映像に翻訳すること。
              技術はあくまで手段であり、主役は常に「想い」。
            </blockquote>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">想いを主役に</h3>
              <p className="text-sm text-muted-foreground">
                技術や手法ではなく、伝えたい想いを中心に据える
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">伝わる形に</h3>
              <p className="text-sm text-muted-foreground">
                見る人の心に届く、最適な表現形式を追求する
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">AIは道具</h3>
              <p className="text-sm text-muted-foreground">
                AIは表現の可能性を広げる道具であり、創造の主体ではない
              </p>
            </div>
          </div>

          {/* Philosophy Details */}
          <div className="space-y-12">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-transparent" />
              <h2 className="text-2xl font-light text-primary mb-4">なぜ「想映」なのか</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                「想映」という言葉には、「想い」を「映像」として「映す」という意味を込めています。
                単なる画像生成や動画制作ではなく、クライアントや自分自身の内にある感情、意図、
                ビジョンを、見る人の心に届く形へと翻訳する行為です。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                AIの進化により、誰もが高品質な映像を生成できる時代になりました。
                しかし、技術だけでは「伝わる」表現は生まれません。
                何を伝えたいのか、誰に届けたいのか、どんな感情を呼び起こしたいのか。
                その「想い」を深く理解し、最適な形に翻訳することこそが、想映の本質です。
              </p>
            </div>

            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[oklch(0.65_0.2_230)] to-transparent" />
              <h2 className="text-2xl font-light text-primary mb-4">AIとの向き合い方</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AIは驚異的なスピードで進化し、表現の可能性を大きく広げています。
                しかし、AIはあくまで道具であり、創造の主体ではありません。
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                プロンプトを入力すれば画像が出力される。
                その便利さの裏で、「何を伝えたいのか」という本質が置き去りにされがちです。
                想映では、AIを「想いを形にするための最高の道具」として位置づけ、
                その特性を理解し、最大限に活用します。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                複数のツールを組み合わせ、それぞれの強みを活かし、
                時には手作業で調整を加えながら、「伝わる」表現を追求します。
              </p>
            </div>

            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-rose-500 to-transparent" />
              <h2 className="text-2xl font-light text-primary mb-4">クリエイターとしての姿勢</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                想映は、単なる受託制作ではありません。
                クライアントの想いに寄り添い、時にはクライアント自身も気づいていない
                本当の意図を引き出し、最適な形に翻訳するパートナーシップです。
              </p>
              <p className="text-muted-foreground leading-relaxed">
                「こんな感じで」という曖昧なイメージを、
                「これが伝えたかったことだ」という確信に変える。
                それが想映のクリエイターとしての役割です。
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6">
              あなたの想いを、形にしませんか？
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/contact">
                  依頼する
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/works">作品を見る</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
