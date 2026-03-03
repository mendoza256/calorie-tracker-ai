import { NextRequest, NextResponse } from "next/server";
import {
  createMeal,
  getDailyTotalsByDate,
  upsertDailyTotals,
} from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth-helpers";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();

    const mealType = body.mealType;
    if (
      !mealType ||
      !MEAL_TYPES.includes(mealType)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid meal type is required (breakfast, lunch, dinner, or snack)",
        },
        { status: 400 }
      );
    }

    const calories = Number(body.calories);
    const protein = Number(body.protein);
    const carbs = Number(body.carbs);
    const fats = Number(body.fats);

    if (
      !Number.isFinite(calories) ||
      !Number.isFinite(protein) ||
      !Number.isFinite(carbs) ||
      !Number.isFinite(fats)
    ) {
      return NextResponse.json(
        { error: "Calories, fat, protein, and carbs must be valid numbers" },
        { status: 400 }
      );
    }

    if (calories < 0 || protein < 0 || carbs < 0 || fats < 0) {
      return NextResponse.json(
        { error: "Values cannot be negative" },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : "Manual entry";

    const date = getTodayDateString();
    const meal = await createMeal({
      userId: user.id,
      date,
      description,
      mealType,
      calories,
      protein,
      carbs,
      fats,
    });

    const existingTotals = await getDailyTotalsByDate(date, user.id);

    if (existingTotals) {
      await upsertDailyTotals({
        userId: user.id,
        date,
        totalCalories: existingTotals.totalCalories + calories,
        totalProtein: existingTotals.totalProtein + protein,
        totalCarbs: existingTotals.totalCarbs + carbs,
        totalFats: existingTotals.totalFats + fats,
      });
    } else {
      await upsertDailyTotals({
        userId: user.id,
        date,
        totalCalories: calories,
        totalProtein: protein,
        totalCarbs: carbs,
        totalFats: fats,
      });
    }

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Error adding manual meal:", error);
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to add manual meal" },
      { status: 500 }
    );
  }
}
