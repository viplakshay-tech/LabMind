
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const PRIMARY_MODEL = "gemini-3.6-flash";

const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
];

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

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const root = payload as Record<string, unknown>;
  const candidates = root.candidates;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return "";
  }

  const firstCandidate = candidates[0];

  if (!firstCandidate || typeof firstCandidate !== "object") {
    return "";
  }

  const content = (firstCandidate as Record<string, unknown>).content;

  if (!content || typeof content !== "object") {
    return "";
  }

  const parts = (content as Record<string, unknown>).parts;

  if (!Array.isArray(parts)) {
    return "";
  }

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

function classifyFailure(status: number | null): string {
  if (status === 401 || status === 403) {
    return "Gemini API authentication failed. Check GEMINI_API_KEY and its API permissions.";
  }

  if (status === 429) {
    return "Gemini rate limit or quota was reached. A fallback model was also attempted.";
  }

  if (status === 404) {
    return "The configured Gemini report model is unavailable for this API project.";
  }

  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return "Gemini is temporarily unavailable. A fallback model was also attempted.";
  }

  return `Gemini report request failed${status ? ` with HTTP ${status}` : ""}.`;
}

async function resolveExperiment(
  body: Record<string, unknown>,
  request: Request,
): Promise<Record<string, unknown> | null> {
  const direct = [
    body.experiment,
    body.experimentContext,
  ];

  for (const candidate of direct) {
    if (
      candidate &&
      typeof candidate === "object"
    ) {
      return candidate as Record<string, unknown>;
    }
  }

  const ids: string[] = [];

  if (
    typeof body.experimentId === "string" &&
    body.experimentId.trim()
  ) {
    ids.push(body.experimentId.trim());
  }

  const context =
    body.context &&
    typeof body.context === "object"
      ? (body.context as Record<string, unknown>)
      : null;

  if (
    context &&
    typeof context.experimentId === "string" &&
    context.experimentId.trim()
  ) {
    ids.push(context.experimentId.trim());
  }

  const referer =
    request.headers.get("referer") ?? "";

  const match = referer.match(
    /\/experiments\/([^/?#]+)(?:\/workspace)?(?:[/?#]|$)/i,
  );

  if (match?.[1]) {
    ids.push(decodeURIComponent(match[1]));
  }

  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    return null;
  }

  try {
    const module =
      (await import("@/data/experimentsData")) as Record<string, unknown>;

    const experiments = Array.isArray(module.experiments)
      ? module.experiments
      : Array.isArray(module.default)
        ? module.default
        : [];

    const resolved = experiments.find((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const record = item as Record<string, unknown>;

      return (
        typeof record.id === "string" &&
        uniqueIds.includes(record.id)
      );
    });

    return resolved &&
      typeof resolved === "object"
      ? (resolved as Record<string, unknown>)
      : null;
  } catch (error) {
    console.warn(
      "Unable to resolve report experiment:",
      error,
    );

    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Record<string, unknown>;

    const experiment =
      await resolveExperiment(body, request);

    if (!experiment) {
      return NextResponse.json(
        {
          error:
            "Experiment context is required. Select an experiment before generating the report.",
        },
        { status: 400 },
      );
    }

    const labState =
      body.labState ??
      body.state ??
      body.experimentState ??
      {};

    const apiKey =
      process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add it to .env.local and restart Next.js.",
        },
        { status: 500 },
      );
    }

    const safeExperiment = {
      id: experiment.id ?? null,
      code: experiment.code ?? null,
      title: experiment.title ?? null,
      category: experiment.category ?? null,
      objective: experiment.objective ?? null,
      theory: experiment.theory ?? null,
      apparatus:
        experiment.apparatus ??
        experiment.components ??
        null,
      booleanEquations:
        experiment.booleanEquations ??
        experiment.equations ??
        null,
      commonMistakes:
        experiment.commonMistakes ?? null,
      learningObjectives:
        experiment.learningObjectives ??
        null,
    };

    const reportPrompt = `
You are LabMind Report Generator, an AI assistant that creates structured engineering laboratory reports for B.Tech students.

Create a professional laboratory report using ONLY the supplied information.

IMPORTANT RULES:
- Never invent experimental readings.
- Never invent observed outputs.
- Clearly distinguish expected values from observed values.
- If information is unavailable, write "Not recorded".
- Keep the report technically accurate.
- Use the supplied experiment context as the primary source.
- Treat AI diagnostic information as supporting information, not experimental truth.

EXPERIMENT CONTEXT:
${JSON.stringify(safeExperiment, null, 2)}

RECORDED LAB STATE:
${JSON.stringify(labState, null, 2)}

Use this structure:

# Laboratory Experiment Report

## 1. Experiment Title

## 2. Objective

## 3. Theory

## 4. Apparatus / Components

## 5. Circuit / Experimental Setup

## 6. Procedure

## 7. Expected Results

## 8. Observed Results

## 9. Error / Fault Analysis

## 10. AI-Assisted Analysis

## 11. Viva Performance

## 12. Conclusion

## 13. Learning Outcomes

Rules:
- Use bullet points for lists.
- Use numbered lists for procedures.
- Use **bold** for important values.
- Clearly distinguish expected and observed outputs.
- Do not add information that is not present in the supplied context.
`.trim();

    const failures: Array<{
      model: string;
      status: number | null;
      message: string;
    }> = [];

    const models = [
      PRIMARY_MODEL,
      ...FALLBACK_MODELS,
    ];

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          console.log(
            `Lab Report Gemini request: model=${model}, attempt=${attempt + 1}`,
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
                contents: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: reportPrompt,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  topP: 0.9,
                  maxOutputTokens: 2200,
                },
              }),
              cache: "no-store",
            },
          );

          // IMPORTANT:
          // response.text is a function.
          // We must parse the response body.
          const payload = await response
            .json()
            .catch(() => null);

          const report =
            extractText(payload);

          if (response.ok && report) {
            console.log(
              `Lab report generated successfully using ${model}.`,
            );

            return NextResponse.json({
              report,
              model,
            });
          }

          const apiMessage =
            payload &&
            typeof payload === "object"
              ? JSON.stringify(payload)
              : `HTTP ${response.status}`;

          failures.push({
            model,
            status: response.status,
            message: apiMessage,
          });

          console.error(
            `Lab Report Gemini failed: model=${model}, attempt=${attempt + 1}, status=${response.status}`,
            payload,
          );

          if (
            response.status === 401 ||
            response.status === 403
          ) {
            break;
          }

          if (
            response.status !== 404 &&
            response.status !== 429 &&
            response.status !== 500 &&
            response.status !== 502 &&
            response.status !== 503 &&
            response.status !== 504
          ) {
            break;
          }
        } catch (error) {
          failures.push({
            model,
            status: null,
            message: getErrorMessage(error),
          });

          console.error(
            `Lab Report request exception: model=${model}, attempt=${attempt + 1}`,
            error,
          );
        }

        if (attempt === 0) {
          await sleep(1000);
        }
      }
    }

    const lastFailure =
      failures[failures.length - 1];

    return NextResponse.json(
      {
        error: classifyFailure(
          lastFailure?.status ?? null,
        ),
        details:
          process.env.NODE_ENV === "development"
            ? failures
            : undefined,
      },
      {
        status:
          lastFailure?.status &&
          lastFailure.status >= 400
            ? lastFailure.status
            : 503,
      },
    );
  } catch (error) {
    console.error(
      "Lab Report route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate the laboratory report.",
        details:
          process.env.NODE_ENV === "development"
            ? getErrorMessage(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}