"use client";

import { cn } from "@/lib/utils";
import { logicToVoltage } from "@/lib/logic";

interface OutputStatusCardProps {
  name: string;
  expected: number;
  observed: number;
}

export default function OutputStatusCard({
  name,
  expected,
  observed,
}: OutputStatusCardProps) {
  const pass = expected === observed;
  const displayBit = observed;

  return (
    <div className="lab-panel-low p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
            Output
          </div>
          <div className="mt-1 text-sm font-semibold text-white">{name}</div>
        </div>

        <span
          className={cn(
            "lab-mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider",
            pass
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-danger/30 bg-danger/10 text-danger",
          )}
        >
          {pass ? "PASS" : "MISMATCH"}
        </span>
      </div>

      <div className="mt-4 flex items-end gap-4">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl border lab-mono text-2xl font-bold",
            displayBit === 1
              ? "border-primary/35 bg-primary/15 text-primary"
              : "border-slate-600/40 bg-surface-low text-slate-400",
          )}
        >
          {displayBit}
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Observed level
          </div>
          <div className="mt-1 lab-mono text-xs text-slate-300">
            {logicToVoltage(displayBit as 0 | 1)}
          </div>
          {!pass && (
            <div className="mt-1 lab-mono text-[10px] text-danger">
              Expected {expected}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
