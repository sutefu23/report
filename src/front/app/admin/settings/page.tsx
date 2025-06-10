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
import { Textarea } from "@/components/shadcn/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  BellIcon,
  BuildingIcon,
  ClockIcon,
  DatabaseIcon,
  KeyIcon,
  MailIcon,
  ServerIcon,
  ShieldIcon,
} from "lucide-react"
import { useState } from "react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement API call
    setTimeout(() => {
      toast({
        title: "設定を保存しました",
        description: "一般設定が正常に更新されました。",
      })
      setLoading(false)
    }, 1000)
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement API call
    setTimeout(() => {
      toast({
        title: "通知設定を保存しました",
        description: "通知設定が正常に更新されました。",
      })
      setLoading(false)
    }, 1000)
  }

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implement API call
    setTimeout(() => {
      toast({
        title: "セキュリティ設定を保存しました",
        description: "セキュリティ設定が正常に更新されました。",
      })
      setLoading(false)
    }, 1000)
  }

  const handleBackup = async () => {
    setLoading(true)

    // TODO: Implement backup
    setTimeout(() => {
      toast({
        title: "バックアップを開始しました",
        description: "バックアップ処理をバックグラウンドで実行しています。",
      })
      setLoading(false)
    }, 1500)
  }

  const handleTestEmail = async () => {
    // TODO: Implement test email
    toast({
      title: "テストメールを送信しました",
      description: "設定されたメールアドレスにテストメールを送信しました。",
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">システム設定</h1>
        <p className="text-muted-foreground">システム全体の設定を管理します</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            一般
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <BellIcon className="h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldIcon className="h-4 w-4" />
            セキュリティ
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <ServerIcon className="h-4 w-4" />
            メンテナンス
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>組織情報</CardTitle>
              <CardDescription>組織の基本情報を設定します</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">組織名</Label>
                  <Input
                    id="org-name"
                    defaultValue="株式会社サンプル"
                    placeholder="組織名を入力"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-url">組織URL</Label>
                  <Input
                    id="org-url"
                    type="url"
                    defaultValue="https://example.com"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-email">サポートメール</Label>
                  <Input
                    id="support-email"
                    type="email"
                    defaultValue="support@example.com"
                    placeholder="support@example.com"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "保存中..." : "設定を保存"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>業務時間設定</CardTitle>
              <CardDescription>標準的な業務時間を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="work-start">始業時刻</Label>
                  <Input id="work-start" type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-end">終業時刻</Label>
                  <Input id="work-end" type="time" defaultValue="18:00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">タイムゾーン</Label>
                <Select defaultValue="asia-tokyo">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia-tokyo">Asia/Tokyo (JST)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="america-newyork">
                      America/New_York (EST)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>メール設定</CardTitle>
              <CardDescription>
                システムメールの送信設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTPホスト</Label>
                  <Input
                    id="smtp-host"
                    defaultValue="smtp.gmail.com"
                    placeholder="smtp.example.com"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTPポート</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      defaultValue="587"
                      placeholder="587"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-encryption">暗号化</Label>
                    <Select defaultValue="tls">
                      <SelectTrigger id="smtp-encryption">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">なし</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTPユーザー名</Label>
                  <Input
                    id="smtp-username"
                    defaultValue="noreply@example.com"
                    placeholder="username@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTPパスワード</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="SMTPパスワードを入力"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-email">送信元メールアドレス</Label>
                  <Input
                    id="from-email"
                    type="email"
                    defaultValue="noreply@example.com"
                    placeholder="noreply@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-name">送信者名</Label>
                  <Input
                    id="from-name"
                    defaultValue="日報管理システム"
                    placeholder="システム名"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "保存中..." : "設定を保存"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestEmail}
                  >
                    <MailIcon className="mr-2 h-4 w-4" />
                    テストメール送信
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>通知タイミング</CardTitle>
              <CardDescription>
                自動通知のタイミングを設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-time">日報提出リマインダー</Label>
                <Input id="reminder-time" type="time" defaultValue="17:00" />
                <p className="text-sm text-muted-foreground">
                  未提出の場合にリマインダーを送信する時刻
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary-time">日次サマリー送信時刻</Label>
                <Input id="summary-time" type="time" defaultValue="20:00" />
                <p className="text-sm text-muted-foreground">
                  管理者に日次サマリーを送信する時刻
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>パスワードポリシー</CardTitle>
              <CardDescription>
                ユーザーパスワードの要件を設定します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min-length">最小文字数</Label>
                  <Input
                    id="min-length"
                    type="number"
                    defaultValue="8"
                    min="6"
                    max="32"
                  />
                </div>

                <div className="space-y-3">
                  <Label>必須要件</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">大文字を含む</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">小文字を含む</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">数字を含む</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">特殊文字を含む</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-expiry">
                    パスワード有効期限（日）
                  </Label>
                  <Input
                    id="password-expiry"
                    type="number"
                    defaultValue="90"
                    min="0"
                    placeholder="0 = 無期限"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "保存中..." : "設定を保存"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>セッション設定</CardTitle>
              <CardDescription>
                ログインセッションの設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">
                  セッションタイムアウト（分）
                </Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="30"
                  min="5"
                  max="1440"
                />
                <p className="text-sm text-muted-foreground">
                  非アクティブ時に自動ログアウトされるまでの時間
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-sessions">最大同時セッション数</Label>
                <Input
                  id="max-sessions"
                  type="number"
                  defaultValue="3"
                  min="1"
                  max="10"
                />
                <p className="text-sm text-muted-foreground">
                  1ユーザーあたりの同時ログイン可能数
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>データベース管理</CardTitle>
              <CardDescription>データベースのメンテナンス機能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5" />
                  <span className="font-medium">データベース情報</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>タイプ: PostgreSQL 14.5</p>
                  <p>サイズ: 256 MB</p>
                  <p>接続数: 12 / 100</p>
                  <p>最終バックアップ: 2024-06-09 03:00</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBackup} disabled={loading}>
                  <DatabaseIcon className="mr-2 h-4 w-4" />
                  今すぐバックアップ
                </Button>
                <Button variant="outline">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  バックアップスケジュール
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>システムログ</CardTitle>
              <CardDescription>システムログの設定と管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="log-level">ログレベル</Label>
                <Select defaultValue="info">
                  <SelectTrigger id="log-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="log-retention">ログ保持期間（日）</Label>
                <Input
                  id="log-retention"
                  type="number"
                  defaultValue="30"
                  min="7"
                  max="365"
                />
              </div>

              <Button variant="outline">
                <ServerIcon className="mr-2 h-4 w-4" />
                ログをダウンロード
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>APIキー管理</CardTitle>
              <CardDescription>外部連携用のAPIキーを管理します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slack-token">Slack Bot Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="slack-token"
                    type="password"
                    placeholder="xoxb-..."
                    defaultValue="xoxb-**********"
                  />
                  <Button variant="outline" size="icon">
                    <KeyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack-channel">通知チャンネルID</Label>
                <Input
                  id="slack-channel"
                  placeholder="C1234567890"
                  defaultValue="C1234567890"
                />
              </div>

              <Button variant="outline">Slack連携をテスト</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
