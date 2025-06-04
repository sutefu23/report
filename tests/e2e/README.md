# E2E Testing with Playwright

日報システムのエンドツーエンド（E2E）テストについて説明します。

## 概要

Playwrightを使用してWebアプリケーション全体のE2Eテストを実装しています。実際のブラウザを使用してユーザーの操作をシミュレートし、システム全体の動作を検証します。

## テスト構成

### ディレクトリ構造

```
e2e/
├── tests/                    # テストファイル
│   ├── daily-report.spec.ts  # 日報機能のテスト
│   └── authentication.spec.ts # 認証機能のテスト
├── utils/                    # テストユーティリティ
│   ├── daily-report-utils.ts # 日報関連のヘルパー
│   ├── auth-utils.ts         # 認証関連のヘルパー
│   └── test-helpers.ts       # 共通ヘルパー
├── fixtures/                 # テストデータ
│   ├── types.ts              # 型定義
│   └── test-data.ts          # テストデータ
└── README.md
```

### テスト実行コマンド

```bash
# 基本のE2Eテスト実行
npm run test:e2e

# ブラウザを表示してテスト実行
npm run test:e2e:headed

# UIモードでテスト実行
npm run test:e2e:ui

# デバッグモードでテスト実行
npm run test:e2e:debug

# テストレポート表示
npm run test:e2e:report

# Playwrightブラウザのインストール
npm run test:install
```

## テストケース

### 認証機能 (`authentication.spec.ts`)

- ✅ ログイン成功/失敗
- ✅ バリデーション
- ✅ ログアウト
- ✅ ロールベースアクセス制御
- ✅ セッション管理
- ✅ パスワードリセット

### 日報管理機能 (`daily-report.spec.ts`)

- ✅ 日報作成・編集・閲覧
- ✅ 作業記録の複数行管理
- ✅ バリデーション
- ✅ 上司コメント機能
- ✅ 統計・集計機能
- ✅ エクスポート機能（CSV/PDF）

## テストユーティリティ

### DailyReportTestUtils

日報機能のテストで使用するヘルパークラス：

```typescript
const testUtils = new DailyReportTestUtils(page)

// ログイン
await testUtils.login()
await testUtils.loginAsManager()

// 作業記録追加
await testUtils.addWorkRecord({
  projectName: 'プロジェクトA',
  workHours: 4,
  workContent: '作業内容'
})

// テストデータ作成
const reportId = await testUtils.createTestDailyReport({
  date: '2024-01-15',
  workRecords: [...]
})
```

### AuthTestUtils

認証機能のテストで使用するヘルパークラス：

```typescript
const authUtils = new AuthTestUtils(page)

// ログイン/ログアウト
await authUtils.login({ email: 'test@example.com', password: 'password' })
await authUtils.logout()

// ロール別ログイン
await authUtils.loginAsEmployee()
await authUtils.loginAsManager()

// アクセス権限テスト
await authUtils.verifyRoleBasedAccess('employee', allowedUrls, deniedUrls)
```

### TestHelpers

共通的なテスト操作のヘルパークラス：

```typescript
const helpers = new TestHelpers(page)

// API モック
await helpers.mockApiResponse({
  method: 'POST',
  path: '/api/reports',
  response: { success: true, data: {...} }
})

// ストレージ操作
await helpers.clearAllStorage()
await helpers.setLocalStorageItem('key', 'value')

// UI操作
await helpers.verifyToast('成功しました', 'success')
await helpers.waitForLoadingToFinish()
```

## テストデータ

### ユーザー

```typescript
// テストユーザー
TEST_USERS = {
  employee: { email: 'employee@example.com', password: 'employee123' },
  manager: { email: 'manager@example.com', password: 'manager123' }
}
```

### 日報データ

```typescript
// サンプル日報データ
SAMPLE_DAILY_REPORTS = [
  {
    date: '2024-01-15',
    workRecords: [
      { projectName: 'プロジェクトA', workHours: 4, workContent: '...' }
    ],
    memo: '特になし',
    tomorrowPlan: 'デプロイ作業'
  }
]
```

## Configuration

### Playwright設定 (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './e2e/tests',
  baseURL: 'http://localhost:3000',
  webServer: [
    {
      command: 'npm run dev:frontend',
      url: 'http://localhost:3000',
    },
    {
      command: 'npm run dev:backend', 
      url: 'http://localhost:9090',
    }
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ]
})
```

## ベストプラクティス

### 1. Page Object Model の活用

テストユーティリティクラスでページの操作を抽象化し、テストコードの保守性を向上させています。

### 2. データテストID の使用

要素の特定には `data-testid` 属性を使用し、UIの変更に影響されにくいテストを作成しています。

```html
<button data-testid="submit-button">提出</button>
```

### 3. テストデータの管理

テストで使用するデータは `fixtures/` ディレクトリで一元管理し、再利用可能な形で提供しています。

### 4. 並列実行の考慮

各テストは独立して実行できるよう設計され、並列実行によるテスト時間の短縮を実現しています。

### 5. レスポンシブテスト

モバイルとデスクトップの両方のビューポートでテストを実行し、レスポンシブデザインを検証しています。

## CI/CD 統合

GitHub Actionsでの自動実行を想定した設定になっています：

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
```

## トラブルシューティング

### よくある問題

1. **テストが不安定**: `waitForSelector` や `waitForLoadState` を適切に使用してください
2. **ローカル環境で失敗**: ブラウザの自動インストール: `npm run test:install`
3. **認証エラー**: テストユーザーのデータが正しく設定されているか確認してください

### デバッグ方法

```bash
# デバッグモードで実行
npm run test:e2e:debug

# ヘッドフルモードで実行
npm run test:e2e:headed

# 特定のテストのみ実行
npx playwright test daily-report.spec.ts
```