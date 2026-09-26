import type { Experiment } from "@/types/experiment";

export const logicGatesExperiment: Experiment = {
  id: "logic-gates",
  code: "DIG-01",
  title: "Basic Logic Gates",
  shortTitle: "Logic Gates",
  category: "Digital",
  estimatedTime: "45 min",
  difficulty: "Beginner",
  status: "Available",

  objective:
    "Understand the operation and truth tables of fundamental digital logic gates.",

  theory:
    "Logic gates are the basic building blocks of digital circuits. This experiment demonstrates AND, OR, NOT, XOR, NAND, and NOR gate behaviour using binary input combinations.",

  apparatus: [
    {
      id: "ic-7408",
      name: "7408 AND Gate IC",
      quantity: 1,
      specification: "Quad 2-input AND",
    },
    {
      id: "ic-7432",
      name: "7432 OR Gate IC",
      quantity: 1,
      specification: "Quad 2-input OR",
    },
    {
      id: "ic-7404",
      name: "7404 NOT Gate IC",
      quantity: 1,
      specification: "Hex inverter",
    },
    {
      id: "ic-7486",
      name: "7486 XOR Gate IC",
      quantity: 1,
      specification: "Quad 2-input XOR",
    },
    {
      id: "breadboard",
      name: "Breadboard",
      quantity: 1,
    },
    {
      id: "led",
      name: "LED",
      quantity: 2,
    },
    {
      id: "resistor",
      name: "Resistor",
      quantity: 4,
      specification: "220Ω",
    },
    {
      id: "jumper",
      name: "Jumper Wires",
      quantity: 1,
    },
  ],

  booleanEquations: [
    {
      name: "AND",
      formula: "Y = A · B",
      icReference: "7408",
    },
    {
      name: "OR",
      formula: "Y = A + B",
      icReference: "7432",
    },
    {
      name: "NOT",
      formula: "Y = Ā",
      icReference: "7404",
    },
    {
      name: "XOR",
      formula: "Y = A ⊕ B",
      icReference: "7486",
    },
  ],

  icPackages: [],

  truthTableSpec: {
    inputs: ["A", "B"],
    outputs: ["AND", "OR", "XOR", "NAND", "NOR"],
    rows: [
      {
        id: 1,
        inputs: { A: 0, B: 0 },
        expectedOutputs: {
          AND: 0,
          OR: 0,
          XOR: 0,
          NAND: 1,
          NOR: 1,
        },
        verdict: "PENDING",
      },
      {
        id: 2,
        inputs: { A: 0, B: 1 },
        expectedOutputs: {
          AND: 0,
          OR: 1,
          XOR: 1,
          NAND: 1,
          NOR: 0,
        },
        verdict: "PENDING",
      },
      {
        id: 3,
        inputs: { A: 1, B: 0 },
        expectedOutputs: {
          AND: 0,
          OR: 1,
          XOR: 1,
          NAND: 1,
          NOR: 0,
        },
        verdict: "PENDING",
      },
      {
        id: 4,
        inputs: { A: 1, B: 1 },
        expectedOutputs: {
          AND: 1,
          OR: 1,
          XOR: 0,
          NAND: 0,
          NOR: 0,
        },
        verdict: "PENDING",
      },
    ],
  },

  schematicSvgType: "logic-gates",

  commonMistakes: [
    "Incorrect IC power and ground connections",
    "Floating input pins",
    "Incorrect jumper-wire connection",
    "Reversing LED polarity",
    "Using the wrong IC gate",
  ],

  learningObjectives: [
    "Understand basic digital logic gates",
    "Construct truth tables",
    "Compare expected and observed outputs",
    "Identify common wiring mistakes",
  ],
};

