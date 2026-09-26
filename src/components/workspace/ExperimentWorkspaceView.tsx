"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Cpu,
  RotateCcw,
  Stethoscope,
  Table2,
  Zap,
} from "lucide-react";
import { useState } from "react";

import AITutorPanel from "@/components/ai/AITutorPanel";
import ExpectedObservedPanel from "@/components/workspace/ExpectedObservedPanel";
import CircuitSchematic from "@/components/workspace/CircuitSchematic";
import FaultInjectionPanel from "@/components/workspace/FaultInjectionPanel";
import LogicSwitch from "@/components/workspace/LogicSwitch";
import OutputStatusCard from "@/components/workspace/OutputStatusCard";
import TruthTable from "@/components/workspace/TruthTable";

import {
  CircuitWorkspaceProvider,
  useCircuitWorkspace,
} from "@/context/CircuitWorkspaceContext";

import { saveExperimentSession } from "@/lib/database";

import type { Experiment } from "@/types/experiment";

interface ExperimentWorkspaceViewProps {
  experiment: Experiment;
}

function WorkspaceContent({
  experiment,
}: {
  experiment: Experiment;
}) {
  const {
    inputs,
    setInput,
    outputNames,
    expectedOutputs,
    observedOutputs,
    reset,
    saveTroubleshooterSnapshot,
  } = useCircuitWorkspace();

  const [saveMessage, setSaveMessage] = useState("");

  const inputEntries = experiment.truthTableSpec.inputs;

  const handleDiagnose = async () => {
    setSaveMessage("");

    try {
      await saveExperimentSession({
        experimentId: experiment.id,
        inputs,
        expectedOutputs,
        observedOutputs,
        notes: "Saved from Diagnose This State.",
      });

      setSaveMessage("Lab state saved.");

      saveTroubleshooterSnapshot();
    } catch (error) {
      console.error("Failed to save experiment session:", error);

      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Could not save the lab state.",
      );

      // Preserve the existing troubleshooter flow even if persistence fails.
      saveTroubleshooterSnapshot();
    }
  };

  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={`/experiments/${experiment.id}/pre-lab`}
          className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pre-Lab
        </Link>

        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {experiment.code} / LIVE WORKSPACE
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {experiment.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {experiment.objective}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700/40 bg-surface-low px-4 py-2.5 text-sm text-slate-300 transition hover:border-primary/30 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                type="button"
                onClick={handleDiagnose}
                className="inline-flex items-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-2.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/15"
              >
                <Stethoscope className="h-4 w-4" />
                Diagnose This State
              </button>
            </div>
          </div>

          {saveMessage && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-xs ${
                saveMessage === "Lab state saved."
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-danger/20 bg-danger/10 text-danger"
              }`}
            >
              {saveMessage}
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="lab-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    STIMULUS
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Digital Inputs
                  </h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {inputEntries.map((name) => (
                  <LogicSwitch
                    key={name}
                    label={name}
                    value={inputs[name] ?? 0}
                    onChange={(value) => setInput(name, value)}
                  />
                ))}
              </div>
            </div>

            <div className="lab-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                    RESPONSE
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Output Panel
                  </h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {outputNames.map((name) => (
                  <OutputStatusCard
                    key={name}
                    name={name}
                    expected={expectedOutputs[name] ?? 0}
                    observed={observedOutputs[name] ?? 0}
                  />
                ))}
              </div>
            </div>

            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  COMPARE
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Expected vs Observed
                </h2>
              </div>

              <ExpectedObservedPanel />
            </div>
          </div>

          <div className="space-y-6">
            <div className="lab-panel p-6">
              <div className="mb-4">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  SCHEMATIC
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Circuit View
                </h2>
              </div>

              <CircuitSchematic />
            </div>

            <div className="lab-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                  <Table2 className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    LIVE
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Truth Table
                  </h2>
                </div>
              </div>

              <TruthTable />

              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                Active input vector is highlighted. MUX rows use current D0–D3
                values with each select combination.
              </p>
            </div>

            <FaultInjectionPanel />
          </div>
        </div>

        <div className="mt-6 lab-panel">
          <div className="border-b border-slate-700/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                <Bot className="h-4 w-4 text-violet-300" />
              </div>

              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  AI ASSISTANCE
                </div>

                <h2 className="text-lg font-semibold text-white">
                  LabMind AI Tutor
                </h2>
              </div>
            </div>
          </div>

          <div className="p-6">
            <AITutorPanel
              experiment={experiment}
              currentInputs={inputs}
              expectedOutputs={expectedOutputs}
              observedOutputs={observedOutputs}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ExperimentWorkspaceView({
  experiment,
}: ExperimentWorkspaceViewProps) {
  return (
    <CircuitWorkspaceProvider experiment={experiment}>
      <WorkspaceContent experiment={experiment} />
    </CircuitWorkspaceProvider>
  );
}