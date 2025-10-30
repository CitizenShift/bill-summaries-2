import { type NextRequest, NextResponse } from "next/server"
import { mockBills, mockVotes, mockComments } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const guestUserId = "guest"

    // Calculate score for each bill (simplified without user preferences)
    const scoredBills = mockBills.map((bill) => {
      let score = 0

      // 1. Policy Interest Match (40% weight) - default to 20 for all
      score += 20

      // 2. Popularity Score (30% weight)
      const billVotes = mockVotes.filter((v) => v.bill_id === bill.id)
      const billComments = mockComments.filter((c) => c.bill_id === bill.id)
      const popularityScore = Math.min((billVotes.length + billComments.length * 2) * 3, 30)
      score += popularityScore

      // 3. Recency Score (20% weight)
      const daysSinceIntroduced = Math.floor(
        (Date.now() - new Date(bill.introduced_date).getTime()) / (1000 * 60 * 60 * 24),
      )
      const recencyScore = Math.max(20 - daysSinceIntroduced * 0.5, 0)
      score += recencyScore

      // 4. Geographic Relevance (10% weight) - default to 5 for all
      score += 5

      // Calculate vote counts
      const upvotes = billVotes.filter((v) => v.vote_type === "upvote").length
      const downvotes = billVotes.filter((v) => v.vote_type === "downvote").length
      const userVote = billVotes.find((v) => v.user_id === guestUserId)?.vote_type || null
      const commentCount = billComments.length

      return {
        ...bill,
        score,
        upvotes,
        downvotes,
        userVote,
        commentCount,
      }
    })

    // Sort by score
    const sortedBills = scoredBills.sort((a, b) => b.score - a.score)

    return NextResponse.json({ bills: sortedBills })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get bills" }, { status: 500 })
  }
}
