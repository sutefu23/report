import type { PrismaClient } from "@prisma/client"

export type SimpleUserRepository = {
  findById: (id: string) => Promise<{ id: string; role: string } | null>
}

export const createSimpleUserRepository = (
  prisma: PrismaClient,
): SimpleUserRepository => {
  return {
    findById: async (
      id: string,
    ): Promise<{ id: string; role: string } | null> => {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, role: true },
      })
      return user
    },
  }
}
