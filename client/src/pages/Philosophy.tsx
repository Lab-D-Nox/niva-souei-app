import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Music, Video, BookOpen, Droplets } from "lucide-react";
import { useRef, useState, useEffect } from "react";

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

// Concept Diagram Component
function ConceptDiagram() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      {/* Central sync point */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
            <Droplets className="w-8 h-8 text-gold" />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border border-gold/30 animate-ping" style={{ animationDuration: '3s' }} />
      </div>
      
      {/* Sound node - Top */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-2 hover-lift">
            <Music className="w-8 h-8 text-gold" />
          </div>
          <span className="text-sm font-serif text-[#2B3A42]">音</span>
          <span className="text-xs text-[#5A6B75]">Sound</span>
        </div>
      </div>
      
      {/* Visual node - Bottom Left */}
      <div className="absolute left-0 bottom-[15%]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-2 hover-lift">
            <Video className="w-8 h-8 text-[#5B8A9A]" />
          </div>
          <span className="text-sm font-serif text-[#2B3A42]">映像</span>
          <span className="text-xs text-[#5A6B75]">Visual</span>
        </div>
      </div>
      
      {/* Story node - Bottom Right */}
      <div className="absolute right-0 bottom-[15%]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center mb-2 hover-lift">
            <BookOpen className="w-8 h-8 text-[#7A9E7E]" />
          </div>
          <span className="text-sm font-serif text-[#2B3A42]">物語</span>
          <span className="text-xs text-[#5A6B75]">Story</span>
        </div>
      </div>
      
      {/* Connecting lines with animation */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        {/* Sound to Center */}
        <line 
          x1="200" y1="60" x2="200" y2="160" 
          stroke="url(#goldGradient)" 
          strokeWidth="2" 
          strokeDasharray="8 4"
          className="diagram-line"
          style={{ animationDelay: '0s' }}
        />
        {/* Visual to Center */}
        <line 
          x1="60" y1="300" x2="160" y2="220" 
          stroke="url(#blueGradient)" 
          strokeWidth="2" 
          strokeDasharray="8 4"
          className="diagram-line"
          style={{ animationDelay: '0.3s' }}
        />
        {/* Story to Center */}
        <line 
          x1="340" y1="300" x2="240" y2="220" 
          stroke="url(#greenGradient)" 
          strokeWidth="2" 
          strokeDasharray="8 4"
          className="diagram-line"
          style={{ animationDelay: '0.6s' }}
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C0A060" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#C0A060" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B8A9A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5B8A9A" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7A9E7E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7A9E7E" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function Philosophy() {
  const heroReveal = useScrollReveal();
  const diagramReveal = useScrollReveal();
  const statementReveal = useScrollReveal();
  const processReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section">
        <div 
          ref={heroReveal.ref}
          className={`container transition-all duration-1000 ${heroReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              Philosophy
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2B3A42] mb-6">
              Nivaの想映
            </h1>
            <p className="text-xl text-[#5A6B75] leading-relaxed">
              想い/意図を、AIで"伝わる映像"として可視化・翻訳する表現活動
            </p>
          </div>
        </div>
      </section>

      {/* Concept Diagram Section */}
      <section className="section bg-white/50">
        <div 
          ref={diagramReveal.ref}
          className={`container transition-all duration-1000 ${diagramReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Diagram */}
            <div className="order-2 lg:order-1">
              <ConceptDiagram />
            </div>
            
            {/* Statement */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B3A42] mb-8 leading-relaxed">
                源流は、常に<br />
                <span className="text-gold">『音』</span>にある。
              </h2>
              <p className="text-lg text-[#5A6B75] leading-relaxed mb-6">
                音楽が感情を呼び起こし、<br />
                映像がその感情を可視化し、<br />
                物語がすべてを意味で包む。
              </p>
              <p className="text-[#5A6B75] leading-relaxed">
                この三要素が「同期」する瞬間、<br />
                見る人の心に波紋が生まれる。<br />
                それが、Nivaの想映の核心です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Statement */}
      <section className="section">
        <div 
          ref={statementReveal.ref}
          className={`container max-w-4xl transition-all duration-1000 ${statementReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <blockquote className="text-center">
            <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-[#2B3A42] leading-relaxed mb-8">
              「想映」とは、<br />
              想いを映像に<span className="text-gold">翻訳</span>すること。
            </p>
            <p className="text-lg text-[#5A6B75] leading-relaxed max-w-2xl mx-auto">
              技術はあくまで手段であり、主役は常に「想い」。<br />
              AIの進化により、誰もが高品質な映像を生成できる時代になりました。<br />
              しかし、技術だけでは「伝わる」表現は生まれません。
            </p>
          </blockquote>
        </div>
      </section>

      {/* Process Section */}
      <section className="section bg-white/50">
        <div 
          ref={processReveal.ref}
          className={`container max-w-4xl transition-all duration-1000 ${processReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              Process
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2B3A42]">
              ワンストップ・クリエーション
            </h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold to-transparent" />
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-serif text-xl">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#2B3A42] mb-2">ヒアリング</h3>
                  <p className="text-[#5A6B75] leading-relaxed">
                    クライアントの想いに寄り添い、時にはクライアント自身も気づいていない
                    本当の意図を引き出します。「こんな感じで」という曖昧なイメージを、
                    「これが伝えたかったことだ」という確信に変える第一歩です。
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#5B8A9A] to-transparent" />
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-[#5B8A9A]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#5B8A9A] font-serif text-xl">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#2B3A42] mb-2">コンセプト設計</h3>
                  <p className="text-[#5A6B75] leading-relaxed">
                    音・映像・物語の三要素をどう組み合わせるか。
                    ムードボードや絵コンテを通じて、完成形のビジョンを共有します。
                    この段階で「同期」のポイントを明確にします。
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7A9E7E] to-transparent" />
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-[#7A9E7E]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#7A9E7E] font-serif text-xl">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#2B3A42] mb-2">制作・翻訳</h3>
                  <p className="text-[#5A6B75] leading-relaxed">
                    複数のAIツールを組み合わせ、それぞれの強みを活かし、
                    時には手作業で調整を加えながら、「伝わる」表現を追求します。
                    AIは「想いを形にするための最高の道具」として活用します。
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold to-transparent" />
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-serif text-xl">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-serif text-[#2B3A42] mb-2">納品・波紋</h3>
                  <p className="text-[#5A6B75] leading-relaxed">
                    完成した作品をお届けし、その波紋があなたのビジネスや表現活動に
                    広がっていくのを見届けます。必要に応じて、各プラットフォームへの
                    最適化もサポートします。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-[#2B3A42] text-[#F4F8FA]">
        <div 
          ref={ctaReveal.ref}
          className={`container text-center transition-all duration-1000 ${ctaReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">
            あなたの想いを、<br className="md:hidden" />形にしませんか？
          </h2>
          <p className="text-lg text-[#F4F8FA]/70 mb-8 max-w-2xl mx-auto">
            まずはお気軽にご相談ください。
            ヒアリングを通じて、最適なプランと進め方をご提案します。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-[#2B3A42] rounded-full px-8">
              <Link href="/contact">
                依頼する
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-[#F4F8FA]/30 text-[#F4F8FA] hover:bg-[#F4F8FA]/10 rounded-full px-8">
              <Link href="/works">作品を見る</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
