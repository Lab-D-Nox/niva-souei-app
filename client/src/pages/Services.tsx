import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Palette, Film, Check } from "lucide-react";

const services = [
  {
    id: "spot",
    name: "Spot Concept",
    subtitle: "スポット現像",
    icon: Sparkles,
    color: "purple",
    description: "単発のビジュアル制作。SNS投稿用画像やサムネイルなど、ピンポイントなニーズに素早く対応します。",
    features: [
      "SNS投稿用画像（1〜5枚程度）",
      "サムネイル・バナー制作",
      "プロフィール画像・アイコン",
      "単発のイラスト・コンセプトアート",
      "短納期対応可能",
    ],
    deliverables: [
      "高解像度画像ファイル",
      "各種サイズバリエーション",
      "使用プロンプト（希望時）",
    ],
    timeline: "3〜7日",
    priceRange: "¥100,000〜",
  },
  {
    id: "standard",
    name: "Standard Translation",
    subtitle: "標準翻訳",
    icon: Palette,
    color: "blue",
    description: "コンセプトからビジュアルへの翻訳。ブランディングやプロモーション素材の一貫した世界観構築をサポートします。",
    features: [
      "ブランドビジュアル一式",
      "プロモーション素材セット",
      "Webサイト用ビジュアル",
      "複数カットの統一された世界観",
      "スタイルガイド作成",
    ],
    deliverables: [
      "ビジュアル素材一式",
      "スタイルガイドドキュメント",
      "各種フォーマット対応",
      "リビジョン2回まで込み",
    ],
    timeline: "2〜4週間",
    priceRange: "¥200,000〜",
  },
  {
    id: "grand",
    name: "Grand Story",
    subtitle: "全編想映",
    icon: Film,
    color: "rose",
    description: "映像作品の企画から完成まで。ストーリー構築、映像制作、音楽選定までトータルでプロデュースします。",
    features: [
      "企画・コンセプト設計",
      "ストーリーボード作成",
      "映像制作（短編〜長編）",
      "音楽・BGM選定/制作",
      "ナレーション・ボイス対応",
      "編集・カラーグレーディング",
    ],
    deliverables: [
      "完成映像ファイル",
      "各種プラットフォーム用書き出し",
      "使用素材アーカイブ",
      "プロジェクトドキュメント",
    ],
    timeline: "1〜3ヶ月",
    priceRange: "¥1,000,000〜",
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
};

export default function Services() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Services
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-primary mb-6">
              提供サービス
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              プロジェクトの規模や目的に合わせて、3つのサービスプランをご用意しています。
              どのプランも「想いを形にする」という想映の理念に基づいて制作します。
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section">
        <div className="container">
          <div className="space-y-24">
            {services.map((service, index) => {
              const Icon = service.icon;
              const colors = colorClasses[service.color];
              const isEven = index % 2 === 1;

              return (
                <div
                  key={service.id}
                  id={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Info Card */}
                  <div className={isEven ? "lg:order-2" : ""}>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg} ${colors.text} text-sm font-medium mb-4`}>
                      <Icon className="h-4 w-4" />
                      {service.subtitle}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light mb-4">{service.name}</h2>
                    <p className="text-lg text-muted-foreground mb-6">{service.description}</p>

                    <div className="flex items-center gap-6 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground">納期目安</p>
                        <p className="font-medium">{service.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">価格</p>
                        <p className="font-medium">{service.priceRange}</p>
                      </div>
                    </div>

                    <Button asChild className="group">
                      <Link href="/contact">
                        このプランで依頼する
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  {/* Features Card */}
                  <div className={`bg-card rounded-xl p-8 border ${colors.border} ${isEven ? "lg:order-1" : ""}`}>
                    <div className="mb-6">
                      <h3 className="font-medium mb-4">対応内容</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className={`h-4 w-4 mt-0.5 ${colors.text}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">納品物</h3>
                      <ul className="space-y-2">
                        {service.deliverables.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('100', '500').replace('900/30', '500')} mt-1.5`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-light text-center mb-12">よくある質問</h2>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-medium mb-2">どのプランを選べばいいですか？</h3>
              <p className="text-sm text-muted-foreground">
                迷われた場合は、お問い合わせフォームからご相談ください。
                ご要望をお聞きした上で、最適なプランをご提案します。
                プラン間の変更や組み合わせも柔軟に対応可能です。
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-medium mb-2">納期を短縮できますか？</h3>
              <p className="text-sm text-muted-foreground">
                プロジェクトの内容によっては、特急対応も可能です。
                追加料金が発生する場合がありますので、事前にご相談ください。
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-medium mb-2">修正は何回まで可能ですか？</h3>
              <p className="text-sm text-muted-foreground">
                各プランに含まれるリビジョン回数内であれば追加料金なしで対応します。
                それ以上の修正が必要な場合は、別途お見積もりとなります。
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h3 className="font-medium mb-2">著作権はどうなりますか？</h3>
              <p className="text-sm text-muted-foreground">
                納品後の著作権は原則としてクライアント様に帰属します。
                ただし、ポートフォリオへの掲載許可をいただく場合があります。
                詳細は契約時にご説明いたします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-4">
            あなたのプロジェクトについて教えてください
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            まずはお気軽にご相談ください。
            ヒアリングを通じて、最適なプランと進め方をご提案します。
          </p>
          <Button asChild size="lg" className="group">
            <Link href="/contact">
              お問い合わせ
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
