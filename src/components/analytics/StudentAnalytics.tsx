"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  MessageCircleQuestion,
  ShieldCheck,
  Stethoscope,
  Target,
  TrendingUp,
} from "lucide-react";

const masteryData = [
  {
    label: "Digital Logic",
    value: 88,
    icon: BrainCircuit,
  },
  {
    label: "Circuit Analysis",
    value: 81,
    icon: Activity,
  },
  {
    label: "Troubleshooting",
    value: 76,
    icon: Stethoscope,
  },
  {
    label: "Viva Readiness",
    value: 84,
    icon: MessageCircleQuestion,
  },
  {
    label: "Lab Procedure",
    value: 79,
    icon: FlaskConical,
  },
];

const vivaTrend = [
  { label: "V1", value: 68 },
  { label: "V2", value: 74 },
  { label: "V3", value: 81 },
  { label: "V4", value: 86 },
  { label: "V5", value: 82 },
];

const experimentPerformance = [
  {
    code: "DIG-01",
    title: "Logic Gates",
    completion: 100,
    score: 91,
    status: "Completed",
  },
  {
    code: "DIG-02",
    title: "Half Adder",
    completion: 100,
    score: 92,
    status: "Completed",
  },
  {
    code: "DIG-03",
    title: "Full Adder",
    completion: 72,
    score: 78,
    status: "In Progress",
  },
  {
    code: "DIG-04",
    title: "4:1 Multiplexer",
    completion: 100,
    score: 86,
    status: "Completed",
  },
];

const troubleshootingData = [
  {
    label: "Diagnoses",
    value: 6,
  },
  {
    label: "Resolved",
    value: 5,
  },
  {
    label: "Unresolved",
    value: 1,
  },
];

