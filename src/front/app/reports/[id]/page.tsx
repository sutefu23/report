"use client"

import MainLayout from "@/components/layout/main-layout"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar"
import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import {
  Card,
  CardContent,
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
  DialogTrigger,
} from "@/components/shadcn/ui/dialog"
import { Textarea } from "@/components/shadcn/ui/textarea"
import { useAuthStore } from "@/stores/auth"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  MessageSquare,
  Send,
  Trash2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

// Mock data - TODO: Replace with API calls
const mockReport = {
  id: "1",
  date: "2024-01-15",
  status: "提出済み",
  author: {
    id: "user1",
    name: "山田太郎",
    email: "yamada@example.com",
    avatar: null,
  },
  tasks: [
    {
      id: "1",
      projectId: "1",
      projectName: "Webサイトリニューアル",
      description:
        "トップページのデザイン実装とレスポンシブ対応を行いました。モバイル版でのレイアウト調整に時間がかかりましたが、予定通り完了しています。",
      hoursSpent: 6,
      progress: 85,
    },
    {
      id: "2",
      projectId: "2",
      projectName: "データベース最適化",
      description:
        "クエリの最適化を実施し、応答時間を30%改善しました。インデックスの追加により大幅な性能向上が見られました。",
      hoursSpent: 2,
      progress: 100,
    },
  ],
  challenges:
    "モバイル版のレイアウト調整でCSSの競合が発生し、解決に予想以上の時間がかかりました。今後は事前にモバイルファーストで設計を進める必要があります。",
  nextDayPlan:
    "Webサイトリニューアルの残りのページの実装を進めます。特に問い合わせフォームとニュース一覧ページの作成を予定しています。",
  memo: "新しいCSSフレームワークの導入を検討中です。チームで相談したいと思います。",
  submittedAt: "2024-01-15T18:00:00",
  createdAt: "2024-01-15T17:30:00",
  updatedAt: "2024-01-15T17:45:00",
  comments: [
    {
      id: "1",
      author: {
        id: "manager1",
        name: "佐藤部長",
        role: "manager",
        avatar: null,
      },
      content:
        "お疲れさまです。モバイル対応での課題、よく分かりました。次回のミーティングでCSSフレームワークについて議論しましょう。",
      createdAt: "2024-01-16T09:00:00",
    },
  ],
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [newComment, setNewComment] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const isAuthor = user?.id === mockReport.author.id
  const isManager = user?.role === "admin"
  const canEdit =
    isAuthor &&
    (mockReport.status === "下書き" || mockReport.status === "差し戻し")
  const canApprove = isManager && mockReport.status === "提出済み"

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

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      // TODO: API call to add comment
      console.log("Adding comment:", newComment)
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to approve report
      console.log("Approving report with feedback:", feedback)
      router.push("/admin/pending")
    } catch (error) {
      console.error("Failed to approve report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert("差し戻し理由を入力してください")
      return
    }

    setIsLoading(true)
    try {
      // TODO: API call to reject report
      console.log("Rejecting report with feedback:", feedback)
      router.push("/admin/pending")
    } catch (error) {
      console.error("Failed to reject report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      // TODO: API call to delete report
      console.log("Deleting report")
      router.push("/reports")
    } catch (error) {
      console.error("Failed to delete report:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalHours = mockReport.tasks.reduce(
    (sum, task) => sum + task.hoursSpent,
    0,
  )

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {format(new Date(mockReport.date), "yyyy年MM月dd日", {
                  locale: ja,
                })}
                の日報
              </h1>
              <p className="text-muted-foreground">
                作成者: {mockReport.author.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(mockReport.status)}
            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={`/reports/edit/${params.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Report Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>基本情報</CardTitle>
              <Badge variant="outline">合計: {totalHours}時間</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">作成日時:</span>
                <span>
                  {format(new Date(mockReport.createdAt), "yyyy/MM/dd HH:mm", {
                    locale: ja,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">更新日時:</span>
                <span>
                  {format(new Date(mockReport.updatedAt), "yyyy/MM/dd HH:mm", {
                    locale: ja,
                  })}
                </span>
              </div>
              {mockReport.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">提出日時:</span>
                  <span>
                    {format(
                      new Date(mockReport.submittedAt),
                      "yyyy/MM/dd HH:mm",
                      { locale: ja },
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>作業記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mockReport.tasks.map((task, index) => (
              <div key={task.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    作業 {index + 1}: {task.projectName}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{task.hoursSpent}時間</Badge>
                    <Badge variant="outline">{task.progress}%</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(mockReport.challenges ||
          mockReport.nextDayPlan ||
          mockReport.memo) && (
          <Card>
            <CardHeader>
              <CardTitle>その他の情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockReport.challenges && (
                <div>
                  <h4 className="font-medium mb-2">課題・困ったこと</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mockReport.challenges}
                  </p>
                </div>
              )}
              {mockReport.nextDayPlan && (
                <div>
                  <h4 className="font-medium mb-2">明日の予定</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mockReport.nextDayPlan}
                  </p>
                </div>
              )}
              {mockReport.memo && (
                <div>
                  <h4 className="font-medium mb-2">メモ</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mockReport.memo}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manager Actions */}
        {canApprove && (
          <Card>
            <CardHeader>
              <CardTitle>承認・差し戻し</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="feedback-textarea"
                  className="text-sm font-medium mb-2 block"
                >
                  フィードバック（任意）
                </label>
                <Textarea
                  id="feedback-textarea"
                  placeholder="承認時のコメントや差し戻し理由を入力してください"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleApprove} disabled={isLoading}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  承認
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  差し戻し
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              コメント ({mockReport.comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Comments */}
            {mockReport.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex space-x-3 p-4 bg-muted rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.author.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {comment.author.role === "manager" ? "管理者" : "一般"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "MM/dd HH:mm", {
                        locale: ja,
                      })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="space-y-3">
              <label htmlFor="comment-textarea" className="text-sm font-medium">
                新しいコメント
              </label>
              <Textarea
                id="comment-textarea"
                placeholder="コメントを入力してください"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isLoading}
              >
                <Send className="mr-2 h-4 w-4" />
                コメント投稿
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Action (for draft reports) */}
        {canEdit && mockReport.status === "下書き" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">危険な操作</h4>
                  <p className="text-sm text-muted-foreground">
                    この操作は取り消せません。注意して実行してください。
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      削除
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>日報を削除しますか？</DialogTitle>
                      <DialogDescription>
                        この操作は取り消せません。本当に削除してもよろしいですか？
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">キャンセル</Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        削除
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
