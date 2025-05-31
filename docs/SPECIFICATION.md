# 日報システム開発指示書

## プロジェクト概要

従業員の日々の作業内容を記録・管理し、上司とのコミュニケーションを促進するWebベースの日報システムの開発。Slack連携を必須機能として含み、リアルタイムでの日報提出リマインダーや集計機能を提供する。

### 主要機能
- 日報作成・編集・閲覧
- 作業記録の複数行管理（プロジェクト名、作業時間、作業内容）
- 困ったこと・相談事項の記録
- 明日やることの記録
- 上司によるコメント機能
- 従業員別・プロジェクト別集計
- レポート出力（CSV/PDF）
- Slack連携（リマインダー、通知）

## 技術スタック

### 共通
- **言語**: TypeScript（フルタイプ）
- **ID生成**: ULID
- **テスト**: Vitest（テストファイルは `.spec.ts` 拡張子を使用）
- **リンター**: Biome（ESLintとPrettierの代替）
- **型チェック**: TypeScript strict mode

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **UIフレームワーク**: shadcn/ui
- **コンポーネント開発**: Storybook
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod
- **gRPC**: @grpc/grpc-js + nice-grpc

### バックエンド
- **フレームワーク**: Hono
- **gRPC**: @grpc/grpc-js + nice-grpc
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **認証**: JWT
- **バリデーション**: Zod
- **ランタイム**: Node.js

### インフラ・外部サービス
- **データベース**: PostgreSQL（Docker Compose で管理）
- **コンテナ**: Docker & Docker Compose
- **Slack API**: Slack Web API
- **ファイル出力**: PDFKit, csv-writer

## アーキテクチャ

### 関数型DDD設計原則

1. **型ファーストアプローチ**: TypeScriptの型でドメインモデルを定義
2. **Workflowパターン**: 全ての業務処理をworkflow関数内に封じ込め
3. **純粋関数**: 副作用のない関数を基本とし、副作用は明示的に分離
4. **イミュータブル**: 全てのデータ構造をimmutableとして扱う
5. **関数合成**: 小さな関数を組み合わせて複雑な処理を構築

### ディレクトリ構成

```
project-root/
├── src/
│   ├── front/                 # Next.js フロントエンド
│   │   │   ├── app/             # App Router
│   │   │   ├── components/      # UIコンポーネント
│   │   │   ├── lib/             # ユーティリティ
│   │   │   └── types/           # 型定義
│   │   ├── public/
│   │   └── package.json
│   ├── backend/                 # Hono + gRPC バックエンド
│   │   │   ├── domain/          # ドメイン層
│   │   │   │   ├── types/       # ドメイン型定義
│   │   │   │   ├── workflows/   # ビジネスロジック
│   │   │   │   └── errors/      # ドメインエラー
│   │   │   ├── infrastructure/  # インフラ層
│   │   │   │   ├── database/    # Prisma関連
│   │   │   │   ├── grpc/        # gRPCサーバー
│   │   │   │   ├── slack/       # Slack連携
│   │   │   │   └── auth/        # 認証
│   │   │   ├── application/     # アプリケーション層
│   │   │   │   ├── services/    # アプリケーションサービス
│   │   │   │   └── handlers/    # gRPCハンドラー
│   │   │   └── utils/           # ユーティリティ
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   └── shared/                  # 共通モジュール
│       ├── proto/               # Protocol Buffers定義
│       ├── types/               # 共通型定義
│       └── utils/               # 共通ユーティリティ
├── docs/                        # ドキュメント
├── .github/                     # GitHub Actions
└── package.json                 # ルートpackage.json
```

### ドメイン層設計

#### 型定義例 (`backend/src/domain/types/`)

```typescript
// user.ts
export type UserId = string & { readonly brand: unique symbol }
export type UserRole = 'employee' | 'manager'

export type User = {
  readonly id: UserId
  readonly username: string
  readonly email: string
  readonly role: UserRole
  readonly managerId?: UserId
  readonly slackUserId: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

// daily-report.ts
export type DailyReportId = string & { readonly brand: unique symbol }
export type WorkRecordId = string & { readonly brand: unique symbol }
export type ProjectId = string & { readonly brand: unique symbol }

export type DailyReport = {
  readonly id: DailyReportId
  readonly userId: UserId
  readonly reportDate: Date
  readonly memo?: string
  readonly tomorrowPlan?: string
  readonly workRecords: readonly WorkRecord[]
  readonly comments: readonly Comment[]
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type WorkRecord = {
  readonly id: WorkRecordId
  readonly dailyReportId: DailyReportId
  readonly projectId: ProjectId
  readonly workHours: number
  readonly workContent: string
  readonly createdAt: Date
}
```

