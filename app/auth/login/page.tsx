"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dumbbell, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [seedStatus, setSeedStatus] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const { login, user } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Auto-seed the database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setSeeding(true)
        const response = await fetch("/api/seed", {
          method: "POST",
        })

        if (response.ok) {
          const result = await response.json()
          setSeedStatus("Database initialized successfully")
          console.log("Seed result:", result)
        } else {
          const errorData = await response.json()
          setSeedStatus(`Database initialization failed: ${errorData.details || errorData.error}`)
          console.error("Seed error:", errorData)
        }
      } catch (error) {
        console.error("Seed error:", error)
        setSeedStatus("Database initialization failed")
      } finally {
        setSeeding(false)
      }
    }

    if (!user) {
      initializeDatabase()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      const success = await login(email, password)

      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid email or password. Please check your credentials and try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Don't render if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Multani Gym</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Database Status */}
          {seeding && (
            <Alert className="mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{seedStatus || "Initializing database..."}</AlertDescription>
            </Alert>
          )}

          {seedStatus && !seeding && (
            <Alert className={`mb-4 ${seedStatus.includes("successfully") ? "border-green-500" : "border-red-500"}`}>
              {seedStatus.includes("successfully") ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>{seedStatus}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
                disabled={loading || seeding}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
                disabled={loading || seeding}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || seeding}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-purple-600 hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <Link href="/membership-plans" className="text-purple-600 hover:underline">
                View Membership Plans
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Note:</strong> No default accounts exist. Please register a new account to get started. Admin
              privileges can be set manually in the database.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
