import type {
  BooleanEquation,
  Experiment,
} from "@/types/experiment";

const logicGateTruthTable = {
  inputs: ["A", "B"],
  outputs: ["AND", "OR", "XOR", "NAND", "NOR", "NOT"],
  rows: [
    {
      id: 1,
      inputs: { A: 0, B: 0 },
      expectedOutputs: { AND: 0, OR: 0, XOR: 0, NAND: 1, NOR: 1, NOT: 1 },
      verdict: "PENDING" as const,
    },
    {
      id: 2,
      inputs: { A: 0, B: 1 },
      expectedOutputs: { AND: 0, OR: 1, XOR: 1, NAND: 1, NOR: 0, NOT: 1 },
      verdict: "PENDING" as const,
    },
    {
      id: 3,
      inputs: { A: 1, B: 0 },
      expectedOutputs: { AND: 0, OR: 1, XOR: 1, NAND: 1, NOR: 0, NOT: 0 },
      verdict: "PENDING" as const,
    },
    {
      id: 4,
      inputs: { A: 1, B: 1 },
      expectedOutputs: { AND: 1, OR: 1, XOR: 0, NAND: 0, NOR: 0, NOT: 0 },
      verdict: "PENDING" as const,
    },
  ],
};

const halfAdderTruthTable = {
  inputs: ["A", "B"],
  outputs: ["SUM", "CARRY"],
  rows: [
    { id: 1, inputs: { A: 0, B: 0 }, expectedOutputs: { SUM: 0, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 2, inputs: { A: 0, B: 1 }, expectedOutputs: { SUM: 1, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 3, inputs: { A: 1, B: 0 }, expectedOutputs: { SUM: 1, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 4, inputs: { A: 1, B: 1 }, expectedOutputs: { SUM: 0, CARRY: 1 }, verdict: "PENDING" as const },
  ],
};

const fullAdderTruthTable = {
  inputs: ["A", "B", "Cin"],
  outputs: ["SUM", "CARRY"],
  rows: [
    { id: 1, inputs: { A: 0, B: 0, Cin: 0 }, expectedOutputs: { SUM: 0, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 2, inputs: { A: 0, B: 0, Cin: 1 }, expectedOutputs: { SUM: 1, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 3, inputs: { A: 0, B: 1, Cin: 0 }, expectedOutputs: { SUM: 1, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 4, inputs: { A: 0, B: 1, Cin: 1 }, expectedOutputs: { SUM: 0, CARRY: 1 }, verdict: "PENDING" as const },
    { id: 5, inputs: { A: 1, B: 0, Cin: 0 }, expectedOutputs: { SUM: 1, CARRY: 0 }, verdict: "PENDING" as const },
    { id: 6, inputs: { A: 1, B: 0, Cin: 1 }, expectedOutputs: { SUM: 0, CARRY: 1 }, verdict: "PENDING" as const },
    { id: 7, inputs: { A: 1, B: 1, Cin: 0 }, expectedOutputs: { SUM: 0, CARRY: 1 }, verdict: "PENDING" as const },
    { id: 8, inputs: { A: 1, B: 1, Cin: 1 }, expectedOutputs: { SUM: 1, CARRY: 1 }, verdict: "PENDING" as const },
  ],
};

const muxTruthTable = {
  inputs: ["D0", "D1", "D2", "D3", "S1", "S0"],
  outputs: ["Y"],
  rows: [
    { id: 1, inputs: { D0: 0, D1: 1, D2: 0, D3: 0, S1: 0, S0: 0 }, expectedOutputs: { Y: 0 }, verdict: "PENDING" as const },
    { id: 2, inputs: { D0: 0, D1: 1, D2: 0, D3: 0, S1: 0, S0: 1 }, expectedOutputs: { Y: 1 }, verdict: "PENDING" as const },
    { id: 3, inputs: { D0: 0, D1: 0, D2: 1, D3: 0, S1: 1, S0: 0 }, expectedOutputs: { Y: 1 }, verdict: "PENDING" as const },
    { id: 4, inputs: { D0: 0, D1: 0, D2: 0, D3: 1, S1: 1, S0: 1 }, expectedOutputs: { Y: 1 }, verdict: "PENDING" as const },
  ],
};

const demuxTruthTable = {
  inputs: ["D", "S1", "S0"],
  outputs: ["Y0", "Y1", "Y2", "Y3"],
  rows: [
    { id: 1, inputs: { D: 1, S1: 0, S0: 0 }, expectedOutputs: { Y0: 1, Y1: 0, Y2: 0, Y3: 0 }, verdict: "PENDING" as const },
    { id: 2, inputs: { D: 1, S1: 0, S0: 1 }, expectedOutputs: { Y0: 0, Y1: 1, Y2: 0, Y3: 0 }, verdict: "PENDING" as const },
    { id: 3, inputs: { D: 1, S1: 1, S0: 0 }, expectedOutputs: { Y0: 0, Y1: 0, Y2: 1, Y3: 0 }, verdict: "PENDING" as const },
    { id: 4, inputs: { D: 1, S1: 1, S0: 1 }, expectedOutputs: { Y0: 0, Y1: 0, Y2: 0, Y3: 1 }, verdict: "PENDING" as const },
  ],
};

const decoderTruthTable = {
  inputs: ["A1", "A0", "EN"],
  outputs: ["Y0", "Y1", "Y2", "Y3"],
  rows: [
    { id: 1, inputs: { A1: 0, A0: 0, EN: 0 }, expectedOutputs: { Y0: 0, Y1: 0, Y2: 0, Y3: 0 }, verdict: "PENDING" as const },
    { id: 2, inputs: { A1: 0, A0: 0, EN: 1 }, expectedOutputs: { Y0: 1, Y1: 0, Y2: 0, Y3: 0 }, verdict: "PENDING" as const },
    { id: 3, inputs: { A1: 0, A0: 1, EN: 1 }, expectedOutputs: { Y0: 0, Y1: 1, Y2: 0, Y3: 0 }, verdict: "PENDING" as const },
    { id: 4, inputs: { A1: 1, A0: 0, EN: 1 }, expectedOutputs: { Y0: 0, Y1: 0, Y2: 1, Y3: 0 }, verdict: "PENDING" as const },
    { id: 5, inputs: { A1: 1, A0: 1, EN: 1 }, expectedOutputs: { Y0: 0, Y1: 0, Y2: 0, Y3: 1 }, verdict: "PENDING" as const },
  ],
};

const encoderTruthTable = {
  inputs: ["I0", "I1", "I2", "I3"],
  outputs: ["A1", "A0"],
  rows: [
    { id: 1, inputs: { I0: 1, I1: 0, I2: 0, I3: 0 }, expectedOutputs: { A1: 0, A0: 0 }, verdict: "PENDING" as const },
    { id: 2, inputs: { I0: 0, I1: 1, I2: 0, I3: 0 }, expectedOutputs: { A1: 0, A0: 1 }, verdict: "PENDING" as const },
    { id: 3, inputs: { I0: 0, I1: 0, I2: 1, I3: 0 }, expectedOutputs: { A1: 1, A0: 0 }, verdict: "PENDING" as const },
    { id: 4, inputs: { I0: 0, I1: 0, I2: 0, I3: 1 }, expectedOutputs: { A1: 1, A0: 1 }, verdict: "PENDING" as const },
  ],
};

const srTruthTable = {
  inputs: ["S", "R"],
  outputs: ["Q", "Qbar"],
  rows: [
    { id: 1, inputs: { S: 0, R: 0 }, expectedOutputs: { Q: 0, Qbar: 1 }, verdict: "PENDING" as const },
    { id: 2, inputs: { S: 0, R: 1 }, expectedOutputs: { Q: 0, Qbar: 1 }, verdict: "PENDING" as const },
    { id: 3, inputs: { S: 1, R: 0 }, expectedOutputs: { Q: 1, Qbar: 0 }, verdict: "PENDING" as const },
    { id: 4, inputs: { S: 1, R: 1 }, expectedOutputs: { Q: 0, Qbar: 0 }, verdict: "PENDING" as const },
  ],
};

const standardBoolean = (name: string, formula: string, icReference: string): BooleanEquation => ({
  name,
  formula,
  icReference,
});

function packagePins(count: number, labels: string[]): { pinNumber: number; label: string; type: "VCC" | "GND" | "INPUT" | "OUTPUT" | "NC" }[] {
  return Array.from({ length: count }, (_, index) => {
    const pinNumber = index + 1;
    const label = labels[index] ?? "NC";
    let type: "VCC" | "GND" | "INPUT" | "OUTPUT" | "NC" = "NC";

    if (label === "VCC") type = "VCC";
    else if (label === "GND") type = "GND";
    else if (label.startsWith("Y") || label === "Q" || label === "Qbar" || label === "A1" || label === "A0") type = "OUTPUT";
    else if (label.startsWith("D") || label.startsWith("S") || label.startsWith("I") || label.startsWith("A") || label === "EN" || label === "R") type = "INPUT";

    return { pinNumber, label, type };
  });
}

const logicGatesExperiment: Experiment = {
  id: "logic-gates",
  code: "DIG-01",
  title: "Basic Logic Gates",
  shortTitle: "Logic Gates",
  category: "Digital",
  estimatedTime: "25 min",
  difficulty: "Beginner",
  status: "Available",
  objective: "Verify the behavior of basic AND, OR, XOR, NAND, NOR and NOT logic gates.",
  theory: "Digital logic gates implement Boolean operations on binary signals. Each gate produces an output according to its characteristic Boolean function.",
  apparatus: [
    { id: "ic-7408", name: "74xx08 AND Gate IC", quantity: 1 },
    { id: "ic-7432", name: "74xx32 OR Gate IC", quantity: 1 },
    { id: "ic-7486", name: "74xx86 XOR Gate IC", quantity: 1 },
    { id: "ic-7400", name: "74xx00 NAND Gate IC", quantity: 1 },
    { id: "ic-7402", name: "74xx02 NOR Gate IC", quantity: 1 },
    { id: "ic-7404", name: "74xx04 NOT Gate IC", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "res", name: "220 ohm resistor", quantity: 2 },
  ],
  booleanEquations: [
    standardBoolean("AND", "Y = A AND B", "7408"),
    standardBoolean("OR", "Y = A OR B", "7432"),
    standardBoolean("XOR", "Y = A XOR B", "7486"),
    standardBoolean("NAND", "Y = NOT(A AND B)", "7400"),
    standardBoolean("NOR", "Y = NOT(A OR B)", "7402"),
    standardBoolean("NOT", "Y = NOT A", "7404"),
  ],
  icPackages: [],
  truthTableSpec: logicGateTruthTable,
  schematicSvgType: "logic-gates",
  commonMistakes: ["Floating inputs", "Incorrect power connections", "Wrong gate IC selection"],
  learningObjectives: ["Identify logic symbols", "Verify truth tables", "Relate gates to Boolean expressions"],
};

const halfAdderExperiment: Experiment = {
  id: "half-adder",
  code: "DIG-02",
  title: "Half Adder",
  shortTitle: "Half Adder",
  category: "Digital",
  estimatedTime: "20 min",
  difficulty: "Beginner",
  status: "Available",
  objective: "Construct a half adder and verify SUM and CARRY for all input combinations.",
  theory: "A half adder adds two one-bit binary values. SUM is generated by XOR and CARRY by AND.",
  apparatus: [
    { id: "ic-xor", name: "74xx86 XOR Gate IC", quantity: 1 },
    { id: "ic-and", name: "74xx08 AND Gate IC", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "res", name: "220 ohm resistor", quantity: 4 },
  ],
  booleanEquations: [
    standardBoolean("SUM", "SUM = A XOR B", "7486"),
    standardBoolean("CARRY", "CARRY = A AND B", "7408"),
  ],
  icPackages: [],
  truthTableSpec: halfAdderTruthTable,
  schematicSvgType: "half-adder",
  commonMistakes: ["Swapping SUM and CARRY", "Missing common ground", "Floating input lines"],
  learningObjectives: ["Understand binary addition", "Separate sum and carry paths", "Verify a two-input truth table"],
};

const fullAdderExperiment: Experiment = {
  id: "full-adder",
  code: "DIG-03",
  title: "Full Adder",
  shortTitle: "Full Adder",
  category: "Digital",
  estimatedTime: "30 min",
  difficulty: "Intermediate",
  status: "Available",
  objective: "Implement a one-bit full adder using two data inputs and a carry-in input.",
  theory: "A full adder adds A, B and Cin. It produces SUM and CARRY and is a building block for multi-bit arithmetic circuits.",
  apparatus: [
    { id: "ic-xor", name: "74xx86 XOR Gate IC", quantity: 1 },
    { id: "ic-and", name: "74xx08 AND Gate IC", quantity: 1 },
    { id: "ic-or", name: "74xx32 OR Gate IC", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "res", name: "220 ohm resistor", quantity: 5 },
  ],
  booleanEquations: [
    standardBoolean("SUM", "SUM = A XOR B XOR Cin", "7486"),
    standardBoolean("CARRY", "CARRY = AB + Cin(A XOR B)", "7408 + 7432"),
  ],
  icPackages: [],
  truthTableSpec: fullAdderTruthTable,
  schematicSvgType: "full-adder",
  commonMistakes: ["Ignoring Cin", "Incorrect carry path", "Missing shared ground"],
  learningObjectives: ["Understand carry propagation", "Compose gates into arithmetic logic", "Verify all eight input states"],
};

const multiplexerExperiment: Experiment = {
  id: "4-1-multiplexer",
  code: "DIG-04",
  title: "4:1 Multiplexer",
  shortTitle: "4:1 MUX",
  category: "Digital",
  estimatedTime: "25 min",
  difficulty: "Intermediate",
  status: "Available",
  objective: "Verify that two select lines route one of four data inputs to the output.",
  theory: "A 4:1 multiplexer selects exactly one of four data inputs according to the binary value of S1 and S0.",
  apparatus: [
    { id: "ic-74153", name: "74xx153 dual 4:1 data selector", quantity: 1, specification: "Dual 4-to-1 multiplexer" },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "switch", name: "SPST logic switches", quantity: 6 },
    { id: "res", name: "220 ohm resistor", quantity: 1 },
  ],
  booleanEquations: [
    standardBoolean("Y", "Y = selected one of D0, D1, D2, D3", "74153"),
  ],
  icPackages: [],
  truthTableSpec: muxTruthTable,
  schematicSvgType: "4-1-multiplexer",
  commonMistakes: ["Reading select bits in the wrong order", "Confusing data and select lines", "Leaving unused inputs undefined"],
  learningObjectives: ["Understand data selection", "Interpret select lines as binary addresses", "Relate multiplexers to data routing"],
};

const demuxExperiment: Experiment = {
  id: "1-4-demultiplexer",
  code: "DIG-05",
  title: "1:4 Demultiplexer",
  shortTitle: "1:4 DEMUX",
  category: "Digital",
  estimatedTime: "25 min",
  difficulty: "Intermediate",
  status: "Available",
  objective: "Route one digital data input to exactly one of four outputs using two select lines.",
  theory: "A 1:4 demultiplexer performs the reverse routing operation of a multiplexer. S1 and S0 determine which output receives the data input.",
  apparatus: [
    { id: "ic-demux", name: "74HC139 decoder/demultiplexer", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "switch", name: "SPST logic switches", quantity: 3 },
    { id: "led", name: "LED indicators", quantity: 4 },
    { id: "res", name: "220 ohm resistor", quantity: 4 },
  ],
  booleanEquations: [
    standardBoolean("Y0", "Y0 = D AND NOT(S1) AND NOT(S0)", "74HC139 / logic"),
    standardBoolean("Y1", "Y1 = D AND NOT(S1) AND S0", "74HC139 / logic"),
    standardBoolean("Y2", "Y2 = D AND S1 AND NOT(S0)", "74HC139 / logic"),
    standardBoolean("Y3", "Y3 = D AND S1 AND S0", "74HC139 / logic"),
  ],
  icPackages: [],
  truthTableSpec: demuxTruthTable,
  schematicSvgType: "1-4-demultiplexer",
  commonMistakes: ["Reversing select-bit order", "Expecting multiple outputs to be active", "Leaving D disconnected"],
  learningObjectives: ["Understand one-to-many routing", "Trace select-line control", "Differentiate MUX and DEMUX behavior"],
};

const decoderExperiment: Experiment = {
  id: "2-4-decoder",
  code: "DIG-06",
  title: "2:4 Decoder",
  shortTitle: "2:4 Decoder",
  category: "Digital",
  estimatedTime: "25 min",
  difficulty: "Intermediate",
  status: "Available",
  objective: "Decode a two-bit binary address into one of four mutually exclusive outputs.",
  theory: "A 2:4 decoder converts two binary address inputs into one-hot output selection. EN enables the decoded output.",
  apparatus: [
    { id: "ic-decoder", name: "74HC139 dual 2-to-4 decoder", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "switch", name: "SPST logic switches", quantity: 3 },
    { id: "led", name: "LED indicators", quantity: 4 },
    { id: "res", name: "220 ohm resistor", quantity: 4 },
  ],
  booleanEquations: [
    standardBoolean("Y0", "Y0 = EN AND NOT(A1) AND NOT(A0)", "74HC139 / logic"),
    standardBoolean("Y1", "Y1 = EN AND NOT(A1) AND A0", "74HC139 / logic"),
    standardBoolean("Y2", "Y2 = EN AND A1 AND NOT(A0)", "74HC139 / logic"),
    standardBoolean("Y3", "Y3 = EN AND A1 AND A0", "74HC139 / logic"),
  ],
  icPackages: [],
  truthTableSpec: decoderTruthTable,
  schematicSvgType: "2-4-decoder",
  commonMistakes: ["Forgetting the enable input", "Reading A1/A0 backwards", "Expecting more than one active output"],
  learningObjectives: ["Understand one-hot decoding", "Use enable control", "Map binary addresses to outputs"],
};

const encoderExperiment: Experiment = {
  id: "4-2-encoder",
  code: "DIG-07",
  title: "4:2 Encoder",
  shortTitle: "4:2 Encoder",
  category: "Digital",
  estimatedTime: "25 min",
  difficulty: "Intermediate",
  status: "Available",
  objective: "Encode one active input of four into a two-bit binary output.",
  theory: "A basic 4:2 encoder converts a one-hot input pattern into the corresponding binary code. This educational model assumes one active input at a time.",
  apparatus: [
    { id: "ic-encoder", name: "4:2 encoder logic block", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "switch", name: "SPST logic switches", quantity: 4 },
    { id: "led", name: "LED indicators", quantity: 2 },
    { id: "res", name: "220 ohm resistor", quantity: 2 },
  ],
  booleanEquations: [
    standardBoolean("A0", "A0 = I1 OR I3", "logic implementation"),
    standardBoolean("A1", "A1 = I2 OR I3", "logic implementation"),
  ],
  icPackages: [],
  truthTableSpec: encoderTruthTable,
  schematicSvgType: "4-2-encoder",
  commonMistakes: ["Activating multiple input lines", "Swapping binary output bits", "Leaving all inputs LOW and expecting a valid code"],
  learningObjectives: ["Understand one-hot encoding", "Generate binary address outputs", "Recognize encoder input assumptions"],
};

const srFlipFlopExperiment: Experiment = {
  id: "sr-flip-flop",
  code: "DIG-08",
  title: "SR Flip-Flop",
  shortTitle: "SR Flip-Flop",
  category: "Digital",
  estimatedTime: "30 min",
  difficulty: "Intermediate",
  status: "Available",
  objective: "Explore set and reset behavior of a basic active-high SR storage element.",
  theory: "An SR latch stores a binary state using Set and Reset controls. The S=1,R=0 combination sets Q, while S=0,R=1 resets Q. The S=1,R=1 state is treated as an invalid state in this educational model.",
  apparatus: [
    { id: "ic-nor", name: "74xx02 NOR Gate IC", quantity: 1 },
    { id: "bb", name: "Digital breadboard", quantity: 1 },
    { id: "switch", name: "SPST logic switches", quantity: 2 },
    { id: "led", name: "LED indicators", quantity: 2 },
    { id: "res", name: "220 ohm resistor", quantity: 2 },
  ],
  booleanEquations: [
    standardBoolean("Q", "Q follows SET/RESET control", "7402"),
    standardBoolean("Qbar", "Qbar is the complementary state in valid states", "7402"),
  ],
  icPackages: [],
  truthTableSpec: srTruthTable,
  schematicSvgType: "sr-flip-flop",
  commonMistakes: ["Driving Set and Reset together", "Confusing active-high and active-low conventions", "Ignoring the complementary output"],
  learningObjectives: ["Understand bistable storage", "Differentiate set and reset behavior", "Recognize the forbidden SR condition"],
};


import { catalogExperiments } from "@/data/labCatalog";
import type { LabCatalogExperiment } from "@/data/labCatalog";
export type { LabCatalogExperiment };

export const coreExperiments: LabCatalogExperiment[] = [logicGatesExperiment,halfAdderExperiment,fullAdderExperiment,multiplexerExperiment,demuxExperiment,decoderExperiment,encoderExperiment,srFlipFlopExperiment].map((experiment)=>({ ...experiment, departmentId:"ece", department:"Electronics & Communication Engineering", subjectId:"digital-electronics", subject:"Digital Electronics", moduleId:"digital-electronics-combinational-logic", module:"Combinational Logic", catalogStatus:"CORE", engineType:"circuit", capabilities:{simulation:true,aiTutor:true,troubleshooting:true,vision:true,viva:true,report:true,analytics:true,digitalTwin3D:true,timeline4D:true}, semester:"3", learningMode:"Hands-on" }));

export const experiments: LabCatalogExperiment[]=[...coreExperiments,...catalogExperiments];
export const experimentCatalog=experiments;
export const TOTAL_LAB_EXPERIMENTS=experiments.length;
export default experiments;
