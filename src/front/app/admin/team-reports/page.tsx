"use client"

import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import { Calendar } from "@/components/shadcn/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu"
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
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  MoreVerticalIcon,
  SearchIcon,
} from "lucide-react"
import { useState } from "react"

interface TeamReport {
  id: string
  date: string
  author: {
    id: string
    name: string
    department: string
  }
  status: "draft" | "submitted" | "approved" | "rejected"
  totalHours: number
  taskCount: number
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
}

export default function TeamReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // TODO: Replace with actual data from API
  const mockReports: TeamReport[] = [
    {
      id: "1",
      date: "2024-06-09",
      author: { id: "1", name: "田中太郎", department: "開発部" },
      status: "approved",
      totalHours: 8,
      taskCount: 5,
      submittedAt: "2024-06-09T18:00:00",
      approvedAt: "2024-06-09T19:30:00",
      approvedBy: "山田課長",
    },
    {
      id: "2",
      date: "2024-06-09",
      author: { id: "2", name: "佐藤花子", department: "営業部" },
      status: "submitted",
      totalHours: 7.5,
      taskCount: 4,
      submittedAt: "2024-06-09T17:45:00",
    },
    {
      id: "3",
      date: "2024-06-09",
      author: { id: "3", name: "鈴木一郎", department: "開発部" },
      status: "rejected",
      totalHours: 6,
      taskCount: 3,
      submittedAt: "2024-06-09T17:30:00",
      approvedAt: "2024-06-09T18:00:00",
      approvedBy: "山田課長",
    },
    {
      id: "4",
      date: "2024-06-08",
      author: { id: "4", name: "高橋美咲", department: "総務部" },
      status: "approved",
      totalHours: 8,
      taskCount: 6,
      submittedAt: "2024-06-08T18:15:00",
      approvedAt: "2024-06-08T19:00:00",
      approvedBy: "佐々木部長",
    },
    {
      id: "5",
      date: "2024-06-08",
      author: { id: "5", name: "山田健", department: "開発部" },
      status: "draft",
      totalHours: 5,
      taskCount: 2,
    },
  ]

  const getStatusBadge = (status: TeamReport["status"]) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">下書き</Badge>
      case "submitted":
        return <Badge variant="default">提出済み</Badge>
      case "approved":
        return <Badge variant="success">承認済み</Badge>
      case "rejected":
        return <Badge variant="destructive">差し戻し</Badge>
    }
  }

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log("Exporting reports...")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">チーム日報一覧</h1>
        <p className="text-muted-foreground">
          チーム全体の日報を確認・管理できます
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="メンバー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="部署" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部署</SelectItem>
                <SelectItem value="dev">開発部</SelectItem>
                <SelectItem value="sales">営業部</SelectItem>
                <SelectItem value="admin">総務部</SelectItem>
                <SelectItem value="hr">人事部</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="submitted">提出済み</SelectItem>
                <SelectItem value="approved">承認済み</SelectItem>
                <SelectItem value="rejected">差し戻し</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy/MM/dd", { locale: ja })} -{" "}
                        {format(dateRange.to, "yyyy/MM/dd", { locale: ja })}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy/MM/dd", { locale: ja })
                    )
                  ) : (
                    "期間を選択"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) =>
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    })
                  }
                  locale={ja}
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleExport} variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              CSV出力
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>日報一覧</CardTitle>
          <CardDescription>
            {mockReports.length}件の日報が見つかりました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>メンバー</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-center">作業時間</TableHead>
                <TableHead className="text-center">タスク数</TableHead>
                <TableHead>提出日時</TableHead>
                <TableHead>承認者</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {format(new Date(report.date), "MM/dd (E)", { locale: ja })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {report.author.name}
                  </TableCell>
                  <TableCell>{report.author.department}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-center">
                    {report.totalHours}時間
                  </TableCell>
                  <TableCell className="text-center">
                    {report.taskCount}
                  </TableCell>
                  <TableCell>
                    {report.submittedAt
                      ? format(new Date(report.submittedAt), "HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>{report.approvedBy || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          詳細を見る
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FilterIcon className="mr-2 h-4 w-4" />
                          この人の日報のみ表示
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
