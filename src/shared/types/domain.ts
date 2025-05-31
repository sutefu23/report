import type { UserId, DailyReportId, WorkRecordId, ProjectId, CommentId } from './branded'

export type UserRole = 'employee' | 'manager'

export type User = {
  readonly id: UserId
  readonly username: string
  readonly email: string
  readonly role: UserRole
  readonly managerId?: UserId
  readonly slackUserId: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type DailyReport = {
  readonly id: DailyReportId
  readonly userId: UserId
  readonly reportDate: Date
  readonly memo?: string
  readonly tomorrowPlan?: string
  readonly workRecords: readonly WorkRecord[]
  readonly comments: readonly Comment[]
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type WorkRecord = {
  readonly id: WorkRecordId
  readonly dailyReportId: DailyReportId
  readonly projectId: ProjectId
  readonly workHours: number
  readonly workContent: string
  readonly createdAt: Date
}

export type Project = {
  readonly id: ProjectId
  readonly name: string
  readonly description?: string
  readonly isActive: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type Comment = {
  readonly id: CommentId
  readonly dailyReportId: DailyReportId
  readonly userId: UserId
  readonly content: string
  readonly createdAt: Date
  readonly updatedAt: Date
}