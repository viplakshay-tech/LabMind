import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3.8-flash";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message = body?.message;
    const experimentContext = body?.experimentContext;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!experimentContext) {
      return NextResponse.json(
        { error: "Experiment context is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const labMindPrompt = `
You are LabMind AI Tutor, an intelligent laboratory assistant for engineering students.

Use the experiment context below to answer the student's question.

EXPERIMENT CONTEXT:
${JSON.stringify(experimentContext, null, 2)}

STUDENT QUESTION:
${message}

RESPONSE FORMAT:

Write the answer in clean Markdown.

Use sections when appropriate:

### Direct Answer
Give the main answer in 1-2 clear sentences.

### Explanation
Explain the concept using short paragraphs.

### Current Circuit State
When relevant, mention the current input and output values.

### Step-by-Step
Use numbered steps for calculations or logical reasoning.

### Final Result
Clearly state the final output.

FORMATTING RULES:
- Use headings with ###.
- Use bullet points for multiple items.
- Use numbered lists for procedures or calculations.
- Use **bold** for important values such as SUM, CARRY, HIGH, LOW, 0, and 1.
- Use inline code for Boolean expressions such as \`A AND B\`.
- Use simple Markdown tables when useful.
- Leave blank lines between sections.
- Keep paragraphs short.
- Do not return one large wall of text.
- Do not unnecessarily repeat the question.
- Stay focused on the current experiment.
- Use current inputs and outputs when relevant.
- Do not invent circuit behavior.
- When troubleshooting, clearly distinguish expected output from observed output.
- Keep the explanation suitable for a B.Tech CSE/AIML student.
`;

    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(
          `Trying Gemini model: ${MODEL}, attempt: ${attempt + 1}`
        );

        const response = await ai.models.generateContent({
          model: MODEL,
          contents: labMindPrompt,
        });

        const text = response.text?.trim();

        if (!text) {
          lastError = new Error("Gemini returned an empty response.");
          continue;
        }

        console.log("Gemini response received.");

        return NextResponse.json({
          response: text,
          model: MODEL,
        });
      } catch (error: unknown) {
        lastError = error;

        console.error(
          `Gemini failed on attempt ${attempt + 1}:`,
          error
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

    console.error("Gemini API error:", lastError);

    return NextResponse.json(
      {
        error:
          "Gemini is temporarily unavailable. Please try again in a few seconds.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Gemini route error:", error);

    return NextResponse.json(
      {
        error: "Failed to process the Gemini request.",
      },
      { status: 500 }
    );
  }
}