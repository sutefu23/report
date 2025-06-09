import type { PrismaClient, User as PrismaUser } from "@prisma/client"
import {
  type User,
  type UserRole,
  createDepartmentId,
  createUserId,
} from "../../domain/types"
import type { UserRepository } from "../../domain/workflows"

export const createUserRepository = (prisma: PrismaClient): UserRepository => {
  const toDomain = (user: PrismaUser, includePassword = false): User => ({
    id: createUserId(user.id),
    email: user.email,
    password: includePassword ? user.passwordHash : undefined,
    name: user.username,
    role: user.role as UserRole,
    departmentId: createDepartmentId(""), // No departmentId in schema
    isActive: true, // No isActive in schema, default to true
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })

  return {
    findById: async (id: string): Promise<User | null> => {
      const user = await prisma.user.findUnique({
        where: { id },
      })
      return user ? toDomain(user) : null
    },

    findByEmail: async (email: string): Promise<User | null> => {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      return user ? toDomain(user, true) : null // Include password for authentication
    },

    create: async (user: User & { password: string }): Promise<User> => {
      const created = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          passwordHash: user.password, // Note: password should be hashed before this
          username: user.name,
          role: user.role,
          slackUserId: "", // Required field, needs to be provided
        },
      })
      return toDomain(created)
    },

    update: async (user: User): Promise<User> => {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: user.name,
          role: user.role,
        },
      })
      return toDomain(updated)
    },
  }
}
