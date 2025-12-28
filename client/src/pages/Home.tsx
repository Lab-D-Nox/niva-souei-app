import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { WorkCard, WorkCardSkeleton } from "@/components/WorkCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Ear, Eye, Brain, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

// Caustics background - water surface effect
function CausticsBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {/* Base gradient - Ice Blue White */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F4F8FA] via-[#E8F0F5] to-[#F4F8FA]" />
      
      {/* Caustics overlay - water ripple pattern */}
      <svg className="caustics-bg w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="caustics-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id="caustics-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C0A060" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#5B8A9A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#caustics-gradient)" filter="url(#caustics-filter)" />
      </svg>
    </div>
  );
}

// Click ripple effect
function ClickRipple() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    const newRipple = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1500);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <>
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="water-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
          }}
        />
      ))}
    </>
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

// Three light beams animation component
function LightBeamsAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Three converging light beams */}
      <div className="light-beam light-beam-sound" />
      <div className="light-beam light-beam-visual" />
      <div className="light-beam light-beam-story" />
      
      {/* Sync burst at center */}
      <div className="sync-burst" />
      
      {/* Concentric ripples */}
      <div className="concentric-ripple" />
      <div className="concentric-ripple" />
      <div className="concentric-ripple" />
      <div className="concentric-ripple" />
    </div>
  );
}

