"use client"

import { BillCard } from "@/components/bill-card"

interface Bill {
  id: string
  bill_number: string
  title: string
  summary: string
  level: string
  jurisdiction: string
  status: string
  policy_area: string
  introduced_date: string
  votes: Array<{ vote_type: string }>
  comments: Array<{ count: number }>
}

interface BillFeedProps {
  bills: any;
}

export function BillFeed({ bills }: BillFeedProps) {
  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No bills to display</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back later for personalized bill summaries based on your interests.
        </p>
      </div>
    )
  }

  let billsToDisplay = bills;

  if (billsToDisplay?.length > 50) {
    billsToDisplay = billsToDisplay.slice(0, 50);
  }

  return (
    <div className="space-y-6">
      {billsToDisplay.map((bill: any, index: number) => (
        <BillCard key={index} bill={bill} />
      ))}
    </div>
  )
}
