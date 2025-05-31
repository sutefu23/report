import { describe, expect, it } from "vitest"
import {
  isCommentId,
  isDailyReportId,
  isProjectId,
  isUserId,
  isWorkRecordId,
} from "../types"
import {
  generateCommentId,
  generateDailyReportId,
  generateProjectId,
  generateUserId,
  generateWorkRecordId,
} from "./id"

describe("ID Generators", () => {
  it("should generate valid UserId", () => {
    const id = generateUserId()

    expect(isUserId(id)).toBe(true)
    expect(typeof id).toBe("string")
    expect(id).toHaveLength(26)
  })

  it("should generate valid DailyReportId", () => {
    const id = generateDailyReportId()

    expect(isDailyReportId(id)).toBe(true)
    expect(typeof id).toBe("string")
    expect(id).toHaveLength(26)
  })

  it("should generate valid WorkRecordId", () => {
    const id = generateWorkRecordId()

    expect(isWorkRecordId(id)).toBe(true)
    expect(typeof id).toBe("string")
    expect(id).toHaveLength(26)
  })

  it("should generate valid ProjectId", () => {
    const id = generateProjectId()

    expect(isProjectId(id)).toBe(true)
    expect(typeof id).toBe("string")
    expect(id).toHaveLength(26)
  })

  it("should generate valid CommentId", () => {
    const id = generateCommentId()

    expect(isCommentId(id)).toBe(true)
    expect(typeof id).toBe("string")
    expect(id).toHaveLength(26)
  })

  it("should generate unique IDs", () => {
    const ids = Array.from({ length: 100 }, () => generateUserId())
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(100)
  })
})
