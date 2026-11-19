import { NextResponse } from "next/server";

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown Gemini API error.";
  }
}

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const record = error as Record<string, unknown>;
  const directStatus = record.status;

  if (typeof directStatus === "number") return directStatus;
  if (typeof directStatus === "string") {
    const parsed = Number(directStatus);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const response = record.response;
  if (response && typeof response === "object") {
    const responseStatus = (response as Record<string, unknown>).status;
    if (typeof responseStatus === "number") return responseStatus;
    if (typeof responseStatus === "string") {
      const parsed = Number(responseStatus);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }

  return null;
}

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const root = payload as Record<string, unknown>;
  const candidates = root.candidates;

  if (!Array.isArray(candidates) || candidates.length === 0) return "";

  const firstCandidate = candidates[0];
  if (!firstCandidate || typeof firstCandidate !== "object") return "";

  const candidate = firstCandidate as Record<string, unknown>;
  const content = candidate.content;

  if (!content || typeof content !== "object") return "";

  const parts = (content as Record<string, unknown>).parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as Record<string, unknown>).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildPrompt({
  message,
  experiment,
  history,
  context,
}: {
  message: string;
  experiment: Record<string, unknown>;
  history?: unknown;
  context?: unknown;
}): string {
  const historyText = Array.isArray(history)
    ? history
        .slice(-8)
        .map((item) => {
          if (!item || typeof item !== "object") return "";
          const record = item as Record<string, unknown>;
          const role = typeof record.role === "string" ? record.role : "user";
          const content =
            typeof record.content === "string" ? record.content : "";
          return content ? `${role}: ${content}` : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  const safeExperiment = {
    id: experiment.id ?? null,
    code: experiment.code ?? null,
    title: experiment.title ?? null,
    category: experiment.category ?? null,
    objective: experiment.objective ?? null,
    theory: experiment.theory ?? null,
    apparatus: experiment.apparatus ?? experiment.components ?? null,
    equations: experiment.equations ?? null,
    commonMistakes: experiment.commonMistakes ?? null,
    learningObjectives: experiment.learningObjectives ?? null,
    inputs: experiment.inputs ?? null,
    expectedOutputs: experiment.expectedOutputs ?? null,
    observedOutputs: experiment.observedOutputs ?? null,
    currentState: experiment.currentState ?? null,
  };

  return `
You are LabMind AI Tutor, an intelligent laboratory assistant for B.Tech CSE/AIML engineering students.

Your job is to help the student understand the supplied laboratory experiment and current circuit state.

CORE RULES:
1. Answer using the supplied experiment information first.
2. Explain concepts clearly and practically for a B.Tech student.
3. Distinguish observed facts from possible causes.
4. Never invent readings, components, faults, measurements, or experiment results.
5. If information is missing, explicitly say that it is not available in the supplied context.
6. If a fault is present, treat it as a simulated fault unless the supplied context says otherwise.
7. For troubleshooting questions, start with what is observed, identify plausible causes, then suggest the next useful check.
8. For output questions, explain the Boolean/logical reason for the output.
9. Keep the answer concise but useful.
10. Use bullets or numbered steps when they improve readability.

EXPERIMENT CONTEXT:
${JSON.stringify(safeExperiment, null, 2)}

ADDITIONAL CONTEXT:
${JSON.stringify(context ?? null, null, 2)}

RECENT CONVERSATION:
${historyText || "No previous conversation."}

STUDENT QUESTION:
${message}

Provide the best educational answer now.
`.trim();
}

function classifyApiFailure(status: number | null, message: string): string {
  const lower = message.toLowerCase();

  if (status === 401 || status === 403 || lower.includes("api key")) {
    return "Gemini API authentication/access failed. Check GEMINI_API_KEY and its project/API permissions.";
  }

  if (status === 429 || lower.includes("quota") || lower.includes("rate limit")) {
    return "Gemini rate limit or quota reached. A fallback model was also attempted.";
  }

  if (status === 404 || lower.includes("not found") || lower.includes("model")) {
    return "The configured Gemini model is unavailable for this API key/project. A fallback model was also attempted.";
  }

  return `Gemini request failed: ${message}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    let experiment =
      body?.experiment && typeof body.experiment === "object"
        ? (body.experiment as Record<string, unknown>)
        : null;

    // Some LabMind callers only know the experiment from the current
    // workspace URL. Resolve that context server-side when the client does
    // not include the full experiment object.
    if (!experiment) {
      const candidateIds: string[] = [];

      if (typeof body?.experimentId === "string" && body.experimentId.trim()) {
        candidateIds.push(body.experimentId.trim());
      }

      const referer = request.headers.get("referer") ?? "";
      const match = referer.match(/\/experiments\/([^/?#]+)(?:\/workspace)?(?:[/?#]|$)/i);
      if (match?.[1]) {
        candidateIds.push(decodeURIComponent(match[1]));
      }

      const contextExperimentId =
        body?.context && typeof body.context === "object" &&
        typeof (body.context as Record<string, unknown>).experimentId === "string"
          ? String((body.context as Record<string, unknown>).experimentId)
          : "";

      if (contextExperimentId.trim()) {
        candidateIds.push(contextExperimentId.trim());
      }

      const uniqueIds = [...new Set(candidateIds)];

      if (uniqueIds.length > 0) {
        try {
          const experimentModule = (await import("@/data/experimentsData")) as Record<string, unknown>;
          const storedExperiments = Array.isArray(experimentModule.experiments)
            ? experimentModule.experiments
            : Array.isArray(experimentModule.default)
              ? experimentModule.default
              : [];

          const resolved = storedExperiments.find((item) => {
            if (!item || typeof item !== "object") return false;
            const record = item as Record<string, unknown>;
            return typeof record.id === "string" && uniqueIds.includes(record.id);
          });

          if (resolved && typeof resolved === "object") {
            experiment = resolved as Record<string, unknown>;
          }
        } catch (resolveError) {
          console.warn("Unable to resolve experiment context from local data:", resolveError);
        }
      }
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    // Keep the tutor usable even when the caller is outside an experiment
    // workspace. In that case Gemini receives a minimal context instead of
    // the request being rejected before the model is called.
    if (!experiment) {
      experiment = {
        id: null,
        code: null,
        title: "Engineering Laboratory",
        category: "Digital Electronics",
        objective: null,
        theory: null,
        apparatus: null,
        equations: null,
        commonMistakes: null,
        learningObjectives: null,
        inputs: null,
        expectedOutputs: null,
        observedOutputs: null,
        currentState: null,
      };
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add it to .env.local and restart Next.js.",
        },
        { status: 500 },
      );
    }

    const prompt = buildPrompt({
      message,
      experiment,
      history: body?.history,
      context: body?.context,
    });

    const models = [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
    const failures: Array<{
      model: string;
      status: number | null;
      message: string;
    }> = [];

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          console.log(
            `LabMind Gemini request: model=${model}, attempt=${attempt + 1}`,
          );

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                system_instruction: {
                  parts: [
                    {
                      text:
                        "You are LabMind AI Tutor. Follow the supplied laboratory context exactly and never invent experimental evidence.",
                    },
                  ],
                },
                contents: [
                  {
                    role: "user",
                    parts: [{ text: prompt }],
                  },
                ],
                generationConfig: {
                  temperature: 0.4,
                  topP: 0.9,
                  maxOutputTokens: 1200,
                },
              }),
              cache: "no-store",
            },
          );

          const payload = await response.json().catch(() => null);
          const responseText = extractText(payload);

          if (response.ok && responseText) {
            console.log(`Gemini response received from ${model}.`);

            return NextResponse.json({
              response: responseText,
              reply: responseText,
              answer: responseText,
              model,
            });
          }

          const apiMessage =
            payload && typeof payload === "object"
              ? JSON.stringify(payload)
              : `HTTP ${response.status}`;

          const failure = {
            model,
            status: response.status,
            message: apiMessage,
          };

          failures.push(failure);

          console.error(
            `Gemini failed: model=${model}, attempt=${attempt + 1}, status=${response.status}`,
            payload,
          );

          if (response.status === 401 || response.status === 403) {
            break;
          }

          if (response.status !== 429 && response.status !== 500 && response.status !== 502 && response.status !== 503 && response.status !== 504) {
            break;
          }
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          const status = getErrorStatus(error);

          failures.push({
            model,
            status,
            message: errorMessage,
          });

          console.error(
            `Gemini request exception: model=${model}, attempt=${attempt + 1}`,
            error,
          );
        }

        if (attempt === 0) {
          await sleep(1500);
        }
      }
    }

    const has503 = failures.some((failure) => failure.status === 503);
    const has429 = failures.some((failure) => failure.status === 429);
    const hasAuthFailure = failures.some(
      (failure) => failure.status === 401 || failure.status === 403,
    );
    const has404Only = failures.length > 0 && failures.every((failure) => failure.status === 404);

    const diagnosticMessage =
      has503
        ? "Gemini is currently experiencing high demand. The available fallback models were also unavailable. Please retry shortly."
        : has429
          ? "Gemini rate limit or quota reached. Please retry in a moment."
          : hasAuthFailure
            ? "Gemini API authentication or project access failed. Check GEMINI_API_KEY and API permissions."
            : has404Only
              ? "None of the configured Gemini models is available to this API key/project."
              : "Gemini request failed. Check the server console for the underlying API error.";

    const responseStatus =
      has503 ? 503 : has429 ? 429 : hasAuthFailure ? 403 : has404Only ? 404 : 502;

    console.error("All LabMind Gemini models failed:", failures);

    return NextResponse.json(
      {
        error: diagnosticMessage,
        details: process.env.NODE_ENV === "development" ? failures : undefined,
      },
      { status: responseStatus },
    );
  } catch (error) {
    console.error("Gemini route error:", error);

    return NextResponse.json(
      {
        error: `Failed to process Gemini request: ${getErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}
