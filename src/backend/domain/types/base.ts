export type Brand<K, T> = K & { __brand: T }

export type UserId = Brand<string, "UserId">
export type DailyReportId = Brand<string, "DailyReportId">
export type DepartmentId = Brand<string, "DepartmentId">
export type ProjectId = Brand<string, "ProjectId">
export type NotificationId = Brand<string, "NotificationId">

export const createUserId = (id: string): UserId => id as UserId
export const createDailyReportId = (id: string): DailyReportId =>
  id as DailyReportId
export const createDepartmentId = (id: string): DepartmentId =>
  id as DepartmentId
export const createProjectId = (id: string): ProjectId => id as ProjectId
export const createNotificationId = (id: string): NotificationId =>
  id as NotificationId

export type Either<E, A> = { tag: "Left"; left: E } | { tag: "Right"; right: A }

export const left = <E, A>(e: E): Either<E, A> => ({ tag: "Left", left: e })
export const right = <E, A>(a: A): Either<E, A> => ({ tag: "Right", right: a })

export const isLeft = <E, A>(
  either: Either<E, A>,
): either is { tag: "Left"; left: E } => either.tag === "Left"

export const isRight = <E, A>(
  either: Either<E, A>,
): either is { tag: "Right"; right: A } => either.tag === "Right"

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export const ok = <T, E = Error>(data: T): Result<T, E> => ({
  success: true,
  data,
})

export const err = <T, E = Error>(error: E): Result<T, E> => ({
  success: false,
  error,
})
