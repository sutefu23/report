"use client"

import { Avatar, AvatarFallback } from "@/components/shadcn/ui/avatar"
import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs"
import { Textarea } from "@/components/shadcn/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  XCircleIcon,
} from "lucide-react"
import { useState } from "react"

interface PendingReport {
  id: string
  date: string
  author: {
    id: string
    name: string
    department: string
    avatar?: string
  }
  submittedAt: string
  totalHours: number
  tasks: Array<{
    id: string
    projectName: string
    description: string
    hoursSpent: number
  }>
  challenges?: string
  nextDayPlan?: string
  memo?: string
}

export default function PendingReportsPage() {
  const { toast } = useToast()
  const [selectedReport, setSelectedReport] = useState<PendingReport | null>(
    null,
  )
  const [feedback, setFeedback] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  // TODO: Replace with actual data from API
  const mockPendingReports: PendingReport[] = [
    {
      id: "1",
      date: "2024-06-09",
      author: {
        id: "2",
        name: "佐藤花子",
        department: "営業部",
      },
      submittedAt: "2024-06-09T17:45:00",
      totalHours: 7.5,
      tasks: [
        {
          id: "1",
          projectName: "新規顧客開拓",
          description: "A社への提案資料作成",
          hoursSpent: 3,
        },
        {
          id: "2",
          projectName: "既存顧客フォロー",
          description: "B社との定例MTG",
          hoursSpent: 2,
        },
        {
          id: "3",
          projectName: "社内会議",
          description: "営業戦略会議",
          hoursSpent: 2.5,
        },
      ],
      challenges: "A社の要件が複雑で、提案内容の調整に時間がかかった",
      nextDayPlan: "A社への提案書を完成させ、レビューを依頼する",
    },
    {
      id: "2",
      date: "2024-06-09",
      author: {
        id: "5",
        name: "山田健",
        department: "開発部",
      },
      submittedAt: "2024-06-09T18:30:00",
      totalHours: 8,
      tasks: [
        {
          id: "1",
          projectName: "プロジェクトX",
          description: "ユーザー認証機能の実装",
          hoursSpent: 5,
        },
        {
          id: "2",
          projectName: "プロジェクトX",
          description: "単体テストの作成",
          hoursSpent: 2,
        },
        {
          id: "3",
          projectName: "社内活動",
          description: "コードレビュー",
          hoursSpent: 1,
        },
      ],
      challenges: "認証ライブラリの仕様理解に時間がかかった",
      nextDayPlan: "認証機能の結合テストを実施",
      memo: "明日のデプロイに向けて準備完了",
    },
  ]

  const handleApprove = async (report: PendingReport) => {
    // TODO: Implement API call
    toast({
      title: "日報を承認しました",
      description: `${report.author.name}さんの${format(
        new Date(report.date),
        "M月d日",
        { locale: ja },
      )}の日報を承認しました。`,
    })
  }

  const handleReject = async () => {
    if (!selectedReport || !feedback.trim()) {
      toast({
        title: "エラー",
        description: "フィードバックを入力してください。",
        variant: "destructive",
      })
      return
    }

    // TODO: Implement API call
    toast({
      title: "日報を差し戻しました",
      description: `${selectedReport.author.name}さんの日報を差し戻しました。`,
    })
    setIsRejectDialogOpen(false)
    setFeedback("")
    setSelectedReport(null)
  }

  const ReportCard = ({ report }: { report: PendingReport }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{report.author.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{report.author.name}</h3>
              <p className="text-sm text-muted-foreground">
                {report.author.department}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {format(new Date(report.date), "M月d日 (E)", { locale: ja })}
            </p>
            <p className="text-xs text-muted-foreground">
              提出: {format(new Date(report.submittedAt), "HH:mm")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">作業時間: {report.totalHours}時間</span>
          </div>
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">タスク: {report.tasks.length}件</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">主な作業内容</h4>
          <ul className="space-y-1">
            {report.tasks.slice(0, 2).map((task) => (
              <li key={task.id} className="text-sm text-muted-foreground">
                • {task.projectName}: {task.description} ({task.hoursSpent}h)
              </li>
            ))}
            {report.tasks.length > 2 && (
              <li className="text-sm text-muted-foreground">
                他{report.tasks.length - 2}件
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={() => handleApprove(report)}>
            <CheckCircleIcon className="mr-2 h-4 w-4" />
            承認
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedReport(report)
              setIsRejectDialogOpen(true)
            }}
          >
            <XCircleIcon className="mr-2 h-4 w-4" />
            差し戻し
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">承認待ち日報</h1>
        <p className="text-muted-foreground">
          チームメンバーの日報を確認・承認します
        </p>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <Badge variant="outline" className="text-lg px-3 py-1">
          <ClockIcon className="mr-2 h-4 w-4" />
          {mockPendingReports.length}件の承認待ち
        </Badge>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">承認待ち</TabsTrigger>
          <TabsTrigger value="recent">最近の承認履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {mockPendingReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  承認待ちの日報はありません
                </p>
                <p className="text-sm text-muted-foreground">
                  すべての日報が処理されています
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {mockPendingReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近の承認履歴</CardTitle>
              <CardDescription>過去7日間の承認・差し戻し履歴</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">承認</Badge>
                    <div>
                      <p className="font-medium">田中太郎</p>
                      <p className="text-sm text-muted-foreground">
                        6月8日の日報
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">1時間前</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">差し戻し</Badge>
                    <div>
                      <p className="font-medium">鈴木一郎</p>
                      <p className="text-sm text-muted-foreground">
                        6月7日の日報
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">3時間前</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">承認</Badge>
                    <div>
                      <p className="font-medium">高橋美咲</p>
                      <p className="text-sm text-muted-foreground">
                        6月7日の日報
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">昨日</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日報の差し戻し</DialogTitle>
            <DialogDescription>
              {selectedReport?.author.name}さんの
              {selectedReport &&
                format(new Date(selectedReport.date), "M月d日", { locale: ja })}
              の日報を差し戻します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm font-medium">
                フィードバック（必須）
              </label>
              <Textarea
                id="feedback"
                placeholder="修正が必要な点を具体的に記載してください..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setFeedback("")
              }}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              差し戻す
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
