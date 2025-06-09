"use client"

import { Badge } from "@/components/shadcn/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import { Progress } from "@/components/shadcn/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs"
import { apiClient } from "@/lib/api"
import {
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalReports: 0,
    thisMonthReports: 0,
    averageCompletionTime: "-",
    completionRate: 0,
    weeklyTrend: [] as Array<{ day: string; count: number }>,
    recentProjects: [] as Array<{
      name: string
      reports: number
      percentage: number
    }>,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getPersonalStats()
      setStats(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "統計データの取得に失敗しました",
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">統計データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">個人統計</h1>
        <p className="text-muted-foreground">あなたの日報作成状況と統計情報</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総日報数</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">全期間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の日報</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthReports}</div>
            <p className="text-xs text-muted-foreground">2024年6月</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均作成時間</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageCompletionTime}
            </div>
            <p className="text-xs text-muted-foreground">過去30日間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">提出率</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">週次レポート</TabsTrigger>
          <TabsTrigger value="projects">プロジェクト別</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>今週の日報提出状況</CardTitle>
              <CardDescription>曜日別の日報提出数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.weeklyTrend.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium">{day.day}</span>
                    <div className="flex-1">
                      <Progress value={day.count * 20} className="h-2" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {day.count}件
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>プロジェクト別日報統計</CardTitle>
              <CardDescription>
                過去30日間のプロジェクト別日報数
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentProjects.map((project) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{project.name}</span>
                        <Badge variant="secondary">{project.reports}件</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {project.percentage}%
                      </span>
                    </div>
                    <Progress value={project.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
