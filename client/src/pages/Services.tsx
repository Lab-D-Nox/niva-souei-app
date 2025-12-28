import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronDown, ChevronUp, Info, X, Palette, Type, Youtube, RefreshCw, Monitor, Smartphone, Zap, Package, Music, Gift, Globe, ShoppingBag, Building, Tv, Mic, Eye, Tent, Users, BookOpen, Flame, Film, Cake, MapPin, Rocket, RotateCcw, HelpCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// 5 Tier Plans based on Ver.5.0 specification
const tiers = [
  {
    tier: 1,
    name: "Droplet",
    label: "雫",
    priceRange: "¥50,000 〜 ¥80,000",
    duration: "5-10s",
    category: "Motion Identity",
    tagline: "静止画に命を吹き込み、記憶のアンカー（碇）を打つ",
    description: "素材1枚、ロゴ1つから制作可能なエントリープラン。",
    useCases: [
      { icon: Palette, title: "ロゴアニメーション", desc: "企業の静止画ロゴに「動き」と「音」をつけて、動画の冒頭や末尾に定着させる。" },
      { icon: Type, title: "キネティック・タイポグラフィ", desc: "短いキャッチコピーや単語を、文字のアニメーションだけで格好良く見せる。" },
      { icon: Youtube, title: "YouTube オープニング/エンディング", desc: "動画の始まりと終わりに毎回入れる、番組の顔となる5秒映像。" },
      { icon: RefreshCw, title: "ローディングアニメーション", desc: "Webサイト読み込み中に表示される、ブランドの世界観をループさせる映像。" },
      { icon: Monitor, title: "デジタルサイネージのアイキャッチ", desc: "街頭ビジョンで、通行人の視界の端に引っかかる「動き」を作る。" },
    ],
    specs: {
      process: "音響選定 / モーション設計 / 同期編集",
      revisions: "2回まで無料",
      marketPrice: "15万〜30万円相当",
      marketNote: "サウンド・モーション分業コストをカット",
    },
  },
  {
    tier: 2,
    name: "Ripple",
    label: "波紋",
    priceRange: "¥150,000 〜 ¥250,000",
    duration: "15-30s",
    category: "Short Impact",
    tagline: "最初の3秒で手を止めさせ、拡散の波紋を広げる",
    description: "スマホ視聴に最適化された、高テンポ・高密度のショート動画。",
    useCases: [
      { icon: Smartphone, title: "SNS広告動画", desc: "縦型全画面。「最初の3秒」で離脱させないハイテンポな編集。TikTok/Reels/Shorts対応。" },
      { icon: Zap, title: "イベント・個展ティザー", desc: "「開催決定」「Coming Soon」などの情報を、期待感を煽る演出で告知。" },
      { icon: Package, title: "プロダクト・スニークピーク", desc: "新商品の全貌を見せず、シルエットや一部のアップだけで興味を惹く映像。" },
      { icon: Music, title: "リリックビデオ (Short Ver.)", desc: "楽曲のサビ部分だけを使い、歌詞をモーショングラフィックスで演出する。" },
      { icon: Gift, title: "デジタル・グリーティングカード", desc: "年賀状や招待状を、紙ではなくリッチなショート動画として送る。" },
    ],
    specs: {
      process: "企画構成 / BGM選定 / AI素材生成 / リズム編集",
      revisions: "2回まで無料",
      marketPrice: "40万〜60万円相当",
      marketNote: "代理店マージン・進行管理費をカット",
    },
  },
  {
    tier: 3,
    name: "Stream",
    label: "水流",
    priceRange: "¥300,000 〜 ¥500,000",
    duration: "30-60s",
    category: "Standard Promotion",
    tagline: "論理で説得し、情緒でファンにする。Nivaのスタンダード",
    description: "商品やサービスの魅力を、ストーリーとして正しく、美しく伝える。",
    useCases: [
      { icon: Globe, title: "Webトップ・ヒーロー動画", desc: "サイト訪問者を釘付けにする、ブランドの世界観を凝縮したメイン映像。" },
      { icon: ShoppingBag, title: "商品・サービス紹介PV", desc: "「何ができる商品か」を、実写合成や3Dテキストを用いて分かりやすく解説。" },
      { icon: Building, title: "施設・店舗・カフェ空間紹介", desc: "店内の雰囲気、光の加減、シズル感を演出し、来店を促す映像。" },
      { icon: Tv, title: "YouTubeインストリーム広告", desc: "広告として配信するための、スキップされない構成を持ったCM。" },
      { icon: Mic, title: "インタビュー・ダイジェスト", desc: "お客様の声や社員インタビューを、退屈させないBGMとインサート映像で演出。" },
    ],
    specs: {
      process: "市場分析 / 絵コンテ / AIナレーション / 3D・実写合成 / カラーグレーディング",
      revisions: "2回まで無料",
      marketPrice: "100万〜150万円相当",
      marketNote: "実写撮影・照明・音声スタッフ等の人件費を技術代替",
    },
    featured: true,
  },
  {
    tier: 4,
    name: "Deep",
    label: "深海",
    priceRange: "¥600,000 〜 ¥900,000",
    duration: "60-90s",
    category: "Branding & Concept",
    tagline: "機能ではなく『意義』を伝える。ブランドの深層へ潜る旅",
    description: "表面的な説明を超え、企業のビジョンや哲学を映像化する。",
    useCases: [
      { icon: Eye, title: "企業ビジョンムービー", desc: "「我々は何者か」という哲学・MVVを、抽象的な映像美とナレーションで描く。" },
      { icon: Tent, title: "展示会・イベント用メインスクリーン", desc: "ブースの顔となる映像。来場者の足を止め、世界観に引き込む大型映像。" },
      { icon: Users, title: "採用ブランディング", desc: "条件面ではなく「情熱」や「社風」を伝え、共感する人材を集める映像。" },
      { icon: BookOpen, title: "創業者ストーリー / 社史アニメーション", desc: "代表の過去や創業の苦労を、一貫したキャラクター生成でドラマ化する。" },
      { icon: Flame, title: "クラウドファンディング・メイン動画", desc: "プロジェクトの熱量を伝え、支援者の感情を動かして「支援ボタン」を押させる。" },
    ],
    specs: {
      process: "ペルソナ設計 / 脚本制作 / キャラクター生成 / ASMR音響設計 / 高度VFX",
      revisions: "期間内、回数制限なし（大幅変更除く）",
      marketPrice: "200万〜300万円相当",
      marketNote: "大手代理店の企画・ブランディング費込みの相場",
      bonus: "SNS用ショートVer.（15秒）へのリサイズ無料",
    },
  },
  {
    tier: 5,
    name: "Genesis",
    label: "源泉",
    priceRange: "¥1,000,000 〜",
    duration: "3-5m",
    category: "Total Art Direction",
    tagline: "想いを神話にする。オリジナル楽曲から創る総合芸術",
    description: "既存の音楽は使わない。あなたの想いを「歌詞」にし、ゼロから世界を創造する。",
    useCases: [
      { icon: Film, title: "完全オリジナル・ミュージックビデオ", desc: "楽曲の世界観を、実写では不可能なスケール（宇宙、ファンタジー）で映像化する。" },
      { icon: Cake, title: "周年事業・記念式典オープニング", desc: "10年、50年の歴史を振り返り、未来への展望を神話的なスケールで描く。" },
      { icon: MapPin, title: "自治体・観光PR", desc: "その土地の伝承や物語を掘り起こし、観光地を「聖地」化する映像。" },
      { icon: Rocket, title: "大型プロジェクト・キックオフ映像", desc: "社運を賭けたプロジェクトの発表時、関わる全員の士気を最高潮に高める映像。" },
      { icon: RotateCcw, title: "リブランディング・キャンペーン", desc: "企業イメージを刷新する際、旧来のイメージを壊し、新しい顔を提示する象徴映像。" },
    ],
    specs: {
      process: "オリジナル作詞・作曲 / AIボーカル生成 / コンセプトアート / 神話級VFX / 総指揮",
      revisions: "プロジェクト完了まで徹底対応",
      marketPrice: "500万〜1,000万円相当",
      marketNote: "楽曲制作費＋フルCG制作費＋監督費の合計",
    },
    premium: true,
  },
];

