import type {
  PersonalStats,
  StatisticsRepository,
  TeamStats,
} from "../../infrastructure/repositories/statistics-repository"

export interface StatisticsService {
  getPersonalStats: (userId: string) => Promise<PersonalStats>
  getTeamStats: () => Promise<TeamStats>
}

export const createStatisticsService = (
  statisticsRepo: StatisticsRepository,
): StatisticsService => ({
  getPersonalStats: async (userId: string): Promise<PersonalStats> => {
    if (!userId) {
      throw new Error("User ID is required")
    }

    return statisticsRepo.getPersonalStats(userId)
  },

  getTeamStats: async (): Promise<TeamStats> => {
    return statisticsRepo.getTeamStats()
  },
})
