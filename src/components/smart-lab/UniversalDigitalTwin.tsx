"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Group } from "three";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  FastForward,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  TimerReset,
} from "lucide-react";

import type { LabCatalogExperiment } from "@/data/labCatalog";
import { getTwinCoverage } from "@/lib/digitalTwinCoverage";

type Props = {
  experiment: LabCatalogExperiment;
};

type TimelineFrame = {
  id: string;
  label: string;
  detail: string;
  factor: number;
  status: string;
  metric: string;
};

const ENGINE_LABELS: Record<string, string> = {
  circuit: "Circuit",
  "software-lab": "Software Lab",
  "ai-dataset": "AI / Dataset",
  numerical: "Numerical",
  "bio-lab": "Biology",
  "chemistry-lab": "Chemistry",
  "engineering-lab": "Engineering",
  generic: "Generic",
};

function engineLabel(engine: string) {
  return ENGINE_LABELS[engine] ?? engine.replace(/[-_]/g, " ");
}

function buildTimeline(experiment: LabCatalogExperiment): TimelineFrame[] {
  const engine = String(experiment.engineType);
  const values =
    engine === "ai-dataset"
      ? ["Dataset ready", "Features mapped", "Training running", "Model state", "Validation", "Learning insight"]
      : engine === "software-lab"
        ? ["Environment ready", "Input loaded", "Execution running", "Benchmark state", "Result captured", "Complexity insight"]
        : engine === "chemistry-lab"
          ? ["Sample prepared", "Reagent loaded", "Reaction running", "Equivalence state", "Measurement", "Chemical insight"]
          : engine === "bio-lab"
            ? ["Culture prepared", "Initial state", "Growth running", "Population state", "Observation", "Biological insight"]
            : engine === "engineering-lab"
              ? ["Rig initialized", "Load applied", "Process running", "Physical state", "Measurement", "Engineering insight"]
              : engine === "numerical"
                ? ["Problem loaded", "Initial value", "Iteration running", "Converged state", "Error measured", "Numerical insight"]
                : ["Twin initialized", "Inputs applied", "Simulation running", "Live state", "Output captured", "Experiment insight"];

  return values.map((label, index) => ({
    id: `${experiment.id}-t${index}`,
    label,
    detail:
      index === 0
        ? "Digital twin created from experiment metadata."
        : index === 1
          ? "Student parameters are propagated into the twin state."
          : index === 2
            ? "The selected engine is represented as an active temporal state."
            : index === 3
              ? "The twin reflects the current experiment state."
              : index === 4
                ? "The result state is preserved for replay and comparison."
                : "The final frame is ready for contextual academic services.",
    factor: index / (values.length - 1),
    status: index < 2 ? "PREPARE" : index < 5 ? "PERFORM" : "REFLECT",
    metric: `${Math.round(100 + index * 17)}% state coverage`,
  }));
}

