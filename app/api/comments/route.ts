import { type NextRequest, NextResponse } from "next/server"
import { mockComments, addComment, removeComment, mockUsers } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billId = searchParams.get("billId")

    if (!billId) {
      return NextResponse.json({ error: "Bill ID required" }, { status: 400 })
    }

    const comments = mockComments
      .filter((c) => c.bill_id === billId)
      .map((comment) => {
        const user = mockUsers.find((u) => u.id === comment.user_id)
        return {
          ...comment,
          user: {
            full_name: user?.full_name || "Anonymous User",
            email: user?.email || "",
          },
        }
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guestUserId = "guest"

    const { billId, content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
    }

    const newComment = addComment({
      user_id: guestUserId,
      bill_id: billId,
      content: content.trim(),
    })

    return NextResponse.json({ success: true, comment: newComment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guestUserId = "guest"

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get("commentId")

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 })
    }

    const comment = mockComments.find((c) => c.id === commentId)
    if (!comment || comment.user_id !== guestUserId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    removeComment(commentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
