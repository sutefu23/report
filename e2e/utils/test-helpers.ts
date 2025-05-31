import {
  type Page,
  type Request,
  type Response,
  expect,
} from "@playwright/test"
import type { MockApiEndpoint } from "../fixtures/types"

export class TestHelpers {
  constructor(private page: Page) {}

  async mockApiResponse(endpoint: MockApiEndpoint): Promise<void> {
    await this.page.route(`**/api${endpoint.path}`, async (route) => {
      const response = {
        status: endpoint.status || 200,
        contentType: "application/json",
        body: JSON.stringify(endpoint.response),
      }

      if (endpoint.delay) {
        await new Promise((resolve) => setTimeout(resolve, endpoint.delay))
      }

      await route.fulfill(response)
    })
  }

  async mockMultipleApiResponses(endpoints: MockApiEndpoint[]): Promise<void> {
    for (const endpoint of endpoints) {
      await this.mockApiResponse(endpoint)
    }
  }

  async waitForApiCall(path: string, method = "GET"): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes(path) && response.request().method() === method,
    )

    return await responsePromise
  }

  async interceptApiCall(path: string, method = "GET"): Promise<Request> {
    return new Promise((resolve) => {
      this.page.on("request", (request) => {
        if (request.url().includes(path) && request.method() === method) {
          resolve(request)
        }
      })
    })
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear())
  }

  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear())
  }

  async clearAllStorage(): Promise<void> {
    await this.clearLocalStorage()
    await this.clearSessionStorage()
    await this.page.context().clearCookies()
  }

  async setLocalStorageItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [key, value],
    )
  }

  async getLocalStorageItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key)
  }

  async simulateNetworkError(): Promise<void> {
    await this.page.route("**/api/**", (route) => route.abort())
  }

  async simulateSlowNetwork(delay = 2000): Promise<void> {
    await this.page.route("**/api/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delay))
      await route.continue()
    })
  }

  async waitForLoadingToFinish(): Promise<void> {
    await this.page.waitForSelector('[data-testid="loading"]', {
      state: "hidden",
    })
  }

  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout })
  }

  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }

  async takeFullPageScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/${name}.png`,
      fullPage: true,
    })
  }

  async fillFormField(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value)
    await this.page.press(selector, "Tab") // Trigger blur event
  }

  async selectFromDropdown(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value)
  }

  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.page.setInputFiles(selector, filePath)
  }

  async verifyToast(
    message: string,
    type: "success" | "error" | "warning" | "info" = "success",
  ): Promise<void> {
    const toastSelector = `[data-testid="toast-${type}"]`
    await expect(this.page.locator(toastSelector)).toBeVisible()
    await expect(this.page.locator(toastSelector)).toContainText(message)
  }

  async dismissToast(): Promise<void> {
    const closeButton = this.page.locator('[data-testid="toast-close"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
    }
  }

  async verifyModalOpen(modalSelector: string): Promise<void> {
    await expect(this.page.locator(modalSelector)).toBeVisible()
    await expect(
      this.page.locator('[data-testid="modal-backdrop"]'),
    ).toBeVisible()
  }

  async closeModal(): Promise<void> {
    await this.page.press("body", "Escape")
    await expect(
      this.page.locator('[data-testid="modal-backdrop"]'),
    ).not.toBeVisible()
  }

  async confirmDialog(confirm = true): Promise<void> {
    const buttonSelector = confirm
      ? '[data-testid="confirm-button"]'
      : '[data-testid="cancel-button"]'
    await this.page.click(buttonSelector)
  }

  async verifyTableData(
    tableSelector: string,
    expectedData: string[][],
  ): Promise<void> {
    const table = this.page.locator(tableSelector)
    await expect(table).toBeVisible()

    for (let i = 0; i < expectedData.length; i++) {
      const row = table.locator("tr").nth(i)
      for (let j = 0; j < expectedData[i].length; j++) {
        const cell = row.locator("td").nth(j)
        await expect(cell).toContainText(expectedData[i][j])
      }
    }
  }

  async sortTable(columnHeader: string): Promise<void> {
    await this.page.click(`[data-testid="sort-${columnHeader}"]`)
  }

  async filterTable(filterSelector: string, value: string): Promise<void> {
    await this.page.fill(filterSelector, value)
    await this.page.press(filterSelector, "Enter")
  }

  async verifyFormValidation(
    fieldSelector: string,
    expectedError: string,
  ): Promise<void> {
    const errorSelector = `${fieldSelector}-error`
    await expect(this.page.locator(errorSelector)).toBeVisible()
    await expect(this.page.locator(errorSelector)).toContainText(expectedError)
  }

  async clearFormValidation(fieldSelector: string): Promise<void> {
    const errorSelector = `${fieldSelector}-error`
    await expect(this.page.locator(errorSelector)).not.toBeVisible()
  }

  async verifyPagination(
    currentPage: number,
    totalPages: number,
  ): Promise<void> {
    const currentPageElement = this.page.locator('[data-testid="current-page"]')
    const totalPagesElement = this.page.locator('[data-testid="total-pages"]')

    await expect(currentPageElement).toContainText(currentPage.toString())
    await expect(totalPagesElement).toContainText(totalPages.toString())
  }

  async navigateToNextPage(): Promise<void> {
    await this.page.click('[data-testid="next-page"]')
  }

  async navigateToPreviousPage(): Promise<void> {
    await this.page.click('[data-testid="previous-page"]')
  }

  async verifyLoadingState(): Promise<void> {
    await expect(this.page.locator('[data-testid="loading"]')).toBeVisible()
  }

  async verifyEmptyState(message: string): Promise<void> {
    await expect(this.page.locator('[data-testid="empty-state"]')).toBeVisible()
    await expect(
      this.page.locator('[data-testid="empty-state-message"]'),
    ).toContainText(message)
  }

  async verifyErrorState(message: string): Promise<void> {
    await expect(this.page.locator('[data-testid="error-state"]')).toBeVisible()
    await expect(
      this.page.locator('[data-testid="error-message"]'),
    ).toContainText(message)
  }

  async retryAction(): Promise<void> {
    await this.page.click('[data-testid="retry-button"]')
  }

  async simulateKeyboardShortcut(shortcut: string): Promise<void> {
    await this.page.keyboard.press(shortcut)
  }

  async verifyAccessibility(): Promise<void> {
    // Basic accessibility checks
    const mainElement = this.page.locator("main")
    await expect(mainElement).toBeVisible()

    // Check for proper heading hierarchy
    const h1Elements = this.page.locator("h1")
    await expect(h1Elements).toHaveCount(1)

    // Check for alt text on images
    const images = this.page.locator("img")
    const imageCount = await images.count()
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute("alt")
      expect(alt).toBeTruthy()
    }
  }

  async verifyResponsiveDesign(
    breakpoint: "mobile" | "tablet" | "desktop",
  ): Promise<void> {
    const viewports = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
    }

    await this.page.setViewportSize(viewports[breakpoint])
    await this.page.reload()
  }

  async measurePerformance(): Promise<PerformanceNavigationTiming> {
    const performanceEntries = await this.page.evaluate(() => {
      return performance.getEntriesByType("navigation")
    })

    return performanceEntries[0]
  }

  async verifyConsoleErrors(): Promise<void> {
    const errors: string[] = []

    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    // Wait a bit for any console errors to appear
    await this.page.waitForTimeout(1000)

    expect(errors).toHaveLength(0)
  }
}