function TwinWorld({
  experiment,
  progress,
}: {
  experiment: LabCatalogExperiment;
  progress: number;
}) {
  const root = useRef<Group>(null);
  const engine = String(experiment.engineType);
  const phase = progress * Math.PI * 2;
  const active = progress > 0.32 && progress < 0.78;

  useFrame((state, delta) => {
    if (!root.current) return;
    root.current.rotation.y += delta * 0.12;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.03;
  });

  const glow = active ? 1.6 : 0.75;

  return (
    <group ref={root}>
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[9, 0.25, 6]} />
        <meshStandardMaterial color="#0a111b" metalness={0.72} roughness={0.32} />
      </mesh>

      <gridHelper args={[9, 18, "#0e3441", "#0b2029"]} position={[0, -0.96, 0]} />

      {engine === "circuit" && (
        <group>
          <mesh position={[0, -0.55, 0]}>
            <boxGeometry args={[5.8, 0.18, 2.7]} />
            <meshStandardMaterial color="#173047" metalness={0.4} roughness={0.48} />
          </mesh>
          {[[-2.3, -0.34], [-1.15, 0.42], [0, -0.1], [1.2, 0.45], [2.25, -0.35]].map(([x, z], index) => (
            <group key={index} position={[x, 0, z]}>
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[0.85, 0.58, 0.52]} />
                <meshStandardMaterial color="#111b29" metalness={0.8} roughness={0.28} />
              </mesh>
              <mesh position={[0.46, 0.35, 0]}>
                <sphereGeometry args={[0.08, 14, 14]} />
                <meshStandardMaterial color={index % 2 === 0 ? "#37e8ff" : "#7cf7b2"} emissive={index % 2 === 0 ? "#37e8ff" : "#7cf7b2"} emissiveIntensity={glow} />
              </mesh>
            </group>
          ))}
          {[
            [-2.0, 0.18, 0.0],
            [-0.9, 0.18, 0.7],
            [0.1, 0.18, -0.3],
            [1.15, 0.18, 0.65],
          ].map(([x, y, z], index) => (
            <mesh key={index} position={[x, y, z]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 2.0, 8]} />
              <meshStandardMaterial color="#29c8e6" emissive="#29c8e6" emissiveIntensity={0.5 + glow * 0.2} />
            </mesh>
          ))}
        </group>
      )}

      {engine === "ai-dataset" && (
        <group>
          {Array.from({ length: 18 }).map((_, index) => {
            const a = (index / 18) * Math.PI * 2;
            const radius = index % 2 === 0 ? 2.2 : 1.25;
            const y = Math.sin(a * 2 + phase) * 0.65;
            return (
              <mesh key={index} position={[Math.cos(a) * radius, y + 0.25, Math.sin(a) * radius]}>
                <sphereGeometry args={[index % 3 === 0 ? 0.12 : 0.08, 12, 12]} />
                <meshStandardMaterial color={index % 2 ? "#a78bfa" : "#36dbe9"} emissive={index % 2 ? "#7c3aed" : "#0891b2"} emissiveIntensity={glow} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.65, 24, 24]} />
            <meshStandardMaterial color="#17233b" metalness={0.7} roughness={0.2} emissive="#2dd4bf" emissiveIntensity={0.45 * glow} />
          </mesh>
        </group>
      )}

      {engine === "software-lab" && (
        <group>
          {[[-2.5, 0], [0, 0.7], [2.5, -0.1], [0.8, -0.85]].map(([x, z], index) => (
            <mesh key={index} position={[x, 0.35, z]}>
              <boxGeometry args={[1.45, 0.85, 1.15]} />
              <meshStandardMaterial color={index === 2 ? "#223a52" : "#101a29"} metalness={0.78} roughness={0.26} emissive={index === 2 ? "#155e75" : "#082f49"} emissiveIntensity={0.45 * glow} />
            </mesh>
          ))}
          {[-1, 0, 1].map((index) => (
            <mesh key={index} position={[index * 1.5, 1.15, 0]}>
              <sphereGeometry args={[0.13, 12, 12]} />
              <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={glow} />
            </mesh>
          ))}
        </group>
      )}

      {engine === "numerical" && (
        <group>
          <mesh rotation={[-Math.PI / 2.15, 0, 0]} position={[0, -0.78, 0]}>
            <planeGeometry args={[6.8, 4.4]} />
            <meshStandardMaterial color="#091a28" metalness={0.15} roughness={0.82} />
          </mesh>
          {Array.from({ length: 15 }).map((_, index) => {
            const x = -3 + index * 0.43;
            const y = Math.sin(x * 1.15 + phase) * 0.9;
            return (
              <mesh key={index} position={[x, y + 0.05, 0]}>
                <sphereGeometry args={[0.075, 10, 10]} />
                <meshStandardMaterial color="#f6c453" emissive="#f59e0b" emissiveIntensity={glow} />
              </mesh>
            );
          })}
        </group>
      )}

      {engine === "chemistry-lab" && (
        <group>
          {[[-1.6, 0], [0, 0.2], [1.6, -0.1]].map(([x, z], index) => (
            <group key={index} position={[x, 0, z]}>
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.55, 0.45, 1.1, 24]} />
                <meshStandardMaterial color="#102b3a" metalness={0.18} roughness={0.32} transparent opacity={0.9} />
              </mesh>
              <mesh position={[0, 0.48 + 0.15 * Math.sin(phase + index), 0]}>
                <cylinderGeometry args={[0.44, 0.44, 0.18, 20]} />
                <meshStandardMaterial color={index === 1 ? "#f59e0b" : "#32d4ff"} emissive={index === 1 ? "#f59e0b" : "#32d4ff"} emissiveIntensity={0.75 * glow} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {engine === "bio-lab" && (
        <group>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[1.15, 32, 32]} />
            <meshStandardMaterial color="#123049" transparent opacity={0.82} metalness={0.05} roughness={0.18} />
          </mesh>
          <mesh position={[0.2, 0.55, 0]}>
            <sphereGeometry args={[0.45, 20, 20]} />
            <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.55 * glow} />
          </mesh>
          {Array.from({ length: 12 }).map((_, index) => {
            const a = index * (Math.PI * 2 / 12);
            return (
              <mesh key={index} position={[Math.cos(a) * 1.6, 0.35 + Math.sin(a * 2 + phase) * 0.45, Math.sin(a) * 1.3]}>
                <sphereGeometry args={[0.09, 10, 10]} />
                <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={glow * 0.8} />
              </mesh>
            );
          })}
        </group>
      )}

      {engine === "engineering-lab" && (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[5.6, 0.55, 1.3]} />
            <meshStandardMaterial color="#1a2633" metalness={0.8} roughness={0.32} />
          </mesh>
          {[-1.8, -0.6, 0.6, 1.8].map((x, index) => (
            <mesh key={index} position={[x, 1.0, 0]} rotation={[0, 0, progress * 0.6 * (index % 2 ? -1 : 1)]}>
              <boxGeometry args={[0.42, 1.35, 0.55]} />
              <meshStandardMaterial color="#2b4158" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 1.55, 0]}>
            <boxGeometry args={[3.9, 0.15, 0.35]} />
            <meshStandardMaterial color="#efb84e" emissive="#f59e0b" emissiveIntensity={0.55 * glow} />
          </mesh>
        </group>
      )}

      {![
        "circuit",
        "ai-dataset",
        "software-lab",
        "numerical",
        "chemistry-lab",
        "bio-lab",
        "engineering-lab",
      ].includes(engine) && (
        <group>
          {Array.from({ length: 9 }).map((_, index) => (
            <mesh
              key={index}
              position={[
                ((index % 3) - 1) * 1.8,
                0.3 + (index % 2) * 0.55,
                (Math.floor(index / 3) - 1) * 1.1,
              ]}
              rotation={[phase * 0.12, phase * 0.16, phase * 0.08]}
            >
              <boxGeometry args={[0.55, 0.55, 0.55]} />
              <meshStandardMaterial color="#203246" emissive="#0e7490" emissiveIntensity={0.35 * glow} metalness={0.62} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 5]} intensity={2.4} />
      <pointLight position={[-4, 3, -2]} intensity={18 * glow} distance={12} color="#16d9ff" />
      <pointLight position={[4, 1, 3]} intensity={10 * glow} distance={10} color="#6d5dfd" />
    </group>
  );
}

export default function UniversalDigitalTwin({ experiment }: Props) {
  const coverage = getTwinCoverage(experiment);
  const frames = useMemo(() => buildTimeline(experiment), [experiment]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[frameIndex];
  const progress = frame.factor;

  const step = (direction: number) => {
    setFrameIndex((current) => {
      const next = current + direction;
      if (next < 0) return frames.length - 1;
      if (next >= frames.length) return 0;
      return next;
    });
  };

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setFrameIndex((current) => {
        if (current >= frames.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1200);
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#080D15]/90 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
            <Boxes className="h-4 w-4" />
            Universal 3D + 4D Digital Twin
          </div>
          <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
            {experiment.title}
          </h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
            Engine-aware spatial representation with a shared temporal experiment timeline. The original core circuit twin remains preserved for the eight specialized ECE experiments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-cyan-300">
            {coverage.shortLabel}
          </span>
          <span className="rounded-full border border-violet-400/15 bg-violet-400/5 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-violet-300">
            {engineLabel(String(experiment.engineType))}
          </span>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <div className="min-h-[480px] bg-[#050a11]">
          <Canvas camera={{ position: [8.6, 6.2, 9.6], fov: 42 }}>
            <color attach="background" args={["#050a11"]} />
            <fog attach="fog" args={["#050a11", 10, 24]} />
            <TwinWorld experiment={experiment} progress={progress} />
            <OrbitControls enablePan enableZoom minDistance={5} maxDistance={18} maxPolarAngle={Math.PI / 2.05} />
          </Canvas>
        </div>

        <aside className="border-t border-white/10 bg-[#090F18] xl:border-l xl:border-t-0">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
              <Eye className="h-4 w-4" />
              Twin coverage
            </div>
            <div className="mt-2 text-base font-semibold text-white">
              {coverage.label}
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {coverage.description}
            </p>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-400">
                <Clock3 className="h-4 w-4" />
                4D Timeline
              </div>
              <span className="text-[10px] font-mono text-slate-600">
                T{frameIndex}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-white">
                  {frame.label}
                </span>
                <span className="rounded-full border border-emerald-400/10 bg-emerald-400/5 px-2 py-1 text-[9px] font-mono uppercase tracking-[0.1em] text-emerald-300">
                  {frame.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {frame.detail}
              </p>
              <div className="mt-3 text-[10px] font-mono text-cyan-300">
                {frame.metric}
              </div>
            </div>

            <input
              aria-label="4D timeline scrubber"
              type="range"
              min={0}
              max={frames.length - 1}
              step={1}
              value={frameIndex}
              onChange={(event) => setFrameIndex(Number(event.target.value))}
              className="mt-5 w-full accent-cyan-400"
            />

            <div className="mt-4 grid grid-cols-3 gap-2">
              {frames.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFrameIndex(index)}
                  className={`rounded-xl border px-2 py-2 text-[9px] transition ${
                    index === frameIndex
                      ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
                      : "border-slate-800 bg-slate-950/40 text-slate-500 hover:text-white"
                  }`}
                >
                  T{index}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#041018]"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "Pause 4D" : "Play 4D"}
              </button>

              <button
                type="button"
                onClick={() => step(-1)}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-slate-400 hover:text-white"
                aria-label="Previous timeline frame"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => step(1)}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-slate-400 hover:text-white"
                aria-label="Next timeline frame"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setFrameIndex(0);
                  setPlaying(false);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5 text-slate-400 hover:text-white"
                aria-label="Reset 4D timeline"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-5">
            <TwinMetric icon={<Sparkles className="h-4 w-4" />} label="3D" value="READY" />
            <TwinMetric icon={<TimerReset className="h-4 w-4" />} label="4D" value="REPLAY" />
            <TwinMetric icon={<Gauge className="h-4 w-4" />} label="Engine" value={engineLabel(String(experiment.engineType))} />
            <TwinMetric icon={<FastForward className="h-4 w-4" />} label="Frame" value={`${frameIndex + 1}/${frames.length}`} />
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#070C13] px-5 py-4 sm:px-6">
        <CircleDot className="h-4 w-4 text-emerald-300" />
        <span className="text-xs text-slate-400">
          Every catalogue experiment now has a universal 3D representation and a 4D replay layer. Specialized core hardware geometry remains exclusive to the original eight circuit labs.
        </span>
      </div>
    </section>
  );
}

function TwinMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-3">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <span className="text-[9px] font-mono uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
      <div className="mt-1 truncate text-xs font-medium text-slate-300">
        {value}
      </div>
    </div>
  );
}
