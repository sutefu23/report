"use client"

import { Badge } from "@/components/shadcn/ui/badge"
import { Button } from "@/components/shadcn/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth"
import {
  BarChart3,
  Calendar,
  CheckSquare,
  FileText,
  Home,
  Settings,
  Users,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    title: "ダッシュボード",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "日報作成",
    href: "/reports/create",
    icon: FileText,
  },
  {
    title: "日報履歴",
    href: "/reports",
    icon: Calendar,
  },
  {
    title: "個人統計",
    href: "/stats",
    icon: BarChart3,
  },
  {
    title: "設定",
    href: "/settings",
    icon: Settings,
  },
  // Admin only items
  {
    title: "チーム日報",
    href: "/admin/team-reports",
    icon: UsersRound,
    adminOnly: true,
  },
  {
    title: "承認待ち",
    href: "/admin/pending",
    icon: CheckSquare,
    badge: 5, // TODO: Replace with actual count
    adminOnly: true,
  },
  {
    title: "ユーザー管理",
    href: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "統計・レポート",
    href: "/admin/team-stats",
    icon: BarChart3,
    adminOnly: true,
  },
  {
    title: "システム設定",
    href: "/admin/settings",
    icon: Settings,
    adminOnly: true,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const isAdmin = user?.role === "admin"

  const filteredItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin,
  )

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Main Navigation */}
            <div className="pb-2">
              <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
                メイン
              </h2>
              {filteredItems
                .filter((item) => !item.adminOnly)
                .map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                  />
                ))}
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
              <div className="pt-4">
                <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
                  管理者
                </h2>
                {filteredItems
                  .filter((item) => item.adminOnly)
                  .map((item) => (
                    <SidebarItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  item: NavigationItem
  pathname: string
}

function SidebarItem({ item, pathname }: SidebarItemProps) {
  const isActive = pathname === item.href

  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn("w-full justify-start", isActive && "bg-muted font-medium")}
    >
      <Link href={item.href}>
        <item.icon className="mr-2 h-4 w-4" />
        {item.title}
        {item.badge && (
          <Badge variant="secondary" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
