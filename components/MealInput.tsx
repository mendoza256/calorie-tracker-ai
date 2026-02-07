"use client";

import { useState } from "react";
import { MealType } from "@/lib/types";
import RecipeModal from "./RecipeModal";

interface MealInputProps {
  onMealAdded: () => void;
}

export default function MealInput({ onMealAdded }: MealInputProps) {
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/parse-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description, mealType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to parse meal");
      }

      setDescription("");
      setMealType("breakfast");
      onMealAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecipe = async (
    recipeId: string,
    selectedMealType: MealType
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recipes/add-to-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId, mealType: selectedMealType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add recipe to meals");
      }

      setShowRecipeModal(false);
      onMealAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Don't close modal on error so user can try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            disabled={loading}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., 100g of Magerquark with 30g whey and 10 almonds"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Adding..." : "Add Meal"}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </form>
      <div className="mb-6">
        <button
          onClick={() => setShowRecipeModal(true)}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Add from Recipes
        </button>
      </div>
      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onSelectRecipe={handleSelectRecipe}
      />
    </>
  );
}
