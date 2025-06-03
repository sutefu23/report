import { type Page, expect } from "@playwright/test"
import type { TestUser } from "../fixtures/types"

export class AuthTestUtils {
  constructor(private page: Page) {}

  async login(
    user: TestUser = { email: "test@example.com", password: "password123" },
  ): Promise<void> {
    await this.page.goto("/login")
    await this.page.fill('[data-testid="username-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.click('[data-testid="login-button"]')

    // Wait for successful login redirect
    await expect(this.page).toHaveURL("/dashboard")
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible()
  }

  async loginAsEmployee(): Promise<void> {
    await this.login({ email: "employee@example.com", password: "employee123" })
  }

  async loginAsManager(): Promise<void> {
    await this.login({ email: "manager@example.com", password: "manager123" })
  }

  async logout(): Promise<void> {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')

    // Verify logout
    await expect(this.page).toHaveURL("/login")
    await expect(
      this.page.locator('[data-testid="user-menu"]'),
    ).not.toBeVisible()
  }

  async expireSession(): Promise<void> {
    // Clear auth tokens to simulate expired session
    await this.page.evaluate(() => {
      localStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_token")
      document.cookie =
        "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    })
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible({
        timeout: 1000,
      })
      return true
    } catch {
      return false
    }
  }

  async getCurrentUser(): Promise<{ email: string; role: string } | null> {
    try {
      // Assuming user info is displayed in user menu
      await this.page.click('[data-testid="user-menu"]')

      const email = await this.page
        .locator('[data-testid="user-email"]')
        .textContent()
      const role = await this.page
        .locator('[data-testid="user-role"]')
        .textContent()

      // Close user menu
      await this.page.press("body", "Escape")

      if (email && role) {
        return { email, role }
      }

      return null
    } catch {
      return null
    }
  }

  async verifyAccessDenied(): Promise<void> {
    await expect(
      this.page.locator('[data-testid="access-denied-message"]'),
    ).toBeVisible()
  }

  async resetPassword(email: string): Promise<void> {
    await this.page.goto("/forgot-password")
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.click('[data-testid="send-reset-button"]')

    await expect(
      this.page.locator('[data-testid="success-message"]'),
    ).toBeVisible()
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Navigate to profile/settings page
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="profile-link"]')

    // Change password
    await this.page.fill('[data-testid="current-password"]', currentPassword)
    await this.page.fill('[data-testid="new-password"]', newPassword)
    await this.page.fill('[data-testid="confirm-password"]', newPassword)
    await this.page.click('[data-testid="change-password-button"]')

    await expect(
      this.page.locator('[data-testid="success-message"]'),
    ).toBeVisible()
  }

  async verifyRedirectAfterLogin(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl)
  }

  async loginAndExpectRedirect(
    user: TestUser,
    expectedUrl: string,
  ): Promise<void> {
    await this.login(user)
    await this.verifyRedirectAfterLogin(expectedUrl)
  }

  async accessProtectedPageWithoutLogin(url: string): Promise<void> {
    await this.page.goto(url)

    // Should redirect to login page
    await expect(this.page).toHaveURL(
      `/login?redirect=${encodeURIComponent(url)}`,
    )
  }

  async verifyRoleBasedAccess(
    role: "employee" | "manager",
    allowedUrls: string[],
    deniedUrls: string[],
  ): Promise<void> {
    if (role === "employee") {
      await this.loginAsEmployee()
    } else {
      await this.loginAsManager()
    }

    // Test allowed URLs
    for (const url of allowedUrls) {
      await this.page.goto(url)
      // Should not be redirected to access denied or login page
      await expect(this.page).toHaveURL(url)
    }

    // Test denied URLs
    for (const url of deniedUrls) {
      await this.page.goto(url)
      // Should either redirect to dashboard or show access denied
      const currentUrl = this.page.url()
      expect(
        currentUrl === "/dashboard" || currentUrl.includes("access-denied"),
      ).toBeTruthy()
    }
  }

  async createTestUser(userData: {
    email: string
    password: string
    role: "employee" | "manager"
    username: string
  }): Promise<void> {
    // This would typically call an API or use a database setup
    // For now, we'll assume this is handled by test fixtures
    await this.page.evaluate((data) => {
      // Mock API call to create user
      console.log("Creating test user:", data)
    }, userData)
  }

  async deleteTestUser(email: string): Promise<void> {
    // Cleanup test user
    await this.page.evaluate((userEmail) => {
      // Mock API call to delete user
      console.log("Deleting test user:", userEmail)
    }, email)
  }
}
