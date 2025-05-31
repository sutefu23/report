import { ulid } from "ulid"
import {
  type CommentId,
  type DailyReportId,
  type ProjectId,
  type UserId,
  type WorkRecordId,
  createCommentId,
  createDailyReportId,
  createProjectId,
  createUserId,
  createWorkRecordId,
} from "../types"

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
