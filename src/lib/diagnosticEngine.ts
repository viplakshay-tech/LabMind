import { outputsMatch } from "@/lib/circuitSimulation";
import { logicToVoltage } from "@/lib/logic";
import type { CircuitWorkspaceSnapshot } from "@/types/circuitWorkspace";
import type { ActiveFault } from "@/types/circuitWorkspace";
import type {
  BayesianHypothesis,
  DiagnosticChecklistStep,
  DiagnosticResult,
  DiagnosticSeverity,
  OutputDifferential,
} from "@/types/diagnostic";
import type { Experiment } from "@/types/experiment";

export interface DiagnosticAnalysisContext {
  snapshot: CircuitWorkspaceSnapshot;
  experiment: Experiment;
}

function formatStimulusVector(inputs: Record<string, number>): string {
  const parts = Object.entries(inputs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}=${value}`);
  return parts.join(" · ");
}

function faultLabel(fault: ActiveFault): string {
  switch (fault.kind) {
    case "FLOATING_INPUT":
      return `Floating Input (${fault.target})`;
    case "OUTPUT_STUCK_LOW":
      return `Output Stuck LOW (${fault.target})`;
    case "OUTPUT_STUCK_HIGH":
      return `Output Stuck HIGH (${fault.target})`;
  }
}

function buildDifferentials(
  expected: Record<string, number>,
  observed: Record<string, number>,
  outputNames: string[],
): OutputDifferential[] {
  return outputNames.map((name) => {
    const exp = expected[name] ?? 0;
    const obs = observed[name] ?? 0;
    const pass = exp === obs;
    const expV = logicToVoltage(exp as 0 | 1);
    const obsV = logicToVoltage(obs as 0 | 1);
    return {
      name,
      expected: exp,
      observed: obs,
      delta: pass ? "0.0 V" : "5.0 V logic delta",
      status: pass ? "PASS" : "MISMATCH",
      expectedVoltage: expV,
      observedVoltage: obsV,
    };
  });
}

function baseChecklist(): DiagnosticChecklistStep[] {
  return [
    {
      id: 1,
      procedure: "Input wiring",
      instruction: "Verify each input switch wire reaches the correct IC pin.",
      voltageThreshold: "0.0 V / 5.0 V",
      completed: false,
    },
    {
      id: 2,
      procedure: "IC power",
      instruction: "Confirm VCC (pin 14) and GND (pin 7) are firmly connected.",
      voltageThreshold: "VCC ≈ 5.0 V",
      completed: false,
    },
    {
      id: 3,
      procedure: "Output connection",
      instruction: "Trace output nets to LEDs or probe points.",
      completed: false,
    },
    {
      id: 4,
      procedure: "Ground reference",
      instruction: "Verify common ground between inputs, IC, and indicators.",
      completed: false,
    },
    {
      id: 5,
      procedure: "Re-run vector",
      instruction:
        "Return to the workspace and re-apply the same input vector to confirm.",
      completed: false,
    },
  ];
}

function faultSpecificChecklist(faults: ActiveFault[]): DiagnosticChecklistStep[] {
  const steps: DiagnosticChecklistStep[] = [];
  let id = 10;

  for (const fault of faults) {
    if (fault.kind === "FLOATING_INPUT") {
      steps.push({
        id: id++,
        procedure: `Float check · ${fault.target}`,
        instruction: `Tie ${fault.target} to a defined logic level (0 V or 5 V); floating pins read unpredictably.`,
        completed: false,
      });
    }
    if (fault.kind === "OUTPUT_STUCK_LOW") {
      steps.push({
        id: id++,
        procedure: `Stuck LOW · ${fault.target}`,
        instruction: `Inspect ${fault.target} for short to ground or damaged output driver.`,
        voltageThreshold: "≈ 0.0 V",
        completed: false,
      });
    }
    if (fault.kind === "OUTPUT_STUCK_HIGH") {
      steps.push({
        id: id++,
        procedure: `Stuck HIGH · ${fault.target}`,
        instruction: `Inspect ${fault.target} for short to VCC or open load path.`,
        voltageThreshold: "≈ 5.0 V",
        completed: false,
      });
    }
  }

  return steps;
}

function passHypotheses(experiment: Experiment): BayesianHypothesis[] {
  return [
    {
      rank: 1,
      title: "Circuit matches reference model",
      probability: 0.94,
      schematicContext: `${experiment.shortTitle} outputs align with Boolean equations for the current vector.`,
      impact: "No corrective action required for this stimulus.",
      remediationAction:
        "Record the passing vector in your lab notebook and proceed to the next truth-table row.",
    },
    {
      rank: 2,
      title: "Measurement within tolerance",
      probability: 0.06,
      schematicContext:
        "Minor probe loading or LED threshold could skew visual readings slightly.",
      impact: "Logical PASS still valid if levels are within TTL thresholds.",
      remediationAction:
        "Optional: confirm with a DMM if your instructor requires voltage logs.",
    },
  ];
}

function mismatchHypotheses(
  experiment: Experiment,
  faults: ActiveFault[],
  differentials: OutputDifferential[],
): BayesianHypothesis[] {
  const mismatched = differentials.filter((d) => d.status === "MISMATCH");
  const hypotheses: BayesianHypothesis[] = [];
  let rank = 1;

  for (const fault of faults) {
    const label = faultLabel(fault);
    hypotheses.push({
      rank: rank++,
      title: label,
      probability: 0.88,
      schematicContext: `Simulated fault injected in the digital lab prototype for ${experiment.shortTitle}.`,
      impact: `Explains observed deviation on affected nodes while expected logic remains ideal.`,
      remediationAction: faultRemediation(fault),
    });
  }

  if (faults.length === 0) {
    hypotheses.push({
      rank: rank++,
      title: "Incorrect net routing",
      probability: 0.52,
      schematicContext:
        "A jumper may connect to the wrong gate input or output pin.",
      impact: `Observed ${mismatched.map((m) => m.name).join(", ")} differ from truth table.`,
      remediationAction:
        "Compare breadboard wiring against the pre-lab schematic pinout.",
    });
  }

  hypotheses.push({
    rank: rank++,
    title: "Open or high-impedance input",
    probability: faults.some((f) => f.kind === "FLOATING_INPUT") ? 0.08 : 0.28,
    schematicContext:
      "Undriven CMOS inputs can oscillate or settle near threshold.",
    impact: "Internal gate inputs may not match switch settings.",
    remediationAction:
      "Ensure every unused input is tied to a defined logic level.",
  });

  hypotheses.push({
    rank: rank++,
    title: "Power or ground integrity",
    probability: 0.14,
    schematicContext: "IC may not be fully powered while inputs appear correct.",
    impact: "Outputs can latch incorrectly or remain static.",
    remediationAction:
      "Measure VCC and GND at the IC package with power applied.",
  });

  return hypotheses.slice(0, 4);
}

function faultRemediation(fault: ActiveFault): string {
  switch (fault.kind) {
    case "FLOATING_INPUT":
      return `Connect ${fault.target} to ground or VCC through a defined switch path.`;
    case "OUTPUT_STUCK_LOW":
      return `Remove shorts on ${fault.target}; verify LED/resistor is not pulling the line hard LOW.`;
    case "OUTPUT_STUCK_HIGH":
      return `Check ${fault.target} for VCC short; verify output driver is not damaged.`;
  }
}

function resolveSeverity(
  overallPass: boolean,
  faults: ActiveFault[],
): DiagnosticSeverity {
  if (overallPass && faults.length === 0) return "INFO";
  if (overallPass && faults.length > 0) return "WARNING";
  if (faults.some((f) => f.kind.startsWith("OUTPUT_STUCK"))) return "ERROR";
  if (faults.some((f) => f.kind === "FLOATING_INPUT")) return "WARNING";
  return "ERROR";
}

function resolveConfidence(
  overallPass: boolean,
  faults: ActiveFault[],
  mismatchCount: number,
): number {
  if (overallPass && faults.length === 0) return 97;
  if (overallPass) return 88;
  if (faults.length > 0 && mismatchCount > 0) return 91;
  if (mismatchCount > 0) return 72;
  return 80;
}

function activeFaultExplanation(faults: ActiveFault[]): string | null {
  if (faults.length === 0) return null;
  return (
    "This session includes software-injected faults from the Live Experiment Workspace. " +
    "Expected outputs reflect ideal Boolean logic; observed outputs reflect the fault model " +
    "(floating inputs read as weak LOW in simulation; stuck outputs override computed levels)."
  );
}

/**
 * Primary analysis entry — replace this function with a Gemini adapter later.
 */
export function analyzeDiagnosticState(
  context: DiagnosticAnalysisContext,
): DiagnosticResult {
  const { snapshot, experiment } = context;
  const outputNames = experiment.truthTableSpec.outputs;
  const overallPass = outputsMatch(
    snapshot.expectedOutputs,
    snapshot.observedOutputs,
    outputNames,
  );
  const overallStatus = overallPass ? "PASS" : "MISMATCH";
  const differentials = buildDifferentials(
    snapshot.expectedOutputs,
    snapshot.observedOutputs,
    outputNames,
  );
  const mismatchCount = differentials.filter(
    (d) => d.status === "MISMATCH",
  ).length;

  const hypotheses = overallPass
    ? passHypotheses(experiment)
    : mismatchHypotheses(experiment, snapshot.faults, differentials);

  const checklistSteps = [
    ...baseChecklist(),
    ...faultSpecificChecklist(snapshot.faults),
  ];

  return {
    experimentId: experiment.id,
    experimentCode: experiment.code,
    experimentTitle: experiment.title,
    severity: resolveSeverity(overallPass, snapshot.faults),
    confidenceScore: resolveConfidence(
      overallPass,
      snapshot.faults,
      mismatchCount,
    ),
    overallStatus,
    stimulusVector: formatStimulusVector(snapshot.inputs),
    inputLabels: experiment.truthTableSpec.inputs,
    expectedOutputs: snapshot.expectedOutputs,
    observedOutputs: snapshot.observedOutputs,
    differentials,
    hypotheses,
    checklistSteps,
    activeFaultLabels: snapshot.faults.map(faultLabel),
    activeFaultExplanation: activeFaultExplanation(snapshot.faults),
    analyzedAt: new Date().toISOString(),
  };
}
