import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const billId = searchParams.get("billId");

        if (!billId) {
            return NextResponse.json({ error: "No billId" }, { status: 404 });
        }

        const votes = await prisma.vote.findMany({
            where: {
                billId
            }
        }) || [];

        return NextResponse.json({ votes });
    } catch (error) {
        return NextResponse.json({ error: "Error getting votes" });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { searchParams } = new URL(request.url);
        const billId = searchParams.get("billId");

        if (!billId) {
            return NextResponse.json({ error: "No billId" }, { status: 404 });
        }

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user?.id) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const { voteType } = await request.json();

        const createdVote = await prisma.vote.create({
            data: {
                billId,
                voteType,
                userId: user.id
            }
        });

        return NextResponse.json({ data: createdVote }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error voting" }, { status: 500 });
    }
}