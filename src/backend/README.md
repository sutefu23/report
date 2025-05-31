# Backend Architecture - Functional DDD

## Overview
日報管理システムのバックエンドは関数型Domain-Driven Design (Functional DDD)パターンを採用しています。

## Directory Structure
```
src/backend/
├── domain/                 # ドメイン層 - ビジネスロジックとルール
│   ├── types/             # 型定義とBranded Types
│   ├── errors/            # ドメインエラー定義
│   └── workflows/         # ビジネスワークフロー（純粋関数）
├── infrastructure/        # インフラ層 - 外部システムとの連携
│   ├── database/          # Prismaクライアント設定
│   ├── repositories/      # データベースアクセス層
│   ├── auth/              # 認証関連サービス
│   ├── grpc/              # gRPC実装
│   └── slack/             # Slack連携
├── application/           # アプリケーション層 - ユースケース調整
│   ├── services/          # ドメインワークフローを呼び出すサービス
│   └── handlers/          # HTTP/gRPCハンドラー
└── utils/                 # ユーティリティ関数
```

## Key Principles

### 1. Branded Types
型安全性を保証するためにBranded Typesを使用:
```typescript
export type UserId = Brand<string, 'UserId'>
export type DailyReportId = Brand<string, 'DailyReportId'>
```

### 2. Workflow Pattern
全てのビジネスロジックは純粋関数としてworkflowに実装:
```typescript
export const createDailyReportWorkflow = (
  repository: DailyReportRepository
) => async (
  input: CreateDailyReportInput
): Promise<Either<DomainError, DailyReport>>
```

### 3. Either Type Pattern
エラーハンドリングにEither型を使用:
```typescript
type Either<E, A> = 
  | { tag: 'Left'; left: E }    // エラー
  | { tag: 'Right'; right: A }  // 成功
```

### 4. Repository Pattern
データアクセスはRepositoryパターンで抽象化:
```typescript
export type DailyReportRepository = {
  findById: (id: string) => Promise<DailyReport | null>
  create: (report: DailyReport) => Promise<DailyReport>
  // ...
}
```

## Core Components

### Domain Layer
- **Types**: ドメインエンティティとビジネス概念の型定義
- **Errors**: ドメイン固有のエラー型
- **Workflows**: ビジネスルールを実装する純粋関数

### Infrastructure Layer
- **Database**: Prismaクライアントの設定と管理
- **Repositories**: ドメインエンティティのデータアクセス実装
- **Auth**: パスワードハッシュ化とJWTトークン生成

### Application Layer
- **Services**: ドメインワークフローを組み合わせるサービス
- **Handlers**: HTTP/gRPCエンドポイントの実装

## Development Commands

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run typecheck

# データベースマイグレーション
npm run db:migrate

# Prismaクライアント生成
npm run db:generate
```

## Key Features
- 完全な型安全性（strict TypeScript）
- 純粋関数によるビジネスロジック
- 副作用の明示的分離
- エラーハンドリングの一貫性
- テスタビリティの向上