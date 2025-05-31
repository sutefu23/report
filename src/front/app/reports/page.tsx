"use client"

import MainLayout from "@/components/layout/main-layout"
import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import { Calendar } from "@/components/shadcn/ui/calendar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import { Input } from "@/components/shadcn/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover"
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
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  CalendarIcon,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data - TODO: Replace with API calls
const mockReports = [
  {
    id: "1",
    date: "2024-01-15",
    status: "承認済み",
    workHours: 8,
    projects: ["Webサイトリニューアル", "データベース最適化"],
    submittedAt: "2024-01-15T18:00:00",
  },
  {
    id: "2",
    date: "2024-01-14",
    status: "提出済み",
    workHours: 7.5,
    projects: ["モバイルアプリ開発"],
    submittedAt: "2024-01-14T17:30:00",
  },
  {
    id: "3",
    date: "2024-01-13",
    status: "承認済み",
    workHours: 8,
    projects: ["Webサイトリニューアル"],
    submittedAt: "2024-01-13T18:15:00",
  },
  {
    id: "4",
    date: "2024-01-12",
    status: "差し戻し",
    workHours: 6,
    projects: ["セキュリティ監査"],
    submittedAt: "2024-01-12T17:00:00",
  },
  {
    id: "5",
    date: "2024-01-11",
    status: "下書き",
    workHours: 4,
    projects: ["データベース最適化"],
    submittedAt: null,
  },
]

const projects = [
  "Webサイトリニューアル",
  "モバイルアプリ開発",
  "データベース最適化",
  "セキュリティ監査",
]

const statusOptions = [
  { value: "all", label: "全て" },
  { value: "draft", label: "下書き" },
  { value: "submitted", label: "提出済み" },
  { value: "approved", label: "承認済み" },
  { value: "rejected", label: "差し戻し" },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      下書き: "secondary",
      提出済み: "default",
      承認済み: "default",
      差し戻し: "destructive",
    } as const

    const colors = {
      下書き: "bg-gray-100 text-gray-800",
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

  const filteredReports = mockReports.filter((report) => {
    // Search filter
    if (
      searchTerm &&
      !report.projects.some((p) =>
        p.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    ) {
      return false
    }

    // Status filter
    if (statusFilter !== "all") {
      const statusMap = {
        draft: "下書き",
        submitted: "提出済み",
        approved: "承認済み",
        rejected: "差し戻し",
      } as const
      if (report.status !== statusMap[statusFilter as keyof typeof statusMap]) {
        return false
      }
    }

    // Project filter
    if (projectFilter !== "all" && !report.projects.includes(projectFilter)) {
      return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const reportDate = new Date(report.date)
      if (dateRange.from && reportDate < dateRange.from) return false
      if (dateRange.to && reportDate > dateRange.to) return false
    }

    return true
  })

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implement actual export functionality
    console.log(`Exporting as ${format}`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">日報履歴</h1>
            <p className="text-muted-foreground">
              これまでに作成した日報の一覧です
            </p>
          </div>
          <Button asChild>
            <Link href="/reports/create">
              <Plus className="mr-2 h-4 w-4" />
              新しい日報作成
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              フィルター・検索
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <label htmlFor="search-input" className="text-sm font-medium">
                  フリーワード検索
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    placeholder="プロジェクト名で検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label htmlFor="status-filter" className="text-sm font-medium">
                  ステータス
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <label htmlFor="project-filter" className="text-sm font-medium">
                  プロジェクト
                </label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全プロジェクト</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project} value={project}>
                        {project}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label htmlFor="date-range" className="text-sm font-medium">
                  期間
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "yyyy/MM/dd", {
                              locale: ja,
                            })}{" "}
                            -{" "}
                            {format(dateRange.to, "yyyy/MM/dd", { locale: ja })}
                          </>
                        ) : (
                          format(dateRange.from, "yyyy/MM/dd", { locale: ja })
                        )
                      ) : (
                        <span>期間を選択</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) =>
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setProjectFilter("all")
                  setDateRange({ from: undefined, to: undefined })
                }}
              >
                フィルターをクリア
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleExport("csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV出力
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF出力
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>日報一覧 ({filteredReports.length}件)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作業時間</TableHead>
                  <TableHead>プロジェクト</TableHead>
                  <TableHead>提出日時</TableHead>
                  <TableHead className="text-right">アクション</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {format(new Date(report.date), "yyyy年MM月dd日", {
                        locale: ja,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{report.workHours}時間</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {report.projects.map((project) => (
                          <Badge
                            key={project}
                            variant="outline"
                            className="text-xs"
                          >
                            {project}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.submittedAt
                        ? format(new Date(report.submittedAt), "MM/dd HH:mm", {
                            locale: ja,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/reports/${report.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(report.status === "下書き" ||
                          report.status === "差し戻し") && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/reports/edit/${report.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredReports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  条件に一致する日報が見つかりませんでした
                </p>
                <Button asChild className="mt-4">
                  <Link href="/reports/create">
                    <Plus className="mr-2 h-4 w-4" />
                    最初の日報を作成
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
