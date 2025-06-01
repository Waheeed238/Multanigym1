"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { foodDatabase, foodCategories, type Food } from "@/lib/food-data"
import {
  UtensilsCrossed,
  Target,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Zap,
  Beef,
  Wheat,
  Droplets,
  Calendar,
  Save,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SelectedFood {
  food: Food
  quantity: number // in grams
  id: string
}

interface NutritionTotals {
  protein: number
  calories: number
  fat: number
  carbs: number
}

interface Targets {
  protein: number
  calories: number
  fat: number
  carbs: number
}

// Default targets based on the specified values
const DEFAULT_TARGETS: Targets = {
  protein: 100,
  calories: 2500,
  fat: 60,
  carbs: 250,
}

export default function DietPage() {
  const { user } = useAuth()
  const [targets, setTargets] = useState<Targets | null>(null)
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // Get user ID helper function
  const getUserId = () => {
    return user?.id || user?._id || user?.userId
  }

  // Load targets and saved diet on component mount
  useEffect(() => {
    const loadData = async () => {
      const userId = getUserId()
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        setError(null)
        console.log("Loading data for user:", userId)

        // Load targets
        const targetsResponse = await fetch(`/api/targets?userId=${userId}`)
        if (targetsResponse.ok) {
          const targetsData = await targetsResponse.json()
          console.log("Loaded targets:", targetsData)

          if (targetsData && Object.keys(targetsData).length > 0) {
            const processedTargets = {
              protein: Number(targetsData.protein) || DEFAULT_TARGETS.protein,
              calories: Number(targetsData.calories) || DEFAULT_TARGETS.calories,
              fat: Number(targetsData.fat) || DEFAULT_TARGETS.fat,
              carbs: Number(targetsData.carbs) || DEFAULT_TARGETS.carbs,
            }

            setTargets(processedTargets)
          } else {
            // If no targets are found, use the default targets
            setTargets(DEFAULT_TARGETS)
          }
        } else {
          // If API call fails, use the default targets
          setTargets(DEFAULT_TARGETS)
        }

        // Load today's diet
        const today = new Date().toISOString().split("T")[0]
        console.log("Loading diet for date:", today)

        const dietResponse = await fetch(`/api/diet?userId=${userId}&date=${today}`)
        if (dietResponse.ok) {
          const dietData = await dietResponse.json()
          console.log("Loaded diet data:", dietData)

          if (dietData.success && dietData.dietPlan && dietData.dietPlan.length > 0) {
            setSelectedFoods(dietData.dietPlan)
            setLastSaved(dietData.lastUpdated)
            console.log("Restored diet plan with", dietData.dietPlan.length, "foods")
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please try again.")
        // Still set default targets even if there's an error
        setTargets(DEFAULT_TARGETS)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Calculate nutrition totals
  const calculateTotals = (): NutritionTotals => {
    return selectedFoods.reduce(
      (totals, item) => {
        const multiplier = item.quantity / 100 // Convert to per 100g
        return {
          protein: totals.protein + item.food.protein * multiplier,
          calories: totals.calories + item.food.calories * multiplier,
          fat: totals.fat + item.food.fat * multiplier,
          carbs: totals.carbs + item.food.carbs * multiplier,
        }
      },
      { protein: 0, calories: 0, fat: 0, carbs: 0 },
    )
  }

  // Filter foods based on category and search
  const filteredFoods = foodDatabase.filter((food) => {
    const matchesCategory = selectedCategory === "All" || food.category === selectedCategory
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Add food to diet
  const addFood = (food: Food) => {
    // Check if food already exists in the diet
    const existingFoodIndex = selectedFoods.findIndex((item) => item.food.id === food.id)

    if (existingFoodIndex !== -1) {
      // If food exists, increase quantity by 100g
      setSelectedFoods((prev) =>
        prev.map((item, index) => (index === existingFoodIndex ? { ...item, quantity: item.quantity + 100 } : item)),
      )

      toast({
        title: "Food Updated",
        description: `Increased ${food.name} quantity by 100g`,
      })
    } else {
      // If food doesn't exist, add new item
      const newItem: SelectedFood = {
        food,
        quantity: 100, // Default 100g
        id: `${food.id}-${Date.now()}`,
      }
      setSelectedFoods((prev) => [...prev, newItem])

      toast({
        title: "Food Added",
        description: `Added ${food.name} to your diet plan`,
      })
    }
  }

  // Update food quantity
  const updateQuantity = (id: string, quantity: number) => {
    setSelectedFoods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item)),
    )
  }

  // Remove food from diet
  const removeFood = (id: string) => {
    setSelectedFoods((prev) => prev.filter((item) => item.id !== id))
  }

  // Save diet plan
  const saveDietPlan = async () => {
    const userId = getUserId()
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      console.log("Saving diet plan for user:", userId)
      console.log("Diet plan data:", selectedFoods)

      const response = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          dietPlan: selectedFoods,
        }),
      })

      const result = await response.json()
      console.log("Save response:", result)

      if (response.ok && result.success) {
        setLastSaved(new Date().toISOString())
        toast({
          title: "Success",
          description: "Diet plan saved successfully!",
        })
      } else {
        throw new Error(result.error || "Failed to save diet plan")
      }
    } catch (error) {
      console.error("Error saving diet plan:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save diet plan",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Calculate progress percentage
  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  const totals = calculateTotals()

  if (loading) {
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

  // Show error message if there was an error loading data
  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Planning</h1>
          <p className="text-gray-600">Plan your meals to meet your daily nutrition targets</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-xl text-red-600">Error Loading Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Diet Planning</h1>
        <p className="text-gray-600">Plan your meals to meet your daily nutrition targets</p>
        {lastSaved && (
          <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Last saved: {new Date(lastSaved).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutrition Progress */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Daily Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Protein */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Beef className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Protein</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {totals.protein.toFixed(1)}g / {targets?.protein}g
                  </span>
                </div>
                <Progress value={getProgress(totals.protein, targets?.protein || 0)} className="h-2" />
                {totals.protein >= (targets?.protein || 0) && targets?.protein !== 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Target reached!</span>
                  </div>
                )}
              </div>

              {/* Calories */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Calories</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {totals.calories.toFixed(0)} / {targets?.calories}
                  </span>
                </div>
                <Progress value={getProgress(totals.calories, targets?.calories || 0)} className="h-2" />
                {totals.calories >= (targets?.calories || 0) && targets?.calories !== 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Target reached!</span>
                  </div>
                )}
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Wheat className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Carbs</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {totals.carbs.toFixed(1)}g / {targets?.carbs}g
                  </span>
                </div>
                <Progress value={getProgress(totals.carbs, targets?.carbs || 0)} className="h-2" />
                {totals.carbs >= (targets?.carbs || 0) && targets?.carbs !== 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Target reached!</span>
                  </div>
                )}
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Fat</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {totals.fat.toFixed(1)}g / {targets?.fat}g
                  </span>
                </div>
                <Progress value={getProgress(totals.fat, targets?.fat || 0)} className="h-2" />
                {totals.fat >= (targets?.fat || 0) && targets?.fat !== 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">Target reached!</span>
                  </div>
                )}
              </div>

              {/* Overall Progress */}
              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      (getProgress(totals.protein, targets?.protein || 0) +
                        getProgress(totals.calories, targets?.calories || 0) +
                        getProgress(totals.carbs, targets?.carbs || 0) +
                        getProgress(totals.fat, targets?.fat || 0)) /
                        4,
                    )}
                    %
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Food Selection and Diet Plan */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="add-foods" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add-foods">Add Foods</TabsTrigger>
              <TabsTrigger value="my-diet">My Diet Plan</TabsTrigger>
            </TabsList>

            {/* Add Foods Tab */}
            <TabsContent value="add-foods">
              <Card>
                <CardHeader>
                  <CardTitle>Food Database</CardTitle>
                  <CardDescription>Select foods to add to your diet plan</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="search">Search Foods</Label>
                      <Input
                        id="search"
                        placeholder="Search for foods..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:w-48">
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {foodCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Food Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFoods.map((food) => (
                      <Card key={food.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={food.image || "/placeholder.svg"}
                              alt={food.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm">{food.name}</h3>
                              <Badge className="bg-purple-600 text-white text-xs mb-2">{food.category}</Badge>
                              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                                <span>Protein: {food.protein}g</span>
                                <span>Calories: {food.calories}</span>
                                <span>Carbs: {food.carbs}g</span>
                                <span>Fat: {food.fat}g</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">per {food.serving}</p>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3" onClick={() => addFood(food)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredFoods.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No foods found matching your criteria</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Diet Tab */}
            <TabsContent value="my-diet">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    <span>Today's Diet Plan</span>
                  </CardTitle>
                  <CardDescription>Adjust quantities to meet your nutrition targets</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedFoods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No foods added to your diet plan yet</p>
                      <p className="text-sm">Switch to "Add Foods" tab to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedFoods.map((item) => {
                        const multiplier = item.quantity / 100
                        return (
                          <Card key={item.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.food.image || "/placeholder.svg"}
                                  alt={item.food.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <h3 className="font-medium">{item.food.name}</h3>
                                  <Badge className="bg-purple-600 text-white text-xs">{item.food.category}</Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFood(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Quantity Control */}
                              <div>
                                <Label htmlFor={`quantity-${item.id}`}>Quantity (grams)</Label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.quantity - 10)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    id={`quantity-${item.id}`}
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, Number.parseFloat(e.target.value) || 0)}
                                    className="text-center"
                                    min="0"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.quantity + 10)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Nutrition Info */}
                              <div>
                                <Label>Nutrition (for {item.quantity}g)</Label>
                                <div className="grid grid-cols-2 gap-1 text-sm mt-1">
                                  <span>Protein: {(item.food.protein * multiplier).toFixed(1)}g</span>
                                  <span>Calories: {(item.food.calories * multiplier).toFixed(0)}</span>
                                  <span>Carbs: {(item.food.carbs * multiplier).toFixed(1)}g</span>
                                  <span>Fat: {(item.food.fat * multiplier).toFixed(1)}g</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}

                      {/* Save Diet Plan */}
                      <div className="pt-4 border-t">
                        <Button className="w-full" onClick={saveDietPlan} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Diet Plan"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
