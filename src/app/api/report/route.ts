import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3.8-flash";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const experimentContext = body?.experimentContext;
    const labState = body?.labState;
    const diagnosticResult = body?.diagnosticResult;
    const vivaSummary = body?.vivaSummary;
    const studentName = body?.studentName ?? "Student";

    if (!experimentContext) {
      return NextResponse.json(
        { error: "Experiment context is required." },
        { status: 400 },
      );
    }

    if (!labState) {
      return NextResponse.json(
        { error: "Lab state is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const reportPrompt = `
You are LabMind Report Generator, an AI assistant that creates structured
engineering laboratory reports for B.Tech students.

Create a professional laboratory report using ONLY the supplied information.

STUDENT:
${studentName}

EXPERIMENT CONTEXT:
${JSON.stringify(experimentContext, null, 2)}

LAB STATE:
${JSON.stringify(labState, null, 2)}

DIAGNOSTIC RESULT:
${JSON.stringify(diagnosticResult ?? null, null, 2)}

VIVA SUMMARY:
${JSON.stringify(vivaSummary ?? null, null, 2)}

IMPORTANT:
- Do not invent measurements, observations, components, readings, or results.
- Clearly distinguish calculated/expected values from observed values.
- If a piece of information is unavailable, write "Not recorded".
- Keep the report technically accurate and suitable for a B.Tech engineering laboratory.
- Use clean Markdown.
- Keep sections clearly separated.
- Do not write one large paragraph.

Use this structure:

# Laboratory Experiment Report

## 1. Student Details

Student:
Experiment:
Experiment Code:

## 2. Aim / Objective

State the experiment objective.

## 3. Theory

Explain the relevant theory in a concise engineering-student-friendly manner.

## 4. Apparatus / Components

List the available apparatus and components from the supplied experiment context.

## 5. Circuit / Experimental Setup

Describe the setup using only information supplied in the context.

## 6. Procedure

Give a numbered procedure based only on the supplied experiment information.
Do not invent physical steps that are not supported.

## 7. Input and Output Conditions

Show the current input state and expected/observed outputs.

Use a Markdown table where appropriate.

## 8. Results and Observations

Clearly distinguish expected results from observed results.

## 9. Error / Fault Analysis

If diagnostic information is supplied, summarize the detected mismatch,
possible fault, and recommended checks.

If no fault exists, state that the recorded state is nominal.

## 10. AI-Assisted Analysis

Summarize the supplied diagnostic or AI analysis without inventing new evidence.

## 11. Viva Performance

If viva information is supplied, summarize the score and important concepts
to improve. Otherwise write "Not recorded".

## 12. Conclusion

Give a concise conclusion based strictly on the supplied experiment state
and results.

## 13. Learning Notes

Provide a few concise learning points derived from the experiment context.

Formatting rules:
- Use Markdown headings.
- Use bullet points for lists.
- Use numbered lists for procedures.
- Use Markdown tables where useful.
- Use **bold** for important values.
- Use inline code for Boolean expressions.
- Keep paragraphs short.
- Do not mention that you are an AI unless specifically necessary.
`;

    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(
          `Lab Report Gemini request, attempt ${attempt + 1}`,
        );

        const response = await ai.models.generateContent({
          model: MODEL,
          contents: reportPrompt,
        });

        const report = response.text?.trim();

        if (!report) {
          lastError = new Error(
            "Gemini returned an empty laboratory report.",
          );
          continue;
        }

        console.log("Lab report generated successfully.");

        return NextResponse.json({
          report,
          model: MODEL,
        });
      } catch (error: unknown) {
        lastError = error;

        console.error(
          `Lab Report Gemini error on attempt ${attempt + 1}:`,
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

    console.error("Lab Report API failed:", lastError);

    return NextResponse.json(
      {
        error:
          "Gemini is temporarily unavailable for report generation. Please try again.",
      },
      { status: 503 },
    );
  } catch (error) {
    console.error("Lab Report route error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate the laboratory report.",
      },
      { status: 500 },
    );
  }
}