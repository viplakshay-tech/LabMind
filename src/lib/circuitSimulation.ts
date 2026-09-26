import {
  and,
  fullAdder,
  halfAdder,
  logicBit,
  mux4to1,
  nand,
  nor,
  not,
  or,
  xor,
  type LogicBit,
} from "@/lib/logic";

export const WORKSPACE_EXPERIMENT_IDS = [
  "logic-gates",
  "half-adder",
  "full-adder",
  "4-1-multiplexer",
] as const;

export type WorkspaceExperimentId = (typeof WORKSPACE_EXPERIMENT_IDS)[number];

export function isWorkspaceExperimentId(
  id: string,
): id is WorkspaceExperimentId {
  return (WORKSPACE_EXPERIMENT_IDS as readonly string[]).includes(id);
}

export function defaultInputsForExperiment(
  experimentId: WorkspaceExperimentId,
): Record<string, number> {
  switch (experimentId) {
    case "logic-gates":
      return { A: 0, B: 0 };
    case "half-adder":
      return { A: 0, B: 0 };
    case "full-adder":
      return { A: 0, B: 0, Cin: 0 };
    case "4-1-multiplexer":
      return { D0: 0, D1: 0, D2: 0, D3: 0, S1: 0, S0: 0 };
    default:
      return {};
  }
}

function readBit(inputs: Record<string, number>, name: string): LogicBit {
  return logicBit(inputs[name] ?? 0);
}

export function computeExpectedOutputs(
  experimentId: WorkspaceExperimentId,
  inputs: Record<string, number>,
): Record<string, LogicBit> {
  switch (experimentId) {
    case "logic-gates": {
      const a = readBit(inputs, "A");
      const b = readBit(inputs, "B");
      return {
        AND: and(a, b),
        OR: or(a, b),
        XOR: xor(a, b),
        NAND: nand(a, b),
        NOR: nor(a, b),
        NOT: not(a),
      };
    }
    case "half-adder": {
      const a = readBit(inputs, "A");
      const b = readBit(inputs, "B");
      const result = halfAdder(a, b);
      return { SUM: result.SUM, CARRY: result.CARRY };
    }
    case "full-adder": {
      const a = readBit(inputs, "A");
      const b = readBit(inputs, "B");
      const cin = readBit(inputs, "Cin");
      const result = fullAdder(a, b, cin);
      return { SUM: result.SUM, CARRY: result.CARRY };
    }
    case "4-1-multiplexer": {
      const y = mux4to1(
        readBit(inputs, "D0"),
        readBit(inputs, "D1"),
        readBit(inputs, "D2"),
        readBit(inputs, "D3"),
        readBit(inputs, "S1"),
        readBit(inputs, "S0"),
      );
      return { Y: y };
    }
    default:
      return {};
  }
}

export interface ActiveFaultLike {
  kind: "FLOATING_INPUT" | "OUTPUT_STUCK_LOW" | "OUTPUT_STUCK_HIGH";
  target: string;
}

/** Effective inputs for observed path (floating → weak LOW). */
export function applyInputFaults(
  inputs: Record<string, number>,
  faults: ActiveFaultLike[],
): Record<string, number> {
  const effective = { ...inputs };
  for (const fault of faults) {
    if (fault.kind === "FLOATING_INPUT") {
      effective[fault.target] = 0;
    }
  }
  return effective;
}

export function computeObservedOutputs(
  experimentId: WorkspaceExperimentId,
  inputs: Record<string, number>,
  faults: ActiveFaultLike[],
): Record<string, LogicBit> {
  const effectiveInputs = applyInputFaults(inputs, faults);
  let outputs = computeExpectedOutputs(experimentId, effectiveInputs);

  for (const fault of faults) {
    if (fault.kind === "OUTPUT_STUCK_LOW" && fault.target in outputs) {
      outputs = { ...outputs, [fault.target]: 0 };
    }
    if (fault.kind === "OUTPUT_STUCK_HIGH" && fault.target in outputs) {
      outputs = { ...outputs, [fault.target]: 1 };
    }
  }

  return outputs;
}

export function outputsMatch(
  expected: Record<string, number>,
  observed: Record<string, number>,
  outputNames: string[],
): boolean {
  return outputNames.every((name) => expected[name] === observed[name]);
}

export type TruthTableRowView = {
  id: number;
  inputs: Record<string, number>;
  expectedOutputs: Record<string, number>;
};

export function buildLiveTruthTableRows(
  experimentId: WorkspaceExperimentId,
  currentInputs: Record<string, number>,
): TruthTableRowView[] {
  switch (experimentId) {
    case "logic-gates":
      return [0, 1].flatMap((a) =>
        [0, 1].map((b, index) => {
          const inputs = { A: a, B: b };
          return {
            id: index + 1 + a * 2,
            inputs,
            expectedOutputs: computeExpectedOutputs(experimentId, inputs),
          };
        }),
      );
    case "half-adder":
      return [0, 1].flatMap((a) =>
        [0, 1].map((b, index) => {
          const inputs = { A: a, B: b };
          return {
            id: index + 1 + a * 2,
            inputs,
            expectedOutputs: computeExpectedOutputs(experimentId, inputs),
          };
        }),
      );
    case "full-adder":
      return [0, 1].flatMap((a) =>
        [0, 1].flatMap((b) =>
          [0, 1].map((cin) => {
            const inputs = { A: a, B: b, Cin: cin };
            return {
              id: a * 4 + b * 2 + cin + 1,
              inputs,
              expectedOutputs: computeExpectedOutputs(experimentId, inputs),
            };
          }),
        ),
      );
    case "4-1-multiplexer": {
      const { D0, D1, D2, D3 } = currentInputs;
      return [
        { S1: 0, S0: 0 },
        { S1: 0, S0: 1 },
        { S1: 1, S0: 0 },
        { S1: 1, S0: 1 },
      ].map((select, index) => {
        const inputs = {
          D0: D0 ?? 0,
          D1: D1 ?? 0,
          D2: D2 ?? 0,
          D3: D3 ?? 0,
          S1: select.S1,
          S0: select.S0,
        };
        return {
          id: index + 1,
          inputs,
          expectedOutputs: computeExpectedOutputs(experimentId, inputs),
        };
      });
    }
    default:
      return [];
  }
}

export function rowMatchesCurrentInputs(
  rowInputs: Record<string, number>,
  currentInputs: Record<string, number>,
  inputNames: string[],
): boolean {
  return inputNames.every(
    (name) => (rowInputs[name] ?? 0) === (currentInputs[name] ?? 0),
  );
}
