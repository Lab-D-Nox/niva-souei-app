# Nivaの想映 (Niva's Souei) - Project TODO

## データベース・バックエンド
- [x] DBスキーマ設計（users, works, tags, work_tags, likes, comments, tools, work_tools, inquiries）
- [x] 作品CRUD API実装
- [x] タグ管理API実装
- [x] いいねAPI実装（匿名対応・レート制限）
- [x] コメントAPI実装（ログイン必須・レート制限）
- [x] 検索API実装（タグ・キーワード・カテゴリ・フィルタ）
- [x] 依頼フォームAPI実装
- [x] ツール管理API実装
- [x] ファイルアップロードAPI実装

## フロントエンド共通
- [x] グローバルレイアウト・ナビゲーション実装
- [x] テーマ・カラーパレット設定
- [x] レスポンシブデザイン対応

## ページ実装
- [x] ホームページ（新着・人気作品、思想・サービス導線）
- [x] 作品一覧ページ（カテゴリタブ、検索、フィルタ、ソート）
- [x] 作品詳細ページ（メディア表示、バッジ、メタ情報、CTA、いいね、コメント）
- [x] SNSリンク集ページ
- [x] サービス紹介ページ（Spot/Standard/Grand）
- [x] Nivaの想映（思想ページ）
- [x] ツール一覧ページ
- [x] 依頼フォームページ（ヒアリングシート生成機能）
- [x] ログイン/プロフィールページ
- [x] 作品投稿ページ（メディアアップロード、タグ自動候補、プロンプト設定）

## 機能実装
- [x] OAuth認証（Manus OAuth）
- [x] 匿名いいね機能（重複防止・レート制限）
- [x] コメント投稿機能（ログイン必須・連投制限）
- [x] タグ自動候補生成機能
- [x] 簡易ヒアリングシート生成機能
- [x] 投稿権限モード切替（Nivaのみ/全ユーザー）
- [x] プロンプト公開/非公開切替
- [x] 音楽作品の歌詞表示

## バッジ・表示
- [x] 受注/個人バッジ表示
- [x] サービス種別バッジ（Spot Concept/Standard Translation/Grand Story）
- [x] 使用AIツール表示

## テスト
- [x] バックエンドAPIテスト
- [x] フロントエンド動作確認


## バグ修正
- [x] APIエラー修正（HTMLが返される問題）- /worksページでtRPCがJSONではなくHTMLを受信 - サーバー再起動で解決

- [x] ダミーデータ投入と作品一覧表示確認

## 新規修正・機能追加
- [x] いいね機能の修正（いいねが反映されない問題）
- [x] 閲覧数カウント機能の修正
- [x] コメント削除機能の実装（投稿者が自分のコメントを削除できるように）
- [x] ヒアリングシート連携機能（作成したシートをお問い合わせフォームに反映）

## 作品編集・削除機能
- [x] バックエンドAPI修正（投稿者による編集・削除権限チェック）
- [x] 作品編集ページの実装（タイトル、説明、プロンプト、タグ、公開設定）
- [x] 作品詳細ページに編集・削除ボタン追加（投稿者のみ表示）
- [x] 作品削除確認ダイアログの実装
- [x] テストの追加

## カスタム通知機能
- [x] 通知用データベーススキーマの作成（notifications, push_subscriptions, email_notification_settings）
- [x] 通知用バックエンドAPI（tRPCルーター）の実装
- [x] トースト通知の強化（いいね、コメント、依頼成功時）
- [x] アプリ内通知センター（ヘッダーにベルアイコン、通知一覧表示）
- [x] プッシュ通知の実装（Service Worker、購読管理）
- [x] メール通知設定の実装（新しい依頼やコメント時）
- [x] 管理者への通知（新しい依頼時にサイトオーナーに通知）
- [x] テストの追加

## SendGridメール通知連携
- [ ] SendGrid APIキーの設定
- [ ] メール送信モジュールの実装
- [ ] メールテンプレートの作成（コメント通知、いいね通知、依頼通知）
- [ ] 通知トリガーへのメール送信統合
- [ ] テストの追加

## SNSリンク更新
- [x] InstagramリンクをNivaの実際のアカウントに更新
- [x] XリンクをNivaの実際のアカウントに更新
- [x] TikTokリンクをNivaの実際のアカウントに更新
- [x] FacebookリンクをNivaの実際のアカウントに更新
- [x] noteの項目をLINEに変更し、公式LINEリンクを紐付け

## お問い合わせフォーム変更
- [x] お問い合わせフォームを公式LINE誘導型に変更（内容コピー→LINE遷移）

## サービス価格変更
- [x] Spot Concept: ¥10,000〜 → ¥100,000〜
- [x] Standard Translation: ¥50,000〜 → ¥200,000〜
- [x] Grand Story: ¥200,000〜 → ¥1,000,000〜

## 公式LINEリンク変更
- [x] SNSリンク集ページのLINEリンクを https://lin.ee/nJQQAw41 に変更
- [x] お問い合わせフォームのLINEリンクを https://lin.ee/nJQQAw41 に変更

