import type { DomainError } from "../../domain/errors"
import {
  type ApproveDailyReportInput,
  type CreateDailyReportInput,
  type DailyReport,
  type RejectDailyReportInput,
  type SubmitDailyReportInput,
  type UpdateDailyReportInput,
  isLeft,
} from "../../domain/types"
import {
  type DailyReportRepository,
  approveDailyReportWorkflow,
  createDailyReportWorkflow,
  rejectDailyReportWorkflow,
  submitDailyReportWorkflow,
  updateDailyReportWorkflow,
} from "../../domain/workflows"
import type { SimpleUserRepository } from "../../infrastructure/repositories/simple-user-repository"

export type DailyReportService = {
  create: (input: CreateDailyReportInput) => Promise<DailyReport>
  update: (input: UpdateDailyReportInput) => Promise<DailyReport>
  submit: (input: SubmitDailyReportInput) => Promise<DailyReport>
  approve: (input: ApproveDailyReportInput) => Promise<DailyReport>
  reject: (input: RejectDailyReportInput) => Promise<DailyReport>
  findById: (id: string) => Promise<DailyReport | null>
  findByUserAndDate: (userId: string, date: Date) => Promise<DailyReport | null>
}

export const createDailyReportService = (
  reportRepo: DailyReportRepository,
  userRepo: SimpleUserRepository,
): DailyReportService => {
  const handleWorkflowResult = async <T>(
    workflow: Promise<
      { tag: "Left"; left: DomainError } | { tag: "Right"; right: T }
    >,
  ): Promise<T> => {
    const result = await workflow
    if (isLeft(result)) {
      throw new Error(result.left.message)
    }
    return result.right
  }

  return {
    create: async (input: CreateDailyReportInput): Promise<DailyReport> => {
      const workflow = createDailyReportWorkflow(reportRepo, userRepo)
      return handleWorkflowResult(workflow(input))
    },

    update: async (input: UpdateDailyReportInput): Promise<DailyReport> => {
      const workflow = updateDailyReportWorkflow(reportRepo)
      return handleWorkflowResult(workflow(input))
    },

    submit: async (input: SubmitDailyReportInput): Promise<DailyReport> => {
      const workflow = submitDailyReportWorkflow(reportRepo)
      return handleWorkflowResult(workflow(input))
    },

    approve: async (input: ApproveDailyReportInput): Promise<DailyReport> => {
      const workflow = approveDailyReportWorkflow(reportRepo, userRepo)
      return handleWorkflowResult(workflow(input))
    },

    reject: async (input: RejectDailyReportInput): Promise<DailyReport> => {
      const workflow = rejectDailyReportWorkflow(reportRepo, userRepo)
      return handleWorkflowResult(workflow(input))
    },

    findById: async (id: string): Promise<DailyReport | null> => {
      return reportRepo.findById(id)
    },

    findByUserAndDate: async (
      userId: string,
      date: Date,
    ): Promise<DailyReport | null> => {
      return reportRepo.findByUserAndDate(userId, date)
    },
  }
}
