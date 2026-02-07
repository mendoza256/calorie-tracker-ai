"use client";

import { useEffect, useState } from "react";
import { DailyTotals } from "@/lib/types";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default function HistoryPage() {
  const [totals, setTotals] = useState<DailyTotals[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/history");
        if (response.ok) {
          const data = await response.json();
          setTotals(data.totals);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Last 7 Days</h1>

      {totals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No history available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {totals.map((day) => (
            <Link
              key={day.id}
              href={`/?date=${day.date}`}
              className="block bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {format(parseISO(day.date), "EEEE, MMMM d, yyyy")}
                </h2>
                {day.date === format(new Date(), "yyyy-MM-dd") && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Today
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Calories</div>
                  <div className="text-lg font-bold text-gray-800">
                    {Math.round(day.totalCalories)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Protein</div>
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(day.totalProtein)}g
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Carbs</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(day.totalCarbs)}g
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Fats</div>
                  <div className="text-lg font-bold text-yellow-600">
                    {Math.round(day.totalFats)}g
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
