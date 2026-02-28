import { cn } from "~/lib/utils";

interface RatioDisplayProps {
  doseG: number;
  yieldG: number;
  className?: string;
}

export function RatioDisplay({ doseG, yieldG, className }: RatioDisplayProps) {
  const ratio = doseG > 0 ? yieldG / doseG : 0;

  // Target espresso ratio is typically 1:2 – 1:3; colour-code accordingly
  const ratioClass =
    ratio < 1.5
      ? "text-yellow-600 dark:text-yellow-400" // under-extracted (too ristretto)
      : ratio > 3.5
      ? "text-blue-600 dark:text-blue-400"    // over-extracted (too lungo)
      : "text-green-600 dark:text-green-400"; // in the sweet spot

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card p-3",
        className
      )}
    >
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">Dose</p>
        <p className="text-lg font-semibold">{doseG > 0 ? `${doseG}g` : "—"}</p>
      </div>

      {/* Visual bar */}
      <div className="flex flex-col items-center gap-1 px-2">
        <div className="h-2 rounded-full bg-primary" style={{ width: "24px" }} />
        <div
          className="h-2 rounded-full bg-primary/50"
          style={{ width: `${Math.min(ratio * 24, 96)}px`, minWidth: "8px" }}
        />
      </div>

      <div className="flex-1 text-right">
        <p className="text-xs text-muted-foreground">Yield</p>
        <p className="text-lg font-semibold">{yieldG > 0 ? `${yieldG}g` : "—"}</p>
      </div>

      <div className="border-l pl-3 ml-1 text-center">
        <p className="text-xs text-muted-foreground">Ratio</p>
        <p className={cn("text-lg font-bold", ratioClass)}>
          {doseG > 0 && yieldG > 0 ? `1:${ratio.toFixed(1)}` : "—"}
        </p>
      </div>
    </div>
  );
}
