import { useState } from "react";
import { Layout } from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, Copy, CheckCircle } from "lucide-react";

const inquiryTypeOptions = [
  { value: "spot", label: "Spot Concept（スポット現像）" },
  { value: "standard", label: "Standard Translation（標準翻訳）" },
  { value: "grand", label: "Grand Story（全編想映）" },
  { value: "other", label: "その他・相談" },
];

const hearingQuestions = [
  {
    id: "purpose",
    question: "制作の目的・用途は何ですか？",
    options: ["SNS投稿用", "プロモーション", "ブランディング", "個人利用", "その他"],
  },
  {
    id: "target",
    question: "ターゲット層は誰ですか？",
    options: ["10代〜20代", "30代〜40代", "50代以上", "全年齢", "特定業界向け"],
  },
  {
    id: "mood",
    question: "希望する雰囲気・トーンは？",
    options: ["明るい・ポップ", "落ち着いた・シック", "クール・スタイリッシュ", "温かみのある", "神秘的・幻想的", "その他"],
  },
  {
    id: "format",
    question: "希望する形式は？",
    options: ["静止画", "動画（短尺）", "動画（長尺）", "音楽・BGM", "複合的", "未定"],
  },
  {
    id: "reference",
    question: "参考にしたいイメージはありますか？",
    type: "text",
    placeholder: "参考URL、作品名、イメージなど",
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("other");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceUrls, setReferenceUrls] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Hearing sheet state
  const [hearingAnswers, setHearingAnswers] = useState<Record<string, string[]>>({});
  const [hearingTexts, setHearingTexts] = useState<Record<string, string>>({});
  const [generatedSheet, setGeneratedSheet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const createInquiryMutation = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("お問い合わせを送信しました");
    },
    onError: (err) => {
      toast.error(err.message || "送信に失敗しました");
    },
  });

  const generateHearingMutation = trpc.inquiries.generateHearingSheet.useMutation({
    onSuccess: (data) => {
      setGeneratedSheet(data.hearingSheet);
      toast.success("ヒアリングシートを生成しました");
    },
    onError: () => {
      toast.error("生成に失敗しました");
    },
  });

  const handleAnswerToggle = (questionId: string, option: string) => {
    setHearingAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(option)) {
        return { ...prev, [questionId]: current.filter((o) => o !== option) };
      }
      return { ...prev, [questionId]: [...current, option] };
    });
  };

  const handleGenerateSheet = async () => {
    setIsGenerating(true);
    try {
      const projectType = inquiryTypeOptions.find((o) => o.value === inquiryType)?.label || "その他";
      const targetAudience = hearingAnswers["target"]?.join(", ") || "";
      const mood = hearingAnswers["mood"]?.join(", ") || "";
      const references = hearingTexts["reference"] || "";
      const additionalNotes = [
        hearingAnswers["purpose"]?.length ? `目的: ${hearingAnswers["purpose"].join(", ")}` : "",
        hearingAnswers["format"]?.length ? `形式: ${hearingAnswers["format"].join(", ")}` : "",
      ].filter(Boolean).join("\n");

      await generateHearingMutation.mutateAsync({
        projectType,
        targetAudience,
        mood,
        references,
        additionalNotes,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyGeneratedSheet = async () => {
    await navigator.clipboard.writeText(generatedSheet);
    toast.success("クリップボードにコピーしました");
  };

  const applyGeneratedSheet = () => {
    // generatedSheet is already bound to the hearing sheet textarea
    // This function just shows a confirmation toast
    toast.success("ヒアリングシート欄に反映しました");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await createInquiryMutation.mutateAsync({
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        inquiryType: inquiryType as any,
        message: message.trim(),
        budget: budget.trim() || undefined,
        deadline: deadline.trim() || undefined,
        referenceUrls: referenceUrls.trim() || undefined,
        hearingSheetData: Object.keys(hearingAnswers).length > 0 ? { answers: hearingAnswers, texts: hearingTexts } : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="section">
          <div className="container max-w-2xl text-center">
            <div className="bg-card rounded-xl p-12 border border-border/50">
              <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
              <h1 className="text-2xl font-medium mb-4">送信完了</h1>
              <p className="text-muted-foreground mb-6">
                お問い合わせありがとうございます。
                内容を確認の上、折り返しご連絡いたします。
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                新しいお問い合わせ
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
              Contact
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-primary mb-4">依頼・お問い合わせ</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              プロジェクトのご相談、お見積もりなど、お気軽にお問い合わせください。
              簡易ヒアリングシートを使って、ご要望を整理することもできます。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Hearing Sheet Generator */}
            <div className="bg-card rounded-xl p-6 border border-border/50 h-fit">
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                簡易ヒアリングシート
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                質問に答えると、整形されたヒアリングシートを生成できます。
              </p>

              <Accordion type="single" collapsible className="mb-6">
                {hearingQuestions.map((q, index) => (
                  <AccordionItem key={q.id} value={q.id}>
                    <AccordionTrigger className="text-sm">
                      {index + 1}. {q.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {q.type === "text" ? (
                        <Textarea
                          value={hearingTexts[q.id] || ""}
                          onChange={(e) =>
                            setHearingTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder={q.placeholder}
                          rows={3}
                        />
                      ) : (
                        <div className="space-y-2">
                          {q.options?.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={hearingAnswers[q.id]?.includes(option) || false}
                                onCheckedChange={() => handleAnswerToggle(q.id, option)}
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button
                onClick={handleGenerateSheet}
                disabled={isGenerating}
                className="w-full mb-4"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                ヒアリングシートを生成
              </Button>

              {generatedSheet && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {generatedSheet}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyGeneratedSheet}>
                      <Copy className="h-4 w-4 mr-2" />
                      コピー
                    </Button>
                    <Button variant="default" size="sm" onClick={applyGeneratedSheet}>
                      フォームに反映
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h2 className="text-xl font-medium mb-6">お問い合わせフォーム</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="mb-2 block">
                      お名前 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="mb-2 block">
                      会社名
                    </Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      メールアドレス <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      電話番号
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">ご依頼の種類</Label>
                  <Select value={inquiryType} onValueChange={setInquiryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget" className="mb-2 block">
                      ご予算
                    </Label>
                    <Input
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="例: 5万円〜10万円"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline" className="mb-2 block">
                      希望納期
                    </Label>
                    <Input
                      id="deadline"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="例: 2週間以内"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="references" className="mb-2 block">
                    参考URL
                  </Label>
                  <Input
                    id="references"
                    value={referenceUrls}
                    onChange={(e) => setReferenceUrls(e.target.value)}
                    placeholder="参考にしたいサイトやコンテンツのURL"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="mb-2 block">
                    ご依頼内容 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="ご依頼の詳細をお書きください"
                    rows={6}
                    required
                  />
                </div>

                {/* Hearing Sheet Section */}
                <div>
                  <Label htmlFor="hearingSheet" className="mb-2 block">
                    ヒアリングシート
                  </Label>
                  <Textarea
                    id="hearingSheet"
                    value={generatedSheet}
                    onChange={(e) => setGeneratedSheet(e.target.value)}
                    placeholder="左側の簡易ヒアリングシートで生成した内容がここに表示されます"
                    rows={4}
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    左側の「ヒアリングシートを生成」ボタンで作成し、「フォームに反映」ボタンでここに貼り付けできます
                  </p>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  送信する
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
