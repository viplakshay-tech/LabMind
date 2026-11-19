"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  ArrowLeft,
  BarChart3,
  Bot,
  Calculator,
  CheckCircle2,
  Database,
  Eye,
  FlaskConical,
  Gauge,
  Loader2,
  MessageCircle,
  Play,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Workflow,
  X,
  Wrench,
} from "lucide-react";

import type { LabCatalogExperiment } from "@/data/labCatalog";
import { getExperimentEngine } from "@/lib/experimentEngineRouter";

type Props = {
  experiment: LabCatalogExperiment;
};

type Status = "READY" | "RUNNING" | "COMPLETE";

type Field = {
  id: string;
  label: string;
  value: string;
  unit?: string;
};

type Result = {
  label: string;
  value: string;
  detail?: string;
};

type TutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const capabilityLabels: Record<
  keyof LabCatalogExperiment["capabilities"],
  string
> = {
  simulation: "Simulation",
  aiTutor: "AI Tutor",
  troubleshooting: "Troubleshooting",
  vision: "Vision",
  viva: "AI Viva",
  report: "Reports",
  analytics: "Analytics",
  digitalTwin3D: "3D Twin",
  timeline4D: "4D Timeline",
};

function numeric(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getFields(engineType: string): Field[] {
  switch (engineType) {
    case "ai-dataset":
      return [
        { id: "samples", label: "Samples", value: "1000" },
        { id: "features", label: "Features", value: "8" },
        { id: "epochs", label: "Epochs", value: "20" },
        { id: "learningRate", label: "Learning Rate", value: "0.001" },
      ];

    case "software-lab":
      return [
        { id: "inputSize", label: "Input Size", value: "1000" },
        { id: "operations", label: "Operations", value: "10000" },
        { id: "runs", label: "Benchmark Runs", value: "5" },
      ];

    case "numerical":
      return [
        { id: "initialValue", label: "Initial Value", value: "1.0" },
        { id: "tolerance", label: "Tolerance", value: "0.0001" },
        { id: "iterations", label: "Max Iterations", value: "20" },
      ];

    case "chemistry-lab":
      return [
        { id: "sampleVolume", label: "Sample Volume", value: "10", unit: "mL" },
        { id: "titrantVolume", label: "Titrant Volume", value: "12", unit: "mL" },
        { id: "titrantMolarity", label: "Titrant Molarity", value: "0.1", unit: "M" },
      ];

    case "bio-lab":
      return [
        { id: "initialPopulation", label: "Initial Population", value: "100" },
        { id: "growthRate", label: "Growth Rate", value: "0.08" },
        { id: "hours", label: "Duration", value: "24", unit: "hr" },
      ];

    case "engineering-lab":
      return [
        { id: "force", label: "Force", value: "100", unit: "N" },
        { id: "area", label: "Area", value: "20", unit: "mm²" },
        { id: "distance", label: "Distance", value: "2", unit: "m" },
        { id: "time", label: "Time", value: "5", unit: "s" },
      ];

    default:
      return [
        { id: "parameterA", label: "Parameter A", value: "10" },
        { id: "parameterB", label: "Parameter B", value: "5" },
        { id: "duration", label: "Duration", value: "10", unit: "s" },
      ];
  }
}

function calculateResults(
  engineType: string,
  fields: Field[],
): Result[] {
  const values = Object.fromEntries(
    fields.map((field) => [field.id, field.value]),
  );

  switch (engineType) {
    case "ai-dataset": {
      const samples = numeric(values.samples, 1000);
      const features = numeric(values.features, 8);
      const epochs = numeric(values.epochs, 20);
      const lr = numeric(values.learningRate, 0.001);

      const accuracy = Math.min(
        99.5,
        68 +
          Math.log10(Math.max(samples, 10)) * 7 +
          Math.min(epochs, 100) * 0.42 +
          Math.min(features, 50) * 0.18 +
          Math.min(lr * 1000, 5) * 0.9,
      );

      const loss = Math.max(
        0.03,
        1.25 / Math.sqrt(Math.max(epochs, 1)) +
          0.15 / Math.sqrt(Math.max(samples / 100, 1)),
      );

      const trainTime = Math.max(
        0.4,
        (samples * features * epochs) / 850000,
      );

      return [
        {
          label: "Estimated Accuracy",
          value: `${accuracy.toFixed(2)}%`,
          detail: "Deterministic engine estimate",
        },
        {
          label: "Estimated Loss",
          value: loss.toFixed(4),
        },
        {
          label: "Feature Space",
          value: `${features} features`,
        },
        {
          label: "Training Time",
          value: `${trainTime.toFixed(2)} s`,
        },
      ];
    }

    case "software-lab": {
      const n = numeric(values.inputSize, 1000);
      const operations = numeric(values.operations, 10000);
      const runs = numeric(values.runs, 5);

      const logarithmicOps = Math.max(1, Math.log2(Math.max(n, 2)));
      const estimatedMs =
        (operations / 150000) * (1 + logarithmicOps / 20);

      return [
        {
          label: "Estimated Runtime",
          value: `${Math.max(0.1, estimatedMs).toFixed(3)} ms`,
        },
        {
          label: "Input Size",
          value: `${Math.round(n)}`,
        },
        {
          label: "Complexity Signal",
          value: `O(n log n)`,
        },
        {
          label: "Benchmark Runs",
          value: `${Math.max(1, Math.round(runs))}`,
        },
      ];
    }

    case "numerical": {
      const start = numeric(values.initialValue, 1);
      const tolerance = Math.max(
        numeric(values.tolerance, 0.0001),
        0.00000001,
      );
      const maxIterations = Math.max(
        1,
        Math.round(numeric(values.iterations, 20)),
      );

      let x = start === 0 ? 1 : start;
      let iteration = 0;
      let error = Number.POSITIVE_INFINITY;

      for (let i = 0; i < maxIterations; i += 1) {
        const next = 0.5 * (x + 2 / x);
        error = Math.abs(next - x);
        x = next;
        iteration = i + 1;

        if (error <= tolerance) {
          break;
        }
      }

      return [
        {
          label: "Computed Root",
          value: x.toFixed(8),
          detail: "Newton-Raphson style convergence",
        },
        {
          label: "Iterations Used",
          value: `${iteration}`,
        },
        {
          label: "Final Error",
          value: error.toExponential(3),
        },
        {
          label: "Converged",
          value: error <= tolerance ? "YES" : "NO",
        },
      ];
    }

    case "chemistry-lab": {
      const sampleVolume = numeric(values.sampleVolume, 10);
      const titrantVolume = numeric(values.titrantVolume, 12);
      const titrantMolarity = numeric(values.titrantMolarity, 0.1);

      const concentration =
        sampleVolume > 0
          ? (titrantVolume * titrantMolarity) / sampleVolume
          : 0;

      return [
        {
          label: "Estimated Concentration",
          value: `${concentration.toFixed(4)} M`,
          detail: "1:1 titration assumption",
        },
        {
          label: "Sample Volume",
          value: `${sampleVolume.toFixed(2)} mL`,
        },
        {
          label: "Titrant Volume",
          value: `${titrantVolume.toFixed(2)} mL`,
        },
        {
          label: "Titrant Strength",
          value: `${titrantMolarity.toFixed(3)} M`,
        },
      ];
    }

    case "bio-lab": {
      const initial = Math.max(
        numeric(values.initialPopulation, 100),
        1,
      );
      const growthRate = numeric(values.growthRate, 0.08);
      const hours = Math.max(numeric(values.hours, 24), 0);

      const finalPopulation =
        initial * Math.exp(growthRate * hours);

      return [
        {
          label: "Estimated Population",
          value: Math.round(finalPopulation).toLocaleString(),
          detail: "Exponential growth model",
        },
        {
          label: "Initial Population",
          value: Math.round(initial).toLocaleString(),
        },
        {
          label: "Growth Rate",
          value: `${growthRate.toFixed(3)} /hr`,
        },
        {
          label: "Duration",
          value: `${hours.toFixed(1)} hr`,
        },
      ];
    }

    case "engineering-lab": {
      const force = numeric(values.force, 100);
      const area = Math.max(numeric(values.area, 20), 0.0001);
      const distance = numeric(values.distance, 2);
      const time = Math.max(numeric(values.time, 5), 0.0001);

      const stressMpa = (force / area);
      const work = force * distance;
      const power = work / time;

      return [
        {
          label: "Stress",
          value: `${stressMpa.toFixed(3)} MPa`,
        },
        {
          label: "Work",
          value: `${work.toFixed(2)} J`,
        },
        {
          label: "Power",
          value: `${power.toFixed(2)} W`,
        },
        {
          label: "Run Time",
          value: `${time.toFixed(2)} s`,
        },
      ];
    }

    default: {
      const a = numeric(values.parameterA, 10);
      const b = numeric(values.parameterB, 5);

      return [
        {
          label: "Combined Value",
          value: (a + b).toFixed(3),
        },
        {
          label: "Difference",
          value: Math.abs(a - b).toFixed(3),
        },
        {
          label: "Ratio",
          value: (b === 0 ? 0 : a / b).toFixed(3),
        },
        {
          label: "Status",
          value: "READY",
        },
      ];
    }
  }
}

export default function UniversalLabWorkspace({
  experiment,
}: Props) {
  const engine = getExperimentEngine(experiment);

  const initialFields = useMemo(
    () => getFields(experiment.engineType),
    [experiment.engineType],
  );

  const [fields, setFields] = useState<Field[]>(initialFields);
  const [results, setResults] = useState<Result[]>(
    () => calculateResults(experiment.engineType, initialFields),
  );
  const [status, setStatus] = useState<Status>("READY");
  const [runs, setRuns] = useState(0);
  const [observations, setObservations] = useState("");
  const [activeCommand, setActiveCommand] = useState("simulation");

  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `I'm LabMind AI Tutor for ${experiment.title}. Ask me about the concept, procedure, calculations, results, mistakes, or how this experiment connects to your subject.`,
    },
  ]);

  const openTutor = () => {
    setTutorOpen(true);
  };

  const askTutor = async (preset?: string) => {
    const message = (preset ?? tutorInput).trim();

    if (!message || tutorLoading) {
      return;
    }

    setTutorInput("");

    const userMessage: TutorMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message,
    };

    setTutorMessages((current) => [...current, userMessage]);
    setTutorLoading(true);

    try {
      const experimentContext = {
        id: experiment.id,
        code: experiment.code,
        title: experiment.title,
        shortTitle: experiment.title,
        category: experiment.subject,
        estimatedTime: "Flexible",
        status: "Available",
        department: experiment.department,
        subject: experiment.subject,
        module: experiment.module,
        objective: experiment.objective,
        theory: experiment.objective,
        difficulty: experiment.difficulty,
        learningMode: experiment.learningMode,
        semester: experiment.semester,
        engineType: experiment.engineType,
        capabilities: experiment.capabilities,
        catalogStatus: experiment.catalogStatus,
        schematicSvgType: experiment.engineType,
        commonMistakes: [],
        learningObjectives: [],
        apparatus: [],
        booleanEquations: [],
        icPackages: [],
        truthTableSpec: {},
      };

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          experiment: experimentContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Gemini request failed.",
        );
      }

      const answer =
        typeof data?.response === "string"
          ? data.response
          : typeof data?.answer === "string"
            ? data.answer
            : typeof data?.text === "string"
              ? data.text
              : typeof data?.message === "string"
                ? data.message
                : typeof data?.reply === "string"
                  ? data.reply
                  : "";

      if (!answer.trim()) {
        throw new Error(
          "The AI Tutor returned an empty response.",
        );
      }

      setTutorMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to contact the AI Tutor.";

      setTutorMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          content: `Tutor error: ${message}`,
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const runExperiment = () => {
    setStatus("RUNNING");
    setRuns((current) => current + 1);

    window.setTimeout(() => {
      setResults(
        calculateResults(experiment.engineType, fields),
      );
      setStatus("COMPLETE");
    }, 500);
  };

  const reset = () => {
    setFields(initialFields);
    setResults(
      calculateResults(experiment.engineType, initialFields),
    );
    setStatus("READY");
    setObservations("");
  };

  const updateField = (id: string, value: string) => {
    setFields((current) =>
      current.map((field) =>
        field.id === id
          ? { ...field, value }
          : field,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/experiments"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Lab Catalog
          </Link>

          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            <Activity className="h-4 w-4 text-cyan-300" />
            Universal Laboratory Workspace
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#0B1018]">
          <header className="border-b border-white/10 p-6 lg:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{experiment.department}</Badge>
                  <Badge>{experiment.subject}</Badge>
                  <Badge accent>{engine.shortTitle}</Badge>
                </div>

                <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                  {experiment.title}
                </h1>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">
                  {engine.description}
                </p>
              </div>

              <div className="min-w-[230px] rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    ENGINE STATUS
                  </span>

                  <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] text-cyan-300">
                    {status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Gauge className="h-6 w-6 text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold">
                      {engine.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Session runs: {runs}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="border-t border-white/10 bg-[#080C12]/70 px-4 py-4 lg:px-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-400">
                  Experiment Command Center
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  One experiment session · one context · connected academic tools
                </div>
              </div>
              <div className="hidden rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.16em] text-emerald-300 sm:block">
                Context Synced
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <CommandButton
                active={activeCommand === "simulation"}
                icon={<Workflow className="h-4 w-4" />}
                label="Simulation"
                onClick={() => {
                  setActiveCommand("simulation");
                  document.getElementById("experiment-engine")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />

              {experiment.capabilities.aiTutor && (
                <CommandButton
                  active={activeCommand === "tutor"}
                  icon={<Bot className="h-4 w-4" />}
                  label="AI Tutor"
                  onClick={() => {
                    setActiveCommand("tutor");
                    openTutor();
                  }}
                />
              )}

              {experiment.capabilities.troubleshooting && (
                <CommandLink
                  href={`/troubleshooter?experiment=${encodeURIComponent(experiment.id)}`}
                  active={activeCommand === "troubleshooting"}
                  icon={<Wrench className="h-4 w-4" />}
                  label="Troubleshooter"
                  onClick={() => setActiveCommand("troubleshooting")}
                />
              )}

              {experiment.capabilities.vision && (
                <CommandLink
                  href={`/vision-inspector?experiment=${encodeURIComponent(experiment.id)}`}
                  active={activeCommand === "vision"}
                  icon={<Eye className="h-4 w-4" />}
                  label="Vision"
                  onClick={() => setActiveCommand("vision")}
                />
              )}

              {experiment.capabilities.viva && (
                <CommandLink
                  href={`/viva?experiment=${encodeURIComponent(experiment.id)}`}
                  active={activeCommand === "viva"}
                  icon={<GraduationCapIcon />}
                  label="AI Viva"
                  onClick={() => setActiveCommand("viva")}
                />
              )}

              {experiment.capabilities.report && (
                <CommandLink
                  href={`/reports?experiment=${encodeURIComponent(experiment.id)}`}
                  active={activeCommand === "report"}
                  icon={<Database className="h-4 w-4" />}
                  label="Report"
                  onClick={() => setActiveCommand("report")}
                />
              )}

              {experiment.capabilities.analytics && (
                <CommandLink
                  href={`/analytics?experiment=${encodeURIComponent(experiment.id)}`}
                  active={activeCommand === "analytics"}
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Analytics"
                  onClick={() => setActiveCommand("analytics")}
                />
              )}

              <CommandButton
                active={activeCommand === "overview"}
                icon={<BookOpen className="h-4 w-4" />}
                label="Overview"
                onClick={() => {
                  setActiveCommand("overview");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </section>

          <div id="experiment-engine" className="grid scroll-mt-6 gap-5 p-4 lg:grid-cols-[1.2fr_0.8fr] lg:p-6">
            <section className="rounded-2xl border border-white/10 bg-[#101722] p-5">
              <SectionHeader
                icon={<Workflow className="h-5 w-5 text-cyan-300" />}
                eyebrow="ENGINE CONTROLS"
                title={engine.shortTitle}
              />

              <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Objective
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {experiment.objective}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {fields.map((field) => (
                  <label
                    key={field.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-2 text-xs text-slate-400">
                      {field.label}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        value={field.value}
                        onChange={(event) =>
                          updateField(
                            field.id,
                            event.target.value,
                          )
                        }
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0B1018] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/40"
                      />

                      {field.unit && (
                        <span className="text-xs text-slate-500">
                          {field.unit}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={runExperiment}
                  disabled={status === "RUNNING"}
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#041018] disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {status === "RUNNING"
                    ? "Running..."
                    : "Run Experiment"}
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 hover:text-white"
                >
                  <Save className="h-4 w-4" />
                  Save Session
                </button>
              </div>

              <div className="mt-6">
                <SectionHeader
                  icon={
                    <BarChart3 className="h-5 w-5 text-cyan-300" />
                  }
                  eyebrow="ENGINE OUTPUT"
                  title="Computed Results"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  {results.map((result) => (
                    <div
                      key={result.label}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        {result.label}
                      </div>

                      <div className="mt-2 text-xl font-semibold text-white">
                        {result.value}
                      </div>

                      {result.detail && (
                        <div className="mt-1 text-xs text-slate-500">
                          {result.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-cyan-300" />
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Observations
                  </span>
                </div>

                <textarea
                  value={observations}
                  onChange={(event) =>
                    setObservations(event.target.value)
                  }
                  placeholder="Record observations, measurements, anomalies or conclusions..."
                  className="min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-[#0B1018] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />
              </div>
            </section>

            <aside className="space-y-5">
              <Panel
                title="Capability Matrix"
                icon={<Workflow className="h-5 w-5 text-cyan-300" />}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(experiment.capabilities)
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-3"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                        <span className="text-xs text-slate-300">
                          {
                            capabilityLabels[
                              key as keyof LabCatalogExperiment["capabilities"]
                            ]
                          }
                        </span>
                      </div>
                    ))}
                </div>
              </Panel>

              <Panel
                title="AI & Academic Tools"
                icon={<Sparkles className="h-5 w-5 text-cyan-300" />}
              >
                <div className="space-y-3">
                  {experiment.capabilities.aiTutor && (
                    <ToolRow
                      icon={<Bot className="h-4 w-4" />}
                      label="AI Tutor"
                      onClick={openTutor}
                    />
                  )}

                  {experiment.capabilities.vision && (
                    <ToolLink
                      href={`/vision-inspector?experiment=${encodeURIComponent(
                        experiment.id,
                      )}`}
                      icon={<Eye className="h-4 w-4" />}
                      label="Vision Inspector"
                    />
                  )}

                  {experiment.capabilities.viva && (
                    <ToolLink
                      href={`/viva?experiment=${encodeURIComponent(
                        experiment.id,
                      )}`}
                      icon={<Bot className="h-4 w-4" />}
                      label="AI Viva"
                    />
                  )}

                  {experiment.capabilities.report && (
                    <ToolLink
                      href={`/reports?experiment=${encodeURIComponent(
                        experiment.id,
                      )}`}
                      icon={<Database className="h-4 w-4" />}
                      label="Lab Report"
                    />
                  )}

                  {experiment.capabilities.analytics && (
                    <ToolLink
                      href="/analytics"
                      icon={<BarChart3 className="h-4 w-4" />}
                      label="Learning Analytics"
                    />
                  )}
                </div>
              </Panel>

              <Panel
                title="Experiment Context"
                icon={<Calculator className="h-5 w-5 text-cyan-300" />}
              >
                <div className="space-y-4">
                  <ContextRow
                    label="Department"
                    value={experiment.department}
                  />
                  <ContextRow
                    label="Subject"
                    value={experiment.subject}
                  />
                  <ContextRow
                    label="Module"
                    value={experiment.module}
                  />
                  <ContextRow
                    label="Learning Mode"
                    value={experiment.learningMode}
                  />
                  <ContextRow
                    label="Difficulty"
                    value={experiment.difficulty}
                  />
                </div>
              </Panel>

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-cyan-300" />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      LabMind Architecture
                    </div>
                    <div className="mt-1 text-sm font-medium text-white">
                      Engine → Session → AI → Analytics
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Results generated here are deterministic engine outputs.
                  AI features can explain or contextualize them later.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {tutorOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <section className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-cyan-400/15 bg-[#0B1018] shadow-2xl shadow-black/50">
              <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2.5 text-cyan-300">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-400">
                      Context-Aware AI Tutor
                    </div>
                    <h2 className="mt-1 text-base font-semibold text-white">
                      {experiment.title}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTutorOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-400 transition hover:text-white"
                  aria-label="Close AI Tutor"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="border-b border-white/10 px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Explain this experiment simply",
                    "What should I learn?",
                    "What mistakes should I avoid?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => askTutor(prompt)}
                      disabled={tutorLoading}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-5">
                {tutorMessages.map((message) => {
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-50"
                            : "border-white/10 bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        {!isUser && (
                          <div className="mb-1 text-[9px] uppercase tracking-[0.16em] text-cyan-400">
                            LabMind AI
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {tutorLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                      LabMind is thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 p-4">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void askTutor();
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={tutorInput}
                    onChange={(event) =>
                      setTutorInput(event.target.value)
                    }
                    disabled={tutorLoading}
                    placeholder="Ask about this experiment..."
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080C12] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40 disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      tutorLoading ||
                      !tutorInput.trim()
                    }
                    className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-[#041018] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    {tutorLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Badge({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
        accent
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/[0.03] text-slate-400"
      }`}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {icon}

      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {eyebrow}
        </div>

        <h2 className="mt-1 text-lg font-semibold text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101722] p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="font-semibold text-white">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function CommandButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${
        active
          ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
          : "border-white/10 bg-black/20 text-slate-400 hover:border-cyan-400/15 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function CommandLink({
  href,
  active,
  icon,
  label,
  onClick,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition ${
        active
          ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
          : "border-white/10 bg-black/20 text-slate-400 hover:border-cyan-400/15 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function GraduationCapIcon() {
  return <span className="text-sm leading-none">✦</span>;
}

function ToolRow({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
    >
      <span className="text-cyan-300">{icon}</span>
      <span className="text-sm text-slate-200">{label}</span>
      <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-300">
        Ready
      </span>
      <ArrowLeft className="h-4 w-4 rotate-180 text-slate-600 transition group-hover:text-cyan-300" />
    </button>
  );
}

function ToolLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:border-cyan-400/20"
    >
      <span className="text-cyan-300">{icon}</span>
      <span className="text-sm text-slate-200">{label}</span>
      <ArrowLeft className="ml-auto h-4 w-4 rotate-180 text-slate-500" />
    </Link>
  );
}

function ContextRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-200">{value}</div>
    </div>
  );
}