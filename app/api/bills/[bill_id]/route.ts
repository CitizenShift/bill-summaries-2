import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ bill_id: string }> }) {
    try {
        const resolvedParams = await params;
        const bill_id = resolvedParams.bill_id;
        const response = await fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getBill&id=${bill_id}`);

        if (!response.ok) {
            return NextResponse.json({ error: "Error fetching bill information" }, { status: 500 });
        }

        const data = await response.json();

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching bill data" }, { status: 500 });
    }
}