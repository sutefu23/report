import { DomainError } from "@domain/errors"
import type {
  CreateDailyReportInput,
  DailyReport,
} from "@domain/types/daily-report"
import type { DailyReportRepository } from "@infrastructure/repositories/daily-report.repository"
import {
  createDailyReportId,
  createProjectId,
  createUserId,
} from "@shared/types/branded"
import { ulid } from "ulid"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { createDailyReportWorkflow } from "../daily-report.workflow"

describe("Daily Report Workflows", () => {
  let mockRepository: DailyReportRepository

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserAndDate: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByUser: vi.fn(),
      findByDateRange: vi.fn(),
    }
  })

  describe("createDailyReportWorkflow", () => {
    it("should create a daily report successfully", async () => {
      const input: CreateDailyReportInput = {
        userId: createUserId(ulid()),
        date: new Date("2024-01-15"),
        tasks: [
          {
            projectId: createProjectId(ulid()),
            description: "Implemented user authentication",
            hoursSpent: 4,
            progress: 75,
          },
        ],
        challenges: "Debugging JWT token expiration issues",
        nextDayPlan: "Complete authentication flow and start on user profile",
      }

      const expectedReport: DailyReport = {
        id: createDailyReportId(ulid()),
        ...input,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRepository.findByUserAndDate.mockResolvedValue(null)
      mockRepository.create.mockResolvedValue(expectedReport)

      const workflow = createDailyReportWorkflow(mockRepository)
      const result = await workflow(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(expectedReport)
      }
      expect(mockRepository.findByUserAndDate).toHaveBeenCalledWith(
        input.userId,
        input.date,
      )
      expect(mockRepository.create).toHaveBeenCalledWith(input)
    })

    it("should return error if report already exists for the date", async () => {
      const input: CreateDailyReportInput = {
        userId: createUserId(ulid()),
        date: new Date("2024-01-15"),
        tasks: [],
        challenges: "",
        nextDayPlan: "",
      }

      const existingReport: DailyReport = {
        id: createDailyReportId(ulid()),
        ...input,
        status: "submitted",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRepository.findByUserAndDate.mockResolvedValue(existingReport)

      const workflow = createDailyReportWorkflow(mockRepository)
      const result = await workflow(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError)
        expect(result.error.code).toBe("DAILY_REPORT_ALREADY_EXISTS")
      }
      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    it("should validate task hours do not exceed 24 hours", async () => {
      const input: CreateDailyReportInput = {
        userId: createUserId(ulid()),
        date: new Date("2024-01-15"),
        tasks: [
          {
            projectId: createProjectId(ulid()),
            description: "Task 1",
            hoursSpent: 12,
            progress: 50,
          },
          {
            projectId: createProjectId(ulid()),
            description: "Task 2",
            hoursSpent: 13,
            progress: 50,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      }

      mockRepository.findByUserAndDate.mockResolvedValue(null)

      const workflow = createDailyReportWorkflow(mockRepository)
      const result = await workflow(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError)
        expect(result.error.code).toBe("INVALID_TASK_HOURS")
      }
    })

    it("should validate progress is between 0 and 100", async () => {
      const input: CreateDailyReportInput = {
        userId: createUserId(ulid()),
        date: new Date("2024-01-15"),
        tasks: [
          {
            projectId: createProjectId(ulid()),
            description: "Task with invalid progress",
            hoursSpent: 4,
            progress: 150,
          },
        ],
        challenges: "",
        nextDayPlan: "",
      }

      mockRepository.findByUserAndDate.mockResolvedValue(null)

      const workflow = createDailyReportWorkflow(mockRepository)
      const result = await workflow(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(DomainError)
        expect(result.error.code).toBe("INVALID_PROGRESS_VALUE")
      }
    })
  })
})
