"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { User, Target, UtensilsCrossed, Bell, MessageCircleQuestion, Star, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigation = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Targets", href: "/targets", icon: Target },
  { name: "Diet", href: "/diet", icon: UtensilsCrossed },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Ask Questions", href: "/questions", icon: MessageCircleQuestion },
  { name: "Review Us", href: "/reviews", icon: Star },
]

const adminNavigation = [{ name: "Admin Panel", href: "/admin", icon: Settings }]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const allNavigation = user?.role === "admin" ? [...navigation, ...adminNavigation] : navigation

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-900 to-purple-800 pt-16">
      <div className="flex h-full flex-col">
        {/* User info */}
        <div className="px-6 py-4 border-b border-purple-700">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              {user.profilePic ? (
                <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-purple-600 text-white">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-purple-200">@{user?.username || user?.email.split("@")[0]}</p>
              <p className="text-xs text-purple-200 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {allNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-purple-700 text-white" : "text-purple-100 hover:bg-purple-700 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-purple-700">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-purple-100 hover:bg-purple-700 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
