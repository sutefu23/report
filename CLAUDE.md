# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

日報管理システム - 従業員の日々の作業内容を記録・管理し、上司とのコミュニケーションを促進するWebベースのシステム。

### 技術スタック
- **共通**: TypeScript (strict mode), ULID for IDs, Vitest, ESLint + Prettier
- **Frontend**: Next.js 14 (App Router), shadcn/ui, Tailwind CSS, Zustand, React Hook Form + Zod
- **Backend**: Hono, gRPC (nice-grpc), Prisma, PostgreSQL, JWT
- **通信**: gRPC with Protocol Buffers
- **外部連携**: Slack API

### アーキテクチャ
- **設計思想**: 関数型DDD (Domain-Driven Design)
- **原則**: 型ファースト、Workflowパターン、純粋関数、イミュータブル、関数合成
- **モノレポ構成**: packages/ (frontend, backend, shared)

## Development Commands

### セットアップ
```bash
npm install          # 依存関係インストール
npm run db:setup     # Prisma初期化
npm run proto:generate # Protocol Buffers生成
```

### 開発
```bash
npm run dev          # 開発サーバー起動
npm run test         # テスト実行
npm run test:watch   # テストウォッチモード
npm run test:coverage # カバレッジ
npm run lint         # ESLint実行
npm run typecheck    # TypeScript型チェック
npm run ui           # shadcn/uiコンポーネント追加
```

### Prisma
```bash
npm run db:migrate   # マイグレーション実行
npm run db:studio    # Prisma Studio起動
npm run db:seed      # Seeder実行
```

## Architecture

### ディレクトリ構成
```
src/
├── front/               # Next.js フロントエンド
│       ├── app/           # App Router
│       ├── components/    # UIコンポーネント
│       ├── lib/           # ユーティリティ
│       └── types/         # 型定義
├── backend/               # Hono + gRPC バックエンド
│       ├── domain/        # ドメイン層（型、workflows、エラー）
│       ├── infrastructure/ # インフラ層（DB、gRPC、Slack、認証）
│       ├── application/   # アプリケーション層（services、handlers）
│       └── utils/         # ユーティリティ
└── shared/                # 共通モジュール
    ├── proto/             # Protocol Buffers定義
    ├── types/             # 共通型定義
    └── utils/             # 共通ユーティリティ
```

### 重要な設計パターン

#### 1. Branded Types
```typescript
export type UserId = string & { readonly brand: unique symbol }
export type DailyReportId = string & { readonly brand: unique symbol }
```

#### 2. Workflow Pattern
全てのビジネスロジックはworkflow関数として実装。副作用を明示的に分離。
```typescript
export const createDailyReportWorkflow = (repository: DailyReportRepository) => 
  async (input: CreateDailyReportInput): Promise<Either<DomainError, DailyReport>>
```

#### 3. Result Type Pattern
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }
```

#### 4. Repository Pattern
Prismaクライアントの直接使用は禁止。全てRepository経由でアクセス。

### 開発ルール
- `any`, `unknown`の使用禁止
- 全ての関数に明示的な型注釈
- 純粋関数を基本とし、副作用は明示的に分離
- Conventional Commitsに従う
- PRは必須レビュー

### shadcn/ui設定
- コンポーネントディレクトリ: `src/front/components/shadcn/ui`
- components.jsonの設定で上記パスを指定
- `npm run ui` でコンポーネント追加

### 環境変数
詳細は docs/SPECIFICATION.md を参照。主要なものは：
- `DATABASE_URL`: PostgreSQL接続文字列
- `JWT_SECRET`: JWT署名用シークレット
- `SLACK_BOT_TOKEN`: Slack Bot Token
- `NEXT_PUBLIC_GRPC_URL`: gRPCサーバーURL

## 関連ドキュメント
- 詳細な仕様書: `docs/SPECIFICATION.md`