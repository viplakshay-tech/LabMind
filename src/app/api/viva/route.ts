import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const PRIMARY_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
];

type VivaAction = "generate" | "evaluate";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const status = Number(
      (error as { status?: unknown }).status,
    );

    return Number.isFinite(status)
      ? status
      : undefined;
  }

  return undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String(
      (error as { message?: unknown }).message,
    );
  }

  return String(error);
}

function getJsonSchema(action: VivaAction) {
  if (action === "generate") {
    return {
      type: "object",
      properties: {
        question: {
          type: "string",
        },
        topic: {
          type: "string",
        },
        difficulty: {
          type: "string",
          enum: [
            "easy",
            "medium",
            "hard",
          ],
        },
        expectedConcept: {
          type: "string",
        },
      },
      required: [
        "question",
        "topic",
        "difficulty",
        "expectedConcept",
      ],
    };
  }

  return {
    type: "object",
    properties: {
      score: {
        type: "number",
      },
      maxScore: {
        type: "number",
      },
      correct: {
        type: "boolean",
      },
      feedback: {
        type: "string",
      },
      missingConcepts: {
        type: "array",
        items: {
          type: "string",
        },
      },
      idealAnswer: {
        type: "string",
      },
      nextDifficulty: {
        type: "string",
        enum: [
          "easy",
          "medium",
          "hard",
        ],
      },
    },
    required: [
      "score",
      "maxScore",
      "correct",
      "feedback",
      "missingConcepts",
      "idealAnswer",
      "nextDifficulty",
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action =
      body?.action as VivaAction;

    const experimentContext =
      body?.experimentContext;

    const difficulty =
      body?.difficulty ?? "medium";

    const previousQuestion =
      body?.previousQuestion ?? "";

    const studentAnswer =
      body?.studentAnswer ?? "";

    const questionNumber =
      body?.questionNumber ?? 1;

    if (
      action !== "generate" &&
      action !== "evaluate"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid viva action.",
        },
        { status: 400 },
      );
    }

    if (!experimentContext) {
      return NextResponse.json(
        {
          error:
            "Experiment context is required.",
        },
        { status: 400 },
      );
    }

    if (
      action === "evaluate" &&
      !studentAnswer.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Student answer is required.",
        },
        { status: 400 },
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured.",
        },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const context = JSON.stringify(
      experimentContext,
      null,
      2,
    );

    let prompt = "";

    if (action === "generate") {
      prompt = `
You are LabMind Adaptive Viva Examiner.

Generate ONE viva question for the engineering laboratory experiment below.

EXPERIMENT CONTEXT:
${context}

Difficulty:
${difficulty}

Question number:
${questionNumber}

Previous question:
${previousQuestion || "None"}

Generate a question that tests actual understanding rather than memorization.

For medium and hard questions, prefer:
- circuit reasoning
- output prediction
- Boolean logic
- troubleshooting
- experiment procedure
- component/function understanding
- real laboratory situations

Avoid repeating the previous question.

Return a single question specifically grounded in the supplied experiment context.
`;
    } else {
      prompt = `
You are LabMind Adaptive Viva Examiner.

Evaluate a student's answer to the viva question below.

EXPERIMENT CONTEXT:
${context}

QUESTION:
${previousQuestion}

STUDENT ANSWER:
${studentAnswer}

Evaluate the answer based on conceptual correctness for this experiment.

Scoring guidance:
0-2 = incorrect or largely unrelated
3-4 = major conceptual gaps
5-6 = partially correct
7-8 = substantially correct
9-10 = clear and technically correct

Do not punish minor wording differences.
Focus on understanding.
`;
    }

    const modelsToTry = [
      PRIMARY_MODEL,
      ...FALLBACK_MODELS,
    ];

    const errors: Array<{
      model: string;
      status?: number;
      message: string;
    }> = [];

    for (
      const model of modelsToTry
    ) {
      for (
        let attempt = 0;
        attempt < 2;
        attempt++
      ) {
        try {
          console.log(
            `Viva Gemini request: action=${action}, model=${model}, attempt=${attempt + 1}`,
          );

          const response =
            await ai.models.generateContent(
              {
                model,
                contents: prompt,
                config: {
                  responseMimeType:
                    "application/json",
                  responseSchema:
                    getJsonSchema(action),
                  maxOutputTokens: 1200,
                },
              },
            );

          const text =
            response.text?.trim();

          if (!text) {
            throw new Error(
              "Gemini returned an empty response.",
            );
          }

          let parsed: unknown;

          try {
            parsed = JSON.parse(text);
          } catch (parseError) {
            console.error(
              `Viva JSON parse failed for ${model}:`,
              text,
            );

            throw new Error(
              `Gemini returned invalid JSON: ${getErrorMessage(parseError)}`,
            );
          }

          return NextResponse.json({
            result: parsed,
            model,
          });
        } catch (error: unknown) {
          const status =
            getErrorStatus(error);

          const message =
            getErrorMessage(error);

          errors.push({
            model,
            status,
            message,
          });

          console.error(
            `Viva Gemini error: model=${model}, attempt=${attempt + 1}, status=${status ?? "unknown"}`,
            error,
          );

          /*
           * Retry rate limiting and temporary service errors.
           */
          if (
            status === 429 ||
            status === 500 ||
            status === 502 ||
            status === 503 ||
            status === 504
          ) {
            if (attempt === 0) {
              await sleep(750);
              continue;
            }

            break;
          }

          /*
           * Authentication, invalid request, invalid model,
           * safety or other deterministic errors should not
           * be retried twice against the same model.
           */
          break;
        }
      }
    }

    const primaryError =
      errors.find(
        (entry) =>
          entry.model === PRIMARY_MODEL,
      );

    const anyRateLimit =
      errors.some(
        (entry) =>
          entry.status === 429,
      );

    const anyTemporaryError =
      errors.some(
        (entry) =>
          entry.status === 500 ||
          entry.status === 502 ||
          entry.status === 503 ||
          entry.status === 504,
      );

    console.error(
      "All Viva Gemini models failed:",
      errors,
    );

    /*
     * Return useful diagnostics to the frontend instead of
     * incorrectly labelling every failure as "Gemini unavailable".
     */
    let publicMessage =
      "The viva AI request could not be completed.";

    if (anyRateLimit) {
      publicMessage =
        "Gemini rate limit reached. Please retry in a moment.";
    } else if (primaryError?.status === 401) {
      publicMessage =
        "Gemini API authentication failed. Check GEMINI_API_KEY.";
    } else if (
      primaryError?.status === 403
    ) {
      publicMessage =
        "Gemini API access was denied. Check the API key/project permissions.";
    } else if (anyTemporaryError) {
      publicMessage =
        "Gemini is temporarily unavailable. A fallback model was also tried.";
    } else if (errors.length > 0) {
      publicMessage =
        `Viva AI request failed: ${errors[0].message}`;
    }

    return NextResponse.json(
      {
        error: publicMessage,
        details:
          process.env.NODE_ENV ===
          "development"
            ? errors
            : undefined,
      },
      { status: 503 },
    );
  } catch (error) {
    console.error(
      "Viva route error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to process the viva request.",
      },
      { status: 500 },
    );
  }
}