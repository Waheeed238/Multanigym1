"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Zap, Beef, Wheat, Droplets } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TargetsPage() {
  const { user } = useAuth()
  const [targets, setTargets] = useState({
    protein: 100,
    calories: 2500,
    fat: 60,
    carbs: 250,
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const targetItems = [
    { key: "protein", label: "Protein", unit: "g", icon: Beef, color: "text-red-600", bgColor: "bg-red-100" },
    { key: "calories", label: "Calories", unit: "kcal", icon: Zap, color: "text-orange-600", bgColor: "bg-orange-100" },
    { key: "fat", label: "Fat", unit: "g", icon: Droplets, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { key: "carbs", label: "Carbs", unit: "g", icon: Wheat, color: "text-green-600", bgColor: "bg-green-100" },
  ]

  // Get user ID - check multiple possible properties
  const getUserId = () => {
    if (!user) return null
    return user.id || user._id || (user as any).userId
  }

  // Load targets on component mount
  useEffect(() => {
    const loadTargets = async () => {
      const userId = getUserId()

      if (!userId) {
        console.log("No user ID found, user object:", user)
        setLoading(false)
        return
      }

      console.log("Loading targets for user:", userId)

      try {
        const response = await fetch(`/api/targets?userId=${userId}`)
        console.log("Load targets response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Loaded targets data:", data)

          if (data && Object.keys(data).length > 0) {
            setTargets({
              protein: Number(data.protein) || 100,
              calories: Number(data.calories) || 2500,
              fat: Number(data.fat) || 60,
              carbs: Number(data.carbs) || 250,
            })
          }
        } else {
          console.error("Failed to load targets:", response.statusText)
        }
      } catch (error) {
        console.error("Error loading targets:", error)
        toast({
          title: "Error",
          description: "Failed to load targets",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTargets()
  }, [user])

  const handleSave = async () => {
    console.log("Save button clicked")
    console.log("Full user object:", user)
    console.log("Targets to save:", targets)

    const userId = getUserId()

    if (!userId) {
      console.error("No user ID available")
      console.log("User object keys:", user ? Object.keys(user) : "user is null")
      toast({
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      })
      return
    }

    console.log("Using user ID:", userId)
    setSaving(true)

    try {
      console.log("Sending save request...")

      const requestBody = {
        userId: userId,
        targets: targets,
      }

      console.log("Request body:", requestBody)

      const response = await fetch("/api/targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Save response status:", response.status)

      const responseData = await response.json()
      console.log("Save response data:", responseData)

      if (response.ok) {
        setEditing(false)
        toast({
          title: "Success",
          description: "Targets saved successfully!",
        })
        console.log("Targets saved successfully")
      } else {
        throw new Error(responseData.error || "Failed to save targets")
      }
    } catch (error) {
      console.error("Error saving targets:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save targets",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    console.log(`Updating ${key} to ${numValue}`)
    setTargets((prev) => ({
      ...prev,
      [key]: numValue,
    }))
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const userId = getUserId()

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Daily Targets</h1>
        <p className="text-sm sm:text-base text-gray-600">Set your daily nutrition goals to stay on track</p>
        {user && (
          <div className="text-xs sm:text-sm text-gray-500 mt-2">
            <p>User ID: {userId || "Not found"}</p>
            <p>User Email: {user.email || "Not found"}</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Debug: User Object</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>

      {!userId && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800">⚠️ No user ID found. Please logout and login again to fix this issue.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {targetItems.map((item) => (
          <Card key={item.key}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                </div>
                <span>{item.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div>
                  <Label htmlFor={item.key} className="text-sm">
                    Target {item.label}
                  </Label>
                  <Input
                    id={item.key}
                    type="number"
                    value={targets[item.key as keyof typeof targets]}
                    onChange={(e) => handleInputChange(item.key, e.target.value)}
                    className="mt-1"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.unit}</p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl sm:text-2xl font-bold">{targets[item.key as keyof typeof targets]}</span>
                    <span className="text-xs sm:text-sm text-gray-500">{item.unit}</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    0 / {targets[item.key as keyof typeof targets]} {item.unit}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 flex justify-center">
        {editing ? (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={handleSave} disabled={saving || !userId} className="min-w-[120px]">
              {saving ? "Saving..." : "Save Targets"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.log("Cancel clicked")
                setEditing(false)
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              console.log("Edit clicked")
              setEditing(true)
            }}
            disabled={!userId}
            className="w-full sm:w-auto"
          >
            Edit Targets
          </Button>
        )}
      </div>

      {!editing && (
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recommendations</CardTitle>
            <CardDescription>Based on your profile and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">For Muscle Building:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Protein: 1.6-2.2g per kg body weight</li>
                  <li>• Calories: Maintenance + 300-500</li>
                  <li>• Carbs: 4-7g per kg body weight</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Fat Loss:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Protein: 1.6-2.4g per kg body weight</li>
                  <li>• Calories: Maintenance - 300-500</li>
                  <li>• Fat: 0.5-1.5g per kg body weight</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
