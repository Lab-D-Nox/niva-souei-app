# Nivaの想映 (Niva's Souei)

**音・映像・物語の同期をテーマにした映像制作ポートフォリオサイト**

Nivaの想映は、映像制作者のための総合プラットフォームです。作品展示、ポートフォリオ管理、受注管理、コミュニティ交流機能を備えた、モダンで拡張性の高いWebアプリケーションです。

## 🌊 プロジェクト概要

このプロジェクトは、映像制作者が自分の作品を世界に発信し、クライアントからの依頼を受け、AIツールを活用した制作フローを共有するためのプラットフォームです。

**主な特徴：**

- 📹 **マルチメディア対応**: 動画、画像、音声、テキスト、Webコンテンツなど複数の形式に対応
- 🎯 **ポートフォリオ管理**: 作品の詳細情報、使用AIツール、プロンプト公開機能
- 💼 **受注管理**: 5段階の料金プラン（Droplet/Ripple/Stream/Deep/Genesis）と依頼フォーム
- 👥 **コミュニティ機能**: いいね（匿名対応）、コメント、タグベースの検索
- 🔐 **OAuth認証**: Google認証による安全なユーザー管理
- 📱 **PWA対応**: オフラインキャッシュ対応のプログレッシブWebアプリ
- 🎨 **ダークモード**: Aquatic Flow（思考の水源）をテーマにしたモダンなUI

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | React 19 + TypeScript + Vite |
| **スタイリング** | Tailwind CSS 4 |
| **バックエンド** | Express 4 + tRPC 11 |
| **データベース** | Drizzle ORM + SQLite/PostgreSQL |
| **認証** | OAuth 2.0 (Manus OAuth) |
| **ファイルストレージ** | S3 (Manus Storage) |
| **テスト** | Vitest |
| **デプロイ** | Manus Platform |

## 📋 機能一覧

### ユーザー機能

- **OAuth認証**: Google連携によるシームレスなログイン
- **プロフィール管理**: ユーザー情報の編集・管理
- **作品投稿**: マルチメディア対応の作品アップロード
- **作品編集・削除**: 投稿者による作品の管理

### 作品機能

- **マルチメディア対応**: 動画、画像、音声、テキスト、Webコンテンツ
- **メタデータ**: タイトル、説明、プロンプト（公開/非公開）、使用AIツール
- **バッジシステム**: 受注/個人バッジ、サービス種別バッジ（Spot/Standard/Grand）
- **Tier表示**: 5段階の制作実績レベル（Droplet/Ripple/Stream/Deep/Genesis）
- **サムネイル自動生成**: 動画からの自動サムネイル抽出
- **動画圧縮**: 大容量動画の自動圧縮（複数品質プリセット）

### コミュニティ機能

- **いいね機能**: 匿名でのいいね（重複防止・レート制限）
- **コメント機能**: ログイン必須のコメント投稿・削除
- **タグシステム**: 作品のタグ付け・検索
- **検索・フィルタ**: カテゴリ、タグ、キーワードによる検索

### 受注機能

- **5段階料金プラン**: Droplet/Ripple/Stream/Deep/Genesis
- **依頼フォーム**: 詳細なヒアリングシート生成
- **LINE連携**: お問い合わせ内容をLINEで送信
- **参考作品リンク**: 作品ページから直接依頼フォームへ

### AIツール機能

- **ツール一覧**: 58個の主要AIツールをカテゴリ別に表示
- **カテゴリ分類**: テキスト、画像生成、動画生成、音声・音楽、編集・加工、コーディング
- **作品との紐付け**: 各作品で使用したAIツールを表示
- **ツールから作品検索**: ツールページから関連作品を検索

### 通知機能

- **トースト通知**: いいね、コメント、依頼成功時の画面通知
- **アプリ内通知センター**: ヘッダーのベルアイコンで通知管理
- **プッシュ通知**: Service Workerによるブラウザプッシュ通知
- **メール通知設定**: 通知種別ごとのオン/オフ設定

### その他機能

- **PWA対応**: ホーム画面へのアプリ追加、オフラインキャッシュ
- **ローディングアニメーション**: ファビコンの水滴落下アニメーション
- **Click Ripple効果**: クリック時の水面波紋エフェクト
- **マウスストーカー**: カーソル追従の水滴エフェクト
- **スムーススクロール**: ページ内リンクのスムーズなスクロール

## 🚀 クイックスタート

### 前提条件

- Node.js 22.13.0以上
- pnpm 9.0.0以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/Lab-D-Nox/niva-souei-app.git
cd niva-souei-app

# 依存パッケージをインストール
pnpm install

# 環境変数を設定
# .env.example をコピーして .env を作成し、必要な環境変数を設定
cp .env.example .env

# データベースをセットアップ
pnpm db:push

# ダミーデータを投入（オプション）
pnpm db:seed
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動
pnpm dev

# ブラウザで http://localhost:3000 を開く
```

### ビルド

```bash
# 本番用ビルド
pnpm build

