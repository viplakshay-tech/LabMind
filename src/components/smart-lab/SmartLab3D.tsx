"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
} from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useCircuitWorkspace } from "@/context/CircuitWorkspaceContext";
import {
  VirtualBreadboard,
  VirtualDipIc,
  VirtualLed,
  VirtualResistor,
  VirtualSwitch,
  VirtualWire,
  type HardwarePosition,
} from "@/components/smart-lab/VirtualHardware";

/* ------------------------------------------------------------------ */
/*  Responsive Camera - Dynamically frames scene for desktop/laptop   */
/* ------------------------------------------------------------------ */
function ResponsiveCamera() {
  const { viewport } = useThree();
  const aspect = viewport.width / viewport.height;
  const fov = aspect < 1.2 ? 54 : aspect < 1.6 ? 48 : 42;

  return (
    <PerspectiveCamera
      makeDefault
      position={[5.6, 5.2, 6.8]}
      fov={fov}
      near={0.1}
      far={50}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Local Studio Lighting - Dark LabMind Synthetic Studio Aesthetic   */
/* ------------------------------------------------------------------ */
function StudioLighting() {
  return (
    <>
      {/* Key directional light */}
      <directionalLight
        position={[5, 8, 4]}
        intensity={2.4}
        color="#f8fafc"
        castShadow={false}
      />

      {/* Fill directional light with subtle cool cyan cast */}
      <directionalLight
        position={[-5, 4, 3]}
        intensity={0.9}
        color="#bae6fd"
      />

      {/* Rim light from behind */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={0.7}
        color="#a5b4fc"
      />

      {/* Ambient baseline lighting */}
      <ambientLight intensity={0.65} color="#475569" />

      {/* Overhead accent light focused on breadboard */}
      <pointLight
        position={[0, 2.8, 0]}
        intensity={10}
        distance={14}
        decay={2}
        color="#06b6d4"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Signal Wire - L-routed tube with smooth glow fade & active pulse  */
/* ------------------------------------------------------------------ */
function SignalWire({
  start,
  end,
  active = false,
  color: wireColor,
}: {
  start: HardwarePosition;
  end: HardwarePosition;
  active?: boolean;
  color?: string;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.MeshStandardMaterial>(null);

  // L-routing with arched breadboard profile
  const riseHeight = 0.18;
  const highY = Math.max(start[1], end[1]) + riseHeight;

  const points = useMemo(() => {
    return [
      new THREE.Vector3(start[0], start[1], start[2]),
      new THREE.Vector3(start[0], highY, start[2]),
      new THREE.Vector3(end[0], highY, end[2]),
      new THREE.Vector3(end[0], end[1], end[2]),
    ];
  }, [start, end, highY]);

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.15),
    [points]
  );

  const tubeGeom = useMemo(
    () => new THREE.TubeGeometry(curve, 24, 0.018, 8, false),
    [curve]
  );

  const inactiveColor = useMemo(() => {
    if (wireColor) return wireColor;
    const palette = [
      "#ef4444",
      "#3b82f6",
      "#22c55e",
      "#eab308",
      "#f97316",
      "#a855f7",
      "#06b6d4",
    ];
    const hash = Math.abs(
      Math.round(start[0] * 1000) +
        Math.round(start[2] * 777) +
        Math.round(end[0] * 555) +
        Math.round(end[2] * 333)
    );
    return palette[hash % palette.length];
  }, [start, end, wireColor]);

  useFrame(({ clock }) => {
    // 1. Update pulse sphere
    if (pulseRef.current) {
      if (!active) {
        pulseRef.current.visible = false;
      } else {
        pulseRef.current.visible = true;
        const t = (clock.getElapsedTime() * 0.75) % 1;
        const pos = curve.getPointAt(t);
        pulseRef.current.position.copy(pos);
      }
    }

    // 2. Smoothly ease emissive glow up/down (active transition)
    if (glowRef.current) {
      const targetIntensity = active ? 2.5 : 0;
      glowRef.current.emissiveIntensity +=
        (targetIntensity - glowRef.current.emissiveIntensity) * 0.14;
    }
  });

  return (
    <>
      <mesh geometry={tubeGeom}>
        <meshStandardMaterial
          ref={glowRef}
          color={active ? "#22d3ee" : inactiveColor}
          emissive={active ? "#22d3ee" : "#000000"}
          emissiveIntensity={0}
          metalness={0.15}
          roughness={0.5}
        />
      </mesh>

      {/* Signal propagation pulse indicator */}
      <mesh ref={pulseRef} visible={false}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial
          color="#a5f3fc"
          emissive="#22d3ee"
          emissiveIntensity={6}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene Floating Title                                              */
/* ------------------------------------------------------------------ */
function SceneTitle({ children }: { children: string }) {
  return (
    <Text
      position={[0, 1.95, 0]}
      fontSize={0.18}
      color="#67e8f9"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.05}
    >
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Power Rail Reference Marker                                       */
/* ------------------------------------------------------------------ */
function RailMarker({
  position,
  text,
  color,
}: {
  position: HardwarePosition;
  text: string;
  color: string;
}) {
  return (
    <Text
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.065}
      color={color}
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
    >
      {text}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Logic Gate IC Helper (DIP IC + Indicator LED)                     */
/* ------------------------------------------------------------------ */
function LogicGateIc({
  position,
  partNumber,
  gateName,
  output,
}: {
  position: HardwarePosition;
  partNumber: string;
  gateName: string;
  output: number;
}) {
  return (
    <group>
      <VirtualDipIc
        position={position}
        partNumber={partNumber}
        description={gateName}
      />

      <VirtualLed
        position={[position[0] + 0.95, 0.6, position[2]]}
        active={output === 1}
        label={`${gateName} = ${output}`}
      />
    </group>
  );
}

/* ================================================================== */
/*  EXPERIMENT SCENE 1: LOGIC GATES                                   */
/* ================================================================== */
function LogicGatesScene({
  inputs,
  outputs,
  onToggle,
}: {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  onToggle: (name: string) => void;
}) {
  const a = inputs.A ?? 0;
  const b = inputs.B ?? 0;

  return (
    <>
      <SceneTitle>LOGIC GATES · VIRTUAL HARDWARE LAB</SceneTitle>

      <VirtualBreadboard />

      <RailMarker position={[-2.5, 0.16, -1.02]} text="+5V" color="#fca5a5" />
      <RailMarker position={[-2.5, 0.16, 1.02]} text="GND" color="#93c5fd" />

      {/* Input Rocker Switches */}
      <VirtualSwitch
        position={[-2.15, 0.55, -1.22]}
        value={a}
        label={`A = ${a}`}
        onToggle={() => onToggle("A")}
      />

      <VirtualSwitch
        position={[-1.2, 0.55, -1.22]}
        value={b}
        label={`B = ${b}`}
        onToggle={() => onToggle("B")}
      />

      {/* Primary Gates (Left Column) */}
      <LogicGateIc
        position={[-1.2, 0.55, -0.65]}
        partNumber="7408"
        gateName="AND"
        output={outputs.AND ?? 0}
      />

      <LogicGateIc
        position={[-1.2, 0.55, 0.05]}
        partNumber="7432"
        gateName="OR"
        output={outputs.OR ?? 0}
      />

      <LogicGateIc
        position={[-1.2, 0.55, 0.75]}
        partNumber="7486"
        gateName="XOR"
        output={outputs.XOR ?? 0}
      />

      {/* Inverted Gates (Right Column) */}
      <LogicGateIc
        position={[0.8, 0.55, -0.65]}
        partNumber="7400"
        gateName="NAND"
        output={outputs.NAND ?? 0}
      />

      <LogicGateIc
        position={[0.8, 0.55, 0.05]}
        partNumber="7402"
        gateName="NOR"
        output={outputs.NOR ?? 0}
      />

      <LogicGateIc
        position={[0.8, 0.55, 0.75]}
        partNumber="7404"
        gateName="NOT"
        output={outputs.NOT ?? 0}
      />

      {/* Pull-down Resistors */}
      <VirtualResistor
        position={[-1.75, 0.42, -0.38]}
        label="220Ω"
        active={a === 1}
      />

      <VirtualResistor
        position={[-0.8, 0.42, -0.38]}
        label="220Ω"
        active={b === 1}
      />

      {/* Input Bus Routing: Switch A to ICs */}
      <SignalWire
        start={[-1.92, 0.55, -1.0]}
        end={[-1.94, 0.55, -0.65]}
        active={a === 1}
        color="#ef4444"
      />
      <SignalWire
        start={[-1.92, 0.55, -1.0]}
        end={[-1.94, 0.55, 0.05]}
        active={a === 1}
        color="#ef4444"
      />
      <SignalWire
        start={[-1.92, 0.55, -1.0]}
        end={[-1.94, 0.55, 0.75]}
        active={a === 1}
        color="#ef4444"
      />

      {/* Input Bus Routing: Switch B to ICs */}
      <SignalWire
        start={[-0.95, 0.55, -1.0]}
        end={[-0.46, 0.55, -0.65]}
        active={b === 1}
        color="#3b82f6"
      />
      <SignalWire
        start={[-0.95, 0.55, -1.0]}
        end={[-0.46, 0.55, 0.05]}
        active={b === 1}
        color="#3b82f6"
      />
      <SignalWire
        start={[-0.95, 0.55, -1.0]}
        end={[-0.46, 0.55, 0.75]}
        active={b === 1}
        color="#3b82f6"
      />

      {/* Left Column Output Wires (to LED inputs) */}
      <SignalWire
        start={[-0.46, 0.55, -0.65]}
        end={[-0.25, 0.55, -0.65]}
        active={(outputs.AND ?? 0) === 1}
        color="#22c55e"
      />
      <SignalWire
        start={[-0.46, 0.55, 0.05]}
        end={[-0.25, 0.55, 0.05]}
        active={(outputs.OR ?? 0) === 1}
        color="#eab308"
      />
      <SignalWire
        start={[-0.46, 0.55, 0.75]}
        end={[-0.25, 0.55, 0.75]}
        active={(outputs.XOR ?? 0) === 1}
        color="#f97316"
      />

      {/* Right Column Output Wires (to LED inputs) */}
      <SignalWire
        start={[1.54, 0.55, -0.65]}
        end={[1.75, 0.55, -0.65]}
        active={(outputs.NAND ?? 0) === 1}
        color="#a855f7"
      />
      <SignalWire
        start={[1.54, 0.55, 0.05]}
        end={[1.75, 0.55, 0.05]}
        active={(outputs.NOR ?? 0) === 1}
        color="#ec4899"
      />
      <SignalWire
        start={[1.54, 0.55, 0.75]}
        end={[1.75, 0.55, 0.75]}
        active={(outputs.NOT ?? 0) === 1}
        color="#06b6d4"
      />
    </>
  );
}

/* ================================================================== */
/*  EXPERIMENT SCENE 2: HALF ADDER                                    */
/* ================================================================== */
function HalfAdderScene({
  inputs,
  outputs,
  onToggle,
}: {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  onToggle: (name: string) => void;
}) {
  const a = inputs.A ?? 0;
  const b = inputs.B ?? 0;
  const sum = outputs.SUM ?? 0;
  const carry = outputs.CARRY ?? 0;

  return (
    <>
      <SceneTitle>HALF ADDER · VIRTUAL HARDWARE LAB</SceneTitle>

      <VirtualBreadboard />

      <RailMarker position={[-2.5, 0.16, -1.02]} text="+5V" color="#fca5a5" />
      <RailMarker position={[-2.5, 0.16, 1.02]} text="GND" color="#93c5fd" />

      {/* Inputs */}
      <VirtualSwitch
        position={[-2.15, 0.55, -1.18]}
        value={a}
        label={`A = ${a}`}
        onToggle={() => onToggle("A")}
      />

      <VirtualSwitch
        position={[-1.25, 0.55, -1.18]}
        value={b}
        label={`B = ${b}`}
        onToggle={() => onToggle("B")}
      />

      <VirtualResistor
        position={[-1.75, 0.45, -0.55]}
        label="220Ω"
        active={a === 1}
      />

      <VirtualResistor
        position={[-0.8, 0.45, -0.55]}
        label="220Ω"
        active={b === 1}
      />

      {/* IC Packages */}
      <VirtualDipIc
        position={[-0.35, 0.55, -0.1]}
        partNumber="7486"
        description="QUAD XOR · SUM"
      />

      <VirtualDipIc
        position={[-0.35, 0.55, 0.72]}
        partNumber="7408"
        description="QUAD AND · CARRY"
      />

      {/* Input Routing: A & B to XOR IC */}
      <SignalWire
        start={[-1.88, 0.55, -0.92]}
        end={[-1.09, 0.55, -0.22]}
        active={a === 1}
        color="#ef4444"
      />

      <SignalWire
        start={[-0.98, 0.55, -0.92]}
        end={[-1.09, 0.55, 0.02]}
        active={b === 1}
        color="#3b82f6"
      />

      {/* Branch Wires: A & B to AND IC */}
      <VirtualWire
        start={[-1.09, 0.48, -0.22]}
        end={[-1.09, 0.48, 0.6]}
        active={a === 1}
      />

      <VirtualWire
        start={[-1.09, 0.48, 0.02]}
        end={[-1.09, 0.48, 0.84]}
        active={b === 1}
      />

      {/* Output Wires: XOR to SUM, AND to CARRY */}
      <SignalWire
        start={[0.39, 0.55, -0.1]}
        end={[1.15, 0.55, -0.2]}
        active={sum === 1}
        color="#22c55e"
      />

      <SignalWire
        start={[0.39, 0.55, 0.72]}
        end={[1.15, 0.55, 0.72]}
        active={carry === 1}
        color="#eab308"
      />

      {/* Output Current Limiting Resistors */}
      <VirtualResistor
        position={[1.22, 0.48, -0.2]}
        label="220Ω"
        active={sum === 1}
      />

      <VirtualResistor
        position={[1.22, 0.48, 0.72]}
        label="220Ω"
        active={carry === 1}
      />

      {/* Output Indicator LEDs */}
      <VirtualLed
        position={[1.82, 0.6, -0.2]}
        active={sum === 1}
        label={`SUM = ${sum}`}
      />

      <VirtualLed
        position={[1.82, 0.6, 0.72]}
        active={carry === 1}
        label={`CARRY = ${carry}`}
      />
    </>
  );
}

/* ================================================================== */
/*  EXPERIMENT SCENE 3: FULL ADDER                                    */
/* ================================================================== */
function FullAdderScene({
  inputs,
  outputs,
  onToggle,
}: {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  onToggle: (name: string) => void;
}) {
  const a = inputs.A ?? 0;
  const b = inputs.B ?? 0;
  const cin = inputs.Cin ?? 0;

  const sum = outputs.SUM ?? 0;
  const carry = outputs.CARRY ?? 0;

  return (
    <>
      <SceneTitle>FULL ADDER · VIRTUAL HARDWARE LAB</SceneTitle>

      <VirtualBreadboard />

      <RailMarker position={[-2.5, 0.16, -1.02]} text="+5V" color="#fca5a5" />
      <RailMarker position={[-2.5, 0.16, 1.02]} text="GND" color="#93c5fd" />

      {/* Inputs */}
      <VirtualSwitch
        position={[-2.2, 0.55, -1.18]}
        value={a}
        label={`A = ${a}`}
        onToggle={() => onToggle("A")}
      />

      <VirtualSwitch
        position={[-1.25, 0.55, -1.18]}
        value={b}
        label={`B = ${b}`}
        onToggle={() => onToggle("B")}
      />

      <VirtualSwitch
        position={[-0.3, 0.55, -1.18]}
        value={cin}
        label={`Cin = ${cin}`}
        onToggle={() => onToggle("Cin")}
      />

      {/* Pull-down Resistors */}
      <VirtualResistor
        position={[-1.8, 0.42, -0.55]}
        label="220Ω"
        active={a === 1}
      />

      <VirtualResistor
        position={[-0.85, 0.42, -0.55]}
        label="220Ω"
        active={b === 1}
      />

      <VirtualResistor
        position={[0.1, 0.42, -0.55]}
        label="220Ω"
        active={cin === 1}
      />

      {/* IC Packages */}
      <VirtualDipIc
        position={[-1.1, 0.55, -0.05]}
        partNumber="7486"
        description="XOR · SUM PATH"
      />

      <VirtualDipIc
        position={[-1.1, 0.55, 0.78]}
        partNumber="7408"
        description="AND · CARRY PATH"
      />

      <VirtualDipIc
        position={[0.7, 0.55, 0.36]}
        partNumber="7432"
        description="OR · CARRY OUT"
      />

      {/* Input Wires */}
      <SignalWire
        start={[-1.93, 0.55, -0.92]}
        end={[-1.84, 0.55, -0.2]}
        active={a === 1}
        color="#ef4444"
      />

      <SignalWire
        start={[-0.98, 0.55, -0.92]}
        end={[-1.84, 0.55, 0.1]}
        active={b === 1}
        color="#3b82f6"
      />

      <SignalWire
        start={[-0.03, 0.55, -0.92]}
        end={[-0.36, 0.55, 0.05]}
        active={cin === 1}
        color="#eab308"
      />

      {/* Intermediate Logic Paths */}
      <VirtualWire
        start={[-1.84, 0.48, -0.2]}
        end={[-1.84, 0.48, 0.64]}
        active={a === 1}
      />

      <VirtualWire
        start={[-1.84, 0.48, 0.1]}
        end={[-1.84, 0.48, 0.92]}
        active={b === 1}
      />

      {/* SUM Output Wire */}
      <SignalWire
        start={[-0.36, 0.55, -0.05]}
        end={[1.15, 0.55, -0.1]}
        active={sum === 1}
        color="#22c55e"
      />

      {/* Carry Branch into OR gate */}
      <SignalWire
        start={[-0.36, 0.55, 0.78]}
        end={[-0.04, 0.55, 0.36]}
        active={(a & b) === 1}
        color="#f97316"
      />

      {/* CARRY Out from OR gate */}
      <SignalWire
        start={[1.44, 0.55, 0.36]}
        end={[1.65, 0.55, 0.72]}
        active={carry === 1}
        color="#a855f7"
      />

      {/* Output Resistors */}
      <VirtualResistor
        position={[1.2, 0.48, -0.1]}
        label="220Ω"
        active={sum === 1}
      />

      <VirtualResistor
        position={[1.72, 0.48, 0.72]}
        label="220Ω"
        active={carry === 1}
      />

      {/* Output LEDs */}
      <VirtualLed
        position={[2.05, 0.6, -0.1]}
        active={sum === 1}
        label={`SUM = ${sum}`}
      />

      <VirtualLed
        position={[2.05, 0.6, 0.72]}
        active={carry === 1}
        label={`CARRY = ${carry}`}
      />
    </>
  );
}

/* ================================================================== */
/*  EXPERIMENT SCENE 4: 4:1 MULTIPLEXER                               */
/* ================================================================== */
function MultiplexerScene({
  inputs,
  outputs,
  onToggle,
}: {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  onToggle: (name: string) => void;
}) {
  const dataInputs = ["D0", "D1", "D2", "D3"];

  return (
    <>
      <SceneTitle>4:1 MULTIPLEXER · VIRTUAL HARDWARE LAB</SceneTitle>

      <VirtualBreadboard />

      <RailMarker position={[-2.5, 0.16, -1.02]} text="+5V" color="#fca5a5" />
      <RailMarker position={[-2.5, 0.16, 1.02]} text="GND" color="#93c5fd" />

      {/* Data Inputs D0-D3 Switches */}
      {dataInputs.map((name, index) => (
        <VirtualSwitch
          key={name}
          position={[-2.15, 0.55, -0.78 + index * 0.5]}
          value={inputs[name] ?? 0}
          label={`${name} = ${inputs[name] ?? 0}`}
          onToggle={() => onToggle(name)}
        />
      ))}

      {/* Address Select Switches S1, S0 */}
      <VirtualSwitch
        position={[-0.15, 0.55, -1.02]}
        value={inputs.S1 ?? 0}
        label={`S1 = ${inputs.S1 ?? 0}`}
        onToggle={() => onToggle("S1")}
      />

      <VirtualSwitch
        position={[-0.15, 0.55, -0.42]}
        value={inputs.S0 ?? 0}
        label={`S0 = ${inputs.S0 ?? 0}`}
        onToggle={() => onToggle("S0")}
      />

      {/* 74153 Dual 4:1 Data Selector IC (16 Pins) */}
      <VirtualDipIc
        position={[0.65, 0.55, 0.25]}
        partNumber="74153"
        description="DUAL 4:1 DATA SELECTOR"
        pinCount={16}
      />

      {/* Data Routing Wires into 74153 Left Pins */}
      {dataInputs.map((name, index) => (
        <SignalWire
          key={name}
          start={[-1.85, 0.55, -0.55 + index * 0.5]}
          end={[-0.09, 0.55, 0.05 + index * 0.12]}
          active={(inputs[name] ?? 0) === 1}
        />
      ))}

      {/* Select Line Routing into 74153 */}
      <SignalWire
        start={[0.0, 0.55, -1.0]}
        end={[0.35, 0.55, -0.05]}
        active={(inputs.S1 ?? 0) === 1}
        color="#a855f7"
      />

      <SignalWire
        start={[0.0, 0.55, -0.4]}
        end={[0.5, 0.55, 0.05]}
        active={(inputs.S0 ?? 0) === 1}
        color="#ec4899"
      />

      {/* Output Wire from 74153 Right Pin to Resistor */}
      <SignalWire
        start={[1.39, 0.55, 0.25]}
        end={[1.65, 0.55, 0.25]}
        active={(outputs.Y ?? 0) === 1}
        color="#22c55e"
      />

      <VirtualResistor
        position={[1.72, 0.48, 0.25]}
        label="220Ω"
        active={(outputs.Y ?? 0) === 1}
      />

      <VirtualLed
        position={[2.12, 0.6, 0.25]}
        active={(outputs.Y ?? 0) === 1}
        label={`Y = ${outputs.Y ?? 0}`}
      />

      {/* Section Explanatory Labels */}
      <Text
        position={[-2.1, 0.18, 1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.07}
        color="#64748b"
        anchorX="left"
        anchorY="middle"
      >
        DATA INPUTS
      </Text>

      <Text
        position={[-0.4, 0.18, 1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.07}
        color="#64748b"
        anchorX="left"
        anchorY="middle"
      >
        SELECT LINES
      </Text>

      <Text
        position={[1.65, 0.18, 1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.07}
        color="#64748b"
        anchorX="left"
        anchorY="middle"
      >
        OUTPUT
      </Text>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Workbench Surface beneath the Breadboard                          */
/* ------------------------------------------------------------------ */
function Workbench() {
  return (
    <>
      <mesh
        position={[0, -0.22, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial
          color="#0b1120"
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      <gridHelper
        args={[14, 28, "#1e293b", "#0f172a"]}
        position={[0, -0.21, 0]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Master Scene Assembly                                             */
/* ------------------------------------------------------------------ */
function CircuitScene({
  experimentId,
  inputs,
  outputs,
  onToggle,
}: {
  experimentId: string;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  onToggle: (name: string) => void;
}) {
  return (
    <>
      <ResponsiveCamera />
      <StudioLighting />

      {/* Atmospheric depth fog */}
      <fog attach="fog" args={["#020617", 12, 28]} />

      <Workbench />

      {experimentId === "logic-gates" && (
        <LogicGatesScene
          inputs={inputs}
          outputs={outputs}
          onToggle={onToggle}
        />
      )}

      {experimentId === "half-adder" && (
        <HalfAdderScene
          inputs={inputs}
          outputs={outputs}
          onToggle={onToggle}
        />
      )}

      {experimentId === "full-adder" && (
        <FullAdderScene
          inputs={inputs}
          outputs={outputs}
          onToggle={onToggle}
        />
      )}

      {experimentId === "4-1-multiplexer" && (
        <MultiplexerScene
          inputs={inputs}
          outputs={outputs}
          onToggle={onToggle}
        />
      )}

      <OrbitControls
        enablePan
        enableZoom
        minDistance={3}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.15}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  SmartLab3D Component Export                                       */
/* ------------------------------------------------------------------ */
export default function SmartLab3D() {
  const {
    experiment,
    inputs,
    observedOutputs,
    inputNames,
    outputNames,
    setInput,
    reset,
  } = useCircuitWorkspace();

  const toggleInput = (name: string) => {
    const current = inputs[name] ?? 0;
    setInput(name, current === 1 ? 0 : 1);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="overflow-hidden rounded-2xl border border-slate-700/30 bg-[#020617]">
        <div className="h-[480px] sm:h-[540px] md:h-[600px] lg:h-[620px] xl:h-[660px]">
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
            }}
          >
            <color attach="background" args={["#020617"]} />

            <CircuitScene
              experimentId={experiment?.id ?? ""}
              inputs={inputs}
              outputs={observedOutputs}
              onToggle={toggleInput}
            />
          </Canvas>
        </div>
      </div>

      {/* Control & Telemetry Sidebar */}
      <div className="space-y-4">
        <div className="lab-panel p-5">
          <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            VIRTUAL HARDWARE
          </div>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {experiment?.title ?? "Smart Lab"}
          </h2>

          <div className="mt-5">
            <div className="mb-2 lab-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
              INPUTS
            </div>

            <div className="space-y-2">
              {inputNames.map((name) => (
                <StateRow
                  key={name}
                  label={name}
                  value={inputs[name] ?? 0}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 lab-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
              OUTPUTS
            </div>

            <div className="space-y-2">
              {outputNames.map((name) => (
                <StateRow
                  key={name}
                  label={name}
                  value={observedOutputs[name] ?? 0}
                  active={(observedOutputs[name] ?? 0) === 1}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-5 w-full rounded-lg border border-slate-600/50 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-primary/50 hover:text-primary"
          >
            Reset Circuit
          </button>
        </div>

        <div className="lab-panel p-5">
          <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
            CYBER-PHYSICAL LAYER
          </div>

          <p className="mt-3 text-xs leading-6 text-slate-500">
            The 3D laboratory represents the physical circuit layer with
            virtual DIP ICs, breadboard connections, resistors, switches,
            LEDs, and signal paths. The same simulation engine controls
            every experiment.
          </p>
        </div>
      </div>
    </div>
  );
}

function StateRow({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-surface-low px-4 py-3">
      <span className="lab-mono text-xs text-slate-400">{label}</span>

      <span
        className={
          active
            ? "lab-mono text-sm font-semibold text-primary"
            : "lab-mono text-sm text-slate-200"
        }
      >
        {value}
      </span>
    </div>
  );
}