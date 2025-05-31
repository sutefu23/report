export interface TestUser {
  email: string
  password: string
  role?: "employee" | "manager"
  username?: string
}

export interface WorkRecord {
  projectName: string
  workHours: number
  workContent: string
}

export interface DailyReportData {
  date?: string
  workRecords: WorkRecord[]
  memo?: string
  tomorrowPlan?: string
}

export interface Comment {
  id: string
  content: string
  authorName: string
  authorRole: "employee" | "manager"
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
}

export interface DailyReport {
  id: string
  userId: string
  reportDate: string
  workRecords: WorkRecord[]
  memo?: string
  tomorrowPlan?: string
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface TestDatabase {
  users: TestUser[]
  dailyReports: DailyReport[]
  projects: Project[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    username: string
    role: "employee" | "manager"
  }
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface ReportFilters {
  projectId?: string
  startDate?: string
  endDate?: string
  userId?: string
  searchTerm?: string
}

export interface ExportOptions {
  format: "csv" | "pdf"
  filters?: ReportFilters
  dateRange?: {
    start: string
    end: string
  }
}

export interface SlackNotification {
  channel: string
  message: string
  userId?: string
}

export interface TestConfig {
  baseURL: string
  timeout: number
  retries: number
  testUsers: {
    employee: TestUser
    manager: TestUser
    admin: TestUser
  }
}

export interface MockApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  response: unknown
  status?: number
  delay?: number
}

export interface TestFixture {
  users: TestUser[]
  projects: Project[]
  dailyReports: DailyReportData[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface NotificationPreferences {
  emailNotifications: boolean
  slackNotifications: boolean
  reminderTime?: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  role: "employee" | "manager"
  managerId?: string
  slackUserId?: string
  notificationPreferences: NotificationPreferences
  createdAt: string
  updatedAt: string
}
