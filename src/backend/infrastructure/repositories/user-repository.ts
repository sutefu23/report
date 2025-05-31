import type { PrismaClient, User as PrismaUser } from "@prisma/client"
import {
  type User,
  type UserRole,
  createDepartmentId,
  createUserId,
} from "../../domain/types"
import type { UserRepository } from "../../domain/workflows"

export const createUserRepository = (prisma: PrismaClient): UserRepository => {
  const toDomain = (user: PrismaUser): User => ({
    id: createUserId(user.id),
    email: user.email,
    password: user.password,
    name: user.name,
    role: user.role as UserRole,
    departmentId: createDepartmentId(user.departmentId),
    isActive: user.isActive,
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
      return user ? toDomain(user) : null
    },

    create: async (user: User & { password: string }): Promise<User> => {
      const created = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          departmentId: user.departmentId,
          isActive: user.isActive,
        },
      })
      return toDomain(created)
    },

    update: async (user: User): Promise<User> => {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name,
          role: user.role,
          departmentId: user.departmentId,
          isActive: user.isActive,
        },
      })
      return toDomain(updated)
    },
  }
}
