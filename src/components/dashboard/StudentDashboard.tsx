"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  Gauge,
  MessageCircleQuestion,
  Stethoscope,
  Trophy,
  Zap,
} from "lucide-react";

import { getDashboardStats } from "@/lib/database";
import type {
  DashboardStats,
  ExperimentRecord,
} from "@/lib/database";

import { getStoredExperiments } from "@/lib/database";

const skills = [
  {
    name: "Digital Logic",
    value: 88,
    icon: Zap,
  },
  {
    name: "Circuit Analysis",
    value: 81,
    icon: Activity,
  },
  {
    name: "Troubleshooting",
    value: 76,
    icon: Stethoscope,
  },
  {
    name: "Viva Readiness",
    value: 84,
    icon: MessageCircleQuestion,
  },
];

const quickActions = [
  {
    title: "Experiment Library",
    description: "Open experiments and begin a new lab session.",
    href: "/experiments",
    icon: FlaskConical,
  },
  {
    title: "AI Troubleshooter",
    description: "Diagnose circuit mismatches and possible faults.",
    href: "/troubleshooter",
    icon: Stethoscope,
  },
  {
    title: "Adaptive Viva",
    description: "Practice experiment-specific viva questions.",
    href: "/viva",
    icon: MessageCircleQuestion,
  },
  {
    title: "Lab Reports",
    description: "Generate structured laboratory documentation.",
    href: "/reports",
    icon: FileText,
  },
];

