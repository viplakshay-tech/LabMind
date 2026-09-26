import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "gemini-3.8-flash";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const imageBase64 = body?.imageBase64;
    const mimeType = body?.mimeType;
    const experimentContext = body?.experimentContext;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 },
      );
    }

    if (!mimeType || typeof mimeType !== "string") {
      return NextResponse.json(
        { error: "Image MIME type is required." },
        { status: 400 },
      );
    }

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          error:
            "Unsupported image format. Please use JPG, PNG, WEBP, HEIC, or HEIF.",
        },
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

    const experimentDetails = experimentContext
      ? JSON.stringify(experimentContext, null, 2)
      : "No experiment context supplied.";

    const visionPrompt = `
You are LabMind Vision Inspector, an AI laboratory assistant for engineering students.

Analyze the uploaded laboratory/circuit image carefully.

Your task is to help identify:
1. Visible components.
2. ICs or modules that can be reasonably identified.
3. Visible wiring and connections.
4. Input/output labels if visible.
5. Possible wiring or configuration mistakes.
6. Whether the visible setup appears consistent with the supplied experiment.
7. Practical checks the student should perform.

EXPERIMENT CONTEXT:
${experimentDetails}

IMPORTANT RULES:
- Do not claim certainty when the image is unclear.
- Clearly distinguish what is visible from what is inferred.
- Do not invent component numbers, wires, voltages, or connections that cannot be seen.
- If a connection cannot be verified from the image, explicitly say that.
- Focus on educational circuit/lab assistance.
- Keep the explanation suitable for a B.Tech CSE/AIML student.
- Do not provide dangerous electrical instructions.
- Return a clean Markdown response.

Use this structure:

### Image Assessment
Give a brief overall assessment.

### Detected Components
List the components or modules that are reasonably visible.

### Wiring / Connections
Describe the connections that can actually be seen.

### Possible Issues
List possible mistakes or suspicious connections.
For each issue, explain why it may be a problem.

### Recommended Checks
Give a numbered list of practical checks.

### Confidence & Limitations
Explain which observations are high confidence and which cannot be verified because of image quality or missing information.
`;

    console.log("Starting LabMind Vision Analysis...");

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
        {
          text: visionPrompt,
        },
      ],
    });

    const text = response.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Gemini returned an empty vision analysis." },
        { status: 503 },
      );
    }

    console.log("LabMind Vision Analysis completed.");

    return NextResponse.json({
      response: text,
      model: MODEL,
    });
  } catch (error: unknown) {
    console.error("Vision API error:", error);

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

    if (status === 429 || status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini Vision is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to analyze the uploaded image.",
      },
      { status: 500 },
    );
  }
}