## YouTubeリンク更新
- [x] SNSリンク集ページのYouTubeリンクを https://www.youtube.com/channel/UCMaZcdLh9Fljg_4zSr2FsMA に変更

## OGPメタタグの実装
- [x] index.htmlに基本OGPメタタグを追加（og:title, og:description, og:image, og:url）
- [x] Twitter Card用メタタグを追加
- [x] OGP用サムネイル画像を生成
- [ ] 作品詳細ページ用の動的OGPメタタグ対応

## 実際の作品データ投稿
- [x] Nivaの実際の作品をギャラリーに投稿
  - 風信花の地球 - This Is Your Story（映像作品）
  - AI Visual Translation（コンセプトアート）
  - 愛犬たちのポートレート（コーギー）
  - 浮遊大陸 - Floating Continents（ファンタジー風景）

## 使用ツールページの更新
- [x] 画像生成セクションに新しいツールを追加（GPT-4o、Seedream、Flux、Mystic、NanobananaPro、Reve、Z-image、Ideogram、Runway、Lovart、Dremina）

## テキストツールの追加
- [x] テキストカテゴリにGemini、Grok、Qwen、Manusを追加

## 編集・加工カテゴリの追加
- [x] 編集・加工カテゴリにMagnific、Gigapixel、Tracejourney、Finalframe、Topazを追加

## 動画生成ツールの追加
- [x] 動画生成カテゴリにFLOW、Runway、Kling、Flova.AI、Luma、Hailuo、Higgsfield、Domo.AI、Sora、Grok Video、Vidu、Wan、Seedance、PixVerse、dora.studio、sousaku AI、HeyGen、Synthesia、No Lang、Veoを追加

## 音声ツールの追加
- [x] 音声・音楽カテゴリにGoogle AI Studio、CoeFont、Producer.AIを追加

## 画像生成ツールの追加（追加）
- [x] 画像生成カテゴリにGoogle Imagen 4を追加

## コーディングカテゴリの追加
- [x] コーディングカテゴリにClaude Code、Cursor、Antigravity、Codex、Manus Codeを追加

## ツールカテゴリの順序変更
- [x] カテゴリ表示順序をテキスト→画像→動画→音楽→編集・加工→コーディングに変更

## 作品とツールの紐付け機能
- [x] 作品投稿時に使用ツールを選択できるようにする（既存機能）
- [x] ツールページから関連作品を閲覧できるようにする（リンク追加済み）

## ツールアイコン画像の設定
- [x] 各ツールの公式ロゴまたはイメージ画像を設定する（29個の主要ツールにアイコン設定済み）

## 残りのツールアイコン追加
- [x] アイコン未設定ツールの確認
- [x] 残りのツールにロゴアイコンを設定（58個全てのツールにアイコン設定完了）

## アイコン画像の修正
- [x] Google AI Studioのアイコン画像を生成して設定
- [x] Producer.AIのアイコン画像を生成して設定

## ファビコンの設定
- [x] Nivaのブランドイメージに合ったファビコンをデザイン
- [x] ファビコンをサイトに設定

## Webサイト大幅改修（仕様書に基づく）
- [x] ダークモード実装（背景色#080808、オフホワイト＆シャンパンゴールド文字）
- [x] Heroセクション完全リデザイン（波紋アニメーション、新コピー）
- [x] Philosophyセクション追加（ワンストップ・クリエーションと波紋の融合テキスト）
- [x] Serviceセクションリデザイン（純度・没入・合理性の3ポイント）
- [x] UI/UXインタラクション実装（スクロールアニメーション、ボタンホバー、blur-in効果）
- [x] Toolsセクションのデザイン調整（モノクロ/ゴールドライン統一）
- [x] Contactセクションに新コピー追加（「あなたの想いを、聴かせてください。」）

## Web Design Specification Ver. 2.0 - Aquatic Flow（思考の水源）
- [x] グローバルデザイン変更（カラーパレット: Ice Blue White #F4F8FA、Deep Ink Blue #2B3A42、Champagne Gold #C0A060）
- [x] タイポグラフィ変更（Heading: しっぽり明朝、Body: Zen Kaku Gothic New）
- [x] 水面の揺らめき背景（コースティクス）の実装
- [x] Click Ripple効果の実装
- [x] Glassmorphism（磨りガラス）表現の実装
- [x] Heroセクションリデザイン（3本の光アニメーション）
- [x] Philosophyセクションリデザイン（概念図とステートメント「源流は、常に『音』にある。」）
- [ ] Worksセクションリデザイン（Tier 1/3/5の代表作表示）
- [x] Service & Pricingセクション完全リデザイン（5Tierプラン、共通事項、アコーディオン）
- [x] Market Referenceモーダルの実装（価格比較表）
- [x] Contactセクションリデザイン（新コピー「その波紋を、あなたのビジネスへ。」）

## Click Rippleエフェクトの実装
- [x] クリック時に水面の波紋が広がるエフェクトをサイト全体に追加

## マウスストーカーの追加
- [x] カーソルに追従する水滴エフェクトを実装
