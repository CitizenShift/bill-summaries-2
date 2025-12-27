import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ bill_id: string }> }) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!user || error) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const bill_id = resolvedParams.bill_id;

        const bill = await prisma.savedBills.findUnique({
            where: {
                billId: bill_id,
            }
        });

        return NextResponse.json({ saved: !!bill }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error retrieving bill" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ bill_id: string }> }) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!user || error) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const bill_id = resolvedParams.bill_id;

        await prisma.savedBills.delete({
            where: {
                billId: bill_id,
            }
        });

        return NextResponse.json({ message: "Successfully unsaved bill" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error unsaving bill" }, { status: 500 });
    }
}