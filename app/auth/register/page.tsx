"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dumbbell, AlertCircle, Upload, X, Loader2 } from "lucide-react"

const goalOptions = ["Weight Loss", "Muscle Gain", "Maintenance", "Strength", "Endurance"]
const experienceLevels = ["Beginner", "Intermediate", "Advanced"]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    goals: [] as string[],
    experienceLevel: "",
  })

  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { register } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password"

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation (exactly 10 digits)
    const phoneRegex = /^\d{10}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits"
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Age validation (if date of birth provided)
    if (formData.dateOfBirth) {
      const today = new Date()
      const birthDate = new Date(formData.dateOfBirth)
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old"
      }
    }

    // Height validation (if provided)
    if (formData.heightFeet) {
      const feet = Number.parseInt(formData.heightFeet)
      if (feet < 3 || feet > 8) {
        newErrors.heightFeet = "Height must be between 3-8 feet"
      }
    }

    if (formData.heightInches) {
      const inches = Number.parseInt(formData.heightInches)
      if (inches < 0 || inches > 11) {
        newErrors.heightInches = "Inches must be between 0-11"
      }
    }

    // Weight validation (if provided)
    if (formData.weight) {
      const weight = Number.parseFloat(formData.weight)
      if (weight < 30 || weight > 300) {
        newErrors.weight = "Weight must be between 30-300 kg"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    // Special handling for phone number - only allow digits
    if (field === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10) // Remove non-digits and limit to 10
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({ ...prev, goals: [...prev.goals, goal] }))
    } else {
      setFormData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g !== goal) }))
    }
    // Clear goals error
    if (errors.goals) {
      setErrors((prev) => ({ ...prev, goals: "" }))
    }
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, profilePic: "Please select a valid image file" }))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profilePic: "Image size must be less than 5MB" }))
        return
      }

      setProfilePic(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Clear error
      if (errors.profilePic) {
        setErrors((prev) => ({ ...prev, profilePic: "" }))
      }
    }
  }

  const removeProfilePic = () => {
    setProfilePic(null)
    setProfilePicPreview(null)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      console.log("Form validation failed:", errors)
      return
    }

    setLoading(true)

    try {
      // Calculate total height in inches
      let totalHeight = 0
      if (formData.heightFeet && formData.heightInches) {
        totalHeight = Number.parseInt(formData.heightFeet) * 12 + Number.parseInt(formData.heightInches)
      }

      // Calculate age from date of birth
      let age = 0
      if (formData.dateOfBirth) {
        age = calculateAge(formData.dateOfBirth)
      }

      const userData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        age,
        weight: formData.weight ? Number.parseFloat(formData.weight) : 0,
        height: totalHeight,
        goals: formData.goals,
        experienceLevel: formData.experienceLevel || "Beginner",
        role: "user" as const,
        isAdmin: false,
        profilePic: profilePicPreview || null,
      }

      console.log("Submitting registration with data:", { ...userData, password: "[HIDDEN]" })

      const success = await register(userData)

      if (success) {
        console.log("Registration successful, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        setErrors({ submit: "Registration failed. Please try again." })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "An unexpected error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Join Multani Gym</CardTitle>
          <CardDescription>Create your account to start your fitness journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={errors.username ? "border-red-500" : ""}
                    placeholder="Choose a unique username"
                  />
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                    placeholder="1234567890 (10 digits only)"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    placeholder="Create a strong password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Picture */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Picture (Optional)</h3>
              <div className="flex items-center space-x-4">
                {profilePicPreview ? (
                  <div className="relative">
                    <img
                      src={profilePicPreview || "/placeholder.svg"}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeProfilePic}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <Label htmlFor="profilePic" className="cursor-pointer">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block">
                      Choose Image
                    </div>
                  </Label>
                  <Input
                    id="profilePic"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">JPEG or PNG, max 5MB</p>
                </div>
              </div>
              {errors.profilePic && <p className="text-red-500 text-sm mt-1">{errors.profilePic}</p>}
            </div>

            <Separator />

            {/* Personal & Fitness Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal & Fitness Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    className="flex space-x-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <Label>Height</Label>
                  <div className="flex space-x-2 mt-1">
                    <div className="flex-1">
                      <Select
                        value={formData.heightFeet}
                        onValueChange={(value) => handleInputChange("heightFeet", value)}
                      >
                        <SelectTrigger className={errors.heightFeet ? "border-red-500" : ""}>
                          <SelectValue placeholder="Feet" />
                        </SelectTrigger>
                        <SelectContent>
                          {[3, 4, 5, 6, 7, 8].map((feet) => (
                            <SelectItem key={feet} value={feet.toString()}>
                              {feet} ft
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Select
                        value={formData.heightInches}
                        onValueChange={(value) => handleInputChange("heightInches", value)}
                      >
                        <SelectTrigger className={errors.heightInches ? "border-red-500" : ""}>
                          <SelectValue placeholder="Inches" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inches) => (
                            <SelectItem key={inches} value={inches.toString()}>
                              {inches} in
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(errors.heightFeet || errors.heightInches) && (
                    <p className="text-red-500 text-sm mt-1">{errors.heightFeet || errors.heightInches}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className={errors.weight ? "border-red-500" : ""}
                    placeholder="Enter your weight"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(value) => handleInputChange("experienceLevel", value)}
                  >
                    <SelectTrigger className={`mt-1 ${errors.experienceLevel ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
                </div>
              </div>
            </div>

            {/* Fitness Goals */}
            <div>
              <Label>Fitness Goals</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {goalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.goals.includes(goal)}
                      onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                    />
                    <Label htmlFor={goal} className="text-sm">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals}</p>}
            </div>

            {/* Submit Button */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-purple-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
