"use client"

import MainLayout from "@/components/layout/main-layout"
import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import { useAuthStore } from "@/stores/auth"
import { Calendar, Clock, FileText, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"

  // Mock data - TODO: Replace with actual API calls
  const todayReportStatus = "未提出" // 提出済み, 承認済み, 差し戻し
  const recentReports = [
    { id: "1", date: "2024-01-15", status: "承認済み", workHours: 8 },
    { id: "2", date: "2024-01-14", status: "提出済み", workHours: 7.5 },
    { id: "3", date: "2024-01-13", status: "承認済み", workHours: 8 },
  ]
  const monthlyStats = { totalHours: 160, averageHours: 8, reportCount: 20 }
  const pendingCount = 5

  const getStatusBadge = (status: string) => {
    const variants = {
      未提出: "secondary",
      提出済み: "default",
      承認済み: "default",
      差し戻し: "destructive",
    } as const

    const colors = {
      未提出: "bg-gray-100 text-gray-800",
      提出済み: "bg-blue-100 text-blue-800",
      承認済み: "bg-green-100 text-green-800",
      差し戻し: "bg-red-100 text-red-800",
    } as const

    return (
      <Badge
        variant={variants[status as keyof typeof variants]}
        className={colors[status as keyof typeof colors]}
      >
        {status}
      </Badge>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              おかえりなさい、{user?.name}さん
            </h1>
            <p className="text-muted-foreground">
              今日も一日お疲れさまでした。日報の状況を確認しましょう。
            </p>
          </div>
          <Button asChild>
            <Link href="/reports/create">
              <Plus className="mr-2 h-4 w-4" />
              今日の日報作成
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Today's Report Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日の日報</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getStatusBadge(todayReportStatus)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {todayReportStatus === "未提出"
                  ? "まだ提出されていません"
                  : "提出済みです"}
              </p>
            </CardContent>
          </Card>

          {/* This Month Work Hours */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                今月の作業時間
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyStats.totalHours}時間
              </div>
              <p className="text-xs text-muted-foreground">
                平均 {monthlyStats.averageHours}時間/日
              </p>
            </CardContent>
          </Card>

          {/* Report Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                今月の日報数
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyStats.reportCount}件
              </div>
              <p className="text-xs text-muted-foreground">先月比 +12%</p>
            </CardContent>
          </Card>

          {/* Admin: Pending Approvals */}
          {isAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">承認待ち</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {pendingCount}件
                </div>
                <p className="text-xs text-muted-foreground">確認が必要です</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近の日報</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/reports">全て見る</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{report.date}</p>
                      <p className="text-sm text-muted-foreground">
                        作業時間: {report.workHours}時間
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reports/${report.id}`}>詳細</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href="/reports/create">
                  <Plus className="mr-2 h-4 w-4" />
                  新しい日報を作成
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  日報履歴を確認
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/stats">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  個人統計を確認
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>管理者アクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/admin/pending">
                    承認待ち日報を確認 ({pendingCount})
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/team-reports">チーム日報を確認</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/team-stats">チーム統計を確認</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
