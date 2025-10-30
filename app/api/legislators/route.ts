import { type NextRequest, NextResponse } from "next/server"
import { mockLegislators, mockBillLegislators } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billId = searchParams.get("billId")

    if (!billId) {
      return NextResponse.json({ error: "Bill ID required" }, { status: 400 })
    }

    const billLegislatorLinks = mockBillLegislators.filter((bl) => bl.bill_id === billId)

    const legislators = billLegislatorLinks.map((link) => {
      const legislator = mockLegislators.find((l) => l.id === link.legislator_id)
      return {
        ...legislator,
        role: link.role,
      }
    })

    return NextResponse.json({ legislators })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get legislators" }, { status: 500 })
  }
}
