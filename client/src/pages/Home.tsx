import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { WorkCard, WorkCardSkeleton } from "@/components/WorkCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Sparkles, Palette, Film, Music, ChevronDown } from "lucide-react";

export default function Home() {
  const { data: latestWorks, isLoading: latestLoading } = trpc.works.list.useQuery({
    sortBy: "newest",
    limit: 6,
  });

  const { data: popularWorks, isLoading: popularLoading } = trpc.works.list.useQuery({
    sortBy: "popular",
    limit: 6,
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[oklch(0.65_0.2_230)]/10 rounded-full blur-3xl" />
        </div>

        <div className="container">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI Creative Expression
            </div>
            
            <h1 className="mb-6">
              <span className="block text-muted-foreground text-lg md:text-xl font-normal mb-2">
                想いを映像に翻訳する
              </span>
              <span className="gradient-text">Niva's Souei</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              技術を主役にせず、想いを主役にする。
              AIを活用したクリエイティブ表現で、あなたの「伝えたい」を形にします。
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/works">
                  作品を見る
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">依頼する</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in animation-delay-500">
          <p className="text-xs tracking-widest text-primary font-medium mb-2">SCROLL</p>
          <div className="w-px h-12 bg-border mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-primary scroll-indicator-line" />
          </div>
        </div>
      </section>

      {/* Latest Works Section */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
                Latest Works
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-primary">新着作品</h2>
            </div>
            <Button asChild variant="ghost" className="group">
              <Link href="/works?sort=newest">
                すべて見る
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestLoading
              ? Array.from({ length: 6 }).map((_, i) => <WorkCardSkeleton key={i} />)
              : latestWorks?.works.map((work: any) => (
                  <WorkCard key={work.id} work={work} />
                ))}
          </div>

          {!latestLoading && (!latestWorks?.works || latestWorks.works.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              まだ作品がありません
            </div>
          )}
        </div>
      </section>

      {/* Popular Works Section */}
      <section className="section">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
                Popular Works
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-primary">人気作品</h2>
            </div>
            <Button asChild variant="ghost" className="group">
              <Link href="/works?sort=popular">
                すべて見る
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLoading
              ? Array.from({ length: 6 }).map((_, i) => <WorkCardSkeleton key={i} />)
              : popularWorks?.works.map((work: any) => (
                  <WorkCard key={work.id} work={work} />
                ))}
          </div>

          {!popularLoading && (!popularWorks?.works || popularWorks.works.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              まだ作品がありません
            </div>
          )}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-[oklch(0.65_0.2_230)]" />
            
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
                Philosophy
              </p>
              <h2 className="text-3xl md:text-4xl font-light text-primary mb-6">Nivaの想映とは</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                「想映」とは、想い/意図をAIで"伝わる映像"として可視化・翻訳する表現活動です。
                技術はあくまで手段であり、主役は常に「想い」。
                クライアントの内にある感情や意図を、見る人の心に届く形へと変換します。
              </p>
              
              <Button asChild variant="outline" className="group">
                <Link href="/philosophy">
                  詳しく見る
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Services
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-primary">提供サービス</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spot Concept */}
            <div className="group bg-card rounded-xl p-6 border border-border/50 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Spot Concept</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                スポット現像
              </p>
              <p className="text-muted-foreground mb-4">
                単発のビジュアル制作。SNS投稿用画像やサムネイルなど、
                ピンポイントなニーズに素早く対応します。
              </p>
              <Button asChild variant="ghost" size="sm" className="group/btn">
                <Link href="/services#spot">
                  詳細を見る
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Standard Translation */}
            <div className="group bg-card rounded-xl p-6 border border-border/50 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Standard Translation</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                標準翻訳
              </p>
              <p className="text-muted-foreground mb-4">
                コンセプトからビジュアルへの翻訳。ブランディングやプロモーション素材の
                一貫した世界観構築をサポートします。
              </p>
              <Button asChild variant="ghost" size="sm" className="group/btn">
                <Link href="/services#standard">
                  詳細を見る
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Grand Story */}
            <div className="group bg-card rounded-xl p-6 border border-border/50 hover-lift">
              <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
                <Film className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Grand Story</h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3">
                全編想映
              </p>
              <p className="text-muted-foreground mb-4">
                映像作品の企画から完成まで。ストーリー構築、映像制作、音楽選定まで
                トータルでプロデュースします。
              </p>
              <Button asChild variant="ghost" size="sm" className="group/btn">
                <Link href="/services#grand">
                  詳細を見る
                  <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg">
              <Link href="/contact">依頼する</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-foreground text-background">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-4">
            あなたの想いを、形に。
          </h2>
          <p className="text-background/70 mb-8 max-w-2xl mx-auto">
            プロジェクトのご相談、お見積もりなど、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">依頼フォームへ</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10">
              <Link href="/links">SNSをフォロー</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
