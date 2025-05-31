// Branded types for type safety
export type UserId = string & { readonly brand: unique symbol }
export type DailyReportId = string & { readonly brand: unique symbol }
export type WorkRecordId = string & { readonly brand: unique symbol }
export type ProjectId = string & { readonly brand: unique symbol }
export type CommentId = string & { readonly brand: unique symbol }

// Type guards
export const isUserId = (id: string): id is UserId => {
  return typeof id === 'string' && id.length === 26
}

export const isDailyReportId = (id: string): id is DailyReportId => {
  return typeof id === 'string' && id.length === 26
}

export const isWorkRecordId = (id: string): id is WorkRecordId => {
  return typeof id === 'string' && id.length === 26
}

export const isProjectId = (id: string): id is ProjectId => {
  return typeof id === 'string' && id.length === 26
}

export const isCommentId = (id: string): id is CommentId => {
  return typeof id === 'string' && id.length === 26
}

// Constructors
export const createUserId = (id: string): UserId => {
  if (!isUserId(id)) {
    throw new Error('Invalid UserId')
  }
  return id as UserId
}

export const createDailyReportId = (id: string): DailyReportId => {
  if (!isDailyReportId(id)) {
    throw new Error('Invalid DailyReportId')
  }
  return id as DailyReportId
}

export const createWorkRecordId = (id: string): WorkRecordId => {
  if (!isWorkRecordId(id)) {
    throw new Error('Invalid WorkRecordId')
  }
  return id as WorkRecordId
}

export const createProjectId = (id: string): ProjectId => {
  if (!isProjectId(id)) {
    throw new Error('Invalid ProjectId')
  }
  return id as ProjectId
}

export const createCommentId = (id: string): CommentId => {
  if (!isCommentId(id)) {
    throw new Error('Invalid CommentId')
  }
  return id as CommentId
}