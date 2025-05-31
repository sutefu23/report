/**
 * API response types for the daily report system
 */

// User types
export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  departmentId?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Authentication types
export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  user: User
}

// Daily report types
export interface Task {
  id: string
  projectId: string
  projectName: string
  description: string
  hoursSpent: number
  progress: number
}

export interface DailyReport {
  id: string
  date: string
  userId: string
  author: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  status: "draft" | "submitted" | "approved" | "rejected"
  tasks: Task[]
  challenges?: string
  nextDayPlan?: string
  memo?: string
  totalHours: number
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  feedback?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDailyReportInput {
  date: string
  tasks: Array<{
    projectId: string
    description: string
    hoursSpent: number
    progress: number
  }>
  challenges: string
  nextDayPlan: string
  memo?: string
}

export interface UpdateDailyReportInput
  extends Partial<CreateDailyReportInput> {}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Comment types
export interface Comment {
  id: string
  reportId: string
  author: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  content: string
  createdAt: string
}

// Statistics types
export interface UserStats {
  userId: string
  period: string
  totalHours: number
  averageHoursPerDay: number
  reportCount: number
  submittedOnTimeRate: number
  projectBreakdown: Array<{
    projectId: string
    projectName: string
    totalHours: number
    percentage: number
  }>
}

export interface TeamStats {
  period: string
  totalReports: number
  totalHours: number
  averageHoursPerPerson: number
  submittedOnTimeRate: number
  memberStats: Array<{
    userId: string
    userName: string
    totalHours: number
    reportCount: number
  }>
}

// API response wrappers
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}
