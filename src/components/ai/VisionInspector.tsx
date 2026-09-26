"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileImage,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { experiments } from "@/data/experimentsData";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export default function VisionInspector() {
  const [selectedExperimentId, setSelectedExperimentId] = useState(
    experiments[0]?.id ?? "",
  );

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedExperiment = useMemo(
    () =>
      experiments.find(
        (experiment) => experiment.id === selectedExperimentId,
      ) ?? experiments[0],
    [selectedExperimentId],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setError("");
    setAnalysis("");

    if (!SUPPORTED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setPreviewUrl("");
      setError(
        "Unsupported image format. Please use JPG, PNG, WEBP, HEIC, or HEIF.",
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setPreviewUrl("");
      setError("Image is too large. Please select an image below 10 MB.");
      return;
    }

    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(null);
    setPreviewUrl("");
    setAnalysis("");
    setError("");
  };

  const analyzeImage = async () => {
    if (!file || !selectedExperiment) {
      setError("Please select an experiment and upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const imageDataUrl = await readFileAsDataUrl(file);

      const commaIndex = imageDataUrl.indexOf(",");

      if (commaIndex === -1) {
        throw new Error("Unable to prepare the image for analysis.");
      }

      const imageBase64 = imageDataUrl.slice(commaIndex + 1);

      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type,
          experimentContext: {
            id: selectedExperiment.id,
            code: selectedExperiment.code,
            title: selectedExperiment.title,
            objective: selectedExperiment.objective,
            theory: selectedExperiment.theory,
            apparatus: selectedExperiment.apparatus,
            commonMistakes: selectedExperiment.commonMistakes,
          },
        }),
      });

      const data = await response.json();

      console.log("Vision API response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error || `Request failed with status ${response.status}`,
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
        throw new Error("The AI returned an empty analysis.");
      }

      setAnalysis(aiResponse);
    } catch (err) {
      console.error("Vision Inspector error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze the uploaded image.",
      );
    } finally {
      setLoading(false);
    }
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

        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                COMPUTER VISION · CIRCUIT ANALYSIS
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Circuit Vision Inspector
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Upload a laboratory circuit image and let LabMind analyze
                visible components, wiring, possible mistakes, and recommended
                checks.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              <span className="lab-mono text-[10px] uppercase tracking-wider text-violet-200">
                Gemini Vision
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  EXPERIMENT CONTEXT
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Select Experiment
                </h2>
              </div>

              <select
                value={selectedExperimentId}
                onChange={(event) =>
                  setSelectedExperimentId(event.target.value)
                }
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

              {selectedExperiment && (
                <div className="mt-4 rounded-xl border border-slate-700/30 bg-surface-low p-4">
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
            </div>

            <div className="lab-panel p-6">
              <div className="mb-5">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  IMAGE INPUT
                </div>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Upload Circuit Image
                </h2>
              </div>

              {!file ? (
                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/50 bg-surface-low px-6 py-12 text-center transition hover:border-primary/30 hover:bg-primary/5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>

                  <div className="mt-4 text-sm font-medium text-white">
                    Choose a circuit image
                  </div>

                  <div className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
                    JPG, PNG, WEBP, HEIC or HEIF
                    <br />
                    Maximum size: 10 MB
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-700/30 bg-surface-low">
                  <div className="relative flex min-h-[300px] items-center justify-center bg-slate-950/40 p-4">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Uploaded circuit"
                        className="max-h-[420px] max-w-full rounded-lg object-contain"
                      />
                    )}

                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-950/80 text-slate-300 transition hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-700/30 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileImage className="h-4 w-4 shrink-0 text-primary" />

                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-slate-200">
                          {file.name}
                        </div>

                        <div className="mt-0.5 text-[10px] text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={analyzeImage}
                disabled={!file || loading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Circuit...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Circuit
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lab-panel min-h-[600px] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                <Bot className="h-4 w-4 text-violet-300" />
              </div>

              <div>
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                  AI ANALYSIS
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Vision Results
                </h2>
              </div>
            </div>

            {!analysis && !loading && (
              <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                  <ImageIcon className="h-7 w-7 text-violet-300" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  No analysis yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  Upload a circuit image and click{" "}
                  <span className="text-violet-300">
                    Analyze Circuit
                  </span>{" "}
                  to generate an AI-assisted inspection.
                </p>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                <Loader2 className="h-9 w-9 animate-spin text-violet-300" />

                <h3 className="mt-5 text-lg font-semibold text-white">
                  LabMind is inspecting the image
                </h3>

                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                  Identifying visible components, connections, and possible
                  issues...
                </p>
              </div>
            )}

            {analysis && !loading && (
              <div>
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                  <span className="lab-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    ANALYSIS COMPLETE
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <ReactMarkdown
                    components={{
                      h2: ({ children }) => (
                        <h2 className="mt-6 text-base font-semibold text-white first:mt-0">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mt-6 text-sm font-semibold text-violet-200 first:mt-0">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="leading-7 text-slate-300">
                          {children}
                        </p>
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
                      code: ({ children }) => (
                        <code className="rounded bg-slate-800/70 px-1.5 py-0.5 font-mono text-xs text-primary">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read image."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to read the selected image."));
    };

    reader.readAsDataURL(file);
  });
}