import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user?.id) {
            return NextResponse.json({ error: "Not authorized." }, { status: 401 });
        }

        const { id } = params;

        await prisma.comment.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: "Deleted comment successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error deleting comment" },
            { status: 500 }
        );
    }
}