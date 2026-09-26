"use client";

import { cn } from "@/lib/utils";
import { useCircuitWorkspace } from "@/context/CircuitWorkspaceContext";

export default function ExpectedObservedPanel() {
  const {
    expectedOutputs,
    observedOutputs,
    outputNames,
    allOutputsPass,
  } = useCircuitWorkspace();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="lab-panel-low p-4">
        <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Expected
        </div>
        <ul className="mt-3 space-y-2">
          {outputNames.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between lab-mono text-sm text-slate-200"
            >
              <span>{name}</span>
              <span className="text-primary">{expectedOutputs[name]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lab-panel-low p-4">
        <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Observed
        </div>
        <ul className="mt-3 space-y-2">
          {outputNames.map((name) => {
            const match = expectedOutputs[name] === observedOutputs[name];
            return (
              <li
                key={name}
                className="flex items-center justify-between lab-mono text-sm"
              >
                <span className="text-slate-200">{name}</span>
                <span className={match ? "text-emerald-400" : "text-danger"}>
                  {observedOutputs[name]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={cn(
          "md:col-span-2 rounded-lg border px-4 py-3 text-center lab-mono text-xs uppercase tracking-[0.2em]",
          allOutputsPass
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
            : "border-danger/25 bg-danger/10 text-danger",
        )}
      >
        Status · {allOutputsPass ? "PASS" : "MISMATCH"}
      </div>
    </div>
  );
}
