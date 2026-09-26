"use client";

import { useCircuitWorkspace } from "@/context/CircuitWorkspaceContext";

const stroke = "rgba(148, 163, 184, 0.55)";
const wire = "rgba(76, 215, 246, 0.65)";
const fill = "rgba(19, 27, 46, 0.95)";
const accent = "#4CD7F6";

function GateBox({
  x,
  y,
  label,
  w = 56,
  h = 40,
}: {
  x: number;
  y: number;
  label: string;
  w?: number;
  h?: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fill={accent}
        fontSize={11}
        fontFamily="var(--font-jetbrains-mono), monospace"
      >
        {label}
      </text>
    </g>
  );
}

function LogicGatesSchematic() {
  const { inputs } = useCircuitWorkspace();
  const a = inputs.A ?? 0;
  const b = inputs.B ?? 0;

  return (
    <svg viewBox="0 0 480 220" className="h-full w-full" aria-hidden>
      <text x={16} y={28} fill="#94a3b8" fontSize={10} fontFamily="monospace">
        A={a} · B={b}
      </text>
      <line x1={40} y1={60} x2={120} y2={60} stroke={wire} strokeWidth={2} />
      <line x1={40} y1={100} x2={120} y2={100} stroke={wire} strokeWidth={2} />
      <text x={8} y={64} fill="#cbd5e1" fontSize={11}>
        A
      </text>
      <text x={8} y={104} fill="#cbd5e1" fontSize={11}>
        B
      </text>
      <GateBox x={120} y={40} label="AND" />
      <GateBox x={120} y={120} label="XOR" />
      <GateBox x={240} y={80} label="NOT A" w={64} />
      <line x1={176} y1={60} x2={240} y2={60} stroke={wire} />
      <line x1={176} y1={140} x2={200} y2={140} stroke={wire} />
      <line x1={200} y1={140} x2={200} y2={100} stroke={wire} />
      <line x1={200} y1={100} x2={240} y2={100} stroke={wire} />
      <line x1={304} y1={100} x2={360} y2={100} stroke={wire} />
      <text x={368} y={104} fill={accent} fontSize={11}>
        OUT
      </text>
    </svg>
  );
}

function HalfAdderSchematic() {
  return (
    <svg viewBox="0 0 400 180" className="h-full w-full" aria-hidden>
      <line x1={30} y1={50} x2={110} y2={50} stroke={wire} strokeWidth={2} />
      <line x1={30} y1={120} x2={110} y2={120} stroke={wire} strokeWidth={2} />
      <text x={8} y={54} fill="#cbd5e1" fontSize={11}>
        A
      </text>
      <text x={8} y={124} fill="#cbd5e1" fontSize={11}>
        B
      </text>
      <GateBox x={110} y={30} label="XOR" />
      <GateBox x={110} y={100} label="AND" />
      <line x1={166} y1={50} x2={320} y2={50} stroke={wire} />
      <line x1={166} y1={120} x2={320} y2={120} stroke={wire} />
      <text x={328} y={54} fill={accent} fontSize={11}>
        SUM
      </text>
      <text x={328} y={124} fill={accent} fontSize={11}>
        CARRY
      </text>
    </svg>
  );
}

function FullAdderSchematic() {
  return (
    <svg viewBox="0 0 440 200" className="h-full w-full" aria-hidden>
      <GateBox x={100} y={30} label="XOR" />
      <GateBox x={100} y={100} label="XOR" />
      <GateBox x={220} y={70} label="XOR" />
      <GateBox x={220} y={130} label="AND/OR" w={72} />
      <line x1={40} y1={50} x2={100} y2={50} stroke={wire} strokeWidth={2} />
      <line x1={40} y1={120} x2={100} y2={120} stroke={wire} strokeWidth={2} />
      <line x1={40} y1={160} x2={80} y2={160} stroke={wire} strokeWidth={2} />
      <line x1={80} y1={160} x2={80} y2={90} stroke={wire} />
      <line x1={80} y1={90} x2={100} y2={90} stroke={wire} />
      <text x={8} y={54} fill="#cbd5e1" fontSize={11}>
        A
      </text>
      <text x={8} y={124} fill="#cbd5e1" fontSize={11}>
        B
      </text>
      <text x={8} y={164} fill="#cbd5e1" fontSize={11}>
        Cin
      </text>
      <line x1={292} y1={90} x2={360} y2={90} stroke={wire} />
      <line x1={292} y1={150} x2={360} y2={150} stroke={wire} />
      <text x={368} y={94} fill={accent} fontSize={11}>
        SUM
      </text>
      <text x={368} y={154} fill={accent} fontSize={11}>
        CARRY
      </text>
    </svg>
  );
}

function MuxSchematic() {
  const { inputs } = useCircuitWorkspace();
  const s1 = inputs.S1 ?? 0;
  const s0 = inputs.S0 ?? 0;

  return (
    <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden>
      <rect
        x={140}
        y={40}
        width={140}
        height={160}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={210}
        y={68}
        textAnchor="middle"
        fill={accent}
        fontSize={12}
        fontFamily="monospace"
      >
        4:1 MUX
      </text>
      {["D0", "D1", "D2", "D3"].map((label, i) => (
        <g key={label}>
          <line
            x1={40}
            y1={70 + i * 32}
            x2={140}
            y2={70 + i * 32}
            stroke={wire}
            strokeWidth={2}
          />
          <text x={8} y={74 + i * 32} fill="#cbd5e1" fontSize={11}>
            {label}
          </text>
        </g>
      ))}
      <line x1={40} y1={200} x2={140} y2={200} stroke={wire} strokeWidth={2} />
      <line x1={40} y1={220} x2={140} y2={220} stroke={wire} strokeWidth={2} />
      <text x={8} y={204} fill="#cbd5e1" fontSize={11}>
        S1
      </text>
      <text x={8} y={224} fill="#cbd5e1" fontSize={11}>
        S0
      </text>
      <line x1={280} y1={120} x2={360} y2={120} stroke={wire} strokeWidth={2} />
      <text x={368} y={124} fill={accent} fontSize={11}>
        Y
      </text>
      <text x={150} y={210} fill="#64748b" fontSize={10} fontFamily="monospace">
        S1S0 = {s1}
        {s0}
      </text>
    </svg>
  );
}

export default function CircuitSchematic() {
  const { experiment } = useCircuitWorkspace();
  const type = experiment?.schematicSvgType ?? "";

  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-slate-700/30 bg-surface-low/80 p-4">
      {type === "logic-gates" && <LogicGatesSchematic />}
      {type === "half-adder" && <HalfAdderSchematic />}
      {type === "full-adder" && <FullAdderSchematic />}
      {type === "4-1-multiplexer" && <MuxSchematic />}
      {!type && (
        <p className="text-sm text-slate-500">Schematic unavailable</p>
      )}
    </div>
  );
}
