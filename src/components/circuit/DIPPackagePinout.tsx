import type { DIPPackage } from "@/types/experiment";

interface DIPPackagePinoutProps {
  packageData: DIPPackage;
}

export default function DIPPackagePinout({
  packageData,
}: DIPPackagePinoutProps) {
  const half = Math.ceil(packageData.pins.length / 2);

  const leftPins = packageData.pins.slice(0, half);
  const rightPins = [...packageData.pins.slice(half)].reverse();

  const pinColor = {
    VCC: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    GND: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    INPUT: "text-primary border-primary/20 bg-primary/5",
    OUTPUT: "text-violet-300 border-violet-500/20 bg-violet-500/5",
    NC: "text-slate-500 border-slate-700/40 bg-slate-900/20",
  };

  return (
    <div className="lab-panel p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="lab-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            IC PINOUT
          </div>

          <h3 className="mt-1 text-lg font-semibold text-white">
            {packageData.icNumber}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {packageData.name}
          </p>
        </div>

        <span className="lab-mono rounded-full border border-slate-700/40 bg-surface-low px-2.5 py-1 text-[10px] text-slate-400">
          DIP-{packageData.pinCount}
        </span>
      </div>

      <div className="mb-5 text-xs leading-5 text-slate-500">
        {packageData.description}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="space-y-2">
          {leftPins.map((pin) => (
            <div
              key={pin.pinNumber}
              className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-surface-low px-3 py-2"
            >
              <span className="lab-mono text-[10px] text-slate-500">
                PIN {pin.pinNumber}
              </span>

              <span
                className={`rounded-md border px-2 py-1 text-[10px] ${pinColor[pin.type]}`}
              >
                {pin.label}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex h-56 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-[#111827]">
          <div className="absolute left-1/2 top-0 h-3 w-8 -translate-x-1/2 rounded-b-full border-x border-b border-primary/20" />

          <div className="lab-mono rotate-90 whitespace-nowrap text-[9px] uppercase tracking-[0.2em] text-slate-500">
            {packageData.icNumber} · LOGIC IC
          </div>
        </div>

        <div className="space-y-2">
          {rightPins.map((pin) => (
            <div
              key={pin.pinNumber}
              className="flex items-center justify-between rounded-lg border border-slate-700/30 bg-surface-low px-3 py-2"
            >
              <span
                className={`rounded-md border px-2 py-1 text-[10px] ${pinColor[pin.type]}`}
              >
                {pin.label}
              </span>

              <span className="lab-mono text-[10px] text-slate-500">
                PIN {pin.pinNumber}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] text-primary">
          INPUT
        </span>

        <span className="rounded-full border border-violet-500/20 bg-violet-500/5 px-2.5 py-1 text-[10px] text-violet-300">
          OUTPUT
        </span>

        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] text-emerald-400">
          VCC
        </span>

        <span className="rounded-full border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 text-[10px] text-rose-400">
          GND
        </span>
      </div>
    </div>
  );
}