import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { cn, formatTime } from "~/lib/utils";
import { Pause, Play, RotateCcw, Flag } from "lucide-react";

interface Lap {
  label: string;
  splitSec: number;
  totalSec: number;
}

interface BrewTimerProps {
  /** Called whenever the elapsed seconds changes (for controlled use) */
  onTick?: (seconds: number) => void;
  /** Optional label shown above the timer */
  label?: string;
  /** Whether to show lap button (for pour-over stages) */
  showLaps?: boolean;
  className?: string;
}

export function BrewTimer({
  onTick,
  label,
  showLaps = false,
  className,
}: BrewTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTimeRef.current !== null) {
      accumulatedRef.current += Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      startTimeRef.current = null;
    }
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setRunning(true);
    intervalRef.current = setInterval(() => {
      const secs = accumulatedRef.current + Math.floor(
        (Date.now() - (startTimeRef.current ?? Date.now())) / 1000
      );
      setElapsed(secs);
      onTick?.(secs);
    }, 500);
  }, [onTick]);

  const reset = useCallback(() => {
    stop();
    accumulatedRef.current = 0;
    setElapsed(0);
    setLaps([]);
    onTick?.(0);
  }, [stop, onTick]);

  const addLap = useCallback(() => {
    const lastTotal = laps[laps.length - 1]?.totalSec ?? 0;
    setLaps((prev) => [
      ...prev,
      {
        label: `Stage ${prev.length + 1}`,
        splitSec: elapsed - lastTotal,
        totalSec: elapsed,
      },
    ]);
  }, [elapsed, laps]);

  // Clean up on unmount
  useEffect(() => () => stop(), [stop]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {label && (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      )}

      {/* Timer display */}
      <div
        className={cn(
          "rounded-2xl border bg-card px-8 py-6 text-center tabular-nums",
          running && "border-primary/50 ring-2 ring-primary/20"
        )}
      >
        <span className="text-5xl font-bold tracking-tight">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={reset}
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          size="lg"
          onClick={running ? stop : start}
          className="min-w-[100px]"
        >
          {running ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {elapsed === 0 ? "Start" : "Resume"}
            </>
          )}
        </Button>

        {showLaps && (
          <Button
            variant="outline"
            size="icon"
            onClick={addLap}
            disabled={!running && elapsed === 0}
            title="Lap"
          >
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lap list */}
      {laps.length > 0 && (
        <div className="w-full space-y-1 text-sm">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between rounded-md bg-muted px-3 py-1.5">
              <span className="text-muted-foreground">{lap.label}</span>
              <span className="font-medium">{formatTime(lap.splitSec)}</span>
              <span className="text-muted-foreground">{formatTime(lap.totalSec)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
