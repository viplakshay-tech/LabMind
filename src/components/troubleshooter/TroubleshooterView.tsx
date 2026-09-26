"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  RefreshCw,
  Stethoscope,
} from "lucide-react";

import AIDiagnosticPanel from "@/components/troubleshooter/AIDiagnosticPanel";
import BayesianRankCard from "@/components/troubleshooter/BayesianRankCard";
import { analyzeDiagnosticState } from "@/lib/diagnosticEngine";
import { loadTroubleshooterSnapshotFromSession } from "@/lib/troubleshooterState";
import { experiments } from "@/data/experimentsData";
import { cn } from "@/lib/utils";

import type {
  DiagnosticChecklistStep,
  DiagnosticResult,
  DiagnosticSeverity,
} from "@/types/diagnostic";

import type { Experiment } from "@/types/experiment";

const severityStyles: Record<
  DiagnosticSeverity,
  { label: string; className: string }
> = {
  INFO: {
    label: "Nominal",
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  WARNING: {
    label: "Warning",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  ERROR: {
    label: "Fault",
    className: "border-danger/30 bg-danger/10 text-danger",
  },
  CRITICAL: {
    label: "Critical",
    className: "border-rose-500/40 bg-rose-500/15 text-rose-300",
  },
};

function EmptyState() {
  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10">
          <Stethoscope className="h-8 w-8 text-violet-300" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-white">
          No workspace state to diagnose
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Open a Live Experiment Workspace, set your inputs, then choose{" "}
          <span className="lab-mono text-primary">
            Diagnose This State
          </span>{" "}
          to capture the current vector here.
        </p>

        <Link
          href="/experiments"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
        >
          <FlaskConical className="h-4 w-4" />
          Open Experiment Library
        </Link>
      </div>
    </section>
  );
}

export default function TroubleshooterView() {
  const [checklist, setChecklist] = useState<DiagnosticChecklistStep[]>([]);
  const [loadTick, setLoadTick] = useState(0);

  const {
    result,
    workspaceHref,
    experiment,
  }: {
    result: DiagnosticResult | null;
    workspaceHref: string | null;
    experiment: Experiment | null;
  } = useMemo(() => {
    const snapshot = loadTroubleshooterSnapshotFromSession();

    if (!snapshot) {
      return {
        result: null,
        workspaceHref: null,
        experiment: null,
      };
    }

    const matchedExperiment = experiments.find(
      (item) => item.id === snapshot.experimentId,
    );

    if (!matchedExperiment) {
      return {
        result: null,
        workspaceHref: null,
        experiment: null,
      };
    }

    const diagnostic = analyzeDiagnosticState({
      snapshot,
      experiment: matchedExperiment,
    });

    return {
      result: diagnostic,
      workspaceHref: `/experiments/${snapshot.experimentId}/workspace`,
      experiment: matchedExperiment,
    };
  }, [loadTick]);

  useEffect(() => {
    if (result) {
      setChecklist(
        result.checklistSteps.map((step) => ({
          ...step,
        })),
      );
    } else {
      setChecklist([]);
    }
  }, [result]);

  const toggleStep = useCallback((id: number) => {
    setChecklist((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              completed: !step.completed,
            }
          : step,
      ),
    );
  }, []);

  const completedCount = checklist.filter(
    (step) => step.completed,
  ).length;

  const handleReRun = useCallback(() => {
    setLoadTick((n) => n + 1);
  }, []);

  if (!result || !workspaceHref || !experiment) {
    return <EmptyState />;
  }

  const sev = severityStyles[result.severity];
  const statusPass = result.overallStatus === "PASS";

  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={workspaceHref}
          className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Workspace
        </Link>

        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                AI DIAGNOSTIC · SOFTWARE REASONING
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Context-Aware Troubleshooter
              </h1>

              <p className="mt-2 text-lg text-slate-200">
                {result.experimentTitle}
              </p>

              <p className="lab-mono mt-1 text-xs text-primary">
                {result.experimentCode}
              </p>
            </div>

            <div className="space-y-2">
              <div
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 lab-mono text-[10px] uppercase tracking-wider",
                  sev.className,
                )}
              >
                {sev.label} · {result.severity}
              </div>

              <div className="lab-panel-low px-4 py-3">
                <div className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Current vector
                </div>

                <div className="mt-1 lab-mono text-xs text-slate-200">
                  {result.stimulusVector}
                </div>

                <div className="mt-2 lab-mono text-[10px] text-slate-600">
                  Confidence {result.confidenceScore}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="lab-panel p-6">
              <div className="mb-4 lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Expected vs observed
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="lab-panel-low p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Expected outputs
                  </div>

                  <ul className="mt-3 space-y-2">
                    {Object.entries(result.expectedOutputs).map(
                      ([name, value]) => (
                        <li
                          key={name}
                          className="flex justify-between lab-mono text-sm text-slate-200"
                        >
                          <span>{name}</span>
                          <span className="text-primary">
                            {value}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div className="lab-panel-low p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">
                    Observed outputs
                  </div>

                  <ul className="mt-3 space-y-2">
                    {Object.entries(result.observedOutputs).map(
                      ([name, value]) => (
                        <li
                          key={name}
                          className="flex justify-between lab-mono text-sm text-slate-200"
                        >
                          <span>{name}</span>

                          <span
                            className={
                              result.expectedOutputs[name] ===
                              value
                                ? "text-emerald-400"
                                : "text-danger"
                            }
                          >
                            {value}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              <div
                className={cn(
                  "mt-4 flex items-center justify-center gap-2 rounded-lg border py-3 lab-mono text-xs uppercase tracking-[0.2em]",
                  statusPass
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                    : "border-danger/25 bg-danger/10 text-danger",
                )}
              >
                {statusPass ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}

                {result.overallStatus}
              </div>
            </div>

            <div className="lab-panel p-6">
              <div className="mb-4 lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Logic differential
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                <table className="w-full text-left">
                  <thead className="bg-surface-low">
                    <tr>
                      {[
                        "Output",
                        "Expected",
                        "Observed",
                        "Delta",
                        "Status",
                      ].map((col) => (
                        <th
                          key={col}
                          className="lab-mono px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {result.differentials.map((row) => (
                      <tr
                        key={row.name}
                        className="border-t border-slate-700/20"
                      >
                        <td className="lab-mono px-3 py-3 text-xs text-white">
                          {row.name}
                        </td>

                        <td className="lab-mono px-3 py-3 text-xs text-primary">
                          {row.expected}

                          <span className="mt-0.5 block text-[10px] text-slate-500">
                            {row.expectedVoltage}
                          </span>
                        </td>

                        <td className="lab-mono px-3 py-3 text-xs text-slate-200">
                          {row.observed}

                          <span className="mt-0.5 block text-[10px] text-slate-500">
                            {row.observedVoltage}
                          </span>
                        </td>

                        <td className="lab-mono px-3 py-3 text-xs text-amber-400/90">
                          {row.delta}
                        </td>

                        <td className="lab-mono px-3 py-3 text-xs">
                          <span
                            className={
                              row.status === "PASS"
                                ? "text-emerald-400"
                                : "text-danger"
                            }
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {result.activeFaultLabels.length > 0 && (
              <div className="lab-panel border-amber-500/20 p-6">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-amber-400">
                  Fault injected
                </div>

                <ul className="mt-3 space-y-2">
                  {result.activeFaultLabels.map((label) => (
                    <li
                      key={label}
                      className="lab-mono text-sm text-amber-200"
                    >
                      {label}
                    </li>
                  ))}
                </ul>

                {result.activeFaultExplanation && (
                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {result.activeFaultExplanation}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  Root-cause analysis
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Ranked hypotheses
                </h2>
              </div>

              <div className="space-y-4">
                {result.hypotheses.map((hypothesis) => (
                  <BayesianRankCard
                    key={hypothesis.rank}
                    hypothesis={hypothesis}
                  />
                ))}
              </div>
            </div>

            <AIDiagnosticPanel
              experiment={experiment}
              result={result}
            />

            <div className="lab-panel p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                    Diagnostic checklist
                  </div>

                  <h2 className="mt-1 text-lg font-semibold text-white">
                    Recommended procedure
                  </h2>
                </div>

                <span className="lab-mono text-xs text-slate-400">
                  {completedCount}/{checklist.length} complete
                </span>
              </div>

              <ul className="space-y-2">
                {checklist.map((step) => (
                  <li key={step.id}>
                    <label className="flex cursor-pointer gap-3 rounded-lg border border-slate-700/30 bg-surface-low px-4 py-3 transition hover:border-primary/20">
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => toggleStep(step.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 accent-primary"
                      />

                      <span className="min-w-0 flex-1">
                        <span className="lab-mono text-xs font-medium text-slate-200">
                          {step.procedure}
                        </span>

                        <span className="mt-1 block text-sm leading-6 text-slate-400">
                          {step.instruction}
                        </span>

                        {step.voltageThreshold && (
                          <span className="mt-1 block lab-mono text-[10px] text-slate-500">
                            Threshold: {step.voltageThreshold}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lab-panel p-6">
              <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Actions
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={workspaceHref}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Workspace
                </Link>

                <button
                  type="button"
                  onClick={handleReRun}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-slate-300 transition hover:border-primary/30 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-run State
                </button>

                <button
                  type="button"
                  onClick={handleReRun}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/15"
                >
                  <Stethoscope className="h-4 w-4" />
                  Diagnose This State
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}