# ビルド結果を確認
pnpm preview
```

## 📁 プロジェクト構造

```
niva-souei-app/
├── client/                    # フロントエンド（React）
│   ├── public/               # 静的アセット
│   │   ├── manifest.json     # PWAマニフェスト
│   │   ├── sw.js            # Service Worker
│   │   └── favicon.ico       # ファビコン
│   ├── src/
│   │   ├── pages/            # ページコンポーネント
│   │   │   ├── Home.tsx
│   │   │   ├── Works.tsx
│   │   │   ├── WorkDetail.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Tools.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Philosophy.tsx
│   │   │   ├── Links.tsx
│   │   │   └── ...
│   │   ├── components/       # 再利用可能なコンポーネント
│   │   │   ├── VideoModal.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── ClickRippleProvider.tsx
│   │   │   └── ...
│   │   ├── hooks/            # カスタムフック
│   │   ├── contexts/         # React Context
│   │   ├── lib/              # ユーティリティ関数
│   │   ├── App.tsx           # ルーティング定義
│   │   ├── main.tsx          # エントリーポイント
│   │   └── index.css         # グローバルスタイル
│   └── index.html
├── server/                    # バックエンド（Express + tRPC）
│   ├── _core/                # フレームワークコア
│   │   ├── context.ts        # tRPC Context
│   │   ├── env.ts            # 環境変数
│   │   ├── llm.ts            # LLM統合
│   │   ├── voiceTranscription.ts
│   │   ├── imageGeneration.ts
│   │   ├── map.ts            # Maps API
│   │   └── notification.ts   # 通知API
│   ├── db.ts                 # データベースクエリ
│   ├── routers.ts            # tRPCルーター定義
│   ├── index.ts              # サーバーエントリーポイント
│   └── *.test.ts             # テストファイル
├── drizzle/                   # データベーススキーマ
│   ├── schema.ts             # テーブル定義
│   └── migrations/           # マイグレーション
├── storage/                   # S3ストレージユーティリティ
│   └── index.ts
├── shared/                    # 共有定数・型
│   └── constants.ts
├── vite.config.ts            # Vite設定
├── tsconfig.json             # TypeScript設定
├── package.json              # 依存パッケージ
└── README.md                 # このファイル
```

## 🔧 環境変数

必要な環境変数は以下の通りです。`.env` ファイルに設定してください：

```env
# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret

# Storage
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Owner
OWNER_NAME=Niva
OWNER_OPEN_ID=your_open_id

# Analytics
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App
VITE_APP_TITLE=Nivaの想映
VITE_APP_LOGO=/logo.png
```

## 📖 使用方法

### 作品の投稿

1. ログイン画面から Google OAuth で認証
2. ナビゲーションから「投稿」を選択
3. メディアファイル（動画/画像/音声など）をアップロード
4. タイトル、説明、プロンプト、使用AIツール、バッジを設定
5. 「投稿」ボタンで公開

### 依頼の受け取り

1. 作品ページから「この作品のような作品をNivaに依頼する」をクリック
2. 依頼フォームで詳細を入力
3. 「内容をコピーしてLINEで送る」で公式LINEに送信

### 通知の管理

1. ヘッダーのベルアイコンで通知を確認
2. 設定ページで通知種別ごとのオン/オフを切り替え

## 🧪 テスト

```bash
# 全テストを実行
pnpm test

# 特定のテストファイルを実行
pnpm test server/auth.logout.test.ts

# ウォッチモードでテスト実行
pnpm test --watch
```

## 🎨 デザイン

このプロジェクトは **Aquatic Flow（思考の水源）** をテーマにしたデザインです。

**カラーパレット：**

- **背景**: Ice Blue White (#F4F8FA)
- **テキスト**: Deep Ink Blue (#2B3A42)
- **アクセント**: Champagne Gold (#C0A060)

**タイポグラフィ：**

- **見出し**: しっぽり明朝（Serif）
- **本文**: Zen Kaku Gothic New（Sans-serif）

**ビジュアルエフェクト：**

- Click Ripple（クリック時の波紋）
- マウスストーカー（水滴エフェクト）
- Glassmorphism（磨りガラス効果）
- Gaussian Blur（ガウシアンブラー）

## 📱 PWA対応

このアプリケーションはPWA（Progressive Web App）に対応しており、以下の機能が利用可能です：

- ホーム画面へのアプリ追加
- オフラインキャッシュ対応
- スタンドアロンアプリとして起動
- プッシュ通知

## 🚢 デプロイ

このプロジェクトは Manus Platform でホストされています。

**公開URL**: https://niva-souei-app.manus.space

カスタムドメインの設定やデプロイの詳細については、[Manus Platform ドキュメント](https://docs.manus.im) を参照してください。

## 🤝 貢献

このプロジェクトへの貢献を歓迎します。詳細については [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細については [LICENSE](./LICENSE) を参照してください。

## 📧 お問い合わせ

ご質問やご提案は、以下の方法でお問い合わせください：

- **公式LINE**: https://lin.ee/nJQQAw41
- **Instagram**: https://www.instagram.com/niva.souei
- **X (Twitter)**: https://x.com/Ryoga_aiworker
- **YouTube**: https://www.youtube.com/channel/UCMaZcdLh9Fljg_4zSr2FsMA
- **TikTok**: https://www.tiktok.com/@ryoga.aiworker

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Express](https://expressjs.com)

---

**Nivaの想映** - 音・映像・物語の同期。その一点が、心に波紋をつくる。
