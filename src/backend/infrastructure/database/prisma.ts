import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient | undefined

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    })
  }
  return prisma
}

export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect()
    prisma = undefined
  }
}
