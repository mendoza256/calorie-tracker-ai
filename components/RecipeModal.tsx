"use client";

import { useState, useEffect } from "react";
import { Recipe, MealType } from "@/lib/types";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipeId: string, mealType: MealType) => void;
}

export default function RecipeModal({
  isOpen,
  onClose,
  onSelectRecipe,
}: RecipeModalProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedMealType, setSelectedMealType] =
    useState<MealType>("breakfast");

  const redirectToLogin = () => {
    const path = window.location.pathname + window.location.search;
    window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
    }
  }, [isOpen]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recipes`);
      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const response = await fetch("/api/recipes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (response.ok) {
        fetchRecipes();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe");
    }
  };

  const handleUpdateRecipe = async (id: string) => {
    if (!editName.trim()) {
      alert("Recipe name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/recipes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, name: editName.trim() }),
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }
      if (response.ok) {
        setEditingId(null);
        setEditName("");
        fetchRecipes();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Failed to update recipe");
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading recipes...
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? "No recipes found matching your search."
                : "No recipes yet. Create your first recipe from a meal!"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {editingId === recipe.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateRecipe(recipe.id);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                            setEditName("");
                          }
                        }}
                      />
                      <button
                        onClick={() => handleUpdateRecipe(recipe.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                        }}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {recipe.name}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{Math.round(recipe.calories)} cal</span>
                          <span>{Math.round(recipe.protein)}g protein</span>
                          <span>{Math.round(recipe.carbs)}g carbs</span>
                          <span>{Math.round(recipe.fats)}g fats</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecipe(recipe.id, selectedMealType);
                          }}
                          className="px-3 py-1 text-sm bg-green-600 text-white hover:bg-green-700 rounded font-medium"
                        >
                          Add to Meals
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(recipe.id);
                            setEditName(recipe.name);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecipe(recipe.id);
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Default Meal Type:
            </label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value as MealType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Close
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Click "Add to Meals" on any recipe to add it to today's meals with
            the selected meal type.
          </div>
        </div>
      </div>
    </div>
  );
}