export const halfAdderExperiment: Experiment = {
  id: "half-adder",
  code: "DIG-02",
  title: "Half Adder",
  shortTitle: "Half Adder",
  category: "Digital",
  estimatedTime: "60 min",
  difficulty: "Beginner",
  status: "Available",

  objective:
    "Implement a one-bit binary addition circuit using XOR and AND gates.",

  theory:
    "A half adder adds two one-bit binary inputs. The XOR gate produces the Sum output and the AND gate produces the Carry output.",

  apparatus: [
    {
      id: "ic-7486",
      name: "7486 XOR Gate IC",
      quantity: 1,
      specification: "Quad 2-input XOR",
    },
    {
      id: "ic-7408",
      name: "7408 AND Gate IC",
      quantity: 1,
      specification: "Quad 2-input AND",
    },
    {
      id: "breadboard",
      name: "Breadboard",
      quantity: 1,
    },
    {
      id: "led-sum",
      name: "SUM LED",
      quantity: 1,
    },
    {
      id: "led-carry",
      name: "CARRY LED",
      quantity: 1,
    },
    {
      id: "resistor",
      name: "Resistor",
      quantity: 2,
      specification: "220Ω",
    },
    {
      id: "jumper",
      name: "Jumper Wires",
      quantity: 1,
    },
  ],

  booleanEquations: [
    {
      name: "SUM",
      formula: "S = A ⊕ B",
      icReference: "7486",
    },
    {
      name: "CARRY",
      formula: "C = A · B",
      icReference: "7408",
    },
  ],

  icPackages: [
    {
      icNumber: "7486",
      name: "Quad 2-Input XOR Gate",
      pinCount: 14,
      description: "XOR gates used for SUM generation.",
      pins: [
        {
          pinNumber: 1,
          label: "A",
          type: "INPUT",
        },
        {
          pinNumber: 2,
          label: "B",
          type: "INPUT",
        },
        {
          pinNumber: 3,
          label: "Y",
          type: "OUTPUT",
        },
        {
          pinNumber: 7,
          label: "GND",
          type: "GND",
        },
        {
          pinNumber: 14,
          label: "VCC",
          type: "VCC",
        },
      ],
    },
    {
      icNumber: "7408",
      name: "Quad 2-Input AND Gate",
      pinCount: 14,
      description: "AND gate used for CARRY generation.",
      pins: [
        {
          pinNumber: 1,
          label: "A",
          type: "INPUT",
        },
        {
          pinNumber: 2,
          label: "B",
          type: "INPUT",
        },
        {
          pinNumber: 3,
          label: "Y",
          type: "OUTPUT",
        },
        {
          pinNumber: 7,
          label: "GND",
          type: "GND",
        },
        {
          pinNumber: 14,
          label: "VCC",
          type: "VCC",
        },
      ],
    },
  ],

  truthTableSpec: {
    inputs: ["A", "B"],
    outputs: ["SUM", "CARRY"],
    rows: [
      {
        id: 1,
        inputs: { A: 0, B: 0 },
        expectedOutputs: {
          SUM: 0,
          CARRY: 0,
        },
        verdict: "PENDING",
      },
      {
        id: 2,
        inputs: { A: 0, B: 1 },
        expectedOutputs: {
          SUM: 1,
          CARRY: 0,
        },
        verdict: "PENDING",
      },
      {
        id: 3,
        inputs: { A: 1, B: 0 },
        expectedOutputs: {
          SUM: 1,
          CARRY: 0,
        },
        verdict: "PENDING",
      },
      {
        id: 4,
        inputs: { A: 1, B: 1 },
        expectedOutputs: {
          SUM: 0,
          CARRY: 1,
        },
        verdict: "PENDING",
      },
    ],
  },

  schematicSvgType: "half-adder",

  commonMistakes: [
    "Incorrect XOR or AND gate connection",
    "Floating inputs",
    "Incorrect IC power connection",
    "Interchanging SUM and CARRY outputs",
    "Incorrect breadboard jumper placement",
  ],

  learningObjectives: [
    "Understand half-adder architecture",
    "Understand XOR-based SUM generation",
    "Understand AND-based CARRY generation",
    "Verify a complete half-adder truth table",
    "Identify common circuit mistakes",
  ],
};

