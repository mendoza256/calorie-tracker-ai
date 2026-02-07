"use client";

import { useState, useEffect } from "react";
import { Meal, MealType } from "@/lib/types";
import { getUserId } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
  onUpdate?: () => void;
}

export default function MealCard({ meal, onDelete, onUpdate }: MealCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState<MealType>(meal.mealType);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCreateRecipe, setShowCreateRecipe] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);

  // Update selectedType when meal prop changes
  useEffect(() => {
    setSelectedType(meal.mealType);
  }, [meal.mealType]);

  // Handle escape key to cancel editing
  useEffect(() => {
    if (!isEditingType) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedType(meal.mealType);
        setIsEditingType(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isEditingType, meal.mealType]);

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(meal.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleTypeChange = async (newType: MealType) => {
    if (newType === meal.mealType) {
      setIsEditingType(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/meals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: meal.id, mealType: newType }),
      });

      if (response.ok) {
        setSelectedType(newType);
        setIsEditingType(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update meal type");
        setSelectedType(meal.mealType);
      }
    } catch (error) {
      console.error("Error updating meal type:", error);
      alert("Failed to update meal type");
      setSelectedType(meal.mealType);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateRecipe = async () => {
    if (!recipeName.trim()) {
      alert("Please enter a recipe name");
      return;
    }

    setIsCreatingRecipe(true);
    try {
      const userId = getUserId();
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: recipeName.trim(),
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          userId,
        }),
      });

      if (response.ok) {
        setShowCreateRecipe(false);
        setRecipeName("");
        alert("Recipe created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create recipe");
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe");
    } finally {
      setIsCreatingRecipe(false);
    }
  };

  const mealTypeColors = {
    breakfast: "bg-orange-100 text-orange-800",
    lunch: "bg-blue-100 text-blue-800",
    dinner: "bg-purple-100 text-purple-800",
    snack: "bg-green-100 text-green-800",
  };

  const mealTypeLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            {isEditingType ? (
              <div className="flex items-center gap-1">
                <select
                  value={selectedType}
                  onChange={(e) => {
                    const newType = e.target.value as MealType;
                    setSelectedType(newType);
                    handleTypeChange(newType);
                  }}
                  disabled={isUpdating}
                  className={`px-2 py-1 rounded text-xs font-semibold border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${mealTypeColors[selectedType]}`}
                  autoFocus
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedType(meal.mealType);
                    setIsEditingType(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xs px-1"
                  title="Cancel (or press Escape)"
                  disabled={isUpdating}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingType(true)}
                className={`px-2 py-1 rounded text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer ${mealTypeColors[meal.mealType]}`}
                title="Click to edit meal type"
              >
                {mealTypeLabels[meal.mealType]}
              </button>
            )}
          </div>
          <p className="text-gray-800 font-medium">
            {meal.description}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {showCreateRecipe ? (
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200">
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Recipe name..."
                className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateRecipe();
                  } else if (e.key === "Escape") {
                    setShowCreateRecipe(false);
                    setRecipeName("");
                  }
                }}
                disabled={isCreatingRecipe}
              />
              <button
                onClick={handleCreateRecipe}
                disabled={isCreatingRecipe || !recipeName.trim()}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold px-2 py-1 bg-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRecipe ? "Creating..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setShowCreateRecipe(false);
                  setRecipeName("");
                }}
                className="text-gray-600 hover:text-gray-800 text-sm font-semibold px-2 py-1"
                disabled={isCreatingRecipe}
              >
                ✕
              </button>
            </div>
          ) : showConfirm ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-semibold px-2 py-1 bg-red-50 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-gray-600 hover:text-gray-800 text-sm font-semibold px-2 py-1 bg-gray-50 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowCreateRecipe(true)}
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold transition-colors"
                title="Create recipe from this meal"
              >
                Create Recipe
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 rounded p-2">
          <span className="text-gray-500 text-xs block mb-1">Calories</span>
          <p className="font-bold text-gray-800 text-lg">
            {Math.round(meal.calories)}
          </p>
        </div>
        <div className="bg-blue-50 rounded p-2">
          <span className="text-blue-600 text-xs block mb-1">Protein</span>
          <p className="font-bold text-blue-700 text-lg">
            {Math.round(meal.protein)}g
          </p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <span className="text-green-600 text-xs block mb-1">Carbs</span>
          <p className="font-bold text-green-700 text-lg">
            {Math.round(meal.carbs)}g
          </p>
        </div>
        <div className="bg-yellow-50 rounded p-2">
          <span className="text-yellow-600 text-xs block mb-1">Fats</span>
          <p className="font-bold text-yellow-700 text-lg">
            {Math.round(meal.fats)}g
          </p>
        </div>
      </div>
    </div>
  );
}
