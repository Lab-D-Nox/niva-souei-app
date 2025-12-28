import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Check, ChevronDown, ChevronUp, Info, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// 5 Tier Plans based on specification
const tiers = [
  {
    tier: 1,
    name: "Droplet",
    label: "雫",
    price: "¥50,000〜",
    description: "モーション・アイデンティティ",
    concept: "ブランドの「核」を動かす。ロゴが呼吸を始める瞬間。",
    deliverables: [
      "モーションロゴ（5〜15秒）",
      "SNSアイコン用ループ動画",
      "音の可視化エフェクト",
    ],
    timeline: "3〜7営業日",
    revisions: 2,
    badge: "badge-tier-1",
  },
  {
    tier: 2,
    name: "Ripple",
    label: "波紋",
    price: "¥150,000〜",
    description: "SNS特化型ショート",
    concept: "一瞬で伝わる、縦型の衝撃。TikTok/Reels/Shorts最適化。",
    deliverables: [
      "ショート動画（15〜60秒）×3本",
      "サムネイル画像セット",
      "キャプション案",
    ],
    timeline: "7〜14営業日",
    revisions: 3,
    badge: "badge-tier-2",
  },
  {
    tier: 3,
    name: "Stream",
    label: "水流",
    price: "¥300,000〜",
    description: "スタンダードCM",
    concept: "商品の魅力を、物語で包む。60秒で完結する世界観。",
    deliverables: [
      "CM動画（30〜90秒）",
      "ティザー版（15秒）",
      "サウンドデザイン込み",
    ],
    timeline: "14〜21営業日",
    revisions: 4,
    badge: "badge-tier-3",
  },
  {
    tier: 4,
    name: "Deep",
    label: "深海",
    price: "¥600,000〜",
    description: "世界観構築ムービー",
    concept: "ブランドの深層を映像化。コンセプトフィルムの領域。",
    deliverables: [
      "コンセプトムービー（2〜5分）",
      "メイキング映像",
      "スタイルガイド",
    ],
    timeline: "21〜30営業日",
    revisions: 5,
    badge: "badge-tier-4",
  },
  {
    tier: 5,
    name: "Genesis",
    label: "源泉",
    price: "¥1,000,000〜",
    description: "総合芸術",
    concept: "音・映像・物語の完全同期。Nivaの想映の真髄。",
    deliverables: [
      "フルプロダクション映像",
      "オリジナル楽曲生成",
      "ブランドストーリー構築",
      "全素材アーカイブ",
    ],
    timeline: "30〜60営業日",
    revisions: "無制限",
    badge: "badge-tier-5",
    featured: true,
  },
];

// Common items across all tiers
const commonItems = [
  "企画・構成の初回ヒアリング（60分）",
  "絵コンテ / ムードボード提出",
  "4K書き出し対応",
  "SNS各プラットフォーム用リサイズ",
  "著作権譲渡（商用利用可）",
];

// Market reference data
const marketReference = {
  traditional: {
    label: "従来の制作会社",
    prices: [
      { item: "モーションロゴ", price: "¥150,000〜300,000" },
      { item: "SNSショート動画×3", price: "¥300,000〜500,000" },
      { item: "60秒CM", price: "¥500,000〜1,500,000" },
      { item: "コンセプトムービー", price: "¥1,000,000〜3,000,000" },
      { item: "フルプロダクション", price: "¥3,000,000〜" },
    ],
  },
  niva: {
    label: "Nivaの想映",
    prices: [
      { item: "Tier 1: Droplet", price: "¥50,000〜" },
      { item: "Tier 2: Ripple", price: "¥150,000〜" },
      { item: "Tier 3: Stream", price: "¥300,000〜" },
      { item: "Tier 4: Deep", price: "¥600,000〜" },
      { item: "Tier 5: Genesis", price: "¥1,000,000〜" },
    ],
  },
};

// Accordion component
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/50 transition-colors"
      >
        <span className="text-lg font-serif text-[#2B3A42]">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gold" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gold" />
        )}
      </button>
      <div
        ref={contentRef}
        className={`accordion-content ${isOpen ? 'open' : ''}`}
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight + 'px' : '0',
        }}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Market Reference Modal
function MarketReferenceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-overlay absolute inset-0" onClick={onClose} />
      <div className="modal-content relative max-w-3xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5A6B75] hover:text-[#2B3A42] transition-colors"
        >
          ✕
        </button>
        
        <h3 className="text-2xl font-serif text-[#2B3A42] mb-6">市場価格との比較</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div>
            <h4 className="text-lg font-medium text-[#5A6B75] mb-4">{marketReference.traditional.label}</h4>
            <div className="space-y-3">
              {marketReference.traditional.prices.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-[#2B3A42]/10">
                  <span className="text-sm text-[#5A6B75]">{item.item}</span>
                  <span className="text-sm font-medium text-[#2B3A42]">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Niva */}
          <div>
            <h4 className="text-lg font-medium text-gold mb-4">{marketReference.niva.label}</h4>
            <div className="space-y-3">
              {marketReference.niva.prices.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gold/20">
                  <span className="text-sm text-[#5A6B75]">{item.item}</span>
                  <span className="text-sm font-medium text-gold">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-[#5A6B75] leading-relaxed">
          ※ 従来の制作会社価格は業界平均の目安です。AI技術の活用により、品質を維持しながらコストを最適化しています。
        </p>
      </div>
    </div>
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

export default function Services() {
  const [showMarketRef, setShowMarketRef] = useState(false);
  const heroReveal = useScrollReveal();
  const tiersReveal = useScrollReveal();
  const commonReveal = useScrollReveal();
  const faqReveal = useScrollReveal();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section">
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
              プロジェクトの規模と目的に合わせた5つのTierをご用意。<br />
              すべてのプランで「音・映像・物語の同期」を実現します。
            </p>
            <button
              onClick={() => setShowMarketRef(true)}
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors"
            >
              <Info className="h-4 w-4" />
              市場価格との比較を見る
            </button>
          </div>
        </div>
      </section>

      {/* 5 Tier Cards */}
      <section className="section bg-white/50">
        <div 
          ref={tiersReveal.ref}
          className={`container transition-all duration-1000 ${tiersReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.tier}
                className={`price-card glass-card p-6 flex flex-col ${tier.featured ? 'ring-2 ring-gold' : ''}`}
              >
                {/* Badge */}
                <div className={`${tier.badge} inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 self-start`}>
                  Tier {tier.tier}
                </div>
                
                {/* Name */}
                <h3 className="text-2xl font-serif text-[#2B3A42] mb-1">{tier.name}</h3>
                <p className="text-sm text-[#5A6B75] mb-2">（{tier.label}）</p>
                
                {/* Price */}
                <p className="text-2xl font-medium text-gold mb-4">{tier.price}</p>
                
                {/* Description */}
                <p className="text-sm text-[#5A6B75] mb-4">{tier.description}</p>
                
                {/* Concept */}
                <p className="text-xs text-[#2B3A42] italic mb-6 leading-relaxed">
                  "{tier.concept}"
                </p>
                
                {/* Deliverables */}
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#5A6B75] uppercase tracking-wider mb-2">納品物</p>
                  <ul className="space-y-1.5 mb-4">
                    {tier.deliverables.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#5A6B75]">
                        <Check className="h-3 w-3 text-gold mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Timeline & Revisions */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4 pt-4 border-t border-[#2B3A42]/10">
                  <div>
                    <p className="text-[#5A6B75]">納期</p>
                    <p className="font-medium text-[#2B3A42]">{tier.timeline}</p>
                  </div>
                  <div>
                    <p className="text-[#5A6B75]">修正</p>
                    <p className="font-medium text-[#2B3A42]">{tier.revisions}回</p>
                  </div>
                </div>
                
                {/* CTA */}
                <Button asChild className="w-full liquid-button rounded-full text-sm">
                  <Link href="/contact">このプランで依頼</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Items */}
      <section className="section">
        <div 
          ref={commonReveal.ref}
          className={`container max-w-3xl transition-all duration-1000 ${commonReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              All Plans Include
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2B3A42]">全プラン共通事項</h2>
          </div>
          
          <div className="glass-card p-8">
            <ul className="space-y-4">
              {commonItems.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-[#2B3A42]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-white/50">
        <div 
          ref={faqReveal.ref}
          className={`container max-w-3xl transition-all duration-1000 ${faqReveal.isVisible ? 'blur-in' : 'opacity-0'}`}
        >
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-[0.3em] text-gold uppercase mb-4">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-[#2B3A42]">よくある質問</h2>
          </div>

          <div className="space-y-4">
            <Accordion title="どのTierを選べばいいですか？">
              <p className="text-[#5A6B75] leading-relaxed">
                迷われた場合は、お問い合わせフォームからご相談ください。
                ヒアリングを通じて、ご予算と目的に最適なTierをご提案します。
                Tier間の組み合わせやカスタマイズも柔軟に対応可能です。
              </p>
            </Accordion>

            <Accordion title="納期を短縮できますか？">
              <p className="text-[#5A6B75] leading-relaxed">
                プロジェクトの内容によっては、特急対応も可能です。
                通常納期の50%短縮で+30%、70%短縮で+50%の追加料金が発生します。
                事前にご相談ください。
              </p>
            </Accordion>

            <Accordion title="修正回数を超えた場合は？">
              <p className="text-[#5A6B75] leading-relaxed">
                各Tierに含まれる修正回数を超えた場合、1回あたり基本料金の10%が追加となります。
                ただし、Tier 5（Genesis）は修正回数無制限です。
              </p>
            </Accordion>

            <Accordion title="著作権はどうなりますか？">
              <p className="text-[#5A6B75] leading-relaxed">
                納品後の著作権は原則としてクライアント様に譲渡されます（商用利用可）。
                ただし、ポートフォリオへの掲載許可をいただく場合があります。
                詳細は契約時にご説明いたします。
              </p>
            </Accordion>

            <Accordion title="支払い方法は？">
              <p className="text-[#5A6B75] leading-relaxed">
                銀行振込（前払い50%、納品後50%）を基本としています。
                Tier 4以上のプロジェクトでは、分割払いのご相談も承ります。
              </p>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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

      {/* Market Reference Modal */}
      <MarketReferenceModal isOpen={showMarketRef} onClose={() => setShowMarketRef(false)} />
    </Layout>
  );
}
