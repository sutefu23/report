import { describe, expect, it } from "vitest"
import {
  type Result,
  err,
  flatMap,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  unwrap,
  unwrapOr,
} from "./result"

describe("Result Type", () => {
  describe("Construction", () => {
    it("should create success result", () => {
      const result = ok("success")

      expect(result.success).toBe(true)
      expect(result.data).toBe("success")
    })

    it("should create error result", () => {
      const result = err("error")

      expect(result.success).toBe(false)
      expect(result.error).toBe("error")
    })
  })

  describe("Type Guards", () => {
    it("should identify ok results", () => {
      const result = ok("value")

      expect(isOk(result)).toBe(true)
      expect(isErr(result)).toBe(false)
    })

    it("should identify error results", () => {
      const result = err("error")

      expect(isOk(result)).toBe(false)
      expect(isErr(result)).toBe(true)
    })
  })

  describe("Transformations", () => {
    it("should map over success values", () => {
      const result = ok(5)
      const mapped = map(result, (x) => x * 2)

      expect(isOk(mapped)).toBe(true)
      if (isOk(mapped)) {
        expect(mapped.data).toBe(10)
      }
    })

    it("should not map over error values", () => {
      const result: Result<number, string> = err("error")
      const mapped = map(result, (x) => x * 2)

      expect(isErr(mapped)).toBe(true)
      if (isErr(mapped)) {
        expect(mapped.error).toBe("error")
      }
    })

    it("should map over errors", () => {
      const result = err("original error")
      const mapped = mapErr(result, (e) => `mapped: ${e}`)

      expect(isErr(mapped)).toBe(true)
      if (isErr(mapped)) {
        expect(mapped.error).toBe("mapped: original error")
      }
    })

    it("should flat map success values", () => {
      const result = ok(5)
      const flatMapped = flatMap(result, (x) => ok(x * 2))

      expect(isOk(flatMapped)).toBe(true)
      if (isOk(flatMapped)) {
        expect(flatMapped.data).toBe(10)
      }
    })

    it("should handle flat map with error result", () => {
      const result = ok(5)
      const flatMapped = flatMap(result, () => err("error"))

      expect(isErr(flatMapped)).toBe(true)
      if (isErr(flatMapped)) {
        expect(flatMapped.error).toBe("error")
      }
    })
  })

  describe("Unwrapping", () => {
    it("should unwrap success values", () => {
      const result = ok("value")

      expect(unwrap(result)).toBe("value")
    })

    it("should throw when unwrapping error", () => {
      const result = err(new Error("test error"))

      expect(() => unwrap(result)).toThrow("test error")
    })

    it("should unwrap with default for success", () => {
      const result = ok("value")

      expect(unwrapOr(result, "default")).toBe("value")
    })

    it("should use default for error", () => {
      const result: Result<string, Error> = err(new Error("error"))

      expect(unwrapOr(result, "default")).toBe("default")
    })
  })
})
