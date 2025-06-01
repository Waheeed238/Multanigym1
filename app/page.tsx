"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Target,
  UtensilsCrossed,
  Trophy,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Bell,
} from "lucide-react"
import Link from "next/link"

const carouselItems = [
  {
    title: "Welcome to Multani Gym",
    description:
      "Your ultimate fitness companion for tracking nutrition, setting goals, and achieving your fitness dreams.",
    icon: Trophy,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Set Your Targets",
    description: "Define your daily nutrition goals including protein, calories, carbs, and fats to stay on track.",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Plan Your Diet",
    description: "Create personalized meal plans based on your targets and track your daily nutrition intake.",
    icon: UtensilsCrossed,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Join the Community",
    description: "Ask questions, share experiences, and get support from fellow fitness enthusiasts.",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
]

interface DashboardStats {
  targetsSet: boolean
  todayProgress: number
  questionsAsked: number
  reviewsGiven: number
  currentStreak: number
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [stats, setStats] = useState<DashboardStats>({
    targetsSet: false,
    todayProgress: 0,
    questionsAsked: 0,
    reviewsGiven: 0,
    currentStreak: 0,
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    // No automatic redirect - let users see the landing page
  }, [user, loading, router])

  // Add this after the loading check
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user?.id) {
        setDashboardLoading(false)
        return
      }

      try {
        // Load targets
        const targetsResponse = await fetch(`/api/targets?userId=${user.id}`)
        const targetsData = targetsResponse.ok ? await targetsResponse.json() : null
        const hasTargets = targetsData && Object.values(targetsData).some((value: any) => Number(value) > 0)

        // Load today's diet progress
        const today = new Date().toISOString().split("T")[0]
        const dietResponse = await fetch(`/api/diet?userId=${user.id}&date=${today}`)
        const dietData = dietResponse.ok ? await dietResponse.json() : []

        // Calculate progress (simplified)
        let progress = 0
        if (dietData.length > 0 && hasTargets) {
          progress = Math.min(75, dietData[0]?.foods?.length * 15 || 0) // Rough calculation
        }

        // Load questions count
        const questionsResponse = await fetch(`/api/questions`)
        const questionsData = questionsResponse.ok ? await questionsResponse.json() : []
        const userQuestions = questionsData.filter((q: any) => q.userId === user.id)

        // Load reviews count
        const reviewsResponse = await fetch(`/api/reviews`)
        const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : []
        const userReviews = reviewsData.filter((r: any) => r.userId === user.id)

        setStats({
          targetsSet: hasTargets,
          todayProgress: progress,
          questionsAsked: userQuestions.length,
          reviewsGiven: userReviews.length,
          currentStreak: Math.floor(Math.random() * 7) + 1, // Mock streak for now
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setDashboardLoading(false)
      }
    }

    if (user?.id) {
      loadDashboardStats()
    }
  }, [user?.id])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // If no user, show login/signup options
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Welcome to</span>{" "}
                    <span className="block text-purple-600 xl:inline">Multani Gym</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Your ultimate fitness companion for tracking nutrition, setting goals, and achieving your fitness
                    dreams. Join our community and start your transformation today.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/auth/register">
                        <Button
                          size="lg"
                          className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/auth/login">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full flex items-center justify-center px-8 py-3 text-base font-medium"
                        >
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:text-center">
                <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Features</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  Everything you need to succeed
                </p>
              </div>

              <div className="mt-10">
                <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                  {carouselItems.map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div key={index} className="relative">
                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{item.title}</p>
                        <p className="mt-2 ml-16 text-base text-gray-500">{item.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-purple-600">
            <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to get started?</span>
                <span className="block">Join Multani Gym today.</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-purple-200">
                Start tracking your nutrition, set your goals, and connect with our fitness community.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 py-3 bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-3 text-white border-white hover:bg-white hover:text-purple-600 bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show dashboard loading
  if (dashboardLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || "User"}! 👋</h1>
        <p className="text-gray-600">Ready to crush your fitness goals today?</p>
      </div>

      {/* Carousel */}
      <div className="relative mb-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-80 flex items-center justify-center">
              <div className={`absolute inset-0 bg-gradient-to-r ${carouselItems[currentSlide].color} opacity-90`} />
              <div className="relative z-10 text-center text-white px-8">
                <div className="flex justify-center mb-4">
                  {React.createElement(carouselItems[currentSlide].icon, {
                    className: "h-16 w-16",
                  })}
                </div>
                <h2 className="text-3xl font-bold mb-4">{carouselItems[currentSlide].title}</h2>
                <p className="text-lg opacity-90 max-w-2xl">{carouselItems[currentSlide].description}</p>
              </div>

              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-purple-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Progress</p>
                <p className="text-2xl font-bold">{stats.todayProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={stats.todayProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak} days</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Questions Asked</p>
                <p className="text-2xl font-bold">{stats.questionsAsked}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviews Given</p>
                <p className="text-2xl font-bold">{stats.reviewsGiven}</p>
              </div>
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/targets">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Daily Targets</p>
                  <p className="text-xl font-bold">{stats.targetsSet ? "Update Goals" : "Set Goals"}</p>
                  {stats.targetsSet && (
                    <Badge variant="secondary" className="mt-1">
                      ✓ Configured
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/diet">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UtensilsCrossed className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Diet Plan</p>
                  <p className="text-xl font-bold">Plan Meals</p>
                  {stats.todayProgress > 0 && (
                    <Badge variant="secondary" className="mt-1">
                      {stats.todayProgress}% Complete
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-xl font-bold">Track Goals</p>
                  <Badge variant="secondary" className="mt-1">
                    {user?.experienceLevel || "Beginner"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Today's Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Set Daily Targets</span>
                {stats.targetsSet ? (
                  <Badge variant="default">✓ Complete</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Plan Today's Meals</span>
                {stats.todayProgress > 0 ? (
                  <Badge variant="default">✓ In Progress</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Track Nutrition</span>
                {stats.todayProgress > 50 ? (
                  <Badge variant="default">✓ On Track</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Quick Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Start your day by setting your nutrition targets for better tracking.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🥗 Plan your meals in advance to meet your daily protein goals.
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  📊 Check your progress regularly to stay motivated and on track.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
