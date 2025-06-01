"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Dumbbell, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Membership {
  id: string
  name: string
  duration: number
  price: number
  features: string[]
  category?: "duration" | "specialized" | "workout" | "gym-cardio" | "bodybuilding" | "bodybuilding-cardio"
  eligibility?: string
}

export default function MembershipPlansPage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMemberships = async () => {
      try {
        const response = await fetch("/api/admin/memberships")
        if (response.ok) {
          const data = await response.json()
          // Remove duplicates based on name and price
          const uniqueMemberships = data.filter(
            (membership: Membership, index: number, self: Membership[]) =>
              index === self.findIndex((m) => m.name === membership.name && m.price === membership.price),
          )
          setMemberships(uniqueMemberships)
        }
      } catch (error) {
        console.error("Error loading memberships:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMemberships()
  }, [])

  const popularPlan = memberships.find((m) => m.name === "Bodybuilding + Cardio Plan - Yearly")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Dumbbell className="h-12 w-12 sm:h-16 sm:w-16" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">Multani Gym Membership Plans</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-purple-200 mb-6 sm:mb-8 px-4">
            Choose the perfect plan for your fitness journey
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 px-6 sm:px-8">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Bodybuilding Plans */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Bodybuilding Plans</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Bodybuilding focused training with no cardio access
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {memberships
              .filter((m) => m.category === "bodybuilding")
              .map((membership) => (
                <Card
                  key={membership.id}
                  className={`relative border-2 transition-all hover:shadow-lg ${
                    membership.id === popularPlan?.id
                      ? "border-purple-500 shadow-lg scale-105"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg sm:text-xl">{membership.name}</CardTitle>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                      ₹{membership.price.toLocaleString()}
                    </div>
                    <Badge variant="outline" className="w-fit mx-auto">
                      {membership.duration} {membership.duration === 1 ? "Month" : "Months"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {membership.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/register">
                      <Button className="w-full text-sm sm:text-base">Choose Plan</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Bodybuilding + Cardio Plans */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Bodybuilding + Cardio Plans</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Complete bodybuilding and cardio training experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {memberships
              .filter((m) => m.category === "bodybuilding-cardio")
              .map((membership) => (
                <Card
                  key={membership.id}
                  className={`relative border-2 transition-all hover:shadow-lg ${
                    membership.id === popularPlan?.id
                      ? "border-purple-500 shadow-lg scale-105"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {membership.id === popularPlan?.id && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-3 sm:px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg sm:text-xl">{membership.name}</CardTitle>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                      ₹{membership.price.toLocaleString()}
                    </div>
                    <Badge variant="outline" className="w-fit mx-auto">
                      {membership.duration} {membership.duration === 1 ? "Month" : "Months"}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {membership.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/register">
                      <Button
                        className={`w-full text-sm sm:text-base ${
                          membership.id === popularPlan?.id
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
                        Choose Plan
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Add-ons */}
        <section>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Add-on Services</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">Enhance your membership with optional services</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                name: "Personal Training",
                price: "₹500/session",
                description: "One-on-one training with certified trainers",
                icon: "💪",
              },
              {
                name: "Diet Plan",
                price: "₹1,000/month",
                description: "Customized nutrition plans by dietitians",
                icon: "🥗",
              },
              {
                name: "Supplements Package",
                price: "₹1,000/month",
                description: "Premium protein and supplement package",
                icon: "🥤",
              },
            ].map((addon, index) => (
              <Card key={index} className="text-center border-2 border-green-200 hover:border-green-400 transition-all">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{addon.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{addon.name}</h3>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">{addon.price}</div>
                  <p className="text-xs sm:text-sm text-gray-600">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-12 sm:mt-16 py-12 sm:py-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white mx-4 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-4">Ready to Start Your Fitness Journey?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-4">
            Join thousands of members who have transformed their lives with Multani Gym
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 w-full sm:w-auto"
              >
                Already a Member?
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
