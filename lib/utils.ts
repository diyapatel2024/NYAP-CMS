import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split("T")[0]
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

// Parse an API error payload into a readable message.
// Handles plain strings and zod fieldErrors objects: { field: string[] }
export function parseApiError(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "string") return error
  if (error && typeof error === "object") {
    const messages = Object.values(error as Record<string, string[] | undefined>)
      .flat()
      .filter(Boolean)
    if (messages.length) return messages.join(", ")
  }
  return fallback
}
