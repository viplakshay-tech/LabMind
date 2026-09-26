"use client";

import { cn } from "@/lib/utils";

interface LogicSwitchProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function LogicSwitch({
  label,
  value,
  onChange,
  disabled = false,
}: LogicSwitchProps) {
  const isHigh = value === 1;

  return (
    <div className="lab-panel-low p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="lab-mono text-xs font-medium text-slate-200">
          {label}
        </span>
        <span
          className={cn(
            "lab-mono rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wider",
            isHigh
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-slate-600/40 bg-surface-low text-slate-500",
          )}
        >
          {isHigh ? "1 · HIGH" : "0 · LOW"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(0)}
          className={cn(
            "rounded-lg border px-3 py-4 text-sm font-semibold transition",
            !isHigh
              ? "border-slate-500/50 bg-surface-high text-white shadow-inner"
              : "border-slate-700/40 bg-surface-low text-slate-500 hover:border-slate-600/50 hover:text-slate-300",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          OFF
          <span className="mt-1 block lab-mono text-[10px] font-normal text-slate-500">
            0 V
          </span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(1)}
          className={cn(
            "rounded-lg border px-3 py-4 text-sm font-semibold transition",
            isHigh
              ? "border-primary/40 bg-primary/15 text-primary lab-glow-cyan"
              : "border-slate-700/40 bg-surface-low text-slate-500 hover:border-primary/20 hover:text-slate-300",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          ON
          <span className="mt-1 block lab-mono text-[10px] font-normal opacity-80">
            5 V
          </span>
        </button>
      </div>
    </div>
  );
}
