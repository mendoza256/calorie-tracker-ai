import { NextResponse } from "next/server";
import { getDailyTotalsByDates } from "@/lib/db";
import { subDays, format } from "date-fns";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    // Get last 7 days of totals
    const dates = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), "yyyy-MM-dd")
    );

    const totals = await getDailyTotalsByDates(dates, user.id);

    return NextResponse.json({ totals });
  } catch (error) {
    console.error("Error fetching history:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
