import { create } from "zustand"
import { persist } from "zustand/middleware"

// Frontend-specific user type with display name
interface FrontendUser {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthState {
  user: FrontendUser | null
  token: string | null
  isAuthenticated: boolean
  login: (user: FrontendUser, token: string) => void
  logout: () => void
  updateUser: (user: FrontendUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
