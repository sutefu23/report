export type DomainErrorType =
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "BUSINESS_RULE_VIOLATION"

export type DomainError = {
  type: DomainErrorType
  message: string
  details?: unknown
}

export const notFound = (message: string, details?: unknown): DomainError => ({
  type: "NOT_FOUND",
  message,
  details,
})

export const alreadyExists = (
  message: string,
  details?: unknown,
): DomainError => ({
  type: "ALREADY_EXISTS",
  message,
  details,
})

export const validationError = (
  message: string,
  details?: unknown,
): DomainError => ({
  type: "VALIDATION_ERROR",
  message,
  details,
})

export const unauthorized = (
  message: string,
  details?: unknown,
): DomainError => ({
  type: "UNAUTHORIZED",
  message,
  details,
})

export const forbidden = (message: string, details?: unknown): DomainError => ({
  type: "FORBIDDEN",
  message,
  details,
})

export const businessRuleViolation = (
  message: string,
  details?: unknown,
): DomainError => ({
  type: "BUSINESS_RULE_VIOLATION",
  message,
  details,
})