#### Workflow例 (`backend/src/domain/workflows/`)

```typescript
// daily-report-workflow.ts
import { DailyReport, CreateDailyReportInput } from '../types'
import { DailyReportRepository } from '../repositories'

export const createDailyReportWorkflow = (
  repository: DailyReportRepository
) => async (
  input: CreateDailyReportInput
): Promise<Either<DomainError, DailyReport>> => {
  return pipe(
    input,
    validateCreateDailyReportInput,
    TE.chain(createDailyReportEntity),
    TE.chain(repository.save),
    TE.chain(notifyManagerIfNeeded)
  )
}

const validateCreateDailyReportInput = (
  input: CreateDailyReportInput
): Either<ValidationError, ValidatedInput> => {
  // バリデーションロジック
}

const createDailyReportEntity = (
  input: ValidatedInput
): TaskEither<DomainError, DailyReport> => {
  // エンティティ作成ロジック
}
```

## 開発ルール

### 型安全性
- `any`, `unknown`の使用禁止
- 全ての関数に明示的な型注釈
- Zodスキーマによる実行時バリデーション
- Tagged Union Typesの活用

### 関数型プログラミング
- 純粋関数を基本とする
- 副作用は明示的に分離（IO, Database, External API）
- Pipeline演算子スタイルの関数合成
- Option/Either型による例外処理

### エラーハンドリング
```typescript
// Result型を使用した統一的なエラーハンドリング
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

// Workflow内でのエラーハンドリング
export const someWorkflow = (input: Input): Promise<Result<Output, DomainError>> => {
  return pipe(
    input,
    validateInput,
    TE.chain(processData),
    TE.chain(saveToDatabase),
    TE.match(
      (error) => ({ success: false, error }),
      (data) => ({ success: true, data })
    )
  )()
}
```

### データベースアクセス
- Repository パターンを使用
- Prismaクライアントの直接使用禁止（Repository経由のみ）
- トランザクション管理の明示化

### テスト戦略

#### テストファイル配置ルール
- テストファイルは対象ファイルと同じディレクトリに配置
- テストファイル名は `{対象ファイル名}.spec.ts` 形式
- Storybookファイル（フロントエンドコンポーネントのみ）も同様に `{コンポーネント名}.stories.tsx` 形式で同じディレクトリに配置

例:
```
components/
├── Button.tsx
├── Button.spec.ts
└── Button.stories.tsx
```

#### 単体テスト
```typescript
// ドメインロジックのテスト（daily-report-workflow.spec.ts）
describe('createDailyReportWorkflow', () => {
  it('should create daily report with valid input', async () => {
    // Given
    const mockRepository = createMockRepository()
    const input = createValidInput()
    
    // When
    const result = await createDailyReportWorkflow(mockRepository)(input)
    
    // Then
    expect(result.success).toBe(true)
    expect(mockRepository.save).toHaveBeenCalledWith(expectedDailyReport)
  })
})
```

#### 統合テスト
- gRPCエンドポイントのテスト
- データベース操作のテスト
- Slack連携のテスト

### コード品質
- リンター/フォーマッター: Biome（統一的なコード品質管理）
- コミットメッセージ: Conventional Commits
- PR必須レビュー

## 実装ガイドライン

### gRPC実装

#### Protocol Buffers生成
```bash
# 共通protoファイルから型生成
npm run proto:generate
```

#### サーバー実装
```typescript
// backend/src/infrastructure/grpc/server.ts
import { createServer } from 'nice-grpc'
import { DailyReportServiceImplementation } from '../application/handlers'

const server = createServer()
server.add(DailyReportServiceDefinition, dailyReportHandler)
```

