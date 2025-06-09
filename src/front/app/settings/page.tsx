"use client"

import { Button } from "@/components/shadcn/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card"
import { Input } from "@/components/shadcn/ui/input"
import { Label } from "@/components/shadcn/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth"
import { BellIcon, KeyIcon, UserIcon } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement profile update API call
    setTimeout(() => {
      toast({
        title: "プロフィールを更新しました",
        description: "変更が正常に保存されました。",
      })
      setLoading(false)
    }, 1000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement password change API call
    setTimeout(() => {
      toast({
        title: "パスワードを変更しました",
        description: "新しいパスワードで次回からログインしてください。",
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-muted-foreground">
          アカウントと通知の設定を管理します
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            プロフィール
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyIcon className="h-4 w-4" />
            パスワード
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <BellIcon className="h-4 w-4" />
            通知設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>プロフィール情報</CardTitle>
              <CardDescription>あなたの基本情報を編集できます</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">氏名</Label>
                    <Input
                      id="name"
                      defaultValue={user?.name || ""}
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      placeholder="taro@example.com"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      メールアドレスは変更できません
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">部署</Label>
                  <Select defaultValue="dev">
                    <SelectTrigger id="department">
                      <SelectValue placeholder="部署を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dev">開発部</SelectItem>
                      <SelectItem value="sales">営業部</SelectItem>
                      <SelectItem value="admin">総務部</SelectItem>
                      <SelectItem value="hr">人事部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "更新中..." : "プロフィールを更新"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>パスワード変更</CardTitle>
              <CardDescription>
                セキュリティのため、定期的にパスワードを変更することをお勧めします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">現在のパスワード</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="現在のパスワードを入力"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">新しいパスワード</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="新しいパスワードを入力"
                  />
                  <p className="text-xs text-muted-foreground">
                    8文字以上で、大文字・小文字・数字を含めてください
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    新しいパスワード（確認）
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="新しいパスワードを再入力"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "変更中..." : "パスワードを変更"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                通知の受信方法と頻度を設定できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">メール通知</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">日報提出リマインダー</p>
                      <p className="text-sm text-muted-foreground">
                        毎日17:00に未提出の場合に通知
                      </p>
                    </div>
                    <Select defaultValue="enabled">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">有効</SelectItem>
                        <SelectItem value="disabled">無効</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">承認通知</p>
                      <p className="text-sm text-muted-foreground">
                        日報が承認または差し戻された時に通知
                      </p>
                    </div>
                    <Select defaultValue="enabled">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">有効</SelectItem>
                        <SelectItem value="disabled">無効</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">コメント通知</p>
                      <p className="text-sm text-muted-foreground">
                        日報にコメントが付いた時に通知
                      </p>
                    </div>
                    <Select defaultValue="enabled">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">有効</SelectItem>
                        <SelectItem value="disabled">無効</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Slack通知</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Slack連携</p>
                      <p className="text-sm text-muted-foreground">
                        Slackで通知を受け取る
                      </p>
                    </div>
                    <Select defaultValue="disabled">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">有効</SelectItem>
                        <SelectItem value="disabled">無効</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button>通知設定を保存</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
