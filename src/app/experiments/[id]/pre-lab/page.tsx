import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Cpu,
  FlaskConical,
  Package,
} from "lucide-react";
import { notFound } from "next/navigation";

import DIPPackagePinout from "@/components/circuit/DIPPackagePinout";
import { experiments } from "@/data/experimentsData";

interface PreLabPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PreLabPage({
  params,
}: PreLabPageProps) {
  const { id } = await params;

  const experiment = experiments.find(
    (item) => item.id === id,
  );

  if (!experiment) {
    notFound();
  }

  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          href="/experiments"
          className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiment Library
        </Link>

        {/* Header */}
        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {experiment.code} / PRE-LAB OVERVIEW
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {experiment.title}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {experiment.objective}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="lab-panel-low px-4 py-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider">
                    Duration
                  </span>
                </div>

                <div className="mt-1 lab-mono text-xs text-slate-200">
                  {experiment.estimatedTime}
                </div>
              </div>

              <div className="lab-panel-low px-4 py-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider">
                    Level
                  </span>
                </div>

                <div className="mt-1 lab-mono text-xs text-slate-200">
                  {experiment.difficulty}
                </div>
              </div>

              <div className="lab-panel-low px-4 py-3 sm:col-span-1 col-span-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Cpu className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider">
                    Category
                  </span>
                </div>

                <div className="mt-1 lab-mono text-xs text-slate-200">
                  {experiment.category}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {/* Theory */}
            <div className="lab-panel p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    CONCEPT
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Theory
                  </h2>
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-300">
                {experiment.theory}
              </p>
            </div>

            {/* Equations */}
            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  LOGIC
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Boolean Equations
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {experiment.booleanEquations.map((equation) => (
                  <div
                    key={equation.name}
                    className="lab-panel-low p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        {equation.name}
                      </span>

                      <span className="lab-mono text-[10px] text-slate-600">
                        {equation.icReference}
                      </span>
                    </div>

                    <div className="mt-3 lab-mono text-sm text-primary">
                      {equation.formula}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Components */}
            <div className="lab-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
                  <Package className="h-4 w-4 text-violet-300" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                    BILL OF MATERIALS
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Apparatus & Components
                  </h2>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {experiment.apparatus.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-surface-low px-4 py-3"
                  >
                    <div>
                      <div className="text-sm text-slate-200">
                        {item.name}
                      </div>

                      {item.specification && (
                        <div className="mt-1 text-[11px] text-slate-500">
                          {item.specification}
                        </div>
                      )}
                    </div>

                    <span className="lab-mono rounded-md border border-slate-700/40 px-2 py-1 text-[10px] text-slate-400">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning objectives */}
            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  LEARNING OBJECTIVES
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  What you should understand
                </h2>
              </div>

              <div className="space-y-3">
                {experiment.learningObjectives.map((objective) => (
                  <div
                    key={objective}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                    <span className="text-sm leading-6 text-slate-300">
                      {objective}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* IC pinouts */}
            {experiment.icPackages.length > 0 ? (
              experiment.icPackages.map((packageData) => (
                <DIPPackagePinout
                  key={packageData.icNumber}
                  packageData={packageData}
                />
              ))
            ) : (
              <div className="lab-panel p-6">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  IC REFERENCE
                </div>

                <h3 className="mt-2 text-lg font-semibold text-white">
                  No dedicated pinout viewer
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This experiment uses multiple standard logic-gate ICs.
                  Detailed package pinouts will appear when the relevant
                  device is selected.
                </p>
              </div>
            )}

            {/* Truth table preview */}
            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  REFERENCE OUTPUT
                </div>

                <h3 className="mt-1 text-lg font-semibold text-white">
                  Truth Table
                </h3>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                <table className="w-full text-left">
                  <thead className="bg-surface-low">
                    <tr>
                      {[...experiment.truthTableSpec.inputs, ...experiment.truthTableSpec.outputs].map(
                        (column) => (
                          <th
                            key={column}
                            className="lab-mono px-3 py-3 text-[10px] uppercase tracking-wider text-slate-500"
                          >
                            {column}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {experiment.truthTableSpec.rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-slate-700/20"
                      >
                        {experiment.truthTableSpec.inputs.map((input) => (
                          <td
                            key={input}
                            className="lab-mono px-3 py-3 text-xs text-slate-300"
                          >
                            {row.inputs[input]}
                          </td>
                        ))}

                        {experiment.truthTableSpec.outputs.map((output) => (
                          <td
                            key={output}
                            className="lab-mono px-3 py-3 text-xs text-primary"
                          >
                            {row.expectedOutputs[output]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Start */}
            <div className="lab-panel p-6">
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  NEXT STEP
                </div>

                <h3 className="mt-2 text-xl font-semibold text-white">
                  Ready to run the experiment?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Open the live workspace to manipulate digital inputs,
                  compare expected and observed states, and begin the
                  simulation.
                </p>

                <Link
                  href={`/experiments/${experiment.id}/workspace`}
                  className="mt-5 flex items-center justify-between rounded-lg border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
                >
                  <span>Start Experiment</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}