export const fullAdderExperiment: Experiment = {
  id: "full-adder",
  code: "DIG-03",
  title: "Full Adder",
  shortTitle: "Full Adder",
  category: "Digital",
  estimatedTime: "75 min",
  difficulty: "Intermediate",
  status: "Available",

  objective:
    "Implement a one-bit full binary adder that adds two input bits and a carry-in bit.",

  theory:
    "A full adder performs binary addition of three one-bit inputs: A, B, and Cin. It produces a SUM output and a CARRY output. The SUM is generated using XOR logic and the carry is generated using a combination of AND and OR gates.",

  apparatus: [
    {
      id: "ic-7486",
      name: "7486 XOR Gate IC",
      quantity: 1,
      specification: "Quad 2-input XOR",
    },
    {
      id: "ic-7408",
      name: "7408 AND Gate IC",
      quantity: 1,
      specification: "Quad 2-input AND",
    },
    {
      id: "ic-7432",
      name: "7432 OR Gate IC",
      quantity: 1,
      specification: "Quad 2-input OR",
    },
    {
      id: "breadboard",
      name: "Breadboard",
      quantity: 1,
    },
    {
      id: "led-sum",
      name: "SUM LED",
      quantity: 1,
    },
    {
      id: "led-carry",
      name: "CARRY LED",
      quantity: 1,
    },
    {
      id: "resistors",
      name: "Resistors",
      quantity: 2,
      specification: "220Ω",
    },
    {
      id: "jumpers",
      name: "Jumper Wires",
      quantity: 1,
    },
  ],

  booleanEquations: [
    {
      name: "SUM",
      formula: "S = A ⊕ B ⊕ Cin",
      icReference: "7486",
    },
    {
      name: "CARRY",
      formula: "Cout = (A · B) + Cin(A ⊕ B)",
      icReference: "7408 + 7432",
    },
  ],

  icPackages: [
    {
      icNumber: "7486",
      name: "Quad 2-Input XOR Gate",
      pinCount: 14,
      description: "Used to generate the SUM logic.",
      pins: [
        { pinNumber: 1, label: "A", type: "INPUT" },
        { pinNumber: 2, label: "B", type: "INPUT" },
        { pinNumber: 3, label: "Y", type: "OUTPUT" },
        { pinNumber: 7, label: "GND", type: "GND" },
        { pinNumber: 14, label: "VCC", type: "VCC" },
      ],
    },
    {
      icNumber: "7408",
      name: "Quad 2-Input AND Gate",
      pinCount: 14,
      description: "Used for the carry generation logic.",
      pins: [
        { pinNumber: 1, label: "A", type: "INPUT" },
        { pinNumber: 2, label: "B", type: "INPUT" },
        { pinNumber: 3, label: "Y", type: "OUTPUT" },
        { pinNumber: 7, label: "GND", type: "GND" },
        { pinNumber: 14, label: "VCC", type: "VCC" },
      ],
    },
    {
      icNumber: "7432",
      name: "Quad 2-Input OR Gate",
      pinCount: 14,
      description: "Combines carry terms to produce Cout.",
      pins: [
        { pinNumber: 1, label: "A", type: "INPUT" },
        { pinNumber: 2, label: "B", type: "INPUT" },
        { pinNumber: 3, label: "Y", type: "OUTPUT" },
        { pinNumber: 7, label: "GND", type: "GND" },
        { pinNumber: 14, label: "VCC", type: "VCC" },
      ],
    },
  ],

  truthTableSpec: {
    inputs: ["A", "B", "Cin"],
    outputs: ["SUM", "CARRY"],
    rows: [
      {
        id: 1,
        inputs: { A: 0, B: 0, Cin: 0 },
        expectedOutputs: { SUM: 0, CARRY: 0 },
        verdict: "PENDING",
      },
      {
        id: 2,
        inputs: { A: 0, B: 0, Cin: 1 },
        expectedOutputs: { SUM: 1, CARRY: 0 },
        verdict: "PENDING",
      },
      {
        id: 3,
        inputs: { A: 0, B: 1, Cin: 0 },
        expectedOutputs: { SUM: 1, CARRY: 0 },
        verdict: "PENDING",
      },
      {
        id: 4,
        inputs: { A: 0, B: 1, Cin: 1 },
        expectedOutputs: { SUM: 0, CARRY: 1 },
        verdict: "PENDING",
      },
      {
        id: 5,
        inputs: { A: 1, B: 0, Cin: 0 },
        expectedOutputs: { SUM: 1, CARRY: 0 },
        verdict: "PENDING",
      },
      {
        id: 6,
        inputs: { A: 1, B: 0, Cin: 1 },
        expectedOutputs: { SUM: 0, CARRY: 1 },
        verdict: "PENDING",
      },
      {
        id: 7,
        inputs: { A: 1, B: 1, Cin: 0 },
        expectedOutputs: { SUM: 0, CARRY: 1 },
        verdict: "PENDING",
      },
      {
        id: 8,
        inputs: { A: 1, B: 1, Cin: 1 },
        expectedOutputs: { SUM: 1, CARRY: 1 },
        verdict: "PENDING",
      },
    ],
  },

  schematicSvgType: "full-adder",

  commonMistakes: [
    "Incorrect Cin connection",
    "Mixing SUM and CARRY pathways",
    "Incorrect XOR/AND/OR gate connection",
    "Floating input pins",
    "Incorrect IC power connection",
    "Wrong jumper placement",
  ],

  learningObjectives: [
    "Understand full-adder architecture",
    "Understand carry propagation",
    "Implement SUM using XOR logic",
    "Implement CARRY using AND and OR logic",
    "Verify all eight truth-table combinations",
  ],
};

