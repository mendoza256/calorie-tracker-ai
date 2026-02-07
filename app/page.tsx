"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MealInput from "@/components/MealInput";
import MealCard from "@/components/MealCard";
import DailyTotals from "@/components/DailyTotals";
import { Meal, DailyTotals as DailyTotalsType } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { getTodayDateString } from "@/lib/utils";

function HomeContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const selectedDate = dateParam || getTodayDateString();
  const isToday = selectedDate === getTodayDateString();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [totals, setTotals] = useState<DailyTotalsType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      const response = await fetch(`/api/meals?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setMeals(data.meals);
        setTotals(data.totals);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const handleMealAdded = () => {
    fetchMeals();
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      const response = await fetch("/api/meals", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        fetchMeals();
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const formattedDate = format(parseISO(selectedDate), "EEEE, MMMM d, yyyy");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isToday ? "Today's Meals" : formattedDate}
        </h1>
        {!isToday && (
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Today
          </a>
        )}
      </div>

      {isToday && <MealInput onMealAdded={handleMealAdded} />}

      {totals && <DailyTotals totals={totals} />}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Meals ({meals.length})
        </h2>
        {meals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              {isToday
                ? "No meals added yet. Add your first meal above!"
                : "No meals recorded for this day."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                onDelete={handleDeleteMeal}
                onUpdate={fetchMeals}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
