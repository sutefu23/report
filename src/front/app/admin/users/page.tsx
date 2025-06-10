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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  EditIcon,
  KeyIcon,
  MailIcon,
  MoreVerticalIcon,
  SearchIcon,
  ShieldIcon,
  UserCheckIcon,
  UserPlusIcon,
  UserXIcon,
} from "lucide-react"
import { useState } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "manager" | "admin"
  department: string
  status: "active" | "inactive"
  createdAt: string
  lastLoginAt?: string
}

export default function UsersManagementPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form state for new/edit user
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    department: "dev",
    password: "",
  })

  // TODO: Replace with actual data from API
  const mockUsers: User[] = [
    {
      id: "1",
      name: "田中太郎",
      email: "tanaka@example.com",
      role: "manager",
      department: "開発部",
      status: "active",
      createdAt: "2024-01-15",
      lastLoginAt: "2024-06-09T10:30:00",
    },
    {
      id: "2",
      name: "佐藤花子",
      email: "sato@example.com",
      role: "user",
      department: "営業部",
      status: "active",
      createdAt: "2024-02-20",
      lastLoginAt: "2024-06-09T09:15:00",
    },
    {
      id: "3",
      name: "鈴木一郎",
      email: "suzuki@example.com",
      role: "user",
      department: "開発部",
      status: "active",
      createdAt: "2024-03-10",
      lastLoginAt: "2024-06-08T18:45:00",
    },
    {
      id: "4",
      name: "高橋美咲",
      email: "takahashi@example.com",
      role: "admin",
      department: "総務部",
      status: "active",
      createdAt: "2023-12-01",
      lastLoginAt: "2024-06-09T11:00:00",
    },
    {
      id: "5",
      name: "山田健",
      email: "yamada@example.com",
      role: "user",
      department: "開発部",
      status: "inactive",
      createdAt: "2024-01-20",
      lastLoginAt: "2024-05-15T17:30:00",
    },
  ]

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive">
            <ShieldIcon className="mr-1 h-3 w-3" />
            管理者
          </Badge>
        )
      case "manager":
        return (
          <Badge variant="default">
            <UserCheckIcon className="mr-1 h-3 w-3" />
            マネージャー
          </Badge>
        )
      case "user":
        return (
          <Badge variant="secondary">
            <UserCheckIcon className="mr-1 h-3 w-3" />
            一般
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: User["status"]) => {
    return status === "active" ? (
      <Badge variant="success">有効</Badge>
    ) : (
      <Badge variant="outline">無効</Badge>
    )
  }

  const handleAddUser = async () => {
    // TODO: Implement API call
    toast({
      title: "ユーザーを追加しました",
      description: `${formData.name}さんを追加しました。`,
    })
    setIsAddUserDialogOpen(false)
    resetForm()
  }

  const handleEditUser = async () => {
    // TODO: Implement API call
    toast({
      title: "ユーザー情報を更新しました",
      description: `${selectedUser?.name}さんの情報を更新しました。`,
    })
    setIsEditUserDialogOpen(false)
    setSelectedUser(null)
    resetForm()
  }

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    // TODO: Implement API call
    toast({
      title: `ユーザーを${newStatus === "active" ? "有効化" : "無効化"}しました`,
      description: `${user.name}さんのアカウントを${
        newStatus === "active" ? "有効化" : "無効化"
      }しました。`,
    })
  }

  const handleResetPassword = async (user: User) => {
    // TODO: Implement API call
    toast({
      title: "パスワードをリセットしました",
      description: `${user.name}さんのパスワードをリセットしました。新しいパスワードをメールで送信しました。`,
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      department: "dev",
      password: "",
    })
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: "",
    })
    setIsEditUserDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ユーザー管理</h1>
        <p className="text-muted-foreground">
          システムユーザーの追加・編集・権限管理を行います
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
                placeholder="名前またはメールアドレスで検索..."
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

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="権限" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="manager">マネージャー</SelectItem>
                <SelectItem value="user">一般</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              ユーザー追加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>{mockUsers.length}名のユーザー</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>権限</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          登録日:{" "}
                          {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MailIcon className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <EditIcon className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(user)}
                        >
                          <KeyIcon className="mr-2 h-4 w-4" />
                          パスワードリセット
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === "active" ? (
                            <>
                              <UserXIcon className="mr-2 h-4 w-4" />
                              無効化
                            </>
                          ) : (
                            <>
                              <UserCheckIcon className="mr-2 h-4 w-4" />
                              有効化
                            </>
                          )}
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規ユーザー追加</DialogTitle>
            <DialogDescription>
              新しいユーザーをシステムに追加します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">氏名</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="山田 太郎"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">メールアドレス</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="yamada@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">初期パスワード</Label>
              <Input
                id="add-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="8文字以上"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add-department">部署</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger id="add-department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">開発部</SelectItem>
                    <SelectItem value="sales">営業部</SelectItem>
                    <SelectItem value="admin">総務部</SelectItem>
                    <SelectItem value="hr">人事部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-role">権限</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="add-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">一般</SelectItem>
                    <SelectItem value="manager">マネージャー</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddUserDialogOpen(false)
                resetForm()
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleAddUser}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザー編集</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}さんの情報を編集します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">氏名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">メールアドレス</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-department">部署</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">開発部</SelectItem>
                    <SelectItem value="sales">営業部</SelectItem>
                    <SelectItem value="admin">総務部</SelectItem>
                    <SelectItem value="hr">人事部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">権限</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">一般</SelectItem>
                    <SelectItem value="manager">マネージャー</SelectItem>
                    <SelectItem value="admin">管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditUserDialogOpen(false)
                setSelectedUser(null)
                resetForm()
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleEditUser}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
