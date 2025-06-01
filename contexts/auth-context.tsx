"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem("gym_user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log("Loaded user from localStorage:", parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("gym_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("Attempting login for:", email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("Login response:", { status: response.status, data })

      if (response.ok && data.user) {
        console.log("Login successful, user data:", data.user)
        setUser(data.user)
        localStorage.setItem("gym_user", JSON.stringify(data.user))
        return { success: true }
      } else {
        const errorMessage = data.error || "Login failed"
        console.error("Login failed:", errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const register = async (userData: Omit<User, "id" | "createdAt">): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("Attempting registration with data:", { ...userData, password: "[HIDDEN]" })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      console.log("Registration response:", { status: response.status, data })

      if (response.ok && data.user) {
        console.log("Registration successful, user data:", data.user)
        setUser(data.user)
        localStorage.setItem("gym_user", JSON.stringify(data.user))
        return { success: true }
      } else {
        const errorMessage = data.error || "Registration failed"
        console.error("Registration failed:", errorMessage)
        if (data.details) {
          console.error("Error details:", data.details)
        }
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error occurred" }
    }
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    const userId = user?.id || user?._id || (user as any)?.userId
    if (!userId) {
      console.error("No user ID available for update")
      return false
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...userData }),
      })

      if (response.ok) {
        const updatedUser = { ...user, ...userData }
        setUser(updatedUser)
        localStorage.setItem("gym_user", JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Update user error:", error)
      return false
    }
  }

  const logout = () => {
    console.log("User logging out")
    setUser(null)
    localStorage.removeItem("gym_user")
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
