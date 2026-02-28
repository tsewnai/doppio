import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds as MM:SS */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Compute brew ratio as a string like "1:2.5" */
export function formatRatio(dose: number, yield_: number): string {
  if (dose === 0) return "—";
  return `1:${(yield_ / dose).toFixed(1)}`;
}

/** Format a date string to a relative label like "Today", "Yesterday", or locale date */
export function formatBrewDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Brew method display labels */
export const BREW_METHOD_LABELS: Record<string, string> = {
  espresso: "Espresso",
  pour_over: "Pour Over",
  aeropress: "AeroPress",
  french_press: "French Press",
};
