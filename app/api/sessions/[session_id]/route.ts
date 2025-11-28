import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
    try {
        const resolvedParams = await params;
        const session_id = resolvedParams.session_id;
        const response = await fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getMasterList&id=${session_id}`);

        if (!response.ok) {
            return NextResponse.json({ error: "Error fetching session information" }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error retrieving session information" }, { status: 500 });
    }
}