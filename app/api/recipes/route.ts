import { NextRequest, NextResponse } from "next/server";
import {
  getRecipesByUserId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipeById,
} from "@/lib/db";
import { AuthError, requireAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const recipes = await getRecipesByUserId(user.id);

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { name, description, calories, protein, carbs, fats } =
      await request.json();

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
      userId: user.id,
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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { id, name } = await request.json();

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

    const recipe = await updateRecipe(id, user.id, { name: name.trim() });

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Recipe not found") {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update recipe" },
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
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    await deleteRecipe(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "Recipe not found") {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
