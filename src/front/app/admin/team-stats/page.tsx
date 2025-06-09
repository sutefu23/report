"use client"

import { Avatar, AvatarFallback } from "@/components/shadcn/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs"
import { apiClient } from "@/lib/api"
import {
  ActivityIcon,
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function TeamStatsPage() {
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    activeToday: 0,
    reportCompletionRate: 0,
    averageResponseTime: "-",
    departmentStats: [] as Array<{
      name: string
      members: number
      completion: number
      reports: number
    }>,
    memberPerformance: [] as Array<{
      name: string
      department: string
      reports: number
      completion: number
      avgTime: string
    }>,
    weeklyTrend: {
      labels: [] as string[],
      submitted: [] as number[],
      onTime: [] as number[],
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamStats()
  }, [])

  const fetchTeamStats = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getTeamStats()
      setTeamStats(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "チーム統計データの取得に失敗しました",
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            チーム統計データを読み込み中...
          </p>
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
        <h1 className="text-3xl font-bold">チーム統計・レポート</h1>
        <p className="text-muted-foreground">組織全体の日報提出状況と分析</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Select defaultValue="all">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="部署を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部署</SelectItem>
            <SelectItem value="dev">開発部</SelectItem>
            <SelectItem value="sales">営業部</SelectItem>
            <SelectItem value="admin">総務部</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="month">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">今週</SelectItem>
            <SelectItem value="month">今月</SelectItem>
            <SelectItem value="quarter">四半期</SelectItem>
            <SelectItem value="year">今年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総メンバー数</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">全部署合計</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              本日アクティブ
            </CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeToday}</div>
            <p className="text-xs text-muted-foreground">日報提出済み</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">提出率</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamStats.reportCompletionRate}%
            </div>
            <Progress value={teamStats.reportCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均承認時間</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamStats.averageResponseTime}
            </div>
            <p className="text-xs text-muted-foreground">過去7日間</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">部署別統計</TabsTrigger>
          <TabsTrigger value="members">メンバー別実績</TabsTrigger>
          <TabsTrigger value="trends">推移グラフ</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>部署別パフォーマンス</CardTitle>
              <CardDescription>各部署の日報提出状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamStats.departmentStats.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-lg">{dept.name}</span>
                        <Badge variant="outline">{dept.members}名</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          提出率: {dept.completion}%
                        </span>
                        <span className="text-muted-foreground">
                          日報数: {dept.reports}
                        </span>
                      </div>
                    </div>
                    <Progress value={dept.completion} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>メンバー別実績（上位5名）</CardTitle>
              <CardDescription>今月の日報提出実績</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メンバー</TableHead>
                    <TableHead>部署</TableHead>
                    <TableHead className="text-center">日報数</TableHead>
                    <TableHead className="text-center">提出率</TableHead>
                    <TableHead className="text-center">平均作成時間</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamStats.memberPerformance.map((member, index) => (
                    <TableRow key={member.name}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell className="text-center">
                        {member.reports}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            member.completion >= 90 ? "success" : "secondary"
                          }
                        >
                          {member.completion}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {member.avgTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>週次提出率推移</CardTitle>
              <CardDescription>今週の日報提出状況の推移</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-8 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm">提出済み</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">定時提出</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {teamStats.weeklyTrend.labels.map((day, index) => (
                    <div key={day} className="flex items-center gap-4">
                      <span className="w-8 text-sm font-medium">{day}</span>
                      <div className="flex-1 flex gap-2">
                        <div className="flex-1 relative">
                          <Progress
                            value={teamStats.weeklyTrend.submitted[index]}
                            className="h-6"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {teamStats.weeklyTrend.submitted[index]}%
                          </span>
                        </div>
                        <div className="flex-1 relative">
                          <Progress
                            value={teamStats.weeklyTrend.onTime[index]}
                            className="h-6 [&>div]:bg-green-500"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {teamStats.weeklyTrend.onTime[index]}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
