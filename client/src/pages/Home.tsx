import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { WorkCard, WorkCardSkeleton } from "@/components/WorkCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Sparkles, Zap, Target, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Ripple animation component
function RippleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Deep black background */}
      <div className="absolute inset-0 bg-[#080808]" />
      
      {/* Sync lines - 3 colors converging */}
      <div className="absolute inset-0">
        {/* Red line (音) */}
        <div className="absolute top-1/3 left-0 w-full h-px sync-line sync-line-red opacity-60" />
        {/* Blue line (映像) */}
        <div className="absolute top-1/2 left-0 w-full h-px sync-line sync-line-blue opacity-60" />
        {/* Green line (物語) */}
        <div className="absolute top-2/3 left-0 w-full h-px sync-line sync-line-green opacity-60" />
      </div>
      
      {/* Central ripple effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="ripple-effect w-[200px] h-[200px]" style={{ animationDelay: '0s' }} />
        <div className="ripple-effect w-[200px] h-[200px]" style={{ animationDelay: '1s' }} />
        <div className="ripple-effect w-[200px] h-[200px]" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
        />
      ))}
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]/80" />
    </div>
  );
}

// Mouse stalker component
function MouseStalker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="mouse-ripple hidden md:block"
      style={{
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}

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

export default function Home() {
  const { data: latestWorks, isLoading: latestLoading } = trpc.works.list.useQuery({
    sortBy: "newest",
    limit: 6,
  });

  const { data: popularWorks, isLoading: popularLoading } = trpc.works.list.useQuery({
    sortBy: "popular",
    limit: 6,
  });

  const philosophyReveal = useScrollReveal();
  const serviceReveal = useScrollReveal();
  const worksReveal = useScrollReveal();

  return (
    <Layout>
      <MouseStalker />
      
      {/* Hero Section - 仕様書に基づく完全リデザイン */}
      <section className="relative min-h-screen flex items-center justify-center">
        <RippleBackground />

        <div className="container relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="mb-6 animate-fade-in">
              <span className="block text-6xl md:text-7xl lg:text-8xl font-light gradient-text text-glow tracking-tight">
                Nivaの想映
              </span>
            </h1>
            
            {/* Sub Title */}
            <p className="text-xl md:text-2xl text-foreground/90 mb-4 animate-fade-in-up animation-delay-200 font-light">
              音・映像・物語の「同期」。その一点が、心に波紋をつくる。
            </p>
            
            {/* Lead Text */}
            <p className="text-base md:text-lg text-muted-foreground mb-12 animate-fade-in-up animation-delay-400 max-w-2xl mx-auto leading-relaxed">
              視覚・聴覚・思考を、一点へ。<br />
              意味が直感に変わる、完全な没入体験。
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-600">
              <Button asChild size="lg" className="liquid-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                <Link href="/works">
                  作品を見る
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="liquid-button border-primary/50 text-foreground hover:bg-primary/10 px-8 py-6 text-lg">
                <Link href="/contact">依頼する</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in animation-delay-800">
          <p className="text-xs tracking-[0.3em] text-gold font-medium mb-3">SCROLL</p>
          <div className="w-px h-16 bg-border/30 mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gold scroll-indicator-line" />
          </div>
        </div>
      </section>

      {/* Philosophy Section - Pattern A + Ripple Concept */}
      <section className="section bg-secondary/30">
        <div 
          ref={philosophyReveal.ref}
          className={`container transition-all duration-1000 ${philosophyReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4 text-center">
              Philosophy: The Logic of Ripples
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-center mb-12 gradient-text">
              ワンストップ・クリエイション
            </h2>
            
            <div className="glass-card p-8 md:p-12 border-glow">
              <div className="space-y-6 text-lg leading-relaxed">
                <p className="text-foreground font-medium text-xl md:text-2xl">
                  企画から完パケまで、たった一人で完結させる。<br />
                  <span className="text-gold">AI技術を実装した、次世代の「ワンストップ・クリエイション」。</span>
                </p>
                
                <p className="text-muted-foreground">
                  私は、生成AI技術とマーケティング視点を融合させた映像クリエイターです。
                  従来、分業で行われていた制作プロセスを個人の制作体制で完結させることで、
                  <span className="text-foreground font-medium">「純度100%の映像」</span>を実現します。
                </p>
                
                <p className="text-muted-foreground">
                  <span className="text-gold font-medium">なぜ、ワンストップなのか。</span><br />
                  それは「同期」のためです。映像、音、そしてストーリー。
                  これらが0.1秒でもズレれば、視聴者の没入は途切れてしまいます。
                  私は全工程をオーケストレーション（指揮）することで、
                  分業によるイメージの劣化（伝言ゲーム）を完全に排除します。
                </p>
                
                <p className="text-muted-foreground">
                  視覚・聴覚・思考。この3つの動機を一点に同期させ、意味を直感へと変換する。
                  その瞬間に生まれる<span className="text-foreground font-medium">「完全な没入体験」</span>こそが、
                  見る人の心に消えない波紋をつくり出します。
                </p>
                
                <p className="text-gold font-medium text-xl">
                  テクノロジーを武器に、感性をダイレクトに届ける。<br />
                  それが、Nivaの想映が提供するクリエイティブです。
                </p>
              </div>
              
              <div className="mt-8 text-center">
                <Button asChild variant="outline" className="liquid-button border-gold/50 text-gold hover:bg-gold/10">
                  <Link href="/philosophy">
                    詳しく見る
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Works Section */}
      <section className="section">
        <div 
          ref={worksReveal.ref}
          className={`container transition-all duration-1000 ${worksReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-2">
                Works Gallery
              </p>
              <h2 className="text-3xl md:text-4xl font-light gradient-text">作品一覧</h2>
            </div>
            <Button asChild variant="ghost" className="group text-gold hover:text-gold/80">
              <Link href="/works">
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

      {/* Service Section - AI One-Stop Production */}
      <section className="section bg-secondary/30">
        <div 
          ref={serviceReveal.ref}
          className={`container transition-all duration-1000 ${serviceReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              AI One-Stop Production
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light gradient-text">
              提供価値
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Point 1: High Purity */}
            <div className="glass-card p-8 hover-lift group">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                <Target className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-2xl font-medium mb-2 text-foreground">High Purity</h3>
              <p className="text-sm text-gold uppercase tracking-wider mb-4">純度</p>
              <p className="text-muted-foreground leading-relaxed">
                企画時の熱量を100%の純度で定着。
                「イメージと違う」が起きない、純度の高いクリエイティブを実現します。
              </p>
            </div>

            {/* Point 2: Deep Immersion */}
            <div className="glass-card p-8 hover-lift group">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                <Sparkles className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-2xl font-medium mb-2 text-foreground">Deep Immersion</h3>
              <p className="text-sm text-gold uppercase tracking-wider mb-4">没入</p>
              <p className="text-muted-foreground leading-relaxed">
                音と映像の緻密な同期により、LPや広告でのCV（行動）に繋がる
                「心に残る波紋」を設計します。
              </p>
            </div>

            {/* Point 3: Speed & Cost */}
            <div className="glass-card p-8 hover-lift group">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                <Zap className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-2xl font-medium mb-2 text-foreground">Speed & Cost</h3>
              <p className="text-sm text-gold uppercase tracking-wider mb-4">合理性</p>
              <p className="text-muted-foreground leading-relaxed">
                AI活用と中間マージンの排除により、TVCM級のクオリティを
                圧倒的なコストパフォーマンスで提供します。
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="liquid-button bg-gold hover:bg-gold/90 text-gold-foreground px-8">
              <Link href="/services">サービス詳細を見る</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/10 -z-10" />
        
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-6 gradient-text">
            その波紋を、あなたのビジネスへ。
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
            プロジェクトのご相談、お見積もりなど、お気軽にお問い合わせください。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="liquid-button bg-gold hover:bg-gold/90 text-gold-foreground px-10 py-6 text-lg">
              <Link href="/contact">依頼フォームへ</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="liquid-button border-gold/50 text-gold hover:bg-gold/10 px-10 py-6 text-lg">
              <Link href="/links">SNSをフォロー</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
