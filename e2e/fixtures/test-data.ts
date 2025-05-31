import type { DailyReportData, Project, TestFixture, TestUser } from "./types"

export const TEST_USERS: Record<string, TestUser> = {
  employee: {
    email: "employee@example.com",
    password: "employee123",
    role: "employee",
    username: "田中太郎",
  },
  manager: {
    email: "manager@example.com",
    password: "manager123",
    role: "manager",
    username: "佐藤花子",
  },
  employee2: {
    email: "employee2@example.com",
    password: "employee123",
    role: "employee",
    username: "山田次郎",
  },
}

export const TEST_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "プロジェクトA",
    description: "Webアプリケーション開発プロジェクト",
  },
  {
    id: "project-2",
    name: "プロジェクトB",
    description: "モバイルアプリ開発プロジェクト",
  },
  {
    id: "project-3",
    name: "プロジェクトC",
    description: "データ分析プロジェクト",
  },
  {
    id: "project-4",
    name: "保守・運用",
    description: "既存システムの保守運用",
  },
]

export const SAMPLE_DAILY_REPORTS: DailyReportData[] = [
  {
    date: "2024-01-15",
    workRecords: [
      {
        projectName: "プロジェクトA",
        workHours: 4,
        workContent:
          "ユーザー認証機能の実装を行いました。JWT認証の仕組みを導入し、ログイン・ログアウト機能を完成させました。",
      },
      {
        projectName: "プロジェクトB",
        workHours: 3,
        workContent:
          "モバイルアプリのUI設計レビューに参加しました。デザイナーと連携してユーザビリティの改善点を検討しました。",
      },
      {
        projectName: "保守・運用",
        workHours: 1,
        workContent:
          "本番環境のサーバー監視とログ確認を実施しました。特に問題は発見されませんでした。",
      },
    ],
    memo: "認証機能の実装で少し時間がかかりましたが、セキュリティ要件を満たす形で完成させることができました。",
    tomorrowPlan:
      "明日はAPI のエンドポイント設計とドキュメント作成を予定しています。",
  },
  {
    date: "2024-01-16",
    workRecords: [
      {
        projectName: "プロジェクトA",
        workHours: 6,
        workContent:
          "API エンドポイントの設計と実装を行いました。RESTful APIの設計原則に従い、CRUD操作のエンドポイントを作成しました。",
      },
      {
        projectName: "プロジェクトC",
        workHours: 2,
        workContent:
          "データ分析用のクエリ最適化を実施しました。インデックスの追加により処理速度が30%向上しました。",
      },
    ],
    memo: "API設計で他チームとの連携が必要な部分があり、仕様調整に時間を要しました。",
    tomorrowPlan: "単体テストの作成とコードレビューの対応を行う予定です。",
  },
  {
    date: "2024-01-17",
    workRecords: [
      {
        projectName: "プロジェクトA",
        workHours: 5,
        workContent:
          "単体テストの作成を行いました。Jest を使用してAPI エンドポイントのテストケースを網羅的に作成しました。",
      },
      {
        projectName: "プロジェクトB",
        workHours: 2,
        workContent:
          "モバイルアプリのプッシュ通知機能の調査を行いました。Firebase Cloud Messaging の導入方法を検討しました。",
      },
      {
        projectName: "保守・運用",
        workHours: 1,
        workContent:
          "セキュリティアップデートの適用とシステムの動作確認を実施しました。",
      },
    ],
    memo: "単体テストでエッジケースの洗い出しができ、バグを事前に発見することができました。",
    tomorrowPlan: "統合テストの実装とCI/CDパイプラインの設定を行います。",
  },
]

export const COMPLEX_DAILY_REPORT: DailyReportData = {
  date: "2024-01-20",
  workRecords: [
    {
      projectName: "プロジェクトA",
      workHours: 3,
      workContent:
        "複雑なビジネスロジックの実装を行いました。関数型プログラミングのパターンを活用し、保守性の高いコードを作成しました。",
    },
    {
      projectName: "プロジェクトA",
      workHours: 2,
      workContent:
        "コードレビューの対応とリファクタリングを実施しました。可読性とパフォーマンスの改善を図りました。",
    },
    {
      projectName: "プロジェクトB",
      workHours: 2,
      workContent:
        "クロスプラットフォーム対応の調査と技術検証を行いました。React Native vs Flutter の比較検討をしました。",
    },
    {
      projectName: "プロジェクトC",
      workHours: 1,
      workContent:
        "データ可視化ダッシュボードのプロトタイプを作成しました。Chart.js を使用したグラフ表示機能を実装しました。",
    },
  ],
  memo: "複数プロジェクトの作業が重なり、優先順位の調整が必要でした。プロジェクトAの重要なマイルストーンが近づいているため、リソースを集中させる必要があります。",
  tomorrowPlan:
    "プロジェクトAの統合テスト完了とデプロイ準備、プロジェクトBの技術選定会議への参加を予定しています。",
}

export const TEST_FIXTURE: TestFixture = {
  users: Object.values(TEST_USERS),
  projects: TEST_PROJECTS,
  dailyReports: SAMPLE_DAILY_REPORTS,
}

export const VALIDATION_TEST_DATA = {
  invalidWorkRecord: {
    projectName: "", // empty project name
    workHours: -1, // negative hours
    workContent: "", // empty content
  },
  validWorkRecord: {
    projectName: "プロジェクトA",
    workHours: 8,
    workContent: "機能開発を行いました。",
  },
  maxLengthWorkRecord: {
    projectName: "プロジェクト名が非常に長い場合のテストケースです。".repeat(
      10,
    ), // very long project name
    workHours: 24, // max possible hours in a day
    workContent: "作業内容が非常に長い場合のテストケースです。".repeat(50), // very long content
  },
}

export const MOCK_API_RESPONSES = {
  loginSuccess: {
    success: true,
    data: {
      token: "mock-jwt-token",
      user: {
        id: "user-1",
        email: "test@example.com",
        username: "テストユーザー",
        role: "employee",
      },
    },
  },
  loginFailure: {
    success: false,
    error: "ユーザー名またはパスワードが間違っています",
  },
  createReportSuccess: {
    success: true,
    data: {
      id: "report-123",
      message: "日報を作成しました",
    },
  },
  validationError: {
    success: false,
    error: "バリデーションエラー",
    details: [
      { field: "workRecords", message: "作業記録は1件以上入力してください" },
      { field: "projectName", message: "プロジェクト名は必須です" },
    ],
  },
}

export const SLACK_TEST_DATA = {
  reminderMessage: "本日の日報の提出をお忘れなく！",
  reportSubmittedMessage: (username: string) =>
    `${username}さんが日報を提出しました。`,
  weeklyReportMessage: "今週の作業時間集計をお送りします。",
}
