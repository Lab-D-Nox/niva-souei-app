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
import { Loader2, Sparkles, Copy, MessageCircle, ExternalLink } from "lucide-react";

const LINE_URL = "https://lin.ee/H5pfvuh";

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
  const [inquiryType, setInquiryType] = useState("other");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceUrls, setReferenceUrls] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Hearing sheet state
  const [hearingAnswers, setHearingAnswers] = useState<Record<string, string[]>>({});
  const [hearingTexts, setHearingTexts] = useState<Record<string, string>>({});
  const [generatedSheet, setGeneratedSheet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Generate formatted content for LINE
  const generateFormattedContent = () => {
    const inquiryTypeLabel = inquiryTypeOptions.find((o) => o.value === inquiryType)?.label || "その他";
    
    let content = `【Niva's Souei お問い合わせ】\n\n`;
    content += `━━━━━━━━━━━━━━━━\n`;
    content += `■ 基本情報\n`;
    content += `━━━━━━━━━━━━━━━━\n`;
    if (name.trim()) content += `お名前: ${name.trim()}\n`;
    if (companyName.trim()) content += `会社名: ${companyName.trim()}\n`;
    content += `ご依頼の種類: ${inquiryTypeLabel}\n`;
    if (budget.trim()) content += `ご予算: ${budget.trim()}\n`;
    if (deadline.trim()) content += `希望納期: ${deadline.trim()}\n`;
    if (referenceUrls.trim()) content += `参考URL: ${referenceUrls.trim()}\n`;
    
    if (message.trim()) {
      content += `\n━━━━━━━━━━━━━━━━\n`;
      content += `■ ご依頼内容\n`;
      content += `━━━━━━━━━━━━━━━━\n`;
      content += `${message.trim()}\n`;
    }
    
    if (generatedSheet.trim()) {
      content += `\n━━━━━━━━━━━━━━━━\n`;
      content += `■ ヒアリングシート\n`;
      content += `━━━━━━━━━━━━━━━━\n`;
      content += `${generatedSheet.trim()}\n`;
    }
    
    content += `\n━━━━━━━━━━━━━━━━\n`;
    content += `※このメッセージはNiva's Soueiのお問い合わせフォームから生成されました`;
    
    return content;
  };

  const copyAndOpenLINE = async () => {
    if (!name.trim()) {
      toast.error("お名前を入力してください");
      return;
    }
    if (!message.trim()) {
      toast.error("ご依頼内容を入力してください");
      return;
    }

    const content = generateFormattedContent();
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success("内容をコピーしました！LINEに貼り付けてください", {
        duration: 5000,
      });
      
      // Open LINE after a short delay
      setTimeout(() => {
        window.open(LINE_URL, "_blank");
      }, 500);
    } catch (err) {
      toast.error("コピーに失敗しました");
    }
  };

  const copyContentOnly = async () => {
    if (!name.trim()) {
      toast.error("お名前を入力してください");
      return;
    }
    if (!message.trim()) {
      toast.error("ご依頼内容を入力してください");
      return;
    }

    const content = generateFormattedContent();
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success("内容をコピーしました");
    } catch (err) {
      toast.error("コピーに失敗しました");
    }
  };

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
              フォームに記入後、公式LINEでやり取りを進めます。
            </p>
          </div>

          {/* LINE Guide Banner */}
          <div className="max-w-5xl mx-auto mb-8">
            <div className="bg-[#06C755]/10 border border-[#06C755]/30 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#06C755] rounded-full p-3 shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">お問い合わせの流れ</h3>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    <li>1. 下記フォームにご依頼内容を記入</li>
                    <li>2. 「内容をコピーしてLINEで送る」ボタンをクリック</li>
                    <li>3. 公式LINEが開くので、コピーした内容を貼り付けて送信</li>
                    <li>4. LINE上でやり取りを進めます</li>
                  </ol>
                </div>
              </div>
            </div>
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
                  <p className="text-xs text-muted-foreground">
                    ※ 生成されたヒアリングシートは、お問い合わせ内容と一緒にLINEに送信されます
                  </p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-xl p-6 border border-border/50">
              <h2 className="text-xl font-medium mb-6">お問い合わせフォーム</h2>

              <div className="space-y-6">
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

                {/* Hearing Sheet Preview */}
                {generatedSheet && (
                  <div>
                    <Label className="mb-2 block">ヒアリングシート（自動添付）</Label>
                    <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground max-h-32 overflow-y-auto">
                      {generatedSheet.substring(0, 200)}...
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ※ 左側で生成したヒアリングシートが自動的に添付されます
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={copyAndOpenLINE} 
                    className="w-full bg-[#06C755] hover:bg-[#05a847] text-white"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    内容をコピーしてLINEで送る
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={copyContentOnly}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      内容をコピーのみ
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(LINE_URL, "_blank")}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      LINEを開く
                    </Button>
                  </div>

                  {isCopied && (
                    <p className="text-sm text-center text-green-600">
                      ✓ 内容がコピーされました。LINEに貼り付けて送信してください。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
