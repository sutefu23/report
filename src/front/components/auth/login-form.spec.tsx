import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { LoginForm } from "./login-form"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe("LoginForm", () => {
  it("should render login form with all fields", () => {
    render(<LoginForm />)

    expect(screen.getByText("日報システム")).toBeInTheDocument()
    expect(screen.getByLabelText("ユーザー名")).toBeInTheDocument()
    expect(screen.getByLabelText("パスワード")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument()
  })

  it("should show validation errors when fields are empty", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole("button", { name: "ログイン" })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText("ユーザー名を入力してください"),
      ).toBeInTheDocument()
      expect(
        screen.getByText("パスワードを入力してください"),
      ).toBeInTheDocument()
    })
  })

  it("should submit form with valid data", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const usernameInput = screen.getByLabelText("ユーザー名")
    const passwordInput = screen.getByLabelText("パスワード")
    const submitButton = screen.getByRole("button", { name: "ログイン" })

    await user.type(usernameInput, "testuser")
    await user.type(passwordInput, "password123")
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toHaveTextContent("ログイン中...")
    })
  })
})
