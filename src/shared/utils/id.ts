import { ulid } from 'ulid'
import {
  createUserId,
  createDailyReportId,
  createWorkRecordId,
  createProjectId,
  createCommentId,
  type UserId,
  type DailyReportId,
  type WorkRecordId,
  type ProjectId,
  type CommentId,
} from '../types'

export const generateUserId = (): UserId => {
  return createUserId(ulid())
}

export const generateDailyReportId = (): DailyReportId => {
  return createDailyReportId(ulid())
}

export const generateWorkRecordId = (): WorkRecordId => {
  return createWorkRecordId(ulid())
}

export const generateProjectId = (): ProjectId => {
  return createProjectId(ulid())
}

export const generateCommentId = (): CommentId => {
  return createCommentId(ulid())
}