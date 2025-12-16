import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billId = searchParams.get("billId")

    if (!billId) {
      return NextResponse.json({ error: "Bill ID required" }, { status: 400 })
    }

    const billComments = await prisma.comment.findMany({
      where: {
        billId
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }) || [];

    const comments = billComments?.map((comment: any) => ({
      ...comment,
      user: {
        full_name: comment?.user?.name || "Anonymous User",
        email: comment?.user?.email || ""
      }
    }));

    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const billId = searchParams?.get("billId");

    if (!billId) {
      return NextResponse.json({ error: "Bill ID required" }, { status: 400 });
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.id) {
      return NextResponse.json({ error: "Not authorized to get content" }, { status: 401 });
    }

    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
    }

    const newComment = await prisma.comment.create({
      data: {
        userId: user.id,
        billId,
        content
      }
    })

    return NextResponse.json({ content: "Successfully created comment" }, { status: 201 });
  } catch (error) {
    console.error("COMMENT ERROR:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