export default function StudentAnalytics() {
  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                PERFORMANCE INTELLIGENCE
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Student Analytics
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Review experiment mastery, viva performance, troubleshooting
                activity, and current learning gaps across LabMind.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsMetric
            label="Overall Mastery"
            value="82%"
            description="Across current modules"
            icon={Target}
            accent="violet"
          />

          <AnalyticsMetric
            label="Average Viva"
            value="82%"
            description="Latest assessment average"
            icon={MessageCircleQuestion}
            accent="primary"
          />

          <AnalyticsMetric
            label="Diagnostic Success"
            value="83%"
            description="5 of 6 resolved"
            icon={ShieldCheck}
            accent="emerald"
          />

          <AnalyticsMetric
            label="Learning Trend"
            value="+14%"
            description="Compared with first viva"
            icon={TrendingUp}
            accent="amber"
          />
        </div>

        {/* Mastery + Viva */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="lab-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  SKILL MASTERY
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Competency Breakdown
                </h2>
              </div>

              <BarChart3 className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-6 space-y-5">
              {masteryData.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-violet-300" />

                        <span className="text-sm text-slate-300">
                          {item.label}
                        </span>
                      </div>

                      <span className="lab-mono text-xs text-slate-400">
                        {item.value}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500/80 to-primary/80"
                        style={{
                          width: `${item.value}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lab-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  VIVA TREND
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Adaptive Viva Performance
                </h2>
              </div>

              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="mt-6">
              <div className="flex h-56 items-end gap-3 rounded-xl border border-slate-700/30 bg-surface-low p-5">
                {vivaTrend.map((item) => (
                  <div
                    key={item.label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="lab-mono text-[10px] text-slate-500">
                      {item.value}
                    </div>

                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-violet-500/70 to-primary/80"
                        style={{
                          height: `${item.value}%`,
                        }}
                      />
                    </div>

                    <div className="lab-mono text-[10px] text-slate-600">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  First assessment
                </span>

                <span className="lab-mono text-emerald-400">
                  +14 percentage points
                </span>

                <span className="text-slate-500">
                  Latest assessment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiments */}
        <div className="mt-6 lab-panel p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                EXPERIMENT PERFORMANCE
              </div>

              <h2 className="mt-1 text-lg font-semibold text-white">
                Laboratory Progress
              </h2>
            </div>

            <Link
              href="/experiments"
              className="inline-flex items-center gap-1.5 text-xs text-primary transition hover:text-white"
            >
              Open Library
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-700/30">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-surface-low">
                <tr>
                  {[
                    "Experiment",
                    "Completion",
                    "Score",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="lab-mono px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {experimentPerformance.map((experiment) => (
                  <tr
                    key={experiment.code}
                    className="border-t border-slate-700/20"
                  >
                    <td className="px-4 py-4">
                      <div className="lab-mono text-[10px] text-primary">
                        {experiment.code}
                      </div>

                      <div className="mt-1 text-sm font-medium text-white">
                        {experiment.title}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex min-w-[180px] items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-high">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${experiment.completion}%`,
                            }}
                          />
                        </div>

                        <span className="lab-mono text-xs text-slate-400">
                          {experiment.completion}%
                        </span>
                      </div>
                    </td>

                    <td className="lab-mono px-4 py-4 text-xs text-slate-200">
                      {experiment.score}%
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={
                          experiment.status === "Completed"
                            ? "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-400"
                            : "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-amber-400"
                        }
                      >
                        {experiment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="lab-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10">
                <Stethoscope className="h-4 w-4 text-emerald-400" />
              </div>

              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                  TROUBLESHOOTING
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Diagnostic Performance
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {troubleshootingData.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-surface-low px-4 py-3"
                >
                  <span className="text-sm text-slate-400">
                    {item.label}
                  </span>

                  <span className="lab-mono text-sm text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
              <div className="lab-mono text-[10px] uppercase tracking-wider text-emerald-400">
                SUCCESS RATE
              </div>

              <div className="mt-2 text-3xl font-semibold text-white">
                83%
              </div>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                Successful diagnosis resolution across recorded sessions.
              </p>
            </div>
          </div>

          <div className="lab-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/15 bg-violet-500/10">
                <Target className="h-4 w-4 text-violet-300" />
              </div>

              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  LEARNING INSIGHTS
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Current Focus Areas
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <InsightCard
                title="Troubleshooting"
                description="Practice more fault-injection scenarios to improve diagnosis speed."
                status="Priority"
                accent="amber"
              />

              <InsightCard
                title="Circuit Analysis"
                description="Review internal gate behavior and output propagation."
                status="Focus"
                accent="violet"
              />

              <InsightCard
                title="Viva Readiness"
                description="Continue adaptive viva sessions to strengthen conceptual recall."
                status="Improving"
                accent="emerald"
              />

              <InsightCard
                title="Lab Procedure"
                description="Complete the remaining Full Adder workflow and document observations."
                status="Active"
                accent="primary"
              />
            </div>
          </div>
        </div>

        {/* Footer summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={CheckCircle2}
            label="Completed Experiments"
            value="3 / 4"
          />

          <SummaryCard
            icon={MessageCircleQuestion}
            label="Viva Sessions"
            value="4"
          />

          <SummaryCard
            icon={BarChart3}
            label="Overall Mastery"
            value="82%"
          />
        </div>
      </div>
    </section>
  );
}

function AnalyticsMetric({
  label,
  value,
  description,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Target;
  accent: "violet" | "primary" | "emerald" | "amber";
}) {
  const iconStyles = {
    violet:
      "border-violet-500/15 bg-violet-500/10 text-violet-300",
    primary:
      "border-primary/15 bg-primary/10 text-primary",
    emerald:
      "border-emerald-500/15 bg-emerald-500/10 text-emerald-400",
    amber:
      "border-amber-500/15 bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="lab-panel p-5">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${iconStyles[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <TrendingUp className="h-4 w-4 text-slate-700" />
      </div>

      <div className="mt-5 text-3xl font-semibold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-300">
        {label}
      </div>

      <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-600">
        {description}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  description,
  status,
  accent,
}: {
  title: string;
  description: string;
  status: string;
  accent: "amber" | "violet" | "emerald" | "primary";
}) {
  const styles = {
    amber:
      "border-amber-500/15 bg-amber-500/5 text-amber-300",
    violet:
      "border-violet-500/15 bg-violet-500/5 text-violet-300",
    emerald:
      "border-emerald-500/15 bg-emerald-500/5 text-emerald-300",
    primary:
      "border-primary/15 bg-primary/5 text-primary",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${styles[accent]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">
          {title}
        </div>

        <span className="lab-mono text-[10px] uppercase tracking-wider">
          {status}
        </span>
      </div>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
}) {
  return (
    <div className="lab-panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/30 bg-surface-low">
          <Icon className="h-4 w-4 text-slate-300" />
        </div>

        <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </div>
      </div>

      <div className="mt-4 text-2xl font-semibold text-white">
        {value}
      </div>
    </div>
  );
}