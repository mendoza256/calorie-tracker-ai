import { NextRequest, NextResponse } from "next/server";
import {
  getMealsByDate,
  getMealById,
  deleteMeal,
  updateMeal,
  getDailyTotalsByDate,
  upsertDailyTotals,
} from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || getTodayDateString();

    const meals = await getMealsByDate(date, user.id);
    const totals = await getDailyTotalsByDate(date, user.id);

    return NextResponse.json({
      meals,
      totals: totals || {
        date,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching meals:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { id, mealType } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Meal ID is required" },
        { status: 400 }
      );
    }

    if (
      !mealType ||
      !["breakfast", "lunch", "dinner", "snack"].includes(mealType)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid meal type is required (breakfast, lunch, dinner, or snack)",
        },
        { status: 400 }
      );
    }

    // Get the meal to verify it exists and belongs to the user
    const meal = await getMealById(id, user.id);

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Update the meal
    await updateMeal(id, user.id, { mealType });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating meal:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Meal ID is required" },
        { status: 400 }
      );
    }

    // Get the meal to know which date to update
    const meal = await getMealById(id, user.id);

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Delete the meal
    await deleteMeal(id, user.id);

    // Recalculate daily totals
    const remainingMeals = await getMealsByDate(meal.date, user.id);

    const newTotals = remainingMeals.reduce(
      (acc, m) => ({
        totalCalories: acc.totalCalories + m.calories,
        totalProtein: acc.totalProtein + m.protein,
        totalCarbs: acc.totalCarbs + m.carbs,
        totalFats: acc.totalFats + m.fats,
      }),
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      }
    );

    await upsertDailyTotals({
      userId: user.id,
      date: meal.date,
      ...newTotals,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
