"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  Download,
  FileText,
  FlaskConical,
  Loader2,
  Printer,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { experiments } from "@/data/experimentsData";
import { saveLabReport } from "@/lib/database";

export default function LabReportGenerator() {
  const [experimentId, setExperimentId] = useState(
    experiments[0]?.id ?? "",
  );

  const [studentName, setStudentName] = useState("Student");
  const [observation, setObservation] = useState("");

  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const selectedExperiment = useMemo(
    () =>
      experiments.find(
        (experiment) => experiment.id === experimentId,
      ) ?? experiments[0],
    [experimentId],
  );

  const generateReport = async () => {
    if (!selectedExperiment) {
      setError("Please select an experiment.");
      return;
    }

    setLoading(true);
    setError("");
    setSaveError("");
    setSaved(false);
    setReport("");

    try {
      const inputNames = selectedExperiment.truthTableSpec.inputs;
      const outputNames = selectedExperiment.truthTableSpec.outputs;

      const currentInputs = Object.fromEntries(
        inputNames.map((name) => [name, 0]),
      );

      const expectedOutputs = Object.fromEntries(
        outputNames.map((name) => [name, "Not recorded"]),
      );

      const observedOutputs = Object.fromEntries(
        outputNames.map((name) => [name, "Not recorded"]),
      );

      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: studentName.trim() || "Student",

          experimentContext: {
            id: selectedExperiment.id,
            code: selectedExperiment.code,
            title: selectedExperiment.title,
            objective: selectedExperiment.objective,
            theory: selectedExperiment.theory,
            apparatus: selectedExperiment.apparatus,
            commonMistakes: selectedExperiment.commonMistakes,
          },

          labState: {
            currentInputs,
            expectedOutputs,
            observedOutputs,
            observation:
              observation.trim() || "Not recorded",
          },

          diagnosticResult: null,

          vivaSummary: null,
        }),
      });

      const data = await response.json();

      console.log("Lab report API response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      if (
        typeof data?.report !== "string" ||
        data.report.trim().length === 0
      ) {
        throw new Error(
          "The AI returned an empty laboratory report.",
        );
      }

      setReport(data.report);
      setSaved(false);
      setSaveError("");
    } catch (err) {
      console.error("Lab report error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the laboratory report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (
      !report ||
      !selectedExperiment ||
      saving ||
      saved
    ) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await saveLabReport({
        experimentId: selectedExperiment.id,
        title: `${selectedExperiment.code} - ${selectedExperiment.title}`,
        contentMarkdown: report,
        metadata: {
          studentName:
            studentName.trim() || "Student",
          observation:
            observation.trim() || "Not recorded",
          generatedAt: new Date().toISOString(),
        },
      });

      setSaved(true);
    } catch (err) {
      console.error("Report persistence error:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Unable to save the report.",
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadReport = () => {
    if (!report) {
      return;
    }

    const blob = new Blob([report], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;

    anchor.download = `${
      selectedExperiment?.code ?? "LabMind"
    }-lab-report.md`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!report) {
      return;
    }

    window.print();
  };

  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
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
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                AUTOMATED DOCUMENTATION · AI REPORTING
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Lab Report Generator
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Generate a structured engineering laboratory report from the
                selected experiment and recorded laboratory information.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2">
              <Sparkles className="h-4 w-4 text-violet-300" />

              <span className="lab-mono text-[10px] uppercase tracking-wider text-violet-200">
                AI REPORT ENGINE
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {/* Left panel */}
          <div className="space-y-6">
            <div className="lab-panel p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                  <FlaskConical className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    REPORT SETUP
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Experiment Details
                  </h2>
                </div>
              </div>

              <div className="space-y-5">
                {/* Student */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Student Name
                  </label>

                  <input
                    value={studentName}
                    onChange={(event) =>
                      setStudentName(event.target.value)
                    }
                    placeholder="Enter student name"
                    className="w-full rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/40"
                  />
                </div>

                {/* Experiment */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Experiment
                  </label>

                  <select
                    value={experimentId}
                    onChange={(event) => {
                      setExperimentId(event.target.value);
                      setSaved(false);
                      setSaveError("");
                    }}
                    className="w-full rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary/40"
                  >
                    {experiments.map((experiment) => (
                      <option
                        key={experiment.id}
                        value={experiment.id}
                      >
                        {experiment.code} — {experiment.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experiment info */}
                {selectedExperiment && (
                  <div className="rounded-xl border border-slate-700/30 bg-surface-low p-4">
                    <div className="lab-mono text-[10px] uppercase tracking-wider text-primary">
                      {selectedExperiment.code}
                    </div>

                    <div className="mt-2 text-sm font-medium text-white">
                      {selectedExperiment.title}
                    </div>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {selectedExperiment.objective}
                    </p>
                  </div>
                )}

                {/* Observation */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Observation / Notes
                  </label>

                  <textarea
                    value={observation}
                    onChange={(event) =>
                      setObservation(event.target.value)
                    }
                    rows={6}
                    placeholder="Enter observations, measured values, or notes from the laboratory session..."
                    className="w-full resize-none rounded-xl border border-slate-700/40 bg-surface-low px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-primary/40"
                  />
                </div>

                {/* Generation error */}
                {error && (
                  <div className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
                    {error}
                  </div>
                )}

                {/* Save error */}
                {saveError && (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-300">
                    {saveError}
                  </div>
                )}

                {/* Generate */}
                <button
                  type="button"
                  onClick={generateReport}
                  disabled={loading || !selectedExperiment}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Laboratory Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Integration status */}
            <div className="lab-panel p-6">
              <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                CURRENT INTEGRATION
              </div>

              <div className="mt-4 space-y-2">
                <StatusItem
                  label="Experiment context"
                  active
                />

                <StatusItem
                  label="Lab observations"
                  active={Boolean(observation.trim())}
                />

                <StatusItem
                  label="Supabase report storage"
                  active={saved}
                />

                <StatusItem
                  label="Diagnostic result"
                  active={false}
                />

                <StatusItem
                  label="Viva performance"
                  active={false}
                />
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-600">
                Diagnostic and viva information will be connected to the
                report in a later integration pass.
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="lab-panel min-h-[700px] p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                  <FileText className="h-4 w-4 text-violet-300" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                    REPORT PREVIEW
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Generated Laboratory Report
                  </h2>
                </div>
              </div>

              {/* Report actions */}
              {report && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={saveReport}
                    disabled={saving || saved}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Database className="h-3.5 w-3.5" />
                        Save to Lab History
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={downloadReport}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-primary transition hover:bg-primary/15"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={printReport}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700/40 bg-surface-low px-3 py-2 text-xs text-slate-300 transition hover:text-white"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print
                  </button>
                </div>
              )}
            </div>

            {/* Empty */}
            {!report && !loading && (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                  <FileText className="h-7 w-7 text-violet-300" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  No report generated
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  Select an experiment, enter your observations, and click
                  Generate Laboratory Report.
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex min-h-[560px] flex-col items-center justify-center text-center">
                <Loader2 className="h-9 w-9 animate-spin text-violet-300" />

                <h3 className="mt-5 text-lg font-semibold text-white">
                  LabMind is preparing your report
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  Organizing theory, procedure, observations, results, and
                  conclusion...
                </p>
              </div>
            )}

            {/* Report */}
            {report && !loading && (
              <div
                id="lab-report"
                className="rounded-xl border border-slate-700/30 bg-surface-low p-6 md:p-8"
              >
                <article className="max-w-none text-sm">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="mb-6 border-b border-slate-700/40 pb-4 text-2xl font-semibold text-white">
                          {children}
                        </h1>
                      ),

                      h2: ({ children }) => (
                        <h2 className="mt-8 border-b border-slate-700/20 pb-2 text-lg font-semibold text-white first:mt-0">
                          {children}
                        </h2>
                      ),

                      h3: ({ children }) => (
                        <h3 className="mt-6 text-base font-semibold text-violet-200">
                          {children}
                        </h3>
                      ),

                      p: ({ children }) => (
                        <p className="my-3 leading-7 text-slate-300">
                          {children}
                        </p>
                      ),

                      ul: ({ children }) => (
                        <ul className="my-3 ml-5 list-disc space-y-1 text-slate-300">
                          {children}
                        </ul>
                      ),

                      ol: ({ children }) => (
                        <ol className="my-3 ml-5 list-decimal space-y-1 text-slate-300">
                          {children}
                        </ol>
                      ),

                      li: ({ children }) => (
                        <li className="pl-1 leading-7">
                          {children}
                        </li>
                      ),

                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">
                          {children}
                        </strong>
                      ),

                      code: ({ children }) => (
                        <code className="rounded bg-slate-800/70 px-1.5 py-0.5 font-mono text-xs text-primary">
                          {children}
                        </code>
                      ),

                      table: ({ children }) => (
                        <div className="my-5 overflow-x-auto rounded-lg border border-slate-700/40">
                          <table className="min-w-full text-left text-xs">
                            {children}
                          </table>
                        </div>
                      ),

                      th: ({ children }) => (
                        <th className="border-b border-slate-700/40 bg-slate-800/40 px-3 py-3 font-semibold text-white">
                          {children}
                        </th>
                      ),

                      td: ({ children }) => (
                        <td className="border-b border-slate-800/30 px-3 py-3 text-slate-300">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {report}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusItem({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-surface-low px-3 py-3">
      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span
        className={
          active
            ? "lab-mono text-[10px] text-emerald-400"
            : "lab-mono text-[10px] text-slate-600"
        }
      >
        {active ? "CONNECTED" : "NEXT"}
      </span>
    </div>
  );
}