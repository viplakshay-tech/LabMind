import type { CircuitWorkspaceSnapshot } from "@/types/circuitWorkspace";
import { TROUBLESHOOTER_STATE_KEY } from "@/types/circuitWorkspace";
import type { ActiveFault } from "@/types/circuitWorkspace";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNumericRecord(
  value: unknown,
): Record<string, number> | null {
  if (!isRecord(value)) return null;
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw !== "number" || (raw !== 0 && raw !== 1)) {
      return null;
    }
    out[key] = raw;
  }
  return out;
}

function parseFaults(value: unknown): ActiveFault[] | null {
  if (!Array.isArray(value)) return null;
  const faults: ActiveFault[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const { id, kind, target } = item;
    if (
      typeof id !== "string" ||
      typeof target !== "string" ||
      (kind !== "FLOATING_INPUT" &&
        kind !== "OUTPUT_STUCK_LOW" &&
        kind !== "OUTPUT_STUCK_HIGH")
    ) {
      return null;
    }
    faults.push({ id, kind, target });
  }
  return faults;
}

export function parseCircuitWorkspaceSnapshot(
  raw: unknown,
): CircuitWorkspaceSnapshot | null {
  if (!isRecord(raw)) return null;

  const experimentId = raw.experimentId;
  const timestamp = raw.timestamp;
  if (typeof experimentId !== "string" || typeof timestamp !== "string") {
    return null;
  }

  const inputs = parseNumericRecord(raw.inputs);
  const expectedOutputs = parseNumericRecord(raw.expectedOutputs);
  const observedOutputs = parseNumericRecord(raw.observedOutputs);
  const faults = parseFaults(raw.faults ?? []);

  if (!inputs || !expectedOutputs || !observedOutputs || faults === null) {
    return null;
  }

  return {
    experimentId,
    inputs,
    expectedOutputs,
    observedOutputs,
    faults,
    timestamp,
  };
}

export function loadTroubleshooterSnapshotFromSession(): CircuitWorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(TROUBLESHOOTER_STATE_KEY);
    if (!raw) return null;
    return parseCircuitWorkspaceSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveTroubleshooterSnapshotToSession(
  snapshot: CircuitWorkspaceSnapshot,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      TROUBLESHOOTER_STATE_KEY,
      JSON.stringify(snapshot),
    );
  } catch {
    /* ignore */
  }
}
