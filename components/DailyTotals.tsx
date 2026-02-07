'use client'

interface DailyTotalsProps {
  totals: {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFats: number
  }
}

export default function DailyTotals({ totals }: DailyTotalsProps) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <h2 className="text-xl font-bold mb-4">Daily Totals</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-90">Calories</div>
          <div className="text-2xl font-bold">
            {Math.round(totals.totalCalories)}
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-90">Protein</div>
          <div className="text-2xl font-bold">
            {Math.round(totals.totalProtein)}g
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-90">Carbs</div>
          <div className="text-2xl font-bold">
            {Math.round(totals.totalCarbs)}g
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
          <div className="text-sm opacity-90">Fats</div>
          <div className="text-2xl font-bold">
            {Math.round(totals.totalFats)}g
          </div>
        </div>
      </div>
    </div>
  )
}
