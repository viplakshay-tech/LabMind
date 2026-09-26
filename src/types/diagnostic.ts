export type DiagnosticSeverity =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export interface ProbeState {
  label: string;
  expectedVoltage: string;
  observedVoltage: string;
  deltaVoltage: string;
  status: "PASS" | "MISMATCH" | "UNKNOWN";
}

export interface BayesianHypothesis {
  rank: number;
  title: string;
  probability: number;
  schematicContext: string;
  impact: string;
  remediationAction: string;
}

export interface DiagnosticChecklistStep {
  id: number;
  procedure: string;
  voltageThreshold?: string;
  instruction: string;
  completed: boolean;
}

export interface FaultScenario {
  id: string;
  title: string;
  severity: DiagnosticSeverity;
  affectedIC: string;
  stimulusVector: string;

  confidenceScore: number;

  expectedState: {
    label: string;
    voltage: string;
  };

  observedState: {
    label: string;
    voltage: string;
    deltaVoltage: string;
  };

  bayesianHypotheses: BayesianHypothesis[];

  checklistSteps: DiagnosticChecklistStep[];
}

export interface OutputDifferential {
  name: string;
  expected: number;
  observed: number;
  delta: string;
  status: "PASS" | "MISMATCH";
  expectedVoltage: string;
  observedVoltage: string;
}

/** Deterministic engine output — future Gemini adapter returns the same shape. */
export interface DiagnosticResult {
  experimentId: string;
  experimentCode: string;
  experimentTitle: string;
  severity: DiagnosticSeverity;
  confidenceScore: number;
  overallStatus: "PASS" | "MISMATCH";
  stimulusVector: string;
  inputLabels: string[];
  expectedOutputs: Record<string, number>;
  observedOutputs: Record<string, number>;
  differentials: OutputDifferential[];
  hypotheses: BayesianHypothesis[];
  checklistSteps: DiagnosticChecklistStep[];
  activeFaultLabels: string[];
  activeFaultExplanation: string | null;
  analyzedAt: string;
}