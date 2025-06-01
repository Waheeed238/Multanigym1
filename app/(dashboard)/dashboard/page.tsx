"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Target, UtensilsCrossed, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  const { user } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [user, router])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {user ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-gray-600">Ready to crush your fitness goals today?</p>
          </div>

          {/* Carousel */}
          <div className="relative mb-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${carouselItems[currentSlide].color} opacity-90`}
                  />
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

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/targets">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Daily Targets</p>
                      <p className="text-2xl font-bold">Set Goals</p>
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
                    <div>
                      <p className="text-sm text-gray-600">Diet Plan</p>
                      <p className="text-2xl font-bold">Plan Meals</p>
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
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold">Track Goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  )
}
