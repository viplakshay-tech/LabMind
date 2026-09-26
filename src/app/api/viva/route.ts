import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3.8-flash";

type VivaAction = "generate" | "evaluate";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const action = body?.action as VivaAction;
    const experimentContext = body?.experimentContext;
    const difficulty = body?.difficulty ?? "medium";
    const previousQuestion = body?.previousQuestion ?? "";
    const studentAnswer = body?.studentAnswer ?? "";
    const questionNumber = body?.questionNumber ?? 1;

    if (action !== "generate" && action !== "evaluate") {
      return NextResponse.json(
        {
          error: "Invalid viva action.",
        },
        { status: 400 },
      );
    }

    if (!experimentContext) {
      return NextResponse.json(
        {
          error: "Experiment context is required.",
        },
        { status: 400 },
      );
    }

    if (action === "evaluate" && !studentAnswer.trim()) {
      return NextResponse.json(
        {
          error: "Student answer is required.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const context = JSON.stringify(experimentContext, null, 2);

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

Return ONLY valid JSON in exactly this structure:

{
  "question": "string",
  "topic": "string",
  "difficulty": "easy | medium | hard",
  "expectedConcept": "string"
}
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

Return ONLY valid JSON in exactly this structure:

{
  "score": 0,
  "maxScore": 10,
  "correct": true,
  "feedback": "short explanation",
  "missingConcepts": ["string"],
  "idealAnswer": "string",
  "nextDifficulty": "easy | medium | hard"
}

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

    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(
          `Viva Gemini request: ${action}, attempt ${attempt + 1}`,
        );

        const response = await ai.models.generateContent({
          model: MODEL,
          contents: prompt,
        });

        const text = response.text?.trim();

        if (!text) {
          lastError = new Error("Gemini returned an empty response.");
          continue;
        }

        let parsed: unknown;

        try {
          parsed = JSON.parse(text);
        } catch {
          const cleaned = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

          parsed = JSON.parse(cleaned);
        }

        return NextResponse.json({
          result: parsed,
          model: MODEL,
        });
      } catch (error: unknown) {
        lastError = error;

        console.error(
          `Viva Gemini error on attempt ${attempt + 1}:`,
          error,
        );

        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error
            ? Number((error as { status?: unknown }).status)
            : undefined;

        if (status !== 429 && status !== 503) {
          break;
        }

        if (attempt < 2) {
          await sleep(1000 * 2 ** attempt);
        }
      }
    }

    console.error("Viva API failed:", lastError);

    return NextResponse.json(
      {
        error:
          "Gemini is temporarily unavailable for the viva. Please try again.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Viva route error:", error);

    return NextResponse.json(
      {
        error: "Failed to process the viva request.",
      },
      { status: 500 },
    );
  }
}