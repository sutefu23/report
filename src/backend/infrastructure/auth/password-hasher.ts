import bcrypt from "bcryptjs"
import type { PasswordHasher } from "../../domain/workflows"

export const createPasswordHasher = (): PasswordHasher => ({
  hash: async (password: string): Promise<string> => {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  },

  verify: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash)
  },
})
