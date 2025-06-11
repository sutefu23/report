/**
 * API client for daily report system
 * Handles communication with the backend API
 */

import { useAuthStore } from "@/stores/auth"
import type {
  CreateDailyReportInput,
  DailyReport,
  LoginResponse,
  Project,
  RegisterResponse,
  TeamStats,
  UpdateDailyReportInput,
  User,
  UserStats,
} from "@/types/api"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const { token } = useAuthStore.getState()

    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData,
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError("Network error or server unavailable", 0, error)
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    name: string
    email: string
    password: string
    role: string
    departmentId?: string
  }) {
    return this.request<RegisterResponse>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  // Daily Reports
  async createDailyReport(reportData: CreateDailyReportInput) {
    return this.request<DailyReport>("/api/daily-reports", {
      method: "POST",
      body: JSON.stringify(reportData),
    })
  }

  async updateDailyReport(id: string, reportData: UpdateDailyReportInput) {
    return this.request<DailyReport>(`/api/daily-reports/${id}`, {
      method: "PUT",
      body: JSON.stringify(reportData),
    })
  }

  async submitDailyReport(id: string, userId: string) {
    return this.request<DailyReport>(`/api/daily-reports/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async approveDailyReport(id: string, approverId: string, feedback?: string) {
    return this.request<DailyReport>(`/api/daily-reports/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ approverId, feedback }),
    })
  }

  async rejectDailyReport(id: string, approverId: string, feedback: string) {
    return this.request<DailyReport>(`/api/daily-reports/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ approverId, feedback }),
    })
  }

  async getDailyReport(id: string) {
    return this.request<DailyReport>(`/api/daily-reports/${id}`)
  }

  async getDailyReports(params?: {
    userId?: string
    startDate?: string
    endDate?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value)
      }
    }

    return this.request<DailyReport[]>(
      `/api/daily-reports?${searchParams.toString()}`,
    )
  }

  // Team management (admin only)
  async getTeamReports(params?: {
    startDate?: string
    endDate?: string
    userId?: string
    status?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.append(key, value)
      }
    }

    return this.request<DailyReport[]>(
      `/api/admin/team-reports?${searchParams.toString()}`,
    )
  }

  async getPendingReports() {
    return this.request<DailyReport[]>("/api/admin/pending-reports")
  }

  // Users
  async getUsers() {
    return this.request<User[]>("/api/users")
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.request<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>("/api/projects")
  }

  async createProject(projectData: { name: string; description?: string }) {
    return this.request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    })
  }

  // Statistics
  async getPersonalStats() {
    return this.request<UserStats>("/api/stats/personal")
  }

  async getTeamStats() {
    return this.request<TeamStats>("/api/stats/team")
  }
}

export const apiClient = new ApiClient()
