// Result type for error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Helper functions
export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
})

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
})

export const isOk = <T, E>(result: Result<T, E>): result is { success: true; data: T } => {
  return result.success === true
}

export const isErr = <T, E>(result: Result<T, E>): result is { success: false; error: E } => {
  return result.success === false
}

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  if (isOk(result)) {
    return ok(fn(result.data))
  }
  return result
}

export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (isErr(result)) {
    return err(fn(result.error))
  }
  return result
}

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> => {
  if (isOk(result)) {
    return fn(result.data)
  }
  return result
}

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (isOk(result)) {
    return result.data
  }
  throw result.error
}

export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (isOk(result)) {
    return result.data
  }
  return defaultValue
}