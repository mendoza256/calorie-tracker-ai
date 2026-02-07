import { NextResponse } from "next/server";
import { getDailyTotalsByDates } from "@/lib/db";
import { subDays, format } from "date-fns";

export async function GET() {
  try {
    // Get last 7 days of totals
    const dates = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), "yyyy-MM-dd")
    );

    const totals = await getDailyTotalsByDates(dates);

    return NextResponse.json({ totals });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
