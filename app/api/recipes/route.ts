import { NextRequest, NextResponse } from "next/server";
import {
  getRecipesByUserId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
} from "@/lib/db";
import { getUserId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || getUserId();

    const recipes = await getRecipesByUserId(userId);

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, calories, protein, carbs, fats, userId: providedUserId } =
      await request.json();

    const userId = providedUserId || getUserId();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Recipe name is required" },
        { status: 400 }
      );
    }

    if (
      typeof calories !== "number" ||
      typeof protein !== "number" ||
      typeof carbs !== "number" ||
      typeof fats !== "number"
    ) {
      return NextResponse.json(
        { error: "All nutritional values are required" },
        { status: 400 }
      );
    }

    const recipe = await createRecipe({
      userId,
      name: name.trim(),
      description: description || "",
      calories,
      protein,
      carbs,
      fats,
    });

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, name, userId: providedUserId } = await request.json();

    const userId = providedUserId || getUserId();

    if (!id) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Recipe name is required" },
        { status: 400 }
      );
    }

    const recipe = await updateRecipe(id, userId, { name: name.trim() });

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    if (error instanceof Error && error.message === "Recipe not found") {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id, userId: providedUserId } = await request.json();

    const userId = providedUserId || getUserId();

    if (!id) {
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    await deleteRecipe(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    if (error instanceof Error && error.message === "Recipe not found") {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
