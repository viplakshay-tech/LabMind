import Link from "next/link";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Clock3,
  FlaskConical,
  Gauge,
} from "lucide-react";

import type { Experiment } from "@/types/experiment";

interface ExperimentCardProps {
  experiment: Experiment;
}

const difficultyStyles = {
  Beginner: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Intermediate: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Advanced: "border-rose-500/20 bg-rose-500/10 text-rose-400",
};

export default function ExperimentCard({
  experiment,
}: ExperimentCardProps) {
  return (
    <article className="group lab-panel flex h-full flex-col p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-glow-cyan">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
          <FlaskConical className="h-5 w-5 text-primary" />
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
            difficultyStyles[experiment.difficulty]
          }`}
        >
          {experiment.difficulty}
        </span>
      </div>

      <div className="mt-5">
        <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          {experiment.code}
        </div>

        <h2 className="mt-1 text-lg font-semibold text-white">
          {experiment.title}
        </h2>

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
              Category
            </span>
          </div>

          <p className="mt-1 lab-mono text-xs text-slate-200">
            {experiment.category}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-xs text-slate-400">
            Ready for simulation
          </span>
        </div>

        <div className="grid gap-2">
          <Link
            href={`/experiments/${experiment.id}/pre-lab`}
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            <span>Open Experiment</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href={`/smart-lab/${experiment.id}`}
            className="flex items-center justify-between rounded-lg border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-400/15"
          >
            <span>Open in Smart Lab</span>
            <Box className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}