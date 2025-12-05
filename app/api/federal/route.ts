import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=search&state=US`);

        if (!response.ok) {
            return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
        }

        const data = await response.json();

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}