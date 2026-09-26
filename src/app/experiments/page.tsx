import {
  BookOpen,
  Filter,
  FlaskConical,
  Search,
} from "lucide-react";

import ExperimentCard from "@/components/experiments/ExperimentCard";
import { experiments } from "@/data/experimentsData";

export default function ExperimentsPage() {
  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8">
          <div className="lab-mono mb-2 text-[10px] uppercase tracking-[0.22em] text-primary">
            DIGITAL ELECTRONICS / EXPERIMENT CATALOG
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Experiment Library
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Explore engineering laboratory experiments and launch an
                interactive pre-lab workspace.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                <span className="lab-mono text-xs text-slate-300">
                  {experiments.length} EXPERIMENTS
                </span>
              </div>

              <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
                <BookOpen className="h-4 w-4 text-violet-300" />
                <span className="lab-mono text-xs text-slate-300">
                  DIGITAL LAB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              placeholder="Search experiments..."
              className="w-full rounded-lg border border-slate-700/40 bg-surface-low py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-primary/40"
            />
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-slate-300 transition hover:border-primary/30 hover:text-white"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Category tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {["All", "Digital", "Analog", "Microprocessor", "VLSI"].map(
            (category, index) => (
              <button
                key={category}
                type="button"
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs transition ${
                  index === 0
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-slate-700/40 bg-surface-low text-slate-400 hover:text-white"
                }`}
              >
                {category}
              </button>
            ),
          )}
        </div>

        {/* Experiment cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {experiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
            />
          ))}
        </div>
      </div>
    </section>
  );
}