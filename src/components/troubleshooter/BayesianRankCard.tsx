import type { BayesianHypothesis } from "@/types/diagnostic";

interface BayesianRankCardProps {
  hypothesis: BayesianHypothesis;
}

export default function BayesianRankCard({
  hypothesis,
}: BayesianRankCardProps) {
  const percent = Math.round(hypothesis.probability * 100);

  return (
    <article className="lab-panel-low p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="lab-mono text-[10px] uppercase tracking-[0.2em] text-violet-300">
          Rank {hypothesis.rank}
        </div>
        <div className="lab-mono text-xs text-violet-200">
          P ≈ {percent}%
        </div>
      </div>

      <h3 className="mt-2 text-base font-semibold text-white">
        {hypothesis.title}
      </h3>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-high">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500/80 to-primary/80"
          style={{ width: `${percent}%` }}
        />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
            Why plausible
          </dt>
          <dd className="mt-1 leading-6 text-slate-300">
            {hypothesis.schematicContext}
          </dd>
        </div>
        <div>
          <dt className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
            Impact
          </dt>
          <dd className="mt-1 leading-6 text-slate-400">
            {hypothesis.impact}
          </dd>
        </div>
        <div>
          <dt className="lab-mono text-[10px] uppercase tracking-wider text-primary">
            Recommended action
          </dt>
          <dd className="mt-1 leading-6 text-slate-200">
            {hypothesis.remediationAction}
          </dd>
        </div>
      </dl>
    </article>
  );
}
