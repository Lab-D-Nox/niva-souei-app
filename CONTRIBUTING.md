# 貢献ガイドライン

Nivaの想映へのご貢献ありがとうございます！このドキュメントでは、プロジェクトへの貢献方法を説明します。

## 🤝 貢献の方法

### バグ報告

バグを見つけた場合は、以下の情報を含めて GitHub Issues で報告してください：

- **バグの説明**: 何が起こったのか
- **再現手順**: バグを再現するための具体的な手順
- **期待される動作**: 本来あるべき動作
- **実際の動作**: 実際に起こった動作
- **スクリーンショット**: 可能であれば、視覚的な証拠
- **環境情報**: OS、ブラウザ、Node.js バージョンなど

### 機能提案

新しい機能のアイデアがある場合は、GitHub Issues で提案してください：

- **機能の説明**: 提案する機能の詳細
- **ユースケース**: その機能がどのように使用されるのか
- **代替案**: 他に考えられる実装方法
- **追加の文脈**: その他の関連情報

### プルリクエスト

コードの変更を提案する場合は、以下の手順に従ってください：

1. **フォーク**: リポジトリをフォークします
2. **ブランチ作成**: 機能ブランチを作成します
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **変更実施**: コードを変更します
4. **テスト**: 変更をテストします
   ```bash
   pnpm test
   ```
5. **コミット**: 変更をコミットします
   ```bash
   git commit -m "feat: description of your changes"
   ```
6. **プッシュ**: ブランチをプッシュします
   ```bash
   git push origin feature/your-feature-name
   ```
7. **プルリクエスト作成**: GitHub でプルリクエストを作成します

## 📝 コミットメッセージ規約

コミットメッセージは以下の形式に従ってください：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コード形式の変更（機能に影響なし）
- `refactor`: コードのリファクタリング
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### Scope

変更の範囲を指定します（例：`auth`、`ui`、`api`）

### Subject

変更の簡潔な説明（50文字以下）

### Body

変更の詳細な説明（オプション）

### Footer

関連する Issue の参照（例：`Closes #123`）

## 🎨 コーディング規約

### 一般的なルール

- **言語**: TypeScript を使用してください
- **フォーマッター**: Prettier でコードをフォーマットしてください
- **リンター**: ESLint でコードをチェックしてください

### ファイル構造

- **コンポーネント**: `client/src/components/` に配置
- **ページ**: `client/src/pages/` に配置
- **ユーティリティ**: `client/src/lib/` に配置
- **フック**: `client/src/hooks/` に配置
- **Context**: `client/src/contexts/` に配置

### 命名規約

- **ファイル名**: PascalCase（コンポーネント）、camelCase（その他）
- **変数名**: camelCase
- **定数名**: UPPER_SNAKE_CASE
- **型名**: PascalCase

### React コンポーネント

```typescript
// ✅ Good
import { FC } from 'react';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

const MyComponent: FC<MyComponentProps> = ({ title, onClick }) => {
  return <div onClick={onClick}>{title}</div>;
};

export default MyComponent;
```

### tRPC ルーター

```typescript
// ✅ Good
export const myRouter = router({
  getItems: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // Implementation
    }),

  createItem: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});
```

## 🧪 テスト

- 新機能にはテストを追加してください
- 既存のテストが失敗しないことを確認してください
- テストカバレッジを維持してください

```bash
# テストを実行
pnpm test

# ウォッチモードでテストを実行
pnpm test --watch

# テストカバレッジを確認
pnpm test --coverage
```

## 📚 ドキュメント

- 新機能にはドキュメントを追加してください
- README.md を更新してください
- コード内にコメントを追加してください

## 🔍 レビュープロセス

プルリクエストが作成されると、以下のレビューが行われます：

1. **自動チェック**: CI/CD パイプラインが実行されます
2. **コードレビュー**: メンテナーがコードをレビューします
3. **テスト**: すべてのテストが成功することを確認します
4. **マージ**: レビューが完了すると、マージされます

## 🚀 リリースプロセス

新しいバージョンのリリースは、以下のプロセスで行われます：

1. **バージョン番号の更新**: `package.json` のバージョンを更新
2. **CHANGELOG の更新**: 変更内容をドキュメント化
3. **リリースノートの作成**: GitHub Releases でリリースノートを作成
4. **デプロイ**: Manus Platform にデプロイ

## 💬 コミュニケーション

- **質問**: GitHub Discussions で質問してください
- **バグ報告**: GitHub Issues でバグを報告してください
- **機能提案**: GitHub Issues で機能を提案してください
- **その他**: 公式 LINE（https://lin.ee/nJQQAw41）でお問い合わせください

## 📖 参考資料

- [React ドキュメント](https://react.dev)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)
- [tRPC ドキュメント](https://trpc.io)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

## ✨ 貢献者

このプロジェクトへの貢献者の皆様に感謝申し上げます！

---

貢献していただきありがとうございます。ご質問や不明な点がある場合は、お気軽にお問い合わせください。
