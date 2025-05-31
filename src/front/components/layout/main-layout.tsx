"use client"

import { useAuthStore } from "@/stores/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Header from "./header"
import Sidebar from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null // Show nothing while redirecting
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-1 flex-col overflow-y-auto border-r bg-background">
            <Sidebar />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