export default function StudentDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [storedExperiments, setStoredExperiments] = useState<
    ExperimentRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardStats, experiments] =
          await Promise.all([
            getDashboardStats(),
            getStoredExperiments(),
          ]);

        setStats(dashboardStats);
        setStoredExperiments(experiments);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalExperiments = storedExperiments.length;
  const completedExperiments =
    stats?.completedSessions ?? 0;
  const diagnosticSessions = stats?.faultSessions ?? 0;
  const averageScore = stats?.averageScore ?? 0;

  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                STUDENT CONTROL CENTER
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                LabMind Dashboard
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Monitor your laboratory progress, experiment activity,
                troubleshooting performance, and viva readiness from one place.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2">
              <Gauge className="h-4 w-4 text-primary" />

              <span className="lab-mono text-[10px] uppercase tracking-wider text-primary">
                DATABASE · CONNECTED
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Experiments"
            value={loading ? "—" : totalExperiments}
            secondary="Available"
            icon={FlaskConical}
            accent="primary"
          />

          <MetricCard
            label="Sessions Completed"
            value={loading ? "—" : completedExperiments}
            secondary="Stored sessions"
            icon={CheckCircle2}
            accent="emerald"
          />

          <MetricCard
            label="Average Score"
            value={loading ? "—" : `${averageScore}%`}
            secondary="Recorded sessions"
            icon={Trophy}
            accent="violet"
          />

          <MetricCard
            label="Fault Sessions"
            value={loading ? "—" : diagnosticSessions}
            secondary="Recorded mismatches"
            icon={Stethoscope}
            accent="amber"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="lab-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  RECENT ACTIVITY
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Recent Lab Sessions
                </h2>
              </div>

              <Link
                href="/experiments"
                className="inline-flex items-center gap-1.5 text-xs text-primary transition hover:text-white"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <LoadingRows />
              ) : stats?.recentSessions.length ? (
                stats.recentSessions.map((session) => {
                  const experiment = storedExperiments.find(
                    (item) => item.id === session.experiment_id,
                  );

                  return (
                    <div
                      key={session.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-700/30 bg-surface-low p-4 transition hover:border-primary/20 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                          <FlaskConical className="h-4 w-4 text-primary" />
                        </div>

                        <div className="min-w-0">
                          <div className="lab-mono text-[10px] uppercase tracking-wider text-primary">
                            {experiment?.code ?? session.experiment_id}
                          </div>

                          <div className="mt-1 truncate text-sm font-medium text-white">
                            {experiment?.title ??
                              "Experiment Session"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-5 md:min-w-[280px]">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-600">
                            Status
                          </div>

                          <div
                            className={
                              session.status === "completed"
                                ? "mt-1 text-xs text-emerald-400"
                                : "mt-1 text-xs text-amber-400"
                            }
                          >
                            {session.status}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-600">
                            Score
                          </div>

                          <div className="mt-1 lab-mono text-xs text-slate-200">
                            {session.score ?? "—"}%
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-600">
                            Session
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 className="h-3 w-3" />
                            Saved
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-slate-700/30 bg-surface-low p-6 text-center">
                  <p className="text-sm text-slate-500">
                    No experiment sessions recorded yet.
                  </p>

                  <Link
                    href="/experiments"
                    className="mt-3 inline-flex items-center gap-2 text-xs text-primary"
                  >
                    Start your first experiment
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="lab-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  SKILL MONITOR
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Current Mastery
                </h2>
              </div>

              <Link
                href="/analytics"
                className="inline-flex items-center gap-1.5 text-xs text-violet-300 transition hover:text-white"
              >
                Analytics
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-5 space-y-5">
              {skills.map((skill) => {
                const Icon = skill.icon;

                return (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-violet-300" />

                        <span className="text-sm text-slate-300">
                          {skill.name}
                        </span>
                      </div>

                      <span className="lab-mono text-xs text-slate-400">
                        {skill.value}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-high">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500/80 to-primary/80"
                        style={{
                          width: `${skill.value}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">
              <div className="lab-mono text-[10px] uppercase tracking-wider text-violet-300">
                STORED LAB SESSIONS
              </div>

              <div className="mt-2 text-3xl font-semibold text-white">
                {loading ? "—" : stats?.totalSessions ?? 0}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Persistent sessions in Supabase
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              QUICK ACCESS
            </div>

            <h2 className="mt-1 text-lg font-semibold text-white">
              LabMind Tools
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="lab-panel group p-5 transition hover:-translate-y-0.5 hover:border-primary/25"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-primary" />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-white">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <InfoCard
            label="REPORTS"
            value="Ready"
            description="Report module connected"
            icon={FileText}
          />

          <InfoCard
            label="VIVA"
            value="Ready"
            description="Adaptive assessment module connected"
            icon={MessageCircleQuestion}
          />

          <InfoCard
            label="DATABASE"
            value="ONLINE"
            description="Supabase persistence active"
            icon={BarChart3}
            online
          />
        </div>
      </div>
    </section>
  );
}

function LoadingRows() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-xl border border-slate-700/30 bg-surface-low"
        />
      ))}
    </>
  );
}

function MetricCard({
  label,
  value,
  secondary,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  secondary: string;
  icon: typeof FlaskConical;
  accent: "primary" | "emerald" | "violet" | "amber";
}) {
  const styles = {
    primary: {
      icon: "border-primary/15 bg-primary/10 text-primary",
      text: "text-primary",
    },
    emerald: {
      icon: "border-emerald-500/15 bg-emerald-500/10 text-emerald-400",
      text: "text-emerald-400",
    },
    violet: {
      icon: "border-violet-500/15 bg-violet-500/10 text-violet-300",
      text: "text-violet-300",
    },
    amber: {
      icon: "border-amber-500/15 bg-amber-500/10 text-amber-400",
      text: "text-amber-400",
    },
  };

  return (
    <div className="lab-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${styles[accent].icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="lab-mono text-[10px] uppercase tracking-wider text-slate-600">
          {secondary}
        </div>
      </div>

      <div className="mt-5 text-3xl font-semibold text-white">
        {value}
      </div>

      <div className={`mt-1 text-xs ${styles[accent].text}`}>
        {label}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  description,
  icon: Icon,
  online = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof FileText;
  online?: boolean;
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

      <div
        className={`mt-4 text-2xl font-semibold ${
          online ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </div>

      <p className="mt-1 text-xs leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}