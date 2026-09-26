"use client";

import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Database,
  Loader2,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { saveDiagnosticSession } from "@/lib/database";
import type { Experiment } from "@/types/experiment";
import type { DiagnosticResult } from "@/types/diagnostic";

interface AIDiagnosticPanelProps {
  experiment: Experiment;
  result: DiagnosticResult;
}

export default function AIDiagnosticPanel({
  experiment,
  result,
}: AIDiagnosticPanelProps) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const analyzeState = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSaveError("");

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `
Analyze the current laboratory fault state.

Do not simply repeat the deterministic diagnostic result.
Use the supplied experiment information and current circuit state to explain:

1. What is happening in the circuit.
2. Why the observed output differs from the expected output, if it does.
3. Which root cause is most plausible and why.
4. What the student should check first.
5. How the student can confirm that the problem is fixed.

Keep the explanation practical for a B.Tech engineering student.
Do not invent components, measurements, or faults that are not present in the supplied context.
          `,
          experimentContext: {
            experiment: {
              id: experiment.id,
              code: experiment.code,
              title: experiment.title,
              objective: experiment.objective,
              theory: experiment.theory,
              apparatus: experiment.apparatus,
              commonMistakes: experiment.commonMistakes,
            },

            diagnosticState: {
              severity: result.severity,
              overallStatus: result.overallStatus,
              confidenceScore: result.confidenceScore,
              stimulusVector: result.stimulusVector,
              expectedOutputs: result.expectedOutputs,
              observedOutputs: result.observedOutputs,
              differentials: result.differentials,
              activeFaultLabels: result.activeFaultLabels,
              activeFaultExplanation:
                result.activeFaultExplanation,
              hypotheses: result.hypotheses,
              checklistSteps: result.checklistSteps,
            },
          },
        }),
      });

      const data = await response.json();

      console.log("AI Diagnostic API response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      const aiResponse =
        data?.response ??
        data?.text ??
        data?.message ??
        data?.answer;

      if (
        typeof aiResponse !== "string" ||
        aiResponse.trim().length === 0
      ) {
        throw new Error(
          "I did not receive a response from the AI.",
        );
      }

      setAnalysis(aiResponse);
    } catch (err) {
      console.error("AI Diagnostic error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to obtain AI diagnostic analysis.",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveDiagnostic = async () => {
    if (saving || saved) {
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      await saveDiagnosticSession({
        experimentId: experiment.id,
        stimulusVector: result.stimulusVector,
        expectedOutputs: result.expectedOutputs,
        observedOutputs: result.observedOutputs,
        severity: result.severity,
        overallStatus: result.overallStatus,
        confidenceScore: result.confidenceScore,
        activeFaults: result.activeFaultLabels,
        hypotheses: result.hypotheses,
        checklist: result.checklistSteps,
        aiAnalysis: analysis || null,
      });

      setSaved(true);
    } catch (err) {
      console.error("Diagnostic persistence error:", err);

      setSaveError(
        err instanceof Error
          ? err.message
          : "Unable to save diagnostic session.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lab-panel border-violet-500/20 p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
              <Bot className="h-4 w-4 text-violet-300" />
            </div>

            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                GENERATIVE AI
              </div>

              <h2 className="text-lg font-semibold text-white">
                LabMind AI Diagnostic Analysis
              </h2>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Gemini analyzes the current experiment state together with
            deterministic diagnostic evidence and explains the likely fault.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={analyzeState}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Current State
              </>
            )}
          </button>

          <button
            type="button"
            onClick={saveDiagnostic}
            disabled={saving || saved}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Save to Lab History
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
          {error}
        </div>
      )}

      {saveError && (
        <div className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-300">
          {saveError}
        </div>
      )}

      {!analysis && !error && !loading && (
        <div className="mt-5 rounded-xl border border-slate-700/30 bg-surface-low p-5">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />

            <div>
              <p className="text-sm leading-7 text-slate-300">
                Analyze the current state for a natural-language explanation,
                then save the diagnostic session to your LabMind history.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-700/30 bg-surface-low p-5 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-violet-300" />
          LabMind is analyzing the current circuit state...
        </div>
      )}

      {analysis && !loading && (
        <div className="mt-5 rounded-xl border border-slate-700/30 bg-surface-low p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="lab-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
              AI ANALYSIS READY
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mt-5 text-base font-semibold text-white first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-5 text-sm font-semibold text-violet-200 first:mt-0">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="leading-7 text-slate-300">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="ml-5 list-disc space-y-1 text-slate-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="ml-5 list-decimal space-y-1 text-slate-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="pl-1 leading-6">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">
                    {children}
                  </strong>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}