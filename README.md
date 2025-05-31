# 日報システム (Daily Report System)

従業員の日々の作業内容を記録・管理し、上司とのコミュニケーションを促進するWebベースの日報システム。

## 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Hono, TypeScript, Prisma, PostgreSQL
- **Communication**: gRPC with Protocol Buffers
- **Testing**: Vitest
- **Linting**: Biome
- **Container**: Docker & Docker Compose

## プロジェクト構成

```
src/
├── front/          # Next.js フロントエンド
├── backend/        # Hono バックエンド
└── shared/         # 共通モジュール（Proto定義、型定義）
```

## セットアップ

### 1. 環境準備

```bash
# PostgreSQLコンテナ起動
docker-compose up -d

# 依存関係インストール
npm install
```

### 2. 環境変数設定

Backend用の環境変数を設定:
```bash
cp src/backend/.env.example src/backend/.env
# .envファイルを編集して適切な値を設定
```

Frontend用の環境変数を設定:
```bash
cp src/front/.env.local.example src/front/.env.local
# .env.localファイルを編集
```

### 3. データベース初期化

```bash
# Prismaマイグレーション実行
npm run db:migrate

# Prisma Studioでデータベース確認（オプション）
npm run db:studio
```

### 4. 開発サーバー起動

```bash
# フロントエンドとバックエンドを同時起動
npm run dev

# または個別に起動
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

## 主要コマンド

```bash
# 開発
npm run dev              # 全サービス起動
npm run dev:frontend     # フロントエンドのみ
npm run dev:backend      # バックエンドのみ

# ビルド
npm run build            # 全プロジェクトビルド
npm run build:frontend   # フロントエンドビルド
npm run build:backend    # バックエンドビルド

# テスト
npm run test             # 全テスト実行
npm run test:watch       # ウォッチモード

# コード品質
npm run lint             # Biomeでチェック
npm run lint:fix         # 自動修正
npm run typecheck        # TypeScript型チェック

# データベース
npm run db:migrate       # マイグレーション実行
npm run db:studio        # Prisma Studio起動
npm run db:seed          # シードデータ投入

# UI Components
npm run ui               # shadcn/uiコンポーネント追加
```

## 開発ガイドライン

- TypeScript strict modeを使用
- テストファイルは `.spec.ts` 拡張子を使用
- テストファイルは対象ファイルと同じディレクトリに配置
- Biomeでコードフォーマット・リント
- Conventional Commitsに従う

## ドキュメント

- [詳細仕様書](docs/SPECIFICATION.md)
- [プロジェクト指示書](CLAUDE.md)