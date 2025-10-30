import { BillFeed } from "@/components/bill-feed"
import { mockBills, mockVotes, mockComments } from "@/lib/mock-data"

export default function HomePage() {
  const enrichedBills = mockBills.map((bill) => {
    const billVotes = mockVotes.filter((v) => v.bill_id === bill.id)
    const upvotes = billVotes.filter((v) => v.vote_type === "upvote").length
    const downvotes = billVotes.filter((v) => v.vote_type === "downvote").length
    const userVote = billVotes.find((v) => v.user_id === "guest")?.vote_type || null
    const commentCount = mockComments.filter((c) => c.bill_id === bill.id).length

    return {
      ...bill,
      upvotes,
      downvotes,
      userVote,
      commentCount,
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Bill Summaries</h1>
          <p className="text-sm text-muted-foreground">Stay informed on legislation that matters</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight">Legislative Feed</h2>
          <p className="mt-2 text-pretty text-muted-foreground">
            Browse bill summaries from federal, state, and local governments
          </p>
        </div>
        <BillFeed bills={enrichedBills} userId="guest" />
      </main>
    </div>
  )
}
