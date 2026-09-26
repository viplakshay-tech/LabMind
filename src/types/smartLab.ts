export type SmartLabView =
  | "digital-twin"
  | "oscilloscope"
  | "thermal-map"
  | "state-simulation";

export type LogicLevel = 0 | 1;

export interface LogicInput {
  id: string;
  label: string;
  value: LogicLevel;
  voltage: number;
}

export interface LogicOutput {
  id: string;
  label: string;
  value: LogicLevel;
  voltage: number;
  status: "PASS" | "MISMATCH" | "PENDING";
}

export interface SmartLabState {
  experimentId: string;

  inputs: Record<string, LogicLevel>;
  outputs: Record<string, LogicLevel>;

  currentView: SmartLabView;

  isRunning: boolean;
  isFaultInjected: boolean;

  simulationTimeMs: number;

  syncStatus: "SYNCED" | "SIMULATING" | "PAUSED";

  faultMode?: string;
}

export interface DigitalTwinComponent {
  id: string;
  name: string;
  type:
    | "BREADBOARD"
    | "IC"
    | "SWITCH"
    | "LED"
    | "DISPLAY"
    | "POWER"
    | "SENSOR";
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  state?: "ACTIVE" | "INACTIVE" | "FAULT";
}

export interface SimulationState {
  timestampMs: number;
  inputs: Record<string, LogicLevel>;
  outputs: Record<string, LogicLevel>;
  faultInjected: boolean;
  faultType?: string;
}