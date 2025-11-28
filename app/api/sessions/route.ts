import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getSessionList&state=FL`);

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to get sessions" }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to get sessions" }, { status: 500 });
    }
}