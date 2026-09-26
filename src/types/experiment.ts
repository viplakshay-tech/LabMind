export type ExperimentCategory =
  | "Digital"
  | "Analog"
  | "Microprocessor"
  | "VLSI";

export type ExperimentDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type ExperimentStatus =
  | "Available"
  | "Active"
  | "Completed";

export interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  specification?: string;
}

export interface BooleanEquation {
  name: string;
  formula: string;
  icReference: string;
}

export type PinType =
  | "VCC"
  | "GND"
  | "INPUT"
  | "OUTPUT"
  | "NC";

export interface DIPPin {
  pinNumber: number;
  label: string;
  type: PinType;
}

export interface DIPPackage {
  icNumber: string;
  name: string;
  pinCount: number;
  description: string;
  pins: DIPPin[];
}

export interface TruthTableRow {
  id: number;
  inputs: Record<string, number>;
  expectedOutputs: Record<string, number>;
  observedOutputs?: Record<string, number>;
  deltaVoltage?: string;
  verdict: "PASS" | "MISMATCH" | "PENDING";
}

export interface TruthTableSpec {
  inputs: string[];
  outputs: string[];
  rows: TruthTableRow[];
}

export interface Experiment {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  category: ExperimentCategory;
  estimatedTime: string;
  difficulty: ExperimentDifficulty;
  status: ExperimentStatus;

  objective: string;

  theory: string;

  apparatus: BOMItem[];

  booleanEquations: BooleanEquation[];

  icPackages: DIPPackage[];

  truthTableSpec: TruthTableSpec;

  schematicSvgType: string;

  commonMistakes: string[];

  learningObjectives: string[];
}