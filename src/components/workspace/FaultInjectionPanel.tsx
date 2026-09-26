"use client";

import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCircuitWorkspace } from "@/context/CircuitWorkspaceContext";
import type { ActiveFault, FaultKind } from "@/types/circuitWorkspace";

function faultId(kind: FaultKind, target: string): string {
  return `${kind}:${target}`;
}

export default function FaultInjectionPanel() {
  const { inputNames, outputNames, faults, toggleFault, reset } =
    useCircuitWorkspace();

  const isActive = (kind: FaultKind, target: string) =>
    faults.some((f) => f.id === faultId(kind, target));

  const handleToggle = (kind: FaultKind, target: string) => {
    const fault: ActiveFault = {
      id: faultId(kind, target),
      kind,
      target,
    };
    toggleFault(fault);
  };

  return (
    <div className="lab-panel p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-amber-400">
            SIMULATION
          </div>
          <h2 className="text-lg font-semibold text-white">
            Fault Injection
          </h2>
        </div>
      </div>

      <p className="mb-5 text-sm leading-6 text-slate-400">
        Inject wiring faults to compare expected logic against a faulty
        observed circuit. Expected outputs stay ideal; observed outputs
        reflect the fault.
      </p>

      <div className="space-y-5">
        <section>
          <h3 className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
            Floating input
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {inputNames.map((name) => (
              <FaultChip
                key={name}
                label={`${name} float`}
                active={isActive("FLOATING_INPUT", name)}
                onClick={() => handleToggle("FLOATING_INPUT", name)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
            Output stuck LOW
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {outputNames.map((name) => (
              <FaultChip
                key={name}
                label={`${name} → 0`}
                active={isActive("OUTPUT_STUCK_LOW", name)}
                onClick={() => handleToggle("OUTPUT_STUCK_LOW", name)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
            Output stuck HIGH
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {outputNames.map((name) => (
              <FaultChip
                key={name}
                label={`${name} → 1`}
                active={isActive("OUTPUT_STUCK_HIGH", name)}
                onClick={() => handleToggle("OUTPUT_STUCK_HIGH", name)}
              />
            ))}
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={reset}
        className="mt-6 w-full rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-slate-300 transition hover:border-primary/30 hover:text-white"
      >
        Reset experiment
      </button>
    </div>
  );
}

function FaultChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 lab-mono text-[10px] uppercase tracking-wide transition",
        active
          ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
          : "border-slate-700/40 bg-surface-low text-slate-400 hover:border-slate-600/50 hover:text-slate-200",
      )}
    >
      {label}
    </button>
  );
}
