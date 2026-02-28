import React, { useState } from "react";
import { cn } from "~/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  className?: string;
  name?: string;
}

export function RatingInput({
  value,
  onChange,
  max = 10,
  className,
  name,
}: RatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-1" role="group" aria-label="Rating">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(n === value ? 0 : n)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
              n <= display
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label={`Rate ${n} out of ${max}`}
            aria-pressed={n === value}
          >
            {n}
          </button>
        ))}
      </div>
      {name && <input type="hidden" name={name} value={value} />}
      <p className="text-xs text-muted-foreground">
        {value === 0
          ? "No rating"
          : value <= 3
          ? "Under-extracted / unpleasant"
          : value <= 5
          ? "Below expectations"
          : value <= 7
          ? "Good"
          : value <= 9
          ? "Great"
          : "Perfect"}
      </p>
    </div>
  );
}
