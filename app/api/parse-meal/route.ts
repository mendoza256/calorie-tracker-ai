import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { createMeal, getDailyTotalsByDate, upsertDailyTotals } from "@/lib/db";
import { getTodayDateString } from "@/lib/utils";

interface ParsedMeal {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export async function POST(request: NextRequest) {
  try {
    const { description, mealType } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Meal description is required" },
        { status: 400 }
      );
    }

    if (!mealType || !["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
      return NextResponse.json(
        { error: "Valid meal type is required (breakfast, lunch, dinner, or snack)" },
        { status: 400 }
      );
    }

    // Call OpenAI API with structured output
    // Use GPT-4o for best results, fallback to gpt-3.5-turbo if needed
    const model = process.env.OPENAI_MODEL || "gpt-4o";
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert. Parse meal descriptions and extract nutritional information.
Return ONLY a valid JSON object with the following structure:
{
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fats": number (in grams)
}

Be accurate and realistic. If quantities are specified (like "100g"), use those. If not, estimate reasonable portions.
For example:
- "100g of Magerquark" might be ~60 calories, 12g protein, 3g carbs, 0g fat
- "30g whey protein" might be ~110 calories, 25g protein, 2g carbs, 1g fat
- "10 almonds" might be ~70 calories, 2.5g protein, 2.5g carbs, 6g fat

Return ONLY the JSON, no other text.`,
        },
        {
          role: "user",
          content: `Parse this meal description and return nutritional values: "${description}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsedMeal: ParsedMeal = JSON.parse(content);

    // Validate the response
    if (
      typeof parsedMeal.calories !== "number" ||
      typeof parsedMeal.protein !== "number" ||
      typeof parsedMeal.carbs !== "number" ||
      typeof parsedMeal.fats !== "number"
    ) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Save to database
    const date = getTodayDateString();
    const meal = await createMeal({
      date,
      description,
      mealType,
      calories: parsedMeal.calories,
      protein: parsedMeal.protein,
      carbs: parsedMeal.carbs,
      fats: parsedMeal.fats,
    });

    // Update daily totals
    const existingTotals = await getDailyTotalsByDate(date);

    if (existingTotals) {
      await upsertDailyTotals({
        date,
        totalCalories: existingTotals.totalCalories + parsedMeal.calories,
        totalProtein: existingTotals.totalProtein + parsedMeal.protein,
        totalCarbs: existingTotals.totalCarbs + parsedMeal.carbs,
        totalFats: existingTotals.totalFats + parsedMeal.fats,
      });
    } else {
      await upsertDailyTotals({
        date,
        totalCalories: parsedMeal.calories,
        totalProtein: parsedMeal.protein,
        totalCarbs: parsedMeal.carbs,
        totalFats: parsedMeal.fats,
      });
    }

    return NextResponse.json({ meal });
  } catch (error) {
    console.error("Error parsing meal:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse meal description",
      },
      { status: 500 }
    );
  }
}
