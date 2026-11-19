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
  "1-4-demultiplexer",
  "2-4-decoder",
  "4-2-encoder",
  "sr-flip-flop",
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

    case "1-4-demultiplexer":
      return { D: 0, S1: 0, S0: 0 };

    case "2-4-decoder":
      return { A1: 0, A0: 0, EN: 0 };

    case "4-2-encoder":
      return { I0: 0, I1: 0, I2: 0, I3: 0 };

    case "sr-flip-flop":
      return { S: 0, R: 0, __Q: 0 };

    default:
      return {};
  }
}

function readBit(inputs: Record<string, number>, name: string): LogicBit {
  return logicBit(inputs[name] ?? 0);
}

function decodeSelect(s1: LogicBit, s0: LogicBit): 0 | 1 | 2 | 3 {
  if (s1 === 0 && s0 === 0) return 0;
  if (s1 === 0 && s0 === 1) return 1;
  if (s1 === 1 && s0 === 0) return 2;
  return 3;
}

function demux1to4(
  data: LogicBit,
  s1: LogicBit,
  s0: LogicBit,
): Record<string, LogicBit> {
  const outputs = {
    Y0: 0 as LogicBit,
    Y1: 0 as LogicBit,
    Y2: 0 as LogicBit,
    Y3: 0 as LogicBit,
  };

  const selected = decodeSelect(s1, s0);
  outputs[`Y${selected}` as keyof typeof outputs] = data;
  return outputs;
}

function decoder2to4(
  a1: LogicBit,
  a0: LogicBit,
  enable: LogicBit,
): Record<string, LogicBit> {
  const outputs = {
    Y0: 0 as LogicBit,
    Y1: 0 as LogicBit,
    Y2: 0 as LogicBit,
    Y3: 0 as LogicBit,
  };

  if (enable === 1) {
    outputs[`Y${decodeSelect(a1, a0)}` as keyof typeof outputs] = 1;
  }

  return outputs;
}

function encoder4to2(
  i0: LogicBit,
  i1: LogicBit,
  i2: LogicBit,
  i3: LogicBit,
): Record<string, LogicBit> {
  if (i3 === 1) return { A1: 1, A0: 1 };
  if (i2 === 1) return { A1: 1, A0: 0 };
  if (i1 === 1) return { A1: 0, A0: 1 };
  return { A1: 0, A0: 0 };
}

export function computeNextSrState(
  currentQ: LogicBit,
  s: LogicBit,
  r: LogicBit,
): LogicBit {
  if (s === 1 && r === 0) return 1;
  if (s === 0 && r === 1) return 0;
  return currentQ;
}

function srFlipFlop(
  s: LogicBit,
  r: LogicBit,
  currentQ: LogicBit,
): Record<string, LogicBit> {
  if (s === 1 && r === 1) {
    return { Q: 0, Qbar: 0 };
  }

  const q = computeNextSrState(currentQ, s, r);
  return {
    Q: q,
    Qbar: q === 1 ? 0 : 1,
  };
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

      return {
        SUM: result.SUM,
        CARRY: result.CARRY,
      };
    }

    case "full-adder": {
      const a = readBit(inputs, "A");
      const b = readBit(inputs, "B");
      const cin = readBit(inputs, "Cin");
      const result = fullAdder(a, b, cin);

      return {
        SUM: result.SUM,
        CARRY: result.CARRY,
      };
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

    case "1-4-demultiplexer":
      return demux1to4(
        readBit(inputs, "D"),
        readBit(inputs, "S1"),
        readBit(inputs, "S0"),
      );

    case "2-4-decoder":
      return decoder2to4(
        readBit(inputs, "A1"),
        readBit(inputs, "A0"),
        readBit(inputs, "EN"),
      );

    case "4-2-encoder":
      return encoder4to2(
        readBit(inputs, "I0"),
        readBit(inputs, "I1"),
        readBit(inputs, "I2"),
        readBit(inputs, "I3"),
      );

    case "sr-flip-flop":
      return srFlipFlop(
        readBit(inputs, "S"),
        readBit(inputs, "R"),
        readBit(inputs, "__Q"),
      );

    default:
      return {};
  }
}

export interface ActiveFaultLike {
  kind: "FLOATING_INPUT" | "OUTPUT_STUCK_LOW" | "OUTPUT_STUCK_HIGH";
  target: string;
}

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
  return outputNames.every(
    (name) => expected[name] === observed[name],
  );
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

    case "1-4-demultiplexer": {
      const data = currentInputs.D ?? 0;

      return [
        { S1: 0, S0: 0 },
        { S1: 0, S0: 1 },
        { S1: 1, S0: 0 },
        { S1: 1, S0: 1 },
      ].map((select, index) => {
        const inputs = {
          D: data,
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

    case "2-4-decoder":
      return [0, 1].flatMap((a1) =>
        [0, 1].flatMap((a0) =>
          [0, 1].map((en) => {
            const inputs = { A1: a1, A0: a0, EN: en };

            return {
              id: a1 * 4 + a0 * 2 + en + 1,
              inputs,
              expectedOutputs: computeExpectedOutputs(experimentId, inputs),
            };
          }),
        ),
      );

    case "4-2-encoder":
      return [0, 1, 2, 3].map((activeIndex) => {
        const inputs = {
          I0: activeIndex === 0 ? 1 : 0,
          I1: activeIndex === 1 ? 1 : 0,
          I2: activeIndex === 2 ? 1 : 0,
          I3: activeIndex === 3 ? 1 : 0,
        };

        return {
          id: activeIndex + 1,
          inputs,
          expectedOutputs: computeExpectedOutputs(experimentId, inputs),
        };
      });

    case "sr-flip-flop":
      return [
        {
          id: 1,
          inputs: { S: 0, R: 0 },
          expectedOutputs: { Q: 0, Qbar: 1 },
        },
        {
          id: 2,
          inputs: { S: 0, R: 1 },
          expectedOutputs: { Q: 0, Qbar: 1 },
        },
        {
          id: 3,
          inputs: { S: 1, R: 0 },
          expectedOutputs: { Q: 1, Qbar: 0 },
        },
        {
          id: 4,
          inputs: { S: 1, R: 1 },
          expectedOutputs: { Q: 0, Qbar: 0 },
        },
      ];

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
