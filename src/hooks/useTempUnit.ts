import { useEffect, useState } from "react";
import { type TempUnit } from "~/lib/utils";

const STORAGE_KEY = "doppio:tempUnit";

export function useTempUnit() {
  const [unit, setUnit] = useState<TempUnit>("C");

  // Read from localStorage once on mount (runs client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "C" || stored === "F") setUnit(stored);
  }, []);

  function toggle() {
    const next: TempUnit = unit === "C" ? "F" : "C";
    setUnit(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return { unit, toggle };
}
