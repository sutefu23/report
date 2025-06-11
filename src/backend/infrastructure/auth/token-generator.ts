import jwt from "jsonwebtoken"
import type { AuthToken } from "../../domain/types"
import type { TokenGenerator } from "../../domain/workflows"

export const createTokenGenerator = (jwtSecret: string): TokenGenerator => ({
  generate: (userId: string, role: string): AuthToken => {
    const expiresIn = 60 * 60 * 24 * 7 // 7 days in seconds

    const accessToken = jwt.sign({ userId, role }, jwtSecret, {
      expiresIn: "7d",
    })

    const refreshToken = jwt.sign(
      { userId, role, type: "refresh" },
      jwtSecret,
      { expiresIn: "30d" },
    )

    return {
      accessToken,
      refreshToken,
      expiresIn,
    }
  },
})