export const multiplexerExperiment: Experiment = {
  id: "4-1-multiplexer",
  code: "DIG-04",
  title: "4:1 Multiplexer",
  shortTitle: "4:1 MUX",
  category: "Digital",
  estimatedTime: "60 min",
  difficulty: "Intermediate",
  status: "Available",

  objective:
    "Understand and implement a 4:1 multiplexer for selecting one of four data inputs using two select lines.",

  theory:
    "A 4:1 multiplexer is a digital data selector. It contains four data inputs, two select lines, and one output. The select lines determine which input is connected to the output.",

  apparatus: [
    {
      id: "ic-74153",
      name: "74153 Multiplexer IC",
      quantity: 1,
      specification: "Dual 4-to-1 data selector",
    },
    {
      id: "breadboard",
      name: "Breadboard",
      quantity: 1,
    },
    {
      id: "led",
      name: "Output LED",
      quantity: 1,
    },
    {
      id: "resistor",
      name: "Resistor",
      quantity: 1,
      specification: "220Ω",
    },
    {
      id: "jumpers",
      name: "Jumper Wires",
      quantity: 1,
    },
  ],

  booleanEquations: [
    {
      name: "MUX OUTPUT",
      formula:
        "Y = D0·S1̅·S0̅ + D1·S1̅·S0 + D2·S1·S0̅ + D3·S1·S0",
      icReference: "74153",
    },
  ],

  icPackages: [
    {
      icNumber: "74153",
      name: "Dual 4-to-1 Data Selector",
      pinCount: 16,
      description:
        "Selects one of four data inputs using two select lines.",
      pins: [
        { pinNumber: 1, label: "1C3", type: "INPUT" },
        { pinNumber: 2, label: "1C2", type: "INPUT" },
        { pinNumber: 3, label: "1C1", type: "INPUT" },
        { pinNumber: 4, label: "1C0", type: "INPUT" },
        { pinNumber: 5, label: "1Y", type: "OUTPUT" },
        { pinNumber: 7, label: "1G", type: "INPUT" },
        { pinNumber: 14, label: "GND", type: "GND" },
        { pinNumber: 16, label: "VCC", type: "VCC" },
      ],
    },
  ],

  truthTableSpec: {
    inputs: ["D0", "D1", "D2", "D3", "S1", "S0"],
    outputs: ["Y"],
    rows: [
      {
        id: 1,
        inputs: { D0: 0, D1: 1, D2: 0, D3: 1, S1: 0, S0: 0 },
        expectedOutputs: { Y: 0 },
        verdict: "PENDING",
      },
      {
        id: 2,
        inputs: { D0: 0, D1: 1, D2: 0, D3: 1, S1: 0, S0: 1 },
        expectedOutputs: { Y: 1 },
        verdict: "PENDING",
      },
      {
        id: 3,
        inputs: { D0: 0, D1: 1, D2: 0, D3: 1, S1: 1, S0: 0 },
        expectedOutputs: { Y: 0 },
        verdict: "PENDING",
      },
      {
        id: 4,
        inputs: { D0: 0, D1: 1, D2: 0, D3: 1, S1: 1, S0: 1 },
        expectedOutputs: { Y: 1 },
        verdict: "PENDING",
      },
    ],
  },

  schematicSvgType: "4-1-multiplexer",

  commonMistakes: [
    "Incorrect select-line connection",
    "Incorrect data-input mapping",
    "Ignoring the active-low enable/strobe",
    "Floating input pins",
    "Incorrect IC power connection",
  ],

  learningObjectives: [
    "Understand multiplexer operation",
    "Understand select-line behaviour",
    "Map data inputs to the output",
    "Understand active-low enable/strobe behaviour",
  ],
};

export const experiments: Experiment[] = [
  logicGatesExperiment,
  halfAdderExperiment,
  fullAdderExperiment,
  multiplexerExperiment,
];