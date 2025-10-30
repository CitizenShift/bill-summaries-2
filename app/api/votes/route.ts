import { type NextRequest, NextResponse } from "next/server"
import { mockVotes, addVote, removeVote, updateVote } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const guestUserId = "guest"

    const { billId, voteType } = await request.json()

    // Check if user already voted
    const existingVote = mockVotes.find((v) => v.user_id === guestUserId && v.bill_id === billId)

    if (existingVote) {
      // If same vote type, remove the vote
      if (existingVote.vote_type === voteType) {
        removeVote(existingVote.id)
        return NextResponse.json({ success: true, action: "removed" })
      } else {
        // If different vote type, update the vote
        updateVote(existingVote.id, voteType)
        return NextResponse.json({ success: true, action: "updated" })
      }
    } else {
      // Create new vote
      addVote({ user_id: guestUserId, bill_id: billId, vote_type: voteType })
      return NextResponse.json({ success: true, action: "created" })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const guestUserId = "guest"

    const { searchParams } = new URL(request.url)
    const billId = searchParams.get("billId")

    if (!billId) {
      return NextResponse.json({ error: "Bill ID required" }, { status: 400 })
    }

    const vote = mockVotes.find((v) => v.user_id === guestUserId && v.bill_id === billId)

    return NextResponse.json({ vote: vote?.vote_type || null })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get vote" }, { status: 500 })
  }
}
