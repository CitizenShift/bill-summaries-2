import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user || error) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
      }

      const savedBills = await prisma.savedBills.findMany({
          where: {
              userId: user.id,
          }
      }) || [];

      const billIds = savedBills?.map((bill: any) => bill?.billId);

      const requests = billIds?.map((bill_id: any) => fetch(`https://api.legiscan.com/?key=${process.env.LEGISCAN_API_KEY}&op=getBill&id=${bill_id}`).then(res => res.json()));
      const responses = await Promise.all(requests);
      const actualBills = responses?.map((res: any, index: number) => ({ ...res?.bill, savedDate: savedBills?.[index]?.createdAt })) || [];

      return NextResponse.json({ savedBills: actualBills }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Error getting saved bills" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!user || error) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const billId = searchParams?.get("billId");

        if (!billId) {
            return NextResponse.json({ error: "No billId" }, { status: 400 });
        }

        const existingBill = await prisma.savedBills.findUnique({
            where: {
                billId
            }
        });

        if (existingBill) {
            return NextResponse.json({ error: "Bill already saved" }, { status: 409 });
        }

        const savedBill = await prisma.savedBills.create({
            data: {
                userId: user.id,
                billId
            }
        });

        return NextResponse.json({ message: "Created bill successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Error saving bill" }, { status: 500 });
    }
}
