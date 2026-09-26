"use client";

import { Pause, Play, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useCircuitWorkspace } from "@/context/CircuitWorkspaceContext";

interface TimelineSnapshot {
  id: number;
  timestamp: number;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
}

const MAX_SNAPSHOTS = 30;
const PLAYBACK_INTERVAL = 800;

function buildSignature(
  inputs: Record<string, number>,
  outputs: Record<string, number>,
) {
  return (
    Object.entries(inputs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${name}:${value}`)
      .join("|") +
    "::" +
    Object.entries(outputs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${name}:${value}`)
      .join("|")
  );
}

export default function SmartLabTimeline() {
  const {
    inputs,
    observedOutputs,
    inputNames,
    setInput,
    reset,
  } = useCircuitWorkspace();

  const [snapshots, setSnapshots] = useState<TimelineSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextId = useRef(1);
  const lastSignature = useRef("");

  const currentSnapshot =
    currentIndex >= 0 ? snapshots[currentIndex] : null;

  const currentInputsSignature = useMemo(
    () =>
      inputNames
        .map((name) => `${name}:${inputs[name] ?? 0}`)
        .join("|"),
    [inputNames, inputs],
  );

  const currentOutputSignature = useMemo(
    () =>
      Object.entries(observedOutputs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, value]) => `${name}:${value}`)
        .join("|"),
    [observedOutputs],
  );

  const currentSignature =
    `${currentInputsSignature}::${currentOutputSignature}`;

  useEffect(() => {
    if (currentSignature === lastSignature.current) {
      return;
    }

    lastSignature.current = currentSignature;

    const snapshot: TimelineSnapshot = {
      id: nextId.current++,
      timestamp: Date.now(),
      inputs: { ...inputs },
      outputs: { ...observedOutputs },
    };

    setSnapshots((previous) =>
      [...previous, snapshot].slice(-MAX_SNAPSHOTS),
    );

    setCurrentIndex(-1);
  }, [currentSignature, inputs, observedOutputs]);

  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((previous) => {
        if (snapshots.length === 1) {
          return 0;
        }

        return previous < snapshots.length - 1
          ? previous + 1
          : 0;
      });
    }, PLAYBACK_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPlaying, snapshots.length]);

  useEffect(() => {
    if (!currentSnapshot) {
      return;
    }

    const targetSignature = buildSignature(
      currentSnapshot.inputs,
      currentSnapshot.outputs,
    );

    lastSignature.current = targetSignature;

    for (const name of inputNames) {
      setInput(
        name,
        currentSnapshot.inputs[name] ?? 0,
      );
    }
  }, [currentSnapshot, inputNames, setInput]);

  const clearTimeline = () => {
    setIsPlaying(false);
    setSnapshots([]);
    setCurrentIndex(-1);
    lastSignature.current = "";
    nextId.current = 1;
  };

  const resetAndRecord = () => {
    setIsPlaying(false);
    reset();
    setCurrentIndex(-1);
    lastSignature.current = "";
  };

  const selectSnapshot = (index: number) => {
    setIsPlaying(false);
    setCurrentIndex(index);
  };

  const handleScrub = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const index = Number(event.target.value);

    if (!Number.isFinite(index)) {
      return;
    }

    setIsPlaying(false);
    setCurrentIndex(index);
  };

  const formatTime = (timestamp: number) => {
    if (snapshots.length === 0) {
      return "0.0s";
    }

    const first = snapshots[0]?.timestamp ?? timestamp;
    const seconds = Math.max(0, timestamp - first) / 1000;

    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="lab-panel p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
            4D STATE TIMELINE
          </div>

          <h2 className="mt-1 text-lg font-semibold text-white">
            Circuit evolution over time
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Recorded circuit states can be played automatically or
            inspected manually using the time scrubber.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setIsPlaying((previous) => !previous)
            }
            disabled={snapshots.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetAndRecord}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/40 bg-surface-low px-3 py-2 text-xs text-slate-300 transition hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={clearTimeline}
            disabled={snapshots.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-400/10 bg-rose-400/5 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {snapshots.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="lab-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              TIME SCRUBBER
            </span>

            <span className="lab-mono text-[10px] text-primary">
              {currentIndex >= 0
                ? `T${currentIndex}`
                : "LIVE"}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(snapshots.length - 1, 0)}
            step={1}
            value={currentIndex >= 0 ? currentIndex : 0}
            onChange={handleScrub}
            className="mt-4 h-2 w-full cursor-pointer accent-cyan-400"
            aria-label="Circuit timeline scrubber"
          />

          <div className="mt-2 flex justify-between">
            <span className="lab-mono text-[9px] text-slate-600">
              {formatTime(snapshots[0].timestamp)}
            </span>

            <span className="lab-mono text-[9px] text-slate-600">
              {formatTime(
                snapshots[snapshots.length - 1].timestamp,
              )}
            </span>
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="lab-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            RECORDED STATES
          </span>

          <span className="lab-mono text-[10px] text-slate-500">
            {snapshots.length}/{MAX_SNAPSHOTS}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {snapshots.length === 0 ? (
            <div className="w-full rounded-lg border border-dashed border-slate-700/50 bg-surface-low px-4 py-6 text-center">
              <span className="text-xs text-slate-600">
                Change a circuit input to create the first timeline
                state.
              </span>
            </div>
          ) : (
            snapshots.map((snapshot, index) => {
              const active = index === currentIndex;

              return (
                <button
                  key={snapshot.id}
                  type="button"
                  onClick={() => selectSnapshot(index)}
                  className={`min-w-[110px] rounded-lg border px-3 py-3 text-left transition ${
                    active
                      ? "border-primary/40 bg-primary/10"
                      : "border-slate-700/30 bg-surface-low hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`lab-mono text-[10px] ${
                      active
                        ? "text-primary"
                        : "text-slate-500"
                    }`}
                  >
                    T{index}
                  </div>

                  <div className="mt-1 lab-mono text-[10px] text-slate-400">
                    {formatTime(snapshot.timestamp)}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {inputNames.map((name) => (
                      <span
                        key={name}
                        className="rounded bg-slate-900/70 px-1.5 py-0.5 text-[9px] text-slate-400"
                      >
                        {name}:{snapshot.inputs[name] ?? 0}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {currentSnapshot && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="lab-panel-low p-4">
            <div className="lab-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
              INPUT STATE
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {inputNames.map((name) => (
                <div
                  key={name}
                  className="rounded-md border border-slate-700/30 bg-slate-950/50 px-3 py-2"
                >
                  <span className="lab-mono text-[10px] text-slate-500">
                    {name}
                  </span>

                  <span className="ml-2 lab-mono text-xs text-slate-200">
                    {currentSnapshot.inputs[name] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lab-panel-low p-4">
            <div className="lab-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
              OUTPUT STATE
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(currentSnapshot.outputs).map(
                ([name, value]) => (
                  <div
                    key={name}
                    className="rounded-md border border-slate-700/30 bg-slate-950/50 px-3 py-2"
                  >
                    <span className="lab-mono text-[10px] text-slate-500">
                      {name}
                    </span>

                    <span
                      className={
                        value === 1
                          ? "ml-2 lab-mono text-xs font-semibold text-primary"
                          : "ml-2 lab-mono text-xs text-slate-200"
                      }
                    >
                      {value}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}