#### クライアント実装
```typescript
// frontend/src/lib/grpc-client.ts
import { createChannel, createClient } from 'nice-grpc-web'
import { DailyReportServiceDefinition } from '@shared/proto'

const channel = createChannel('http://localhost:9090')
const client = createClient(DailyReportServiceDefinition, channel)
```

### Prismaスキーマ

```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid()) @db.VarChar(26)
  username     String   @unique @db.VarChar(50)
  email        String   @unique @db.VarChar(100)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  role         String   @db.VarChar(20)
  managerId    String?  @map("manager_id") @db.VarChar(26)
  slackUserId  String   @map("slack_user_id") @db.VarChar(50)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  manager      User?          @relation("UserManager", fields: [managerId], references: [id])
  subordinates User[]         @relation("UserManager")
  dailyReports DailyReport[]
  comments     Comment[]

  @@map("users")
}

model DailyReport {
  id           String   @id @default(cuid()) @db.VarChar(26)
  userId       String   @map("user_id") @db.VarChar(26)
  reportDate   DateTime @map("report_date") @db.Date
  memo         String?
  tomorrowPlan String?  @map("tomorrow_plan")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user        User          @relation(fields: [userId], references: [id])
  workRecords WorkRecord[]
  comments    Comment[]

  @@unique([userId, reportDate])
  @@map("daily_reports")
}
```

### フロントエンド実装

#### shadcn/ui設定
```json
// components.json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/front/styles/globals.css",
    "baseColor": "neutral",
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/shadcn/ui"
  }
}
```

コンポーネント追加コマンド:
```bash
npm run ui button  # ボタンコンポーネント追加
npm run ui card    # カードコンポーネント追加
```

#### shadcn/ui使用例
```typescript
// src/front/components/daily-report-form.tsx
import { Button } from '@/components/shadcn/ui/button'
import { Input } from '@/components/shadcn/ui/input'
import { Textarea } from '@/components/shadcn/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card'

export const DailyReportForm = () => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workRecords'
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>日報作成</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 作業記録 */}
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 border rounded p-4">
            <Input placeholder="プロジェクト名" {...register(`workRecords.${index}.projectName`)} />
            <Input type="number" placeholder="作業時間" {...register(`workRecords.${index}.workHours`)} />
            <Textarea placeholder="作業内容" {...register(`workRecords.${index}.workContent`)} />
            <Button variant="destructive" onClick={() => remove(index)}>削除</Button>
          </div>
        ))}
        
        <Button onClick={() => append({ projectName: '', workHours: 0, workContent: '' })}>
          作業記録追加
        </Button>
        
        {/* その他事項 */}
        <Textarea placeholder="困ったこと、相談したいこと" {...register('memo')} />
        <Textarea placeholder="明日やること" {...register('tomorrowPlan')} />
      </CardContent>
    </Card>
  )
}
```

## 開発フロー

### セットアップ
1. `docker-compose up -d` - PostgreSQLコンテナ起動
2. `npm install` - 依存関係インストール
3. `npm run db:setup` - Prisma初期化
4. `npm run proto:generate` - Protocol Buffers生成
5. `npm run dev` - 開発サーバー起動

### 開発フェーズ
1. **Phase 1**: 基本機能（認証、日報CRUD、コメント）
2. **Phase 2**: 集計・レポート機能
3. **Phase 3**: Slack連携機能

### テスト実行
```bash
# 全テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage
```

### コンポーネント管理
```bash
# shadcn/uiコンポーネント追加
npm run ui
```

## Docker構成

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: daily-report-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: daily_report
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Docker操作コマンド
```bash
# PostgreSQL起動
docker-compose up -d

# PostgreSQL停止
docker-compose down

# データボリューム込みで削除
docker-compose down -v

# ログ確認
docker-compose logs -f postgres

# PostgreSQLに接続
docker-compose exec postgres psql -U postgres -d daily_report
```

## 環境変数

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/daily_report"
JWT_SECRET="your-jwt-secret"
SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
SLACK_CHANNEL_ID="C1234567890"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_GRPC_URL="http://localhost:9090"
```

## デプロイメント

### 本番環境
- **Frontend**: Vercel
- **Backend**: Railway / Render
- **Database**: PostgreSQL (Railway / Supabase)

### CI/CD
- GitHub Actions
- 自動テスト実行
- 型チェック
- リント・フォーマット
- セキュリティスキャン