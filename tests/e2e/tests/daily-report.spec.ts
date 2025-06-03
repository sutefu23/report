import { expect, test } from "@playwright/test"
import { DailyReportTestUtils } from "../utils/daily-report-utils"

test.describe("Daily Report Management", () => {
  let testUtils: DailyReportTestUtils

  test.beforeEach(async ({ page }) => {
    testUtils = new DailyReportTestUtils(page)
    await testUtils.login()
  })

  test.describe("Daily Report Creation", () => {
    test("should create a new daily report", async ({ page }) => {
      // Navigate to daily report creation page
      await page.goto("/reports/new")

      // Wait for the form to load
      await expect(
        page.locator('[data-testid="daily-report-form"]'),
      ).toBeVisible()

      // Fill in work records
      await testUtils.addWorkRecord({
        projectName: "プロジェクトA",
        workHours: 4,
        workContent: "APIの設計と実装を行いました",
      })

      await testUtils.addWorkRecord({
        projectName: "プロジェクトB",
        workHours: 2,
        workContent: "バグ修正と単体テストを実施しました",
      })

      // Fill in memo and tomorrow plan
      await page.fill(
        '[data-testid="memo-textarea"]',
        "特に困ったことはありませんでした",
      )
      await page.fill(
        '[data-testid="tomorrow-plan-textarea"]',
        "明日はコードレビューを実施予定です",
      )

      // Submit the form
      await page.click('[data-testid="submit-button"]')

      // Verify success message
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toContainText("日報を作成しました")

      // Verify redirect to daily report list
      await expect(page).toHaveURL("/reports")
    })

    test("should validate required fields", async ({ page }) => {
      await page.goto("/reports/new")

      // Try to submit without filling any fields
      await page.click('[data-testid="submit-button"]')

      // Verify validation errors
      await expect(
        page.locator('[data-testid="work-records-error"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="work-records-error"]'),
      ).toContainText("作業記録は1件以上入力してください")
    })

    test("should validate work record fields", async ({ page }) => {
      await page.goto("/reports/new")

      // Add work record but leave fields empty
      await page.click('[data-testid="add-work-record-button"]')

      // Try to submit
      await page.click('[data-testid="submit-button"]')

      // Verify field validation errors
      await expect(
        page.locator('[data-testid="project-name-error"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="work-hours-error"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="work-content-error"]'),
      ).toBeVisible()
    })
  })

  test.describe("Daily Report Viewing", () => {
    test("should display daily report list", async ({ page }) => {
      // Create test data
      await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "テストプロジェクト",
            workHours: 8,
            workContent: "テスト作業",
          },
        ],
      })

      await page.goto("/reports")

      // Verify daily report list is displayed
      await expect(
        page.locator('[data-testid="daily-report-list"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="daily-report-item"]'),
      ).toHaveCount(1)

      // Verify report content
      const reportItem = page
        .locator('[data-testid="daily-report-item"]')
        .first()
      await expect(
        reportItem.locator('[data-testid="report-date"]'),
      ).toContainText("2024-01-15")
      await expect(
        reportItem.locator('[data-testid="total-hours"]'),
      ).toContainText("8時間")
    })

    test("should display daily report details", async ({ page }) => {
      const reportId = await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "プロジェクトA",
            workHours: 4,
            workContent: "API開発",
          },
          {
            projectName: "プロジェクトB",
            workHours: 3,
            workContent: "テスト作成",
          },
        ],
        memo: "特になし",
        tomorrowPlan: "デプロイ作業",
      })

      await page.goto(`/reports/${reportId}`)

      // Verify report details
      await expect(page.locator('[data-testid="report-date"]')).toContainText(
        "2024-01-15",
      )
      await expect(page.locator('[data-testid="work-record"]')).toHaveCount(2)
      await expect(page.locator('[data-testid="memo"]')).toContainText(
        "特になし",
      )
      await expect(page.locator('[data-testid="tomorrow-plan"]')).toContainText(
        "デプロイ作業",
      )
    })
  })

  test.describe("Daily Report Editing", () => {
    test("should edit existing daily report", async ({ page }) => {
      const reportId = await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "プロジェクトA",
            workHours: 4,
            workContent: "初期作業",
          },
        ],
      })

      await page.goto(`/reports/${reportId}/edit`)

      // Modify work content
      await page.fill('[data-testid="work-content-0"]', "修正された作業内容")

      // Add new work record
      await testUtils.addWorkRecord({
        projectName: "プロジェクトC",
        workHours: 2,
        workContent: "追加作業",
      })

      // Submit changes
      await page.click('[data-testid="submit-button"]')

      // Verify success message
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible()

      // Verify changes were saved
      await page.goto(`/reports/${reportId}`)
      await expect(page.locator('[data-testid="work-record"]')).toHaveCount(2)
      await expect(
        page.locator('[data-testid="work-content"]').first(),
      ).toContainText("修正された作業内容")
    })
  })

  test.describe("Manager Comments", () => {
    test("should allow manager to add comments", async ({ page }) => {
      // Login as manager
      await testUtils.loginAsManager()

      const reportId = await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "プロジェクトA",
            workHours: 8,
            workContent: "開発作業",
          },
        ],
      })

      await page.goto(`/reports/${reportId}`)

      // Add comment
      await page.fill(
        '[data-testid="comment-textarea"]',
        "お疲れ様でした。良い進捗ですね。",
      )
      await page.click('[data-testid="add-comment-button"]')

      // Verify comment was added
      await expect(page.locator('[data-testid="comment"]')).toBeVisible()
      await expect(
        page.locator('[data-testid="comment-content"]'),
      ).toContainText("お疲れ様でした。良い進捗ですね。")
    })

    test("should not allow employees to add comments to their own reports", async ({
      page,
    }) => {
      const reportId = await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "プロジェクトA",
            workHours: 8,
            workContent: "開発作業",
          },
        ],
      })

      await page.goto(`/reports/${reportId}`)

      // Verify comment form is not visible for employees
      await expect(
        page.locator('[data-testid="comment-form"]'),
      ).not.toBeVisible()
    })
  })

  test.describe("Report Statistics", () => {
    test("should display project statistics", async ({ page }) => {
      // Create test data for multiple projects
      await testUtils.createMultipleTestReports([
        {
          date: "2024-01-15",
          workRecords: [
            {
              projectName: "プロジェクトA",
              workHours: 4,
              workContent: "作業1",
            },
            {
              projectName: "プロジェクトB",
              workHours: 4,
              workContent: "作業2",
            },
          ],
        },
        {
          date: "2024-01-16",
          workRecords: [
            {
              projectName: "プロジェクトA",
              workHours: 6,
              workContent: "作業3",
            },
            {
              projectName: "プロジェクトC",
              workHours: 2,
              workContent: "作業4",
            },
          ],
        },
      ])

      await page.goto("/reports/statistics")

      // Verify project statistics
      await expect(page.locator('[data-testid="project-stats"]')).toBeVisible()
      await expect(
        page.locator('[data-testid="project-A-hours"]'),
      ).toContainText("10時間")
      await expect(
        page.locator('[data-testid="project-B-hours"]'),
      ).toContainText("4時間")
      await expect(
        page.locator('[data-testid="project-C-hours"]'),
      ).toContainText("2時間")
    })
  })

  test.describe("Export Functionality", () => {
    test("should export reports as CSV", async ({ page }) => {
      // Create test data
      await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "プロジェクトA",
            workHours: 8,
            workContent: "開発作業",
          },
        ],
      })

      await page.goto("/reports")

      // Start download
      const downloadPromise = page.waitForEvent("download")
      await page.click('[data-testid="export-csv-button"]')
      const download = await downloadPromise

      // Verify download
      expect(download.suggestedFilename()).toMatch(/daily-reports-.*\.csv/)
    })

    test("should export reports as PDF", async ({ page }) => {
      // Create test data
      await testUtils.createTestDailyReport({
        date: "2024-01-15",
        workRecords: [
          {
            projectName: "プロジェクトA",
            workHours: 8,
            workContent: "開発作業",
          },
        ],
      })

      await page.goto("/reports")

      // Start download
      const downloadPromise = page.waitForEvent("download")
      await page.click('[data-testid="export-pdf-button"]')
      const download = await downloadPromise

      // Verify download
      expect(download.suggestedFilename()).toMatch(/daily-reports-.*\.pdf/)
    })
  })
})
