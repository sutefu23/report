import { describe, expect, it } from "vitest"
import {
  addDays,
  formatDate,
  getEndOfMonth,
  getEndOfWeek,
  getStartOfMonth,
  getStartOfWeek,
  isSameDay,
  parseDate,
  toDateOnly,
} from "./date"

describe("Date Utils", () => {
  describe("toDateOnly", () => {
    it("should remove time components", () => {
      const date = new Date("2023-12-25T15:30:45.123Z")
      const dateOnly = toDateOnly(date)

      expect(dateOnly.getHours()).toBe(0)
      expect(dateOnly.getMinutes()).toBe(0)
      expect(dateOnly.getSeconds()).toBe(0)
      expect(dateOnly.getMilliseconds()).toBe(0)
    })
  })

  describe("formatDate", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date("2023-12-25T15:30:45Z")
      const formatted = formatDate(date)

      expect(formatted).toBe("2023-12-25")
    })
  })

  describe("parseDate", () => {
    it("should parse date string", () => {
      const dateString = "2023-12-25"
      const parsed = parseDate(dateString)

      expect(parsed.getFullYear()).toBe(2023)
      expect(parsed.getMonth()).toBe(11) // 0-indexed
      expect(parsed.getDate()).toBe(25)
    })
  })

  describe("getStartOfMonth", () => {
    it("should return first day of month", () => {
      const date = new Date("2023-12-15T15:30:45Z")
      const startOfMonth = getStartOfMonth(date)

      expect(startOfMonth.getDate()).toBe(1)
      expect(startOfMonth.getHours()).toBe(0)
      expect(startOfMonth.getMinutes()).toBe(0)
    })
  })

  describe("getEndOfMonth", () => {
    it("should return last day of month", () => {
      const date = new Date("2023-12-15T15:30:45Z")
      const endOfMonth = getEndOfMonth(date)

      expect(endOfMonth.getDate()).toBe(31) // December has 31 days
      expect(endOfMonth.getHours()).toBe(23)
      expect(endOfMonth.getMinutes()).toBe(59)
    })
  })

  describe("getStartOfWeek", () => {
    it("should return Monday of the week", () => {
      const friday = new Date("2023-12-22T15:30:45Z") // Friday
      const startOfWeek = getStartOfWeek(friday)

      expect(startOfWeek.getDay()).toBe(1) // Monday
      expect(startOfWeek.getDate()).toBe(18) // Monday of that week
    })
  })

  describe("getEndOfWeek", () => {
    it("should return Sunday of the week", () => {
      const friday = new Date("2023-12-22T15:30:45Z") // Friday
      const endOfWeek = getEndOfWeek(friday)

      expect(endOfWeek.getDay()).toBe(0) // Sunday
      expect(endOfWeek.getDate()).toBe(24) // Sunday of that week
    })
  })

  describe("addDays", () => {
    it("should add days to date", () => {
      const date = new Date("2023-12-25T15:30:45Z")
      const newDate = addDays(date, 7)

      expect(newDate.getDate()).toBe(1) // January 1st
      expect(newDate.getMonth()).toBe(0) // January
      expect(newDate.getFullYear()).toBe(2024)
    })

    it("should subtract days from date", () => {
      const date = new Date("2023-12-25T15:30:45Z")
      const newDate = addDays(date, -5)

      expect(newDate.getDate()).toBe(20)
      expect(newDate.getMonth()).toBe(11) // December
    })
  })

  describe("isSameDay", () => {
    it("should return true for same day", () => {
      const date1 = new Date("2023-12-25T10:00:00Z")
      const date2 = new Date("2023-12-25T20:00:00Z")

      expect(isSameDay(date1, date2)).toBe(true)
    })

    it("should return false for different days", () => {
      const date1 = new Date("2023-12-25T10:00:00Z")
      const date2 = new Date("2023-12-26T10:00:00Z")

      expect(isSameDay(date1, date2)).toBe(false)
    })
  })
})
