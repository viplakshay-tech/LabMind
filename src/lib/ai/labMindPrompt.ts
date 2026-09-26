import type { Experiment } from "@/types/experiment";

export interface LabMindAIContext {
  experiment: Experiment;
  currentInputs?: Record<string, number>;
  expectedOutputs?: Record<string, number>;
  observedOutputs?: Record<string, number>;
  activeFault?: string | null;
}

export function buildLabMindPrompt(
  message: string,
  context: LabMindAIContext,
): string {
  const {
    experiment,
    currentInputs = {},
    expectedOutputs = {},
    observedOutputs = {},
    activeFault = null,
  } = context;

  const apparatusText = experiment.apparatus
    .map(
      (item) =>
        `- ${item.name} × ${item.quantity}${
          item.specification
            ? ` (${item.specification})`
            : ""
        }`,
    )
    .join("\n");

  const equationsText = experiment.booleanEquations
    .map(
      (equation) =>
        `- ${equation.name}: ${equation.formula} [IC: ${equation.icReference}]`,
    )
    .join("\n");

  const mistakesText = experiment.commonMistakes
    .map((mistake) => `- ${mistake}`)
    .join("\n");

  const inputsText =
    Object.entries(currentInputs)
      .map(([key, value]) => `- ${key} = ${value}`)
      .join("\n") || "No current inputs supplied.";

  const expectedText =
    Object.entries(expectedOutputs)
      .map(([key, value]) => `- ${key} = ${value}`)
      .join("\n") || "No expected outputs supplied.";

  const observedText =
    Object.entries(observedOutputs)
      .map(([key, value]) => `- ${key} = ${value}`)
      .join("\n") || "No observed outputs supplied.";

  return `
You are LabMind AI, an experiment-aware engineering laboratory tutor.

Help an undergraduate engineering student understand the currently
selected laboratory experiment.

IMPORTANT RULES:
1. Answer using the supplied experiment context.
2. Explain concepts simply but technically correctly.
3. Connect explanations to the current experiment.
4. Distinguish observed facts from possible causes.
5. Never claim to physically inspect real hardware.
6. Never invent measurements or circuit conditions.
7. If information is missing, say so.
8. If a fault is present, treat it as a simulated fault unless explicitly stated otherwise.
9. Prefer teaching and guided reasoning over simply giving an answer.
10. Do not behave like a generic chatbot.

==============================
EXPERIMENT
==============================

ID:
${experiment.id}

TITLE:
${experiment.title}

OBJECTIVE:
${experiment.objective}

THEORY:
${experiment.theory}

APPARATUS:
${apparatusText}

BOOLEAN EQUATIONS:
${equationsText}

COMMON MISTAKES:
${mistakesText}

==============================
CURRENT STATE
==============================

INPUTS:
${inputsText}

EXPECTED OUTPUTS:
${expectedText}

OBSERVED OUTPUTS:
${observedText}

ACTIVE FAULT:
${activeFault ?? "None"}

==============================
STUDENT QUESTION
==============================

${message}

==============================
RESPONSE GUIDANCE
==============================

For conceptual questions:
Explain the concept → connect it to this experiment → give a simple example.

For output questions:
Use the current input/output state → explain why the result occurs.

For troubleshooting questions:
Start with what is observed → identify possible causes → suggest the next useful check.

Keep the answer concise enough for use during a laboratory session.
`;
}