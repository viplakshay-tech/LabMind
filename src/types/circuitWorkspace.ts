import type { Experiment } from "@/types/experiment";

export type FaultKind =
  | "FLOATING_INPUT"
  | "OUTPUT_STUCK_LOW"
  | "OUTPUT_STUCK_HIGH";

export interface ActiveFault {
  id: string;
  kind: FaultKind;
  target: string;
}

export interface CircuitWorkspaceSnapshot {
  experimentId: string;
  inputs: Record<string, number>;
  expectedOutputs: Record<string, number>;
  observedOutputs: Record<string, number>;
  faults: ActiveFault[];
  timestamp: string;
}

export interface CircuitWorkspaceState {
  experiment: Experiment | null;
  inputs: Record<string, number>;
  expectedOutputs: Record<string, number>;
  observedOutputs: Record<string, number>;
  faults: ActiveFault[];
}

export type CircuitWorkspaceAction =
  | { type: "INIT"; experiment: Experiment; inputs: Record<string, number> }
  | { type: "SET_INPUT"; name: string; value: number }
  | { type: "TOGGLE_FAULT"; fault: ActiveFault }
  | { type: "CLEAR_FAULTS" }
  | { type: "RESET" };

export const TROUBLESHOOTER_STATE_KEY = "labmind-troubleshooter-state";
