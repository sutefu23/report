import { type Page, expect } from "@playwright/test"
import type { DailyReportData, TestUser, WorkRecord } from "../fixtures/types"

export class DailyReportTestUtils {
  constructor(private page: Page) {}

  async login(
    user: TestUser = { email: "test@example.com", password: "password123" },
  ): Promise<void> {
    await this.page.goto("/login")
    await this.page.fill('[data-testid="username-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.click('[data-testid="login-button"]')
    await expect(this.page).toHaveURL("/dashboard")
  }

  async loginAsManager(): Promise<void> {
    await this.login({ email: "manager@example.com", password: "manager123" })
  }

  async addWorkRecord(workRecord: WorkRecord): Promise<void> {
    // Click add work record button
    await this.page.click('[data-testid="add-work-record-button"]')

    // Get the last work record form (newly added one)
    const workRecordCount = await this.page
      .locator('[data-testid^="work-record-"]')
      .count()
    const index = workRecordCount - 1

    // Fill work record fields
    await this.page.fill(
      `[data-testid="project-name-${index}"]`,
      workRecord.projectName,
    )
    await this.page.fill(
      `[data-testid="work-hours-${index}"]`,
      workRecord.workHours.toString(),
    )
    await this.page.fill(
      `[data-testid="work-content-${index}"]`,
      workRecord.workContent,
    )
  }

  async removeWorkRecord(index: number): Promise<void> {
    await this.page.click(`[data-testid="remove-work-record-${index}"]`)
  }

  async createTestDailyReport(data: DailyReportData): Promise<string> {
    // Navigate to new report page
    await this.page.goto("/reports/new")

    // Add work records
    for (const workRecord of data.workRecords) {
      await this.addWorkRecord(workRecord)
    }

    // Fill memo if provided
    if (data.memo) {
      await this.page.fill('[data-testid="memo-textarea"]', data.memo)
    }

    // Fill tomorrow plan if provided
    if (data.tomorrowPlan) {
      await this.page.fill(
        '[data-testid="tomorrow-plan-textarea"]',
        data.tomorrowPlan,
      )
    }

    // Set date if provided (assuming date picker exists)
    if (data.date) {
      await this.page.fill('[data-testid="report-date-input"]', data.date)
    }

    // Submit form
    await this.page.click('[data-testid="submit-button"]')

    // Wait for success message and extract report ID from URL
    await expect(
      this.page.locator('[data-testid="success-message"]'),
    ).toBeVisible()

    // Assuming redirect to /reports/{id} after creation
    const url = this.page.url()
    const reportId = url.split("/").pop()

    if (!reportId) {
      throw new Error("Failed to extract report ID from URL")
    }

    return reportId
  }

  async createMultipleTestReports(
    reportsData: DailyReportData[],
  ): Promise<string[]> {
    const reportIds: string[] = []

    for (const reportData of reportsData) {
      const reportId = await this.createTestDailyReport(reportData)
      reportIds.push(reportId)
    }

    return reportIds
  }

  async waitForReportToLoad(reportId: string): Promise<void> {
    await this.page.goto(`/reports/${reportId}`)
    await expect(
      this.page.locator('[data-testid="daily-report-details"]'),
    ).toBeVisible()
  }

  async verifyWorkRecord(
    index: number,
    expectedRecord: WorkRecord,
  ): Promise<void> {
    const workRecordElement = this.page.locator(
      `[data-testid="work-record-${index}"]`,
    )

    await expect(
      workRecordElement.locator('[data-testid="project-name"]'),
    ).toContainText(expectedRecord.projectName)
    await expect(
      workRecordElement.locator('[data-testid="work-hours"]'),
    ).toContainText(expectedRecord.workHours.toString())
    await expect(
      workRecordElement.locator('[data-testid="work-content"]'),
    ).toContainText(expectedRecord.workContent)
  }

  async addComment(comment: string): Promise<void> {
    await this.page.fill('[data-testid="comment-textarea"]', comment)
    await this.page.click('[data-testid="add-comment-button"]')
    await expect(
      this.page.locator('[data-testid="comment"]').last(),
    ).toBeVisible()
  }

  async verifyComment(commentText: string, authorName?: string): Promise<void> {
    const lastComment = this.page.locator('[data-testid="comment"]').last()
    await expect(
      lastComment.locator('[data-testid="comment-content"]'),
    ).toContainText(commentText)

    if (authorName) {
      await expect(
        lastComment.locator('[data-testid="comment-author"]'),
      ).toContainText(authorName)
    }
  }

  async getTotalWorkHours(): Promise<number> {
    const totalHoursText = await this.page
      .locator('[data-testid="total-hours"]')
      .textContent()
    if (!totalHoursText) return 0

    const match = totalHoursText.match(/(\d+)/)
    return match ? Number.parseInt(match[1]) : 0
  }

  async filterReportsByProject(projectName: string): Promise<void> {
    await this.page.selectOption('[data-testid="project-filter"]', projectName)
    await this.page.waitForSelector('[data-testid="daily-report-item"]')
  }

  async filterReportsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<void> {
    await this.page.fill('[data-testid="start-date-filter"]', startDate)
    await this.page.fill('[data-testid="end-date-filter"]', endDate)
    await this.page.click('[data-testid="apply-filters-button"]')
    await this.page.waitForSelector('[data-testid="daily-report-item"]')
  }

  async exportReports(format: "csv" | "pdf"): Promise<void> {
    const downloadPromise = this.page.waitForEvent("download")
    await this.page.click(`[data-testid="export-${format}-button"]`)
    await downloadPromise
  }

  async searchReports(searchTerm: string): Promise<void> {
    await this.page.fill('[data-testid="search-input"]', searchTerm)
    await this.page.press('[data-testid="search-input"]', "Enter")
    await this.page.waitForSelector('[data-testid="daily-report-item"]')
  }

  async getReportCount(): Promise<number> {
    return await this.page.locator('[data-testid="daily-report-item"]').count()
  }

  async navigateToPage(pageNumber: number): Promise<void> {
    await this.page.click(`[data-testid="page-${pageNumber}"]`)
    await this.page.waitForSelector('[data-testid="daily-report-item"]')
  }

  async verifyPagination(expectedTotalPages: number): Promise<void> {
    const paginationInfo = this.page.locator('[data-testid="pagination-info"]')
    await expect(paginationInfo).toContainText(`/ ${expectedTotalPages}`)
  }

  async duplicateReport(reportId: string): Promise<string> {
    await this.page.goto(`/reports/${reportId}`)
    await this.page.click('[data-testid="duplicate-button"]')

    // Verify redirect to new report form with pre-filled data
    await expect(this.page).toHaveURL("/reports/new")
    await expect(
      this.page.locator('[data-testid="work-record-0"]'),
    ).toBeVisible()

    // Submit to create the duplicate
    await this.page.click('[data-testid="submit-button"]')

    // Extract new report ID
    const url = this.page.url()
    const newReportId = url.split("/").pop()

    if (!newReportId) {
      throw new Error("Failed to extract duplicated report ID from URL")
    }

    return newReportId
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.page.goto(`/reports/${reportId}`)
    await this.page.click('[data-testid="delete-button"]')

    // Confirm deletion in modal
    await this.page.click('[data-testid="confirm-delete-button"]')

    // Verify deletion success
    await expect(
      this.page.locator('[data-testid="success-message"]'),
    ).toBeVisible()
    await expect(this.page).toHaveURL("/reports")
  }
}
