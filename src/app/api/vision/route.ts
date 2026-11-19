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
    return "Unknown Gemini error.";
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

function classifyFailure(status: number | null, message: string): string {
  const lower = message.toLowerCase();

  if (status === 400) {
    return "Gemini rejected the vision request. Check the image format and image payload.";
  }

  if (status === 401 || status === 403 || lower.includes("api key")) {
    return "Gemini API authentication failed. Check GEMINI_API_KEY and its API permissions.";
  }

  if (
    status === 429 ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {
    return "Gemini rate limit or quota was reached. A fallback model was also attempted.";
  }

  if (
    status === 404 ||
    lower.includes("model") ||
    lower.includes("not found")
  ) {
    return "The configured Gemini vision model is unavailable for this API project.";
  }

  if (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return "Gemini is temporarily unavailable. A fallback model was also attempted.";
  }

  return `Gemini vision request failed${status ? ` with HTTP ${status}` : ""}.`;
}

async function resolveExperiment(
  body: Record<string, unknown>,
  request: Request,
): Promise<Record<string, unknown> | null> {
  const directCandidates: Record<string, unknown>[] = [];

  const experimentCandidates = [
    body.experiment,
    body.experimentContext,
  ];

  for (const candidate of experimentCandidates) {
    if (candidate && typeof candidate === "object") {
      directCandidates.push(candidate as Record<string, unknown>);
    }
  }

  if (directCandidates.length > 0) {
    return directCandidates[0];
  }

  const candidateIds: string[] = [];

  if (
    typeof body.experimentId === "string" &&
    body.experimentId.trim()
  ) {
    candidateIds.push(body.experimentId.trim());
  }

  const context =
    body.context && typeof body.context === "object"
      ? (body.context as Record<string, unknown>)
      : null;

  if (
    context &&
    typeof context.experimentId === "string" &&
    context.experimentId.trim()
  ) {
    candidateIds.push(context.experimentId.trim());
  }

  const referer = request.headers.get("referer") ?? "";

  const match = referer.match(
    /\/experiments\/([^/?#]+)(?:\/workspace)?(?:[/?#]|$)/i,
  );

  if (match?.[1]) {
    candidateIds.push(decodeURIComponent(match[1]));
  }

  const uniqueIds = [...new Set(candidateIds)];

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
      if (!item || typeof item !== "object") return false;

      const record = item as Record<string, unknown>;

      return (
        typeof record.id === "string" &&
        uniqueIds.includes(record.id)
      );
    });

    return resolved && typeof resolved === "object"
      ? (resolved as Record<string, unknown>)
      : null;
  } catch (error) {
    console.warn(
      "Unable to resolve Vision experiment context:",
      error,
    );

    return null;
  }
}

function cleanBase64(value: string): string {
  const commaIndex = value.indexOf(",");

  if (
    value.startsWith("data:") &&
    commaIndex !== -1
  ) {
    return value.slice(commaIndex + 1);
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const imageData =
      typeof body.imageData === "string"
        ? body.imageData
        : typeof body.dataUrl === "string"
          ? body.dataUrl
          : typeof body.base64 === "string"
            ? body.base64
            : typeof body.image === "string"
              ? body.image
              : "";

    const mimeType =
      typeof body.mimeType === "string"
        ? body.mimeType
        : typeof body.imageMimeType === "string"
          ? body.imageMimeType
          : typeof body.mime_type === "string"
            ? body.mime_type
            : "";

    if (!imageData.trim()) {
      return NextResponse.json(
        {
          error: "Image data is required.",
        },
        { status: 400 },
      );
    }

    if (!mimeType.trim()) {
      return NextResponse.json(
        {
          error: "Image MIME type is required.",
        },
        { status: 400 },
      );
    }

    const allowedTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ]);

    const normalizedMimeType = mimeType
      .trim()
      .toLowerCase();

    if (!allowedTypes.has(normalizedMimeType)) {
      return NextResponse.json(
        {
          error:
            "Unsupported image format. Please use JPG, PNG, WEBP, HEIC, or HEIF.",
        },
        { status: 400 },
      );
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

    const experiment = await resolveExperiment(body, request);

    const safeExperiment = experiment
      ? {
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
          commonMistakes:
            experiment.commonMistakes ?? null,
          learningObjectives:
            experiment.learningObjectives ?? null,
        }
      : null;

    const visionPrompt = `
You are LabMind Vision Inspector, an AI laboratory assistant for engineering students.

Analyze the supplied laboratory/circuit image.

Your task is to identify:

1. Visible components or modules.
2. Visible ICs or hardware markings when readable.
3. Visible wiring and connections.
4. Visible input/output labels.
5. Possible wiring or configuration mistakes.
6. Whether the visible setup appears consistent with the supplied experiment.
7. Practical checks the student should perform.

IMPORTANT RULES:
- Only describe what can reasonably be observed.
- Do not claim certainty when the image is unclear.
- Clearly separate visible facts from inference.
- Do not invent missing components or measurements.
- Treat possible faults as hypotheses unless directly visible.
- Keep the response educational and suitable for a B.Tech CSE/AIML student.

SUPPLIED EXPERIMENT CONTEXT:
${JSON.stringify(safeExperiment, null, 2)}

Use this structure:

### Visible Components
List the components that are reasonably visible.

### Wiring / Connections
Describe the visible wiring and connections.

### Possible Issues
List possible wiring/configuration issues and explain why each may matter.

### Recommended Checks
Provide a numbered list of practical checks.

### Confidence
Explain which observations are high confidence and which cannot be verified because of image quality or missing information.
`.trim();

    const base64Image = cleanBase64(imageData).trim();

    if (!base64Image) {
      return NextResponse.json(
        {
          error: "The supplied image data is empty.",
        },
        { status: 400 },
      );
    }

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
            `LabMind Vision request: model=${model}, attempt=${attempt + 1}`,
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
                        text: visionPrompt,
                      },
                      {
                        inline_data: {
                          mime_type: normalizedMimeType,
                          data: base64Image,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.2,
                  topP: 0.9,
                  maxOutputTokens: 1400,
                },
              }),
              cache: "no-store",
            },
          );

          const payload = await response
            .json()
            .catch(() => null);

          const responseText = extractText(payload);

          if (response.ok && responseText) {
            console.log(
              `LabMind Vision succeeded with ${model}.`,
            );

            return NextResponse.json({
              analysis: responseText,
              response: responseText,
              reply: responseText,
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
            `Vision Gemini failed: model=${model}, attempt=${attempt + 1}, status=${response.status}`,
            payload,
          );

          if (
            response.status === 401 ||
            response.status === 403
          ) {
            break;
          }

          if (
            response.status !== 400 &&
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
            `Vision Gemini request exception: model=${model}, attempt=${attempt + 1}`,
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
          lastFailure?.message ?? "",
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
    console.error("Vision route error:", error);

    return NextResponse.json(
      {
        error: "Failed to process the vision request.",
        details:
          process.env.NODE_ENV === "development"
            ? getErrorMessage(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}