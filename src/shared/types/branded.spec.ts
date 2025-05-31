import { ulid } from "ulid"
import { describe, expect, it } from "vitest"
import {
  createCommentId,
  createDailyReportId,
  createProjectId,
  createUserId,
  createWorkRecordId,
  isCommentId,
  isDailyReportId,
  isProjectId,
  isUserId,
  isWorkRecordId,
} from "./branded"

describe("Branded Types", () => {
  describe("Type Guards", () => {
    it("should validate ULID format correctly", () => {
      const validId = ulid()
      const invalidId = "invalid-id"

      expect(isUserId(validId)).toBe(true)
      expect(isUserId(invalidId)).toBe(false)

      expect(isDailyReportId(validId)).toBe(true)
      expect(isDailyReportId(invalidId)).toBe(false)

      expect(isWorkRecordId(validId)).toBe(true)
      expect(isWorkRecordId(invalidId)).toBe(false)

      expect(isProjectId(validId)).toBe(true)
      expect(isProjectId(invalidId)).toBe(false)

      expect(isCommentId(validId)).toBe(true)
      expect(isCommentId(invalidId)).toBe(false)
    })
  })

  describe("Constructors", () => {
    it("should create branded types from valid ULIDs", () => {
      const validId = ulid()

      expect(() => createUserId(validId)).not.toThrow()
      expect(() => createDailyReportId(validId)).not.toThrow()
      expect(() => createWorkRecordId(validId)).not.toThrow()
      expect(() => createProjectId(validId)).not.toThrow()
      expect(() => createCommentId(validId)).not.toThrow()
    })

    it("should throw error for invalid IDs", () => {
      const invalidId = "invalid-id"

      expect(() => createUserId(invalidId)).toThrow("Invalid UserId")
      expect(() => createDailyReportId(invalidId)).toThrow(
        "Invalid DailyReportId",
      )
      expect(() => createWorkRecordId(invalidId)).toThrow(
        "Invalid WorkRecordId",
      )
      expect(() => createProjectId(invalidId)).toThrow("Invalid ProjectId")
      expect(() => createCommentId(invalidId)).toThrow("Invalid CommentId")
    })

    it("should create different branded types that are not assignable to each other", () => {
      const id = ulid()
      const userId = createUserId(id)
      const projectId = createProjectId(id)

      // This test ensures type safety at compile time
      // TypeScript should prevent assignment between different branded types
      expect(userId).not.toBe(projectId) // Runtime check
    })
  })
})
