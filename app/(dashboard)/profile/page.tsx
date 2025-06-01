"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Edit,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Crown,
  Plus,
  ArrowRight,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import type { Membership, User as UserType } from "@/lib/types"

const goalOptions = ["Weight Loss", "Muscle Gain", "Maintenance", "Strength", "Endurance"]
const experienceLevels = ["Beginner", "Intermediate", "Advanced"]

interface EditData {
  name: string
  username: string
  phone: string
  dateOfBirth: string
  gender: string
  heightFeet: string
  heightInches: string
  weight: number
  goals: string[]
  experienceLevel: string
}

export default function ProfilePage() {
  const { user: currentUser, setUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [membershipLoading, setMembershipLoading] = useState(true)

  // Admin functionality
  const [allUsers, setAllUsers] = useState<UserType[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [viewingUser, setViewingUser] = useState<UserType | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)

  const [editData, setEditData] = useState<EditData>({
    name: "",
    username: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: 0,
    goals: [],
    experienceLevel: "",
  })

  // Determine which user to display (admin can view others, regular users see themselves)
  const displayUser = currentUser?.isAdmin && viewingUser ? viewingUser : currentUser

  useEffect(() => {
    if (currentUser?.isAdmin) {
      loadAllUsers()
    }
  }, [currentUser])

  useEffect(() => {
    if (displayUser?.membershipId) {
      loadMembershipDetails()
    } else {
      setMembershipLoading(false)
    }
  }, [displayUser])

  useEffect(() => {
    if (displayUser) {
      setEditData({
        name: displayUser.name || "",
        username: displayUser.username || "",
        phone: displayUser.phone || "",
        dateOfBirth: displayUser.dateOfBirth || "",
        gender: displayUser.gender || "",
        heightFeet: displayUser.height ? Math.floor(displayUser.height / 12).toString() : "",
        heightInches: displayUser.height ? (displayUser.height % 12).toString() : "",
        weight: displayUser.weight || 0,
        goals: displayUser.goals || [],
        experienceLevel: displayUser.experienceLevel || "",
      })
    }
  }, [displayUser])

  const loadAllUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        const users = Array.isArray(data) ? data : []
        // Filter out the current admin user from the list
        const filteredUsers = users.filter((user: UserType) => user.id !== currentUser?.id)
        setAllUsers(filteredUsers)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setUsersLoading(false)
    }
  }

  const loadMembershipDetails = async () => {
    if (!displayUser?.membershipId) return

    try {
      const response = await fetch(`/api/memberships/${displayUser.membershipId}`)
      if (response.ok) {
        const membershipData = await response.json()
        setMembership(membershipData)
      }
    } catch (error) {
      console.error("Error loading membership:", error)
    } finally {
      setMembershipLoading(false)
    }
  }

  const handleUserSelection = async (userId: string) => {
    setSelectedUserId(userId)
    if (!userId) {
      setViewingUser(null)
      return
    }

    try {
      const response = await fetch(`/api/user/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setViewingUser(userData)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const handleAddMembership = () => {
    if (displayUser?.id) {
      // Navigate to admin panel with user pre-selected
      router.push(`/admin?tab=users&userId=${displayUser.id}`)
    }
  }

  const handleGoalChange = (goal: string, checked: boolean) => {
    if (checked) {
      setEditData((prev) => ({ ...prev, goals: [...prev.goals, goal] }))
    } else {
      setEditData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g !== goal) }))
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return displayUser?.age || 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayUser) return

    setLoading(true)
    try {
      const totalHeight = Number.parseInt(editData.heightFeet) * 12 + Number.parseInt(editData.heightInches)
      const age = calculateAge(editData.dateOfBirth)

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: displayUser.id,
          ...editData,
          height: totalHeight,
          age,
        }),
      })

      if (response.ok) {
        const { user: updatedUser } = await response.json()

        // Update the appropriate user state
        if (currentUser?.isAdmin && viewingUser) {
          setViewingUser(updatedUser)
          // Also update in the users list
          setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
        } else {
          setUser(updatedUser)
        }

        setEditDialogOpen(false)
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile")
    } finally {
      setLoading(false)
    }
  }

  const getMembershipStatus = () => {
    if (!displayUser?.membershipExpiry) return { status: "none", text: "No Membership", color: "gray" }

    const expiryDate = new Date(displayUser.membershipExpiry)
    const today = new Date()
    const daysUntilExpiry = differenceInDays(expiryDate, today)

    if (daysUntilExpiry < 0) {
      return { status: "expired", text: "Expired", color: "red", icon: XCircle }
    } else if (daysUntilExpiry <= 7) {
      return { status: "expiring", text: "Expiring Soon", color: "yellow", icon: AlertTriangle }
    } else {
      return { status: "active", text: "Active", color: "green", icon: CheckCircle }
    }
  }

  const membershipStatus = getMembershipStatus()

  if (!currentUser) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!displayUser) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-500">No user data available</p>
        </div>
      </div>
    )
  }

  const displayAge = displayUser.dateOfBirth ? calculateAge(displayUser.dateOfBirth) : displayUser.age || 0
  const displayHeightFeet = Math.floor((displayUser.height || 0) / 12)
  const displayHeightInches = (displayUser.height || 0) % 12

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              Profile
              {currentUser.isAdmin && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Admin View
                </Badge>
              )}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {currentUser.isAdmin ? "View and manage user profiles" : "Manage your account information and membership"}
            </p>
          </div>

          {/* Admin User Selection */}
          {currentUser.isAdmin && (
            <div className="w-full sm:w-80">
              <Label htmlFor="user-select" className="text-sm font-medium">
                Select User to View
              </Label>
              <Select value={selectedUserId} onValueChange={handleUserSelection}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a user to view..." />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading users...
                    </SelectItem>
                  ) : allUsers.length === 0 ? (
                    <SelectItem value="no-users" disabled>
                      No other users found
                    </SelectItem>
                  ) : (
                    allUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id || "unknown"}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{user.name || user.email || "Unknown User"}</span>
                          {user.isAdmin && <Crown className="h-3 w-3 text-yellow-500" />}
                          {user.membershipExpiry && (
                            <Badge
                              variant={new Date(user.membershipExpiry) > new Date() ? "default" : "destructive"}
                              className="text-xs ml-1"
                            >
                              {user.membershipType || "Member"}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <CardTitle className="text-lg sm:text-xl">
                    Personal Information
                    {currentUser.isAdmin && viewingUser && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (Viewing: {viewingUser.name || viewingUser.email})
                      </span>
                    )}
                  </CardTitle>
                </div>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-2" />
                      {currentUser.isAdmin && viewingUser ? "Edit User" : "Edit"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle>
                        {currentUser.isAdmin && viewingUser ? `Edit ${viewingUser.name}'s Profile` : "Edit Profile"}
                      </DialogTitle>
                      <DialogDescription>Update personal information</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Full Name</Label>
                          <Input
                            id="edit-name"
                            value={editData.name}
                            onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-username">Username</Label>
                          <Input
                            id="edit-username"
                            value={editData.username}
                            onChange={(e) => setEditData((prev) => ({ ...prev, username: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Phone Number</Label>
                          <Input
                            id="edit-phone"
                            value={editData.phone}
                            onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                          <Input
                            id="edit-dateOfBirth"
                            type="date"
                            value={editData.dateOfBirth}
                            onChange={(e) => setEditData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Gender</Label>
                          <RadioGroup
                            value={editData.gender}
                            onValueChange={(value) => setEditData((prev) => ({ ...prev, gender: value }))}
                            className="flex flex-wrap gap-4 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="edit-male" />
                              <Label htmlFor="edit-male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="edit-female" />
                              <Label htmlFor="edit-female">Female</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="edit-other" />
                              <Label htmlFor="edit-other">Other</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label htmlFor="edit-weight">Weight (kg)</Label>
                          <Input
                            id="edit-weight"
                            type="number"
                            step="0.1"
                            value={editData.weight}
                            onChange={(e) => setEditData((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                            required
                          />
                        </div>
                        <div>
                          <Label>Height</Label>
                          <div className="flex space-x-2 mt-1">
                            <Select
                              value={editData.heightFeet}
                              onValueChange={(value) => setEditData((prev) => ({ ...prev, heightFeet: value }))}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Feet" />
                              </SelectTrigger>
                              <SelectContent>
                                {[3, 4, 5, 6, 7, 8, 9].map((feet) => (
                                  <SelectItem key={feet} value={feet.toString()}>
                                    {feet} ft
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={editData.heightInches}
                              onValueChange={(value) => setEditData((prev) => ({ ...prev, heightInches: value }))}
                            >
                              <SelectTrigger className="flex-1">
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
                        <div className="md:col-span-2">
                          <Label>Experience Level</Label>
                          <Select
                            value={editData.experienceLevel}
                            onValueChange={(value) => setEditData((prev) => ({ ...prev, experienceLevel: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Fitness Goals</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {goalOptions.map((goal) => (
                            <div key={goal} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-${goal}`}
                                checked={editData.goals.includes(goal)}
                                onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                              />
                              <Label htmlFor={`edit-${goal}`} className="text-sm">
                                {goal}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  {displayUser.profilePic ? (
                    <AvatarImage src={displayUser.profilePic || "/placeholder.svg"} alt={displayUser.name} />
                  ) : (
                    <AvatarFallback className="text-lg sm:text-2xl">
                      {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold">{displayUser.name || "Unknown User"}</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    @{displayUser.username || (displayUser.email ? displayUser.email.split("@")[0] : "user")}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600">{displayUser.email || "No email"}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant={displayUser.isAdmin ? "default" : "secondary"}>
                      {displayUser.isAdmin ? "Admin" : "Member"}
                    </Badge>
                    {currentUser.isAdmin && viewingUser && <Badge variant="outline">Viewing as Admin</Badge>}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">{displayUser.phone || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 break-all">{displayUser.email || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Physical Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2">{displayAge} years</span>
                    </div>
                    {displayUser.dateOfBirth && (
                      <div>
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="ml-2">{format(new Date(displayUser.dateOfBirth), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {displayUser.gender && (
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <span className="ml-2 capitalize">{displayUser.gender}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2">{displayUser.weight || "Not set"} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <span className="ml-2">
                        {displayHeightFeet}' {displayHeightInches}"
                      </span>
                    </div>
                    {displayUser.experienceLevel && (
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <span className="ml-2">{displayUser.experienceLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Fitness Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {(displayUser.goals || []).map((goal) => (
                    <Badge key={goal} variant="outline">
                      {goal}
                    </Badge>
                  ))}
                  {(!displayUser.goals || displayUser.goals.length === 0) && (
                    <p className="text-gray-500 text-sm">No goals set</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Membership Information */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <CardTitle className="text-lg sm:text-xl">Membership</CardTitle>
                </div>
                {currentUser.isAdmin && displayUser.membershipId && membership && (
                  <Button onClick={handleAddMembership} size="sm" variant="outline" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {membershipLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : displayUser.membershipId && membership ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base">{membership.name}</h3>
                    <Badge
                      variant={
                        membershipStatus.status === "active"
                          ? "default"
                          : membershipStatus.status === "expiring"
                            ? "destructive"
                            : "secondary"
                      }
                      className="flex items-center space-x-1 w-fit"
                    >
                      {membershipStatus.icon && <membershipStatus.icon className="h-3 w-3" />}
                      <span>{membershipStatus.text}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Started:</span>
                      <span>
                        {displayUser.membershipStartDate
                          ? format(new Date(displayUser.membershipStartDate), "MMM dd, yyyy")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Expires:</span>
                      <span>
                        {displayUser.membershipExpiry
                          ? format(new Date(displayUser.membershipExpiry), "MMM dd, yyyy")
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{displayUser.membershipType || "N/A"}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Features</h4>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {membership.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {membershipStatus.status === "expiring" && displayUser.membershipExpiry && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Membership Expiring Soon!</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Membership expires in {differenceInDays(new Date(displayUser.membershipExpiry), new Date())}{" "}
                        days.
                        {currentUser.isAdmin ? " Consider renewal." : " Contact admin to renew."}
                      </p>
                    </div>
                  )}

                  {membershipStatus.status === "expired" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Membership Expired</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">
                        Membership has expired.
                        {currentUser.isAdmin ? " Assign a new membership." : " Please contact admin to renew."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CreditCard className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="font-medium mb-1 text-sm sm:text-base">No Active Membership</h3>
                  <p className="text-xs sm:text-sm">
                    {currentUser.isAdmin
                      ? "Click 'Add Membership' to assign a plan"
                      : "Contact admin to get a membership plan"}
                  </p>
                  <Button onClick={handleAddMembership} className="mt-3 flex items-center gap-2 mx-auto" size="sm">
                    <Plus className="h-4 w-4" />
                    Assign Membership
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
