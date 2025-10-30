import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, mockUserPolicyInterests, mockPolicyInterests } from "@/lib/mock-data"

export async function GET() {
  try {
    const guestUserId = "guest"

    const user = mockUsers.find((u) => u.id === guestUserId)
    const userInterests = mockUserPolicyInterests[guestUserId] || []

    return NextResponse.json({
      profile: user,
      interests: userInterests,
      availableInterests: mockPolicyInterests,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guestUserId = "guest"

    const data = await request.json()
    const user = mockUsers.find((u) => u.id === guestUserId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user profile
    if (data.full_name !== undefined) user.full_name = data.full_name
    if (data.location_country !== undefined) user.location_country = data.location_country
    if (data.location_state !== undefined) user.location_state = data.location_state
    if (data.location_city !== undefined) user.location_city = data.location_city

    // Update policy interests
    if (data.interests !== undefined) {
      mockUserPolicyInterests[guestUserId] = data.interests
    }

    return NextResponse.json({ success: true, profile: user })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
