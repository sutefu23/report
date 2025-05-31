import type { DailyReportId, ProjectId, UserId } from "./base"

export type DailyReportStatus = "draft" | "submitted" | "approved" | "rejected"

export type TaskProgress = {
  projectId: ProjectId
  description: string
  hoursSpent: number
  progress: number
}

export type DailyReport = {
  id: DailyReportId
  userId: UserId
  date: Date
  tasks: TaskProgress[]
  challenges: string
  nextDayPlan: string
  status: DailyReportStatus
  submittedAt?: Date
  approvedAt?: Date
  approvedBy?: UserId
  feedback?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateDailyReportInput = {
  userId: UserId
  date: Date
  tasks: TaskProgress[]
  challenges: string
  nextDayPlan: string
}

export type UpdateDailyReportInput = {
  id: DailyReportId
  tasks?: TaskProgress[]
  challenges?: string
  nextDayPlan?: string
}

export type SubmitDailyReportInput = {
  id: DailyReportId
  userId: UserId
}

export type ApproveDailyReportInput = {
  id: DailyReportId
  approverId: UserId
  feedback?: string
}

export type RejectDailyReportInput = {
  id: DailyReportId
  approverId: UserId
  feedback: string
}