// Concept diagram component
function ConceptDiagram() {
  const diagramReveal = useScrollReveal();
  
  return (
    <div 
      ref={diagramReveal.ref}
      className={`relative w-full max-w-md mx-auto transition-all duration-1000 ${diagramReveal.isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <svg viewBox="0 0 400 300" className="w-full h-auto">
        {/* Input lines */}
        <g className={diagramReveal.isVisible ? 'diagram-line' : ''}>
          {/* Sound line */}
          <line x1="50" y1="80" x2="200" y2="150" stroke="#C0A060" strokeWidth="2" strokeDasharray="100" />
          {/* Visual line */}
          <line x1="50" y1="150" x2="200" y2="150" stroke="#5B8A9A" strokeWidth="2" strokeDasharray="100" style={{ animationDelay: '0.3s' }} />
          {/* Story line */}
          <line x1="50" y1="220" x2="200" y2="150" stroke="#7A9E7E" strokeWidth="2" strokeDasharray="100" style={{ animationDelay: '0.6s' }} />
        </g>
        
        {/* Input icons */}
        <g className="fill-[#2B3A42]">
          <circle cx="50" cy="80" r="25" fill="rgba(192, 160, 96, 0.2)" stroke="#C0A060" strokeWidth="1" />
          <text x="50" y="85" textAnchor="middle" fontSize="12" fill="#C0A060">耳</text>
          
          <circle cx="50" cy="150" r="25" fill="rgba(91, 138, 154, 0.2)" stroke="#5B8A9A" strokeWidth="1" />
          <text x="50" y="155" textAnchor="middle" fontSize="12" fill="#5B8A9A">目</text>
          
          <circle cx="50" cy="220" r="25" fill="rgba(122, 158, 126, 0.2)" stroke="#7A9E7E" strokeWidth="1" />
          <text x="50" y="225" textAnchor="middle" fontSize="12" fill="#7A9E7E">脳</text>
        </g>
        
        {/* Sync point */}
        <circle cx="200" cy="150" r="15" fill="#C0A060" className="float" />
        <text x="200" y="155" textAnchor="middle" fontSize="10" fill="#F4F8FA" fontWeight="500">Sync</text>
        
        {/* Output ripples */}
        <g className={diagramReveal.isVisible ? '' : 'opacity-0'}>
          <circle cx="320" cy="150" r="30" fill="none" stroke="rgba(192, 160, 96, 0.5)" strokeWidth="1" className="float" style={{ animationDelay: '0.2s' }} />
          <circle cx="320" cy="150" r="50" fill="none" stroke="rgba(192, 160, 96, 0.3)" strokeWidth="1" className="float" style={{ animationDelay: '0.4s' }} />
          <circle cx="320" cy="150" r="70" fill="none" stroke="rgba(192, 160, 96, 0.15)" strokeWidth="1" className="float" style={{ animationDelay: '0.6s' }} />
        </g>
        
        {/* Output arrow */}
        <line x1="215" y1="150" x2="280" y2="150" stroke="#C0A060" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#C0A060" />
          </marker>
        </defs>
        
        {/* Labels */}
        <text x="50" y="260" textAnchor="middle" fontSize="11" fill="#5A6B75">Input</text>
        <text x="200" y="190" textAnchor="middle" fontSize="11" fill="#5A6B75">Sync Point</text>
        <text x="320" y="240" textAnchor="middle" fontSize="11" fill="#5A6B75">Emotion</text>
      </svg>
    </div>
  );
}

export default function Home() {
  const { data: latestWorks, isLoading: latestLoading } = trpc.works.list.useQuery({
    sortBy: "newest",
    limit: 3,
  });

  const philosophyReveal = useScrollReveal();
  const worksReveal = useScrollReveal();
  const serviceReveal = useScrollReveal();

  return (
    <Layout>
      <CausticsBackground />
      <ClickRipple />
      
      {/* Hero Section - 3本の光が衝突して波紋が広がる */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <LightBeamsAnimation />

        <div className="container relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="mb-6 animate-fade-in">
              <span className="block text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-[#2B3A42]">
                Nivaの想映
              </span>
            </h1>
            
            {/* Sub Title */}
            <p className="text-xl md:text-2xl text-[#2B3A42] mb-8 animate-fade-in-up animation-delay-200 font-serif">
              音・映像・物語の「同期」。<br className="md:hidden" />その一点が、心に波紋をつくる。
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
              <Button asChild size="lg" className="liquid-button px-8 py-6 text-lg rounded-full">
                <Link href="/works">
                  作品を見る
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="outline-button px-8 py-6 text-lg rounded-full">
                <Link href="/contact">依頼する</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in animation-delay-600">
          <p className="text-xs tracking-[0.3em] text-gold font-medium mb-3">SCROLL</p>
          <div className="w-px h-16 bg-[#2B3A42]/20 mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gold scroll-indicator-line" />
          </div>
        </div>
      </section>

      {/* Philosophy Section - 概念図とステートメント */}
      <section className="section">
        <div 
          ref={philosophyReveal.ref}
          className={`container transition-all duration-1000 ${philosophyReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              Philosophy
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2B3A42]">
              想映とは
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Concept Diagram */}
            <ConceptDiagram />
            
            {/* Right: Statement */}
            <div className="glass-card p-8 md:p-10">
              <h3 className="text-2xl md:text-3xl font-serif text-[#2B3A42] mb-6">
                「源流は、常に<span className="text-gold">『音』</span>にある。」
              </h3>
              
              <div className="space-y-4 text-[#5A6B75] leading-relaxed">
                <p>
                  Nivaの映像制作は、PCの前ではなく、音を聴くことから始まります。
                  多くの制作現場では映像が先にあり、音は後付けされます。しかし、それでは「ズレ」が生じます。
                </p>
                
                <p>
                  私は、まずブランドの想いを「リズム」と「和音」に変換します。
                  その音の波形に合わせて、映像と物語を1フレーム単位で同期させる。
                </p>
                
                <p className="text-[#2B3A42] font-medium">
                  視覚・聴覚・思考が完全に重なった瞬間、見る人の心には、決して消えない波紋が広がります。
                </p>
                
                <p>
                  これが、AI技術と感性を同期させた、Niva独自の<span className="text-gold font-medium">「想映（Thought Projection）」</span>です。
                </p>
              </div>
              
              <div className="mt-8">
                <Button asChild variant="outline" className="outline-button rounded-full">
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

      {/* Works Section - Tier表示 */}
      <section className="section bg-white/50">
        <div 
          ref={worksReveal.ref}
          className={`container transition-all duration-1000 ${worksReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              Works
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2B3A42]">制作実績</h2>
          </div>

          {/* Featured Works by Tier */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Tier 1: Droplet */}
            <div className="glass-card p-6 hover-lift">
              <div className="badge-tier-1 inline-block px-3 py-1 rounded-full text-xs font-medium mb-4">
                Tier 1: Droplet（雫）
              </div>
              <h3 className="text-xl font-serif text-[#2B3A42] mb-2">モーションロゴ「一休百福」</h3>
              <p className="text-sm text-[#5A6B75] mb-4">ロゴアニメーション / 8秒 / 音の可視化</p>
              <div className="aspect-video bg-[#2B3A42]/5 rounded-lg flex items-center justify-center">
                <span className="text-[#5A6B75] text-sm">Coming Soon</span>
              </div>
            </div>
            
            {/* Tier 3: Stream */}
            <div className="glass-card p-6 hover-lift">
              <div className="badge-tier-3 inline-block px-3 py-1 rounded-full text-xs font-medium mb-4">
                Tier 3: Stream（水流）
              </div>
              <h3 className="text-xl font-serif text-[#2B3A42] mb-2">商品CM「I..CANBY」</h3>
              <p className="text-sm text-[#5A6B75] mb-4">商品プロモーション / 60秒 / AI×実写合成</p>
              <div className="aspect-video bg-[#2B3A42]/5 rounded-lg flex items-center justify-center">
                <span className="text-[#5A6B75] text-sm">Coming Soon</span>
              </div>
            </div>
            
            {/* Tier 5: Genesis */}
            <div className="glass-card p-6 hover-lift">
              <div className="badge-tier-5 inline-block px-3 py-1 rounded-full text-xs font-medium mb-4">
                Tier 5: Genesis（源泉）
              </div>
              <h3 className="text-xl font-serif text-[#2B3A42] mb-2">コンセプト映像「天女サロン」</h3>
              <p className="text-sm text-[#5A6B75] mb-4">ブランディング / 3分 / オリジナル楽曲生成</p>
              <div className="aspect-video bg-[#2B3A42]/5 rounded-lg flex items-center justify-center">
                <span className="text-[#5A6B75] text-sm">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild variant="outline" className="outline-button rounded-full">
              <Link href="/works">
                すべての作品を見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service & Pricing Section Preview */}
      <section className="section">
        <div 
          ref={serviceReveal.ref}
          className={`container transition-all duration-1000 ${serviceReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              Service & Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2B3A42]">料金プラン</h2>
          </div>

          {/* 5 Tier Cards Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[
              { tier: 1, name: "Droplet", label: "雫", price: "¥50,000〜", desc: "モーション・アイデンティティ" },
              { tier: 2, name: "Ripple", label: "波紋", price: "¥150,000〜", desc: "SNS特化型ショート" },
              { tier: 3, name: "Stream", label: "水流", price: "¥300,000〜", desc: "スタンダードCM" },
              { tier: 4, name: "Deep", label: "深海", price: "¥600,000〜", desc: "世界観構築ムービー" },
              { tier: 5, name: "Genesis", label: "源泉", price: "¥1,000,000〜", desc: "総合芸術" },
            ].map((plan) => (
              <div key={plan.tier} className="glass-card p-5 text-center hover-lift">
                <div className={`badge-tier-${plan.tier} inline-block px-3 py-1 rounded-full text-xs font-medium mb-3`}>
                  Tier {plan.tier}
                </div>
                <h3 className="text-lg font-serif text-[#2B3A42] mb-1">{plan.name}</h3>
                <p className="text-xs text-[#5A6B75] mb-2">（{plan.label}）</p>
                <p className="text-gold font-medium mb-2">{plan.price}</p>
                <p className="text-xs text-[#5A6B75]">{plan.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild className="liquid-button rounded-full px-8 py-6 text-lg">
              <Link href="/service">
                詳細を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="section bg-[#2B3A42] text-[#F4F8FA]">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">
            その波紋を、<br className="md:hidden" />あなたのビジネスへ。
          </h2>
          <p className="text-lg text-[#F4F8FA]/70 mb-8 max-w-2xl mx-auto">
            フォーム送信後、48時間以内に返信いたします。
          </p>
          <Button asChild size="lg" className="bg-gold hover:bg-gold/90 text-[#2B3A42] rounded-full px-8 py-6 text-lg">
            <Link href="/contact">
              お問い合わせ
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
