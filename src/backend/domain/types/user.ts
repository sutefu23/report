import type { DepartmentId, UserId } from "./base"

export type UserRole = "admin" | "manager" | "employee"

export type User = {
  id: UserId
  email: string
  password?: string
  name: string
  role: UserRole
  departmentId: DepartmentId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = {
  email: string
  name: string
  password: string
  role: UserRole
  departmentId: DepartmentId
}

export type UpdateUserInput = {
  id: UserId
  name?: string
  role?: UserRole
  departmentId?: DepartmentId
  isActive?: boolean
}

export type AuthenticateUserInput = {
  email: string
  password: string
}

export type AuthToken = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
