import { redirect } from "next/navigation"

export default function Home() {
  // For now, redirect to login page
  redirect("/login")
}
