import { ulid } from "ulid"
import {
  type DomainError,
  businessRuleViolation,
  forbidden,
  notFound,
  validationError,
} from "../errors"
import {
  type ApproveDailyReportInput,
  type CreateDailyReportInput,
  type DailyReport,
  type Either,
  type RejectDailyReportInput,
  type SubmitDailyReportInput,
  type UpdateDailyReportInput,
  createDailyReportId,
  left,
  right,
} from "../types"

export type DailyReportRepository = {
  findById: (id: string) => Promise<DailyReport | null>
  findByUserAndDate: (userId: string, date: Date) => Promise<DailyReport | null>
  create: (report: DailyReport) => Promise<DailyReport>
  update: (report: DailyReport) => Promise<DailyReport>
}

export type UserRepository = {
  findById: (id: string) => Promise<{ id: string; role: string } | null>
}

const validateCreateInput = (
  input: CreateDailyReportInput,
): Either<DomainError, CreateDailyReportInput> => {
  if (input.tasks.length === 0) {
    return left(validationError("少なくとも1つのタスクを入力してください"))
  }

  const totalHours = input.tasks.reduce((sum, task) => sum + task.hoursSpent, 0)
  if (totalHours > 24) {
    return left(
      validationError("1日の作業時間は24時間を超えることはできません"),
    )
  }

  for (const task of input.tasks) {
    if (task.progress < 0 || task.progress > 100) {
      return left(validationError("進捗率は0〜100の範囲で入力してください"))
    }
  }

  return right(input)
}

export const createDailyReportWorkflow =
  (reportRepo: DailyReportRepository, userRepo: UserRepository) =>
  async (
    input: CreateDailyReportInput,
  ): Promise<Either<DomainError, DailyReport>> => {
    const validationResult = validateCreateInput(input)
    if (validationResult.tag === "Left") {
      return validationResult
    }

    const user = await userRepo.findById(input.userId)
    if (!user) {
      return left(notFound("ユーザーが見つかりません"))
    }

    const existingReport = await reportRepo.findByUserAndDate(
      input.userId,
      input.date,
    )
    if (existingReport) {
      return left(businessRuleViolation("指定された日付の日報は既に存在します"))
    }

    const now = new Date()
    const report: DailyReport = {
      id: createDailyReportId(ulid()),
      userId: input.userId,
      date: input.date,
      tasks: input.tasks,
      challenges: input.challenges,
      nextDayPlan: input.nextDayPlan,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    }

    const created = await reportRepo.create(report)
    return right(created)
  }

export const updateDailyReportWorkflow =
  (reportRepo: DailyReportRepository) =>
  async (
    input: UpdateDailyReportInput,
  ): Promise<Either<DomainError, DailyReport>> => {
    const report = await reportRepo.findById(input.id)
    if (!report) {
      return left(notFound("日報が見つかりません"))
    }

    if (report.status !== "draft" && report.status !== "rejected") {
      return left(
        businessRuleViolation("提出済みまたは承認済みの日報は編集できません"),
      )
    }

    const updated: DailyReport = {
      ...report,
      tasks: input.tasks ?? report.tasks,
      challenges: input.challenges ?? report.challenges,
      nextDayPlan: input.nextDayPlan ?? report.nextDayPlan,
      updatedAt: new Date(),
    }

    if (input.tasks) {
      const totalHours = input.tasks.reduce(
        (sum, task) => sum + task.hoursSpent,
        0,
      )
      if (totalHours > 24) {
        return left(
          validationError("1日の作業時間は24時間を超えることはできません"),
        )
      }
    }

    const result = await reportRepo.update(updated)
    return right(result)
  }

export const submitDailyReportWorkflow =
  (reportRepo: DailyReportRepository) =>
  async (
    input: SubmitDailyReportInput,
  ): Promise<Either<DomainError, DailyReport>> => {
    const report = await reportRepo.findById(input.id)
    if (!report) {
      return left(notFound("日報が見つかりません"))
    }

    if (report.userId !== input.userId) {
      return left(forbidden("他のユーザーの日報を提出することはできません"))
    }

    if (report.status === "submitted" || report.status === "approved") {
      return left(businessRuleViolation("既に提出済みまたは承認済みの日報です"))
    }

    const now = new Date()
    const updated: DailyReport = {
      ...report,
      status: "submitted",
      submittedAt: now,
      updatedAt: now,
    }

    const result = await reportRepo.update(updated)
    return right(result)
  }

export const approveDailyReportWorkflow =
  (reportRepo: DailyReportRepository, userRepo: UserRepository) =>
  async (
    input: ApproveDailyReportInput,
  ): Promise<Either<DomainError, DailyReport>> => {
    const approver = await userRepo.findById(input.approverId)
    if (!approver) {
      return left(notFound("承認者が見つかりません"))
    }

    if (approver.role !== "manager" && approver.role !== "admin") {
      return left(forbidden("マネージャーまたは管理者のみが日報を承認できます"))
    }

    const report = await reportRepo.findById(input.id)
    if (!report) {
      return left(notFound("日報が見つかりません"))
    }

    if (report.status !== "submitted") {
      return left(businessRuleViolation("提出された日報のみ承認できます"))
    }

    const now = new Date()
    const updated: DailyReport = {
      ...report,
      status: "approved",
      approvedAt: now,
      approvedBy: input.approverId,
      feedback: input.feedback,
      updatedAt: now,
    }

    const result = await reportRepo.update(updated)
    return right(result)
  }

export const rejectDailyReportWorkflow =
  (reportRepo: DailyReportRepository, userRepo: UserRepository) =>
  async (
    input: RejectDailyReportInput,
  ): Promise<Either<DomainError, DailyReport>> => {
    const approver = await userRepo.findById(input.approverId)
    if (!approver) {
      return left(notFound("承認者が見つかりません"))
    }

    if (approver.role !== "manager" && approver.role !== "admin") {
      return left(forbidden("マネージャーまたは管理者のみが日報を差し戻せます"))
    }

    const report = await reportRepo.findById(input.id)
    if (!report) {
      return left(notFound("日報が見つかりません"))
    }

    if (report.status !== "submitted") {
      return left(businessRuleViolation("提出された日報のみ差し戻せます"))
    }

    if (!input.feedback || input.feedback.trim() === "") {
      return left(validationError("差し戻し理由を入力してください"))
    }

    const now = new Date()
    const updated: DailyReport = {
      ...report,
      status: "rejected",
      feedback: input.feedback,
      updatedAt: now,
    }

    const result = await reportRepo.update(updated)
    return right(result)
  }
