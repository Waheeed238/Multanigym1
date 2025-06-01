"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { Users, CreditCard, CalendarIcon, Search, UserPlus, CheckCircle, Clock, Shield, Plus } from "lucide-react"
import type { User, Membership } from "@/lib/types"

// Available add-ons (removed locker as requested)
const AVAILABLE_ADDONS = [
  {
    id: "personal-training",
    name: "Personal Training",
    price: 500,
    unit: "session",
    description: "One-on-one training with certified trainers",
  },
  {
    id: "diet-plan",
    name: "Diet Plan",
    price: 1000,
    unit: "month",
    description: "Customized nutrition plans by dietitians",
  },
  {
    id: "supplements",
    name: "Supplements Package",
    price: 1000,
    unit: "month",
    description: "Premium protein and supplement package",
  },
]

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<User[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [assigningMembership, setAssigningMembership] = useState(false)

  // Get URL parameters
  const tabFromUrl = searchParams.get("tab") || "users"
  const userIdFromUrl = searchParams.get("userId")

  // Membership assignment form
  const [membershipForm, setMembershipForm] = useState({
    membershipId: "",
    startDate: new Date(),
    selectedAddons: [] as string[],
  })

  // Check admin access
  useEffect(() => {
    if (user && user.role !== "admin" && !user.isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, router])

  // Load users and memberships
  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResponse, membershipsResponse] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/memberships"),
        ])

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          const usersList = Array.isArray(usersData) ? usersData : []
          setUsers(usersList)

          // Auto-select user if userId is provided in URL
          if (userIdFromUrl && usersList.length > 0) {
            const userToSelect = usersList.find((u: User) => u.id === userIdFromUrl)
            if (userToSelect) {
              setSelectedUser(userToSelect)
            }
          }
        }

        if (membershipsResponse.ok) {
          const membershipsData = await membershipsResponse.json()
          // Remove duplicates based on name and price
          const uniqueMemberships = Array.isArray(membershipsData)
            ? membershipsData.filter(
                (membership: Membership, index: number, self: Membership[]) =>
                  index === self.findIndex((m) => m.name === membership.name && m.price === membership.price),
              )
            : []
          setMemberships(uniqueMemberships)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "admin" || user?.isAdmin) {
      loadData()
    }
  }, [user, userIdFromUrl])

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get selected membership details
  const selectedMembership = memberships.find((m) => m.id === membershipForm.membershipId)

  // Calculate total price including add-ons
  const calculateTotalPrice = () => {
    const basePrice = selectedMembership?.price || 0
    const addonsPrice = membershipForm.selectedAddons.reduce((total, addonId) => {
      const addon = AVAILABLE_ADDONS.find((a) => a.id === addonId)
      return total + (addon?.price || 0)
    }, 0)
    return basePrice + addonsPrice
  }

  // Calculate expiry date based on membership duration
  const calculateExpiryDate = (startDate: Date, duration: number) => {
    const expiry = new Date(startDate)
    expiry.setMonth(expiry.getMonth() + duration)
    return expiry
  }

  // Determine plan type based on membership duration
  const getPlanType = (duration: number): "monthly" | "yearly" => {
    return duration >= 12 ? "yearly" : "monthly"
  }

  // Handle addon selection
  const handleAddonToggle = (addonId: string) => {
    setMembershipForm((prev) => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(addonId)
        ? prev.selectedAddons.filter((id) => id !== addonId)
        : [...prev.selectedAddons, addonId],
    }))
  }

  // Update the assignMembership function to handle the response properly
  const assignMembership = async () => {
    if (!selectedUser || !membershipForm.membershipId || !selectedMembership) return

    setAssigningMembership(true)
    try {
      const expiryDate = calculateExpiryDate(membershipForm.startDate, selectedMembership.duration)
      const planType = getPlanType(selectedMembership.duration)

      const response = await fetch("/api/admin/assign-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          membershipId: membershipForm.membershipId,
          planType: planType,
          startDate: membershipForm.startDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          assignedBy: user?.id,
          addons: membershipForm.selectedAddons,
          totalPrice: calculateTotalPrice(),
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Refresh users data
        const usersResponse = await fetch("/api/admin/users")
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(Array.isArray(usersData) ? usersData : [])
          // Update selected user
          const updatedUser = usersData.find((u: User) => u.id === selectedUser.id)
          if (updatedUser) {
            setSelectedUser(updatedUser)
          }
        }

        // Reset form
        setMembershipForm({
          membershipId: "",
          startDate: new Date(),
          selectedAddons: [],
        })

        // Show appropriate message
        if (result.isExtension) {
          alert("Membership extended successfully! The expiry date has been updated.")
        } else {
          alert("Membership assigned successfully!")
        }
      } else {
        alert("Failed to assign membership")
      }
    } catch (error) {
      console.error("Error assigning membership:", error)
      alert("Error assigning membership")
    } finally {
      setAssigningMembership(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
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

  if (user?.role !== "admin" && !user?.isAdmin) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
            </div>
            <CardTitle className="text-lg sm:text-xl text-red-600">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage users, memberships, and gym operations</p>
        {userIdFromUrl && selectedUser && (
          <div className="mt-2">
            <Badge variant="outline" className="flex items-center gap-2 w-fit">
              <Users className="h-3 w-3" />
              Pre-selected: {selectedUser.name || selectedUser.email}
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue={tabFromUrl} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            User Management
          </TabsTrigger>
          <TabsTrigger value="memberships" className="text-xs sm:text-sm">
            Membership Plans
          </TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs sm:text-sm">
            Expiry Reminders
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                    <Users className="h-5 w-5" />
                    <span>All Users</span>
                  </CardTitle>
                  <CardDescription className="text-sm">Select a user to manage their membership</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          try {
                            setSelectedUser(u)
                          } catch (error) {
                            console.error("Error selecting user:", error)
                          }
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUser?.id === u.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{u.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name || "Unknown User"}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email || "No email"}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                                {u.role || "user"}
                              </Badge>
                              {u.membershipExpiry && (
                                <Badge
                                  variant={new Date(u.membershipExpiry) > new Date() ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {u.membershipType || "Member"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">No users found</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* User Details & Membership Assignment */}
            <div className="lg:col-span-2">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* User Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                        <UserPlus className="h-5 w-5" />
                        <span>User Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-600">Name</Label>
                          <p className="font-medium text-sm sm:text-base">{selectedUser.name || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Email</Label>
                          <p className="font-medium text-sm sm:text-base break-all">{selectedUser.email || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Phone</Label>
                          <p className="font-medium text-sm sm:text-base">{selectedUser.phone || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Age</Label>
                          <p className="font-medium text-sm sm:text-base">
                            {selectedUser.age ? `${selectedUser.age} years` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Weight</Label>
                          <p className="font-medium text-sm sm:text-base">
                            {selectedUser.weight ? `${selectedUser.weight} kg` : "N/A"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-600">Height</Label>
                          <p className="font-medium text-sm sm:text-base">
                            {selectedUser.height ? `${selectedUser.height} inches` : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Current Membership */}
                      {selectedUser.membershipExpiry && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">Current Membership</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <Label className="text-gray-600">Plan Type</Label>
                              <p className="font-medium capitalize">{selectedUser.membershipType || "Unknown"}</p>
                            </div>
                            <div>
                              <Label className="text-gray-600">Start Date</Label>
                              <p className="font-medium">
                                {selectedUser.membershipStartDate
                                  ? (() => {
                                      try {
                                        return format(new Date(selectedUser.membershipStartDate), "MMM dd, yyyy")
                                      } catch (error) {
                                        return "Invalid Date"
                                      }
                                    })()
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <Label className="text-gray-600">Expiry Date</Label>
                              <p
                                className={`font-medium ${(() => {
                                  try {
                                    return new Date(selectedUser.membershipExpiry) < new Date()
                                      ? "text-red-600"
                                      : "text-green-600"
                                  } catch (error) {
                                    return "text-gray-600"
                                  }
                                })()}`}
                              >
                                {(() => {
                                  try {
                                    return format(new Date(selectedUser.membershipExpiry), "MMM dd, yyyy")
                                  } catch (error) {
                                    return "Invalid Date"
                                  }
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Assign Membership */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                        <CreditCard className="h-5 w-5" />
                        <span>Assign Membership</span>
                      </CardTitle>
                      <CardDescription className="text-sm">Add or update membership plan for this user</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="membership" className="text-sm">
                            Membership Plan
                          </Label>
                          <Select
                            value={membershipForm.membershipId}
                            onValueChange={(value) => setMembershipForm((prev) => ({ ...prev, membershipId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Bodybuilding Plans */}
                              {memberships
                                .filter((m) => m.category === "bodybuilding")
                                .map((membership) => (
                                  <SelectItem key={membership.id} value={membership.id || "unknown"}>
                                    {membership.name} - ₹{membership.price?.toLocaleString()}
                                  </SelectItem>
                                ))}
                              {/* Bodybuilding + Cardio Plans */}
                              {memberships
                                .filter((m) => m.category === "bodybuilding-cardio")
                                .map((membership) => (
                                  <SelectItem key={membership.id} value={membership.id || "unknown"}>
                                    {membership.name} - ₹{membership.price?.toLocaleString()}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-sm">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(membershipForm.startDate, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={membershipForm.startDate}
                                onSelect={(date) => date && setMembershipForm((prev) => ({ ...prev, startDate: date }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Add-ons Selection */}
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Add-on Services (Optional)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {AVAILABLE_ADDONS.map((addon) => (
                            <div key={addon.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                              <Checkbox
                                id={addon.id}
                                checked={membershipForm.selectedAddons.includes(addon.id)}
                                onCheckedChange={() => handleAddonToggle(addon.id)}
                              />
                              <div className="flex-1">
                                <label htmlFor={addon.id} className="text-sm font-medium cursor-pointer">
                                  {addon.name}
                                </label>
                                <p className="text-xs text-gray-600">{addon.description}</p>
                                <p className="text-sm font-semibold text-green-600">
                                  ₹{addon.price}/{addon.unit}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedMembership && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">Plan Summary</h4>
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="text-gray-600">Plan:</span> {selectedMembership.name}
                            </p>
                            <p>
                              <span className="text-gray-600">Duration:</span> {selectedMembership.duration}{" "}
                              {selectedMembership.duration === 1 ? "month" : "months"}
                            </p>
                            <p>
                              <span className="text-gray-600">Base Price:</span> ₹
                              {selectedMembership.price?.toLocaleString()}
                            </p>
                            {membershipForm.selectedAddons.length > 0 && (
                              <div>
                                <span className="text-gray-600">Add-ons:</span>
                                <ul className="ml-4 mt-1">
                                  {membershipForm.selectedAddons.map((addonId) => {
                                    const addon = AVAILABLE_ADDONS.find((a) => a.id === addonId)
                                    return addon ? (
                                      <li key={addonId} className="text-xs">
                                        • {addon.name} - ₹{addon.price}/{addon.unit}
                                      </li>
                                    ) : null
                                  })}
                                </ul>
                              </div>
                            )}
                            <p className="font-semibold border-t pt-1">
                              <span className="text-gray-600">Total Price:</span> ₹
                              {calculateTotalPrice().toLocaleString()}
                            </p>
                            <p>
                              <span className="text-gray-600">Start Date:</span>{" "}
                              {format(membershipForm.startDate, "MMM dd, yyyy")}
                            </p>
                            <p>
                              <span className="text-gray-600">Expiry Date:</span>{" "}
                              {format(
                                calculateExpiryDate(membershipForm.startDate, selectedMembership.duration),
                                "MMM dd, yyyy",
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedUser?.membershipExpiry &&
                        (() => {
                          try {
                            return new Date(selectedUser.membershipExpiry) > new Date()
                          } catch (error) {
                            return false
                          }
                        })() && (
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                            <h4 className="font-medium text-yellow-800 mb-1 text-sm">Membership Extension</h4>
                            <p className="text-sm text-yellow-700">
                              This user already has an active membership expiring on{" "}
                              <span className="font-medium">
                                {(() => {
                                  try {
                                    return format(new Date(selectedUser.membershipExpiry), "MMM dd, yyyy")
                                  } catch (error) {
                                    return "Invalid Date"
                                  }
                                })()}
                              </span>
                              . Assigning a new membership will extend their current expiry date.
                            </p>
                          </div>
                        )}

                      <Button
                        onClick={assignMembership}
                        disabled={!membershipForm.membershipId || assigningMembership}
                        className="w-full"
                      >
                        {assigningMembership ? "Assigning..." : "Assign Membership"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      Select a user to view details and manage membership
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Membership Plans Tab */}
        <TabsContent value="memberships">
          <div className="space-y-6">
            {/* Bodybuilding Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Bodybuilding Plans</span>
                </CardTitle>
                <CardDescription className="text-sm">Bodybuilding focused membership plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {memberships
                    .filter((m) => m.category === "bodybuilding")
                    .map((membership) => (
                      <Card key={membership.id} className="border-2 hover:border-purple-300 transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg">{membership.name}</CardTitle>
                          <div className="text-xl sm:text-2xl font-bold text-purple-600">
                            ₹{membership.price?.toLocaleString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="w-fit text-xs">
                              {membership.duration} {membership.duration === 1 ? "Month" : "Months"}
                            </Badge>
                            <Badge variant="secondary" className="w-fit text-xs">
                              {getPlanType(membership.duration)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <p className="text-sm font-medium mb-2">Features:</p>
                            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                              {membership.features?.map((feature, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Bodybuilding + Cardio Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5" />
                  <span>Bodybuilding + Cardio Plans</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Complete bodybuilding and cardio training experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {memberships
                    .filter((m) => m.category === "bodybuilding-cardio")
                    .map((membership) => (
                      <Card key={membership.id} className="border-2 hover:border-blue-300 transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg">{membership.name}</CardTitle>
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            ₹{membership.price?.toLocaleString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {membership.duration} {membership.duration === 1 ? "Month" : "Months"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getPlanType(membership.duration)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <p className="text-sm font-medium mb-2">Features:</p>
                            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                              {membership.features?.map((feature, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Add-ons Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Plus className="h-5 w-5" />
                  <span>Available Add-ons</span>
                </CardTitle>
                <CardDescription className="text-sm">Optional services for any membership plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_ADDONS.map((addon) => (
                    <div key={addon.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm sm:text-base">{addon.name}</h4>
                      <p className="text-base sm:text-lg font-bold text-green-600">
                        ₹{addon.price}/{addon.unit}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">{addon.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Clock className="h-5 w-5" />
                <span>Membership Expiry Reminders</span>
              </CardTitle>
              <CardDescription className="text-sm">Users with memberships expiring soon</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpiryReminders users={users} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Update the ExpiryReminders component
function ExpiryReminders({ users }: { users: User[] }) {
  const [reminderDays, setReminderDays] = useState(7)

  // Filter users with expiring memberships
  const expiringUsers = users
    .filter((user) => {
      if (!user.membershipExpiry) return false
      const expiryDate = new Date(user.membershipExpiry)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= reminderDays && daysUntilExpiry >= 0
    })
    .map((user) => {
      const expiryDate = new Date(user.membershipExpiry!)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { ...user, daysUntilExpiry }
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)

  const sendReminder = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        alert("Reminder sent successfully!")
      } else {
        alert("Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Error sending reminder")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Label htmlFor="reminderDays" className="text-sm font-medium">
          Show memberships expiring within:
        </Label>
        <Select value={reminderDays.toString()} onValueChange={(value) => setReminderDays(Number.parseInt(value))}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 days</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">2 months</SelectItem>
            <SelectItem value="180">6 months</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>
        <Button size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Create Reminder
        </Button>
      </div>

      {expiringUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm sm:text-base">No memberships expiring within {reminderDays} days</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expiringUsers.map((user) => (
            <Card
              key={user.id}
              className={`border-l-4 ${user.daysUntilExpiry <= 3 ? "border-l-red-500" : user.daysUntilExpiry <= 7 ? "border-l-orange-500" : "border-l-yellow-500"}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm sm:text-base">{user.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-all">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {user.membershipType || "Member"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Expires: {format(new Date(user.membershipExpiry!), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-center">
                      <div
                        className={`text-lg sm:text-xl font-bold ${
                          user.daysUntilExpiry <= 3
                            ? "text-red-600"
                            : user.daysUntilExpiry <= 7
                              ? "text-orange-600"
                              : "text-yellow-600"
                        }`}
                      >
                        {user.daysUntilExpiry}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.daysUntilExpiry === 0 ? "Expires today" : "days left"}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => sendReminder(user.id!)} className="text-xs">
                      Send Reminder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
