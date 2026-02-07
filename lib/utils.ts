import { format } from 'date-fns'

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getTodayDateString(): string {
  return formatDate(new Date())
}

// Simple user ID management (using localStorage)
// In a production app, this would be handled by proper authentication
export function getUserId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a default user ID
    return 'default-user'
  }
  
  let userId = localStorage.getItem('calorie-tracker-user-id')
  if (!userId) {
    // Generate a simple user ID
    userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('calorie-tracker-user-id', userId)
  }
  return userId
}
