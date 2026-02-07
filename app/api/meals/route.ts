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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || getTodayDateString();

    const meals = await getMealsByDate(date);
    const totals = await getDailyTotalsByDate(date);

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
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, mealType } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Meal ID is required" },
        { status: 400 }
      );
    }

    if (!mealType || !["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
      return NextResponse.json(
        { error: "Valid meal type is required (breakfast, lunch, dinner, or snack)" },
        { status: 400 }
      );
    }

    // Get the meal to verify it exists
    const meal = await getMealById(id);

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Update the meal
    await updateMeal(id, { mealType });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Meal ID is required" },
        { status: 400 }
      );
    }

    // Get the meal to know which date to update
    const meal = await getMealById(id);

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Delete the meal
    await deleteMeal(id);

    // Recalculate daily totals
    const remainingMeals = await getMealsByDate(meal.date);

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
      date: meal.date,
      ...newTotals,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
