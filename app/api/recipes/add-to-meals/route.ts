import { NextRequest, NextResponse } from "next/server";
import {
  getRecipeById,
  createMeal,
  getDailyTotalsByDate,
  upsertDailyTotals,
} from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";
import { requireAuthenticatedUser } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { recipeId, mealType } = await request.json();

    if (!recipeId) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
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

    // Get the recipe
    const recipe = await getRecipeById(recipeId, user.id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Create a meal entry for today with the recipe's nutritional values
    const date = getTodayDateString();
    const meal = await createMeal({
      userId: user.id,
      date,
      description: recipe.name,
      mealType,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
    });

    // Update daily totals
    const existingTotals = await getDailyTotalsByDate(date, user.id);

    if (existingTotals) {
      await upsertDailyTotals({
        userId: user.id,
        date,
        totalCalories: existingTotals.totalCalories + recipe.calories,
        totalProtein: existingTotals.totalProtein + recipe.protein,
        totalCarbs: existingTotals.totalCarbs + recipe.carbs,
        totalFats: existingTotals.totalFats + recipe.fats,
      });
    } else {
      await upsertDailyTotals({
        userId: user.id,
        date,
        totalCalories: recipe.calories,
        totalProtein: recipe.protein,
        totalCarbs: recipe.carbs,
        totalFats: recipe.fats,
      });
    }

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Error adding recipe to meals:", error);
    return NextResponse.json(
      { error: "Failed to add recipe to meals" },
      { status: 500 }
    );
  }
}
