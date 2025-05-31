import { expect, test } from "@playwright/test"
import { AuthTestUtils } from "../utils/auth-utils"

test.describe("Authentication", () => {
  let authUtils: AuthTestUtils

  test.beforeEach(async ({ page }) => {
    authUtils = new AuthTestUtils(page)
  })

  test.describe("Login", () => {
    test("should login with valid credentials", async ({ page }) => {
      await page.goto("/login")

      // Fill login form
      await page.fill('[data-testid="username-input"]', "test@example.com")
      await page.fill('[data-testid="password-input"]', "password123")

      // Submit form
      await page.click('[data-testid="login-button"]')

      // Verify successful login
      await expect(page).toHaveURL("/dashboard")
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    test("should show error with invalid credentials", async ({ page }) => {
      await page.goto("/login")

      // Fill login form with invalid credentials
      await page.fill('[data-testid="username-input"]', "invalid@example.com")
      await page.fill('[data-testid="password-input"]', "wrongpassword")

      // Submit form
      await page.click('[data-testid="login-button"]')

      // Verify error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        "ユーザー名またはパスワードが間違っています",
      )
    })

    test("should validate required fields", async ({ page }) => {
      await page.goto("/login")

      // Try to submit without filling fields
      await page.click('[data-testid="login-button"]')

      // Verify validation errors
      await expect(page.locator('[data-testid="username-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
    })

    test("should redirect to intended page after login", async ({ page }) => {
      // Try to access protected page without login
      await page.goto("/reports/new")

      // Verify redirect to login
      await expect(page).toHaveURL("/login?redirect=/reports/new")

      // Login
      await page.fill('[data-testid="username-input"]', "test@example.com")
      await page.fill('[data-testid="password-input"]', "password123")
      await page.click('[data-testid="login-button"]')

      // Verify redirect to intended page
      await expect(page).toHaveURL("/reports/new")
    })
  })

  test.describe("Logout", () => {
    test("should logout successfully", async ({ page }) => {
      // Login first
      await authUtils.login()

      // Logout
      await page.click('[data-testid="user-menu"]')
      await page.click('[data-testid="logout-button"]')

      // Verify logout
      await expect(page).toHaveURL("/login")
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible()
    })
  })

  test.describe("Role-based Access", () => {
    test("should allow employees to access their own reports", async ({
      page,
    }) => {
      await authUtils.loginAsEmployee()

      await page.goto("/reports")

      // Verify access
      await expect(
        page.locator('[data-testid="daily-report-list"]'),
      ).toBeVisible()
    })

    test("should allow managers to access all reports", async ({ page }) => {
      await authUtils.loginAsManager()

      await page.goto("/reports/all")

      // Verify access
      await expect(
        page.locator('[data-testid="all-reports-list"]'),
      ).toBeVisible()
    })

    test("should deny employee access to manager pages", async ({ page }) => {
      await authUtils.loginAsEmployee()

      await page.goto("/reports/all")

      // Verify access denied
      await expect(page).toHaveURL("/dashboard")
      await expect(
        page.locator('[data-testid="access-denied-message"]'),
      ).toBeVisible()
    })
  })

  test.describe("Session Management", () => {
    test("should maintain session across page reloads", async ({ page }) => {
      await authUtils.login()

      // Reload page
      await page.reload()

      // Verify still logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    test("should handle expired sessions", async ({ page }) => {
      await authUtils.login()

      // Simulate expired token
      await authUtils.expireSession()

      // Try to access protected page
      await page.goto("/reports/new")

      // Verify redirect to login
      await expect(page).toHaveURL("/login")
    })
  })

  test.describe("Password Reset", () => {
    test("should send password reset email", async ({ page }) => {
      await page.goto("/login")
      await page.click('[data-testid="forgot-password-link"]')

      // Fill email
      await page.fill('[data-testid="email-input"]', "test@example.com")
      await page.click('[data-testid="send-reset-button"]')

      // Verify success message
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toBeVisible()
      await expect(
        page.locator('[data-testid="success-message"]'),
      ).toContainText("パスワードリセットメールを送信しました")
    })

    test("should validate email format", async ({ page }) => {
      await page.goto("/forgot-password")

      // Fill invalid email
      await page.fill('[data-testid="email-input"]', "invalid-email")
      await page.click('[data-testid="send-reset-button"]')

      // Verify validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-error"]')).toContainText(
        "有効なメールアドレスを入力してください",
      )
    })
  })
})
