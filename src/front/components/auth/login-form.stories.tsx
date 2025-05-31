import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "@storybook/test"
import { LoginForm } from "./login-form"

const meta = {
  title: "Auth/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  play: async ({ canvasElement }) => {
    const { getByRole } = within(canvasElement)
    const submitButton = getByRole("button", { name: "ログイン" })

    // Simulate form submission to show error state
    await userEvent.click(submitButton)
  },
}

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    const { getByLabelText, getByRole } = within(canvasElement)

    await userEvent.type(getByLabelText("ユーザー名"), "testuser")
    await userEvent.type(getByLabelText("パスワード"), "password")
    await userEvent.click(getByRole("button", { name: "ログイン" }))
  },
}
