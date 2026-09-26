import Link from "next/link";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Gauge,
} from "lucide-react";

import { experiments } from "@/data/experimentsData";

export default function SmartLabPage() {
  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 lab-panel p-6 md:p-8">
          <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            VIRTUAL SMART LAB · DIGITAL TWIN PLATFORM
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Virtual Smart Lab
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Select an engineering experiment to enter its interactive 3D
            digital twin. Each laboratory uses the same LabMind simulation
            engine as the Experiment Workspace.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
              <Box className="h-4 w-4 text-primary" />
              <span className="lab-mono text-[10px] text-slate-300">
                3D DIGITAL TWIN
              </span>
            </div>

            <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="lab-mono text-[10px] text-slate-300">
                LIVE SIMULATION
              </span>
            </div>

            <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
              <FlaskConical className="h-4 w-4 text-violet-300" />
              <span className="lab-mono text-[10px] text-slate-300">
                {experiments.length} EXPERIMENTS
              </span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="lab-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            SELECT LABORATORY
          </div>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Choose an experiment
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {experiments.map((experiment) => (
            <Link
              key={experiment.id}
              href={`/smart-lab/${experiment.id}`}
              className="group"
            >
              <article className="lab-panel h-full p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-glow-cyan">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
                    <Box className="h-5 w-5 text-primary" />
                  </div>

                  <span className="lab-mono rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-violet-300">
                    3D LAB
                  </span>
                </div>

                <div className="mt-5">
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {experiment.code}
                  </div>

                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {experiment.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {experiment.objective}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="lab-panel-low p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase tracking-wider">
                        Duration
                      </span>
                    </div>

                    <p className="mt-1 lab-mono text-xs text-slate-200">
                      {experiment.estimatedTime}
                    </p>
                  </div>

                  <div className="lab-panel-low p-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Gauge className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase tracking-wider">
                        Difficulty
                      </span>
                    </div>

                    <p className="mt-1 lab-mono text-xs text-slate-200">
                      {experiment.difficulty}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
                  <span className="text-sm font-medium text-primary">
                    Enter Digital Twin
                  </span>

                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}