// Market Comparison Data
const marketComparison = [
  { item: "チーム体制", traditional: "分業制 (5〜10名)\nP/D/PM/撮影/編集/音響/CG", niva: "ワンストップ (1名 + AI)\n全工程をNivaが指揮・実行" },
  { item: "コスト構造", traditional: "人件費・マージン・スタジオ代\n見積もりの約60%が制作外コスト", niva: "技術料・クリエイティブ費のみ\n予算の100%を品質に還元" },
  { item: "音響制作", traditional: "映像完成後にBGMを選定\n（ズレが生じやすい）", niva: "企画段階から音を設計\n（0.1秒のズレもない完全同期）" },
  { item: "修正スピード", traditional: "確認リレーにより数日〜1週間", niva: "即時対応可能\n（AI活用で修正コストも圧縮）" },
];

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

// Use Case Accordion Component
function UseCaseAccordion({ tier }: { tier: typeof tiers[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gold hover:text-gold/80 transition-colors border border-gold/30 rounded-lg hover:bg-gold/5"
      >
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span>{isOpen ? "閉じる" : "制作対応リスト・用途を見る"}</span>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-3 p-4 bg-white/30 rounded-lg">
          {tier.useCases.map((useCase, i) => (
            <div key={i} className="flex items-start gap-3">
              <useCase.icon className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#2B3A42]">{useCase.title}</p>
                <p className="text-xs text-[#5A6B75] leading-relaxed">{useCase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Specs Accordion Component
function SpecsAccordion({ tier }: { tier: typeof tiers[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#5A6B75] hover:text-[#2B3A42] transition-colors"
      >
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span>{isOpen ? "閉じる" : "スペック・市場価値"}</span>
      </button>
      
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 bg-[#2B3A42]/5 rounded-lg space-y-2 text-xs">
          <div>
            <span className="text-[#5A6B75]">工程：</span>
            <span className="text-[#2B3A42]">{tier.specs.process}</span>
          </div>
          <div>
            <span className="text-[#5A6B75]">修正：</span>
            <span className="text-[#2B3A42]">{tier.specs.revisions}</span>
          </div>
          {tier.specs.bonus && (
            <div>
              <span className="text-[#5A6B75]">特典：</span>
              <span className="text-gold">{tier.specs.bonus}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#2B3A42]/10">
            <span className="text-[#5A6B75]">市場相場：</span>
            <span className="text-gold font-medium">{tier.specs.marketPrice}</span>
            <p className="text-[#5A6B75] mt-1">（{tier.specs.marketNote}）</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Market Comparison Modal
function MarketComparisonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#5A6B75] hover:text-[#2B3A42] transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center mb-8">
          <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-2">Market Comparison</p>
          <h3 className="text-2xl md:text-3xl font-serif text-[#2B3A42]">なぜこの価格で提供できるのか？</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#2B3A42]/10">
                <th className="py-4 px-4 text-left text-sm font-medium text-[#5A6B75]">項目</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-[#5A6B75]">一般的な映像制作会社</th>
                <th className="py-4 px-4 text-left text-sm font-medium text-gold">Nivaの想映 (One-Stop)</th>
              </tr>
            </thead>
            <tbody>
              {marketComparison.map((row, i) => (
                <tr key={i} className="border-b border-[#2B3A42]/5">
                  <td className="py-4 px-4 text-sm font-medium text-[#2B3A42]">{row.item}</td>
                  <td className="py-4 px-4 text-sm text-[#5A6B75] whitespace-pre-line">{row.traditional}</td>
                  <td className="py-4 px-4 text-sm text-[#2B3A42] whitespace-pre-line font-medium">{row.niva}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const [showMarketComparison, setShowMarketComparison] = useState(false);
  const heroReveal = useScrollReveal();
  const processReveal = useScrollReveal();
  const tiersReveal = useScrollReveal();
  const notesReveal = useScrollReveal();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section pt-32">
        <div 
          ref={heroReveal.ref}
          className={`container transition-all duration-1000 ${heroReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              Service & Pricing
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#2B3A42] mb-6">
              料金プラン
            </h1>
            <p className="text-lg text-[#5A6B75] leading-relaxed mb-8">
              クライアントが「自分の作りたい映像」を直感的に選べるよう、<br className="hidden md:block" />
              <span className="text-gold font-medium">「検索性（Use Case）」</span>と<span className="text-gold font-medium">「納得感（Market Value）」</span>を重視したデザインです。
            </p>
            <button
              onClick={() => setShowMarketComparison(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm text-gold border border-gold/30 rounded-full hover:bg-gold/5 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              なぜこの価格で提供できるのか？
            </button>
          </div>
        </div>
      </section>

      {/* Process Diagram Section */}
      <section className="section bg-gradient-to-b from-transparent via-white/50 to-transparent">
        <div 
          ref={processReveal.ref}
          className={`container transition-all duration-1000 ${processReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-2">Sound Driven Workflow</p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2B3A42]">Niva独自の「音から作る」フロー</h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
              {/* Step 1 */}
              <div className="glass-card p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-medium px-3 py-1 rounded-full">
                  Step 1
                </div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                  <Music className="h-8 w-8 text-gold" />
                </div>
                <h3 className="text-xl font-serif text-[#2B3A42] mb-2">Sound</h3>
                <p className="text-sm text-gold mb-2">源流</p>
                <p className="text-sm text-[#5A6B75]">ブランドの想いを<br />「リズム・音」に変換</p>
              </div>
              
              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="h-8 w-8 text-gold/30" />
              </div>
              
              {/* Step 2 */}
              <div className="glass-card p-6 text-center relative md:col-start-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-medium px-3 py-1 rounded-full">
                  Step 2
                </div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#5B8A9A]/20 to-[#5B8A9A]/5 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-[#5B8A9A]" />
                </div>
                <h3 className="text-xl font-serif text-[#2B3A42] mb-2">Sync</h3>
                <p className="text-sm text-[#5B8A9A] mb-2">同期</p>
                <p className="text-sm text-[#5A6B75]">0.1秒単位で<br />映像と物語を同期</p>
              </div>
              
              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center md:col-start-3 md:row-start-1">
                <ArrowRight className="h-8 w-8 text-gold/30 md:hidden" />
              </div>
              
              {/* Step 3 */}
              <div className="glass-card p-6 text-center relative md:col-start-3">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-medium px-3 py-1 rounded-full">
                  Step 3
                </div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#7A9E7E]/20 to-[#7A9E7E]/5 flex items-center justify-center">
                  <svg className="h-8 w-8 text-[#7A9E7E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="12" cy="12" r="6" opacity="0.5" />
                    <circle cx="12" cy="12" r="9" opacity="0.25" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif text-[#2B3A42] mb-2">Ripple</h3>
                <p className="text-sm text-[#7A9E7E] mb-2">波紋</p>
                <p className="text-sm text-[#5A6B75]">視聴者の心に<br />深い没入を生む</p>
              </div>
            </div>
            
            {/* Mobile arrows */}
            <div className="flex md:hidden justify-center my-4">
              <ChevronDown className="h-6 w-6 text-gold/30" />
            </div>
          </div>
        </div>
      </section>

      {/* 5 Tier Cards */}
      <section className="section">
        <div 
          ref={tiersReveal.ref}
          className={`container transition-all duration-1000 ${tiersReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-2">5 Tier Structure</p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#2B3A42]">プロジェクトの規模に合わせた5つのプラン</h2>
          </div>
          
          <div className="space-y-8">
            {tiers.map((tier) => (
              <div
                key={tier.tier}
                className={`glass-card p-6 md:p-8 ${tier.featured ? 'ring-2 ring-gold' : ''} ${tier.premium ? 'bg-gradient-to-br from-gold/5 to-transparent' : ''}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Basic Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-start gap-4">
                      <div className={`badge-tier-${tier.tier} px-3 py-1 rounded-full text-xs font-medium`}>
                        Tier {tier.tier}
                      </div>
                      {tier.featured && (
                        <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded">STANDARD</span>
                      )}
                      {tier.premium && (
                        <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded">PREMIUM</span>
                      )}
                    </div>
                    
                    <h3 className="text-3xl font-serif text-[#2B3A42] mt-4">{tier.name}</h3>
                    <p className="text-sm text-[#5A6B75]">（{tier.label}）</p>
                    
                    <div className="mt-4">
                      <p className="text-2xl md:text-3xl font-medium text-gold">{tier.priceRange}</p>
                      <p className="text-sm text-[#5A6B75] mt-1">{tier.category} / {tier.duration}</p>
                    </div>
                    
                    <Button asChild className="liquid-button mt-6 w-full lg:w-auto">
                      <Link href={`/contact?tier=${tier.tier}`}>
                        このプランで依頼
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Right: Description & Use Cases */}
                  <div className="lg:col-span-2">
                    <blockquote className="text-lg md:text-xl font-serif text-[#2B3A42] italic border-l-4 border-gold pl-4 mb-4">
                      「{tier.tagline}」
                    </blockquote>
                    <p className="text-[#5A6B75] mb-4">{tier.description}</p>
                    
                    <UseCaseAccordion tier={tier} />
                    <SpecsAccordion tier={tier} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notes & Payment Section */}
      <section className="section bg-[#2B3A42] text-[#F4F8FA]">
        <div 
          ref={notesReveal.ref}
          className={`container transition-all duration-1000 ${notesReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-2">Notes & Payment</p>
              <h2 className="text-2xl md:text-3xl font-serif">注意事項・お支払い</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">制作体制</h4>
                  <p className="text-sm text-[#F4F8FA]/70">企画・構成・生成・編集・音響の全工程をNivaが一人で行う「ワンストップ制作」です。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Mic className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">ナレーション</h4>
                  <p className="text-sm text-[#F4F8FA]/70">AI音声生成技術を使用します。（高品質かつ修正が早く、コストも抑えられます）</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">納期について</h4>
                  <p className="text-sm text-[#F4F8FA]/70">「先着順」で着手いたします。他のご依頼と重複している場合、着手までにお時間をいただくため、納期が長くなる場合がございます。余裕を持ってご相談ください。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Info className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">お支払い</h4>
                  <p className="text-sm text-[#F4F8FA]/70">着手金として<span className="text-gold font-medium">50%</span>、納品完了後に残金<span className="text-gold font-medium">50%</span>のご入金をお願いいたします。</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="liquid-button px-8 py-6 text-lg rounded-full">
                <Link href="/contact">
                  お問い合わせ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Market Comparison Modal */}
      <MarketComparisonModal 
        isOpen={showMarketComparison} 
        onClose={() => setShowMarketComparison(false)} 
      />
    </Layout>
  );
}
