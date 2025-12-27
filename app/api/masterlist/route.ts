import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const state = searchParams.get("state") || "FL";

        const response_state = await fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getMasterList&state=${state}`);
        const response_federal  = await fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getMasterList&state=US`);

        if (!response_state.ok || !response_federal.ok) {
            return NextResponse.json({ error: "Failed to get bills" }, { status: 500 });
        }

        const state_data = await response_state.json();
        const federal_data = await response_federal.json();

        return NextResponse.json({ data: { federal: federal_data, state: state_data } }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error retrieving masterlist" });
    }
}