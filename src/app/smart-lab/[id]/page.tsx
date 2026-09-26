import { notFound } from "next/navigation";

import SmartLab3D from "@/components/smart-lab/SmartLab3D";
import SmartLabTimeline from "@/components/smart-lab/SmartLabTimeline";
import { CircuitWorkspaceProvider } from "@/context/CircuitWorkspaceContext";
import { experiments } from "@/data/experimentsData";

interface SmartLabPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SmartLabExperimentPage({
  params,
}: SmartLabPageProps) {
  const { id } = await params;

  const experiment = experiments.find(
    (item) => item.id === id,
  );

  if (!experiment) {
    notFound();
  }

  return (
    <CircuitWorkspaceProvider experiment={experiment}>
      <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="lab-panel mb-6 p-6 md:p-8">
            <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
              VIRTUAL SMART LAB · DIGITAL TWIN
            </div>

            <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {experiment.title}
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  Interactive 3D and 4D digital twin for{" "}
                  {experiment.title}. Change virtual inputs, observe
                  simulated outputs, and replay circuit states over time.
                </p>
              </div>

              <div className="lab-panel-low px-4 py-3">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  EXPERIMENT
                </div>

                <div className="mt-1 lab-mono text-sm text-slate-200">
                  {experiment.code}
                </div>
              </div>
            </div>
          </div>

          <SmartLab3D />

          <div className="mt-6">
            <SmartLabTimeline />
          </div>
        </div>
      </section>
    </CircuitWorkspaceProvider>
  );
}