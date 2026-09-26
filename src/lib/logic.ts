export type LogicBit = 0 | 1;

export function and(a: LogicBit, b: LogicBit): LogicBit {
  return a & b ? 1 : 0;
}

export function or(a: LogicBit, b: LogicBit): LogicBit {
  return a | b ? 1 : 0;
}

export function not(a: LogicBit): LogicBit {
  return a === 1 ? 0 : 1;
}

export function xor(a: LogicBit, b: LogicBit): LogicBit {
  return a !== b ? 1 : 0;
}

export function nand(a: LogicBit, b: LogicBit): LogicBit {
  return not(and(a, b));
}

export function nor(a: LogicBit, b: LogicBit): LogicBit {
  return not(or(a, b));
}

export function halfAdder(a: LogicBit, b: LogicBit): {
  SUM: LogicBit;
  CARRY: LogicBit;
} {
  return {
    SUM: xor(a, b),
    CARRY: and(a, b),
  };
}

export function fullAdder(
  a: LogicBit,
  b: LogicBit,
  cin: LogicBit,
): { SUM: LogicBit; CARRY: LogicBit } {
  const sum = xor(xor(a, b), cin);
  const carry = or(and(a, b), and(cin, xor(a, b)));
  return { SUM: sum, CARRY: carry };
}

export function mux4to1(
  d0: LogicBit,
  d1: LogicBit,
  d2: LogicBit,
  d3: LogicBit,
  s1: LogicBit,
  s0: LogicBit,
): LogicBit {
  if (s1 === 0 && s0 === 0) return d0;
  if (s1 === 0 && s0 === 1) return d1;
  if (s1 === 1 && s0 === 0) return d2;
  return d3;
}

export function logicBit(value: number): LogicBit {
  return value === 1 ? 1 : 0;
}

export function logicToVoltage(bit: LogicBit): string {
  return bit === 1 ? "5.0 V (HIGH)" : "0.0 V (LOW)";
}
