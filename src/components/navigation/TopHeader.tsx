"use client";

import {
  Activity,
  Bell,
  CircleUserRound,
  Cpu,
  Wifi,
} from "lucide-react";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-700/30 bg-void/90 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Cpu className="h-5 w-5 text-primary" />
          </div>

          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              LABMIND
            </div>

            <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Smart Laboratory
            </div>
          </div>
        </div>

        {/* Center telemetry */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
            <Activity className="h-4 w-4 text-primary" />

            <div>
              <div className="lab-mono text-[10px] text-slate-500">
                RIG STATUS
              </div>

              <div className="lab-mono text-xs font-medium text-emerald-400">
                ONLINE
              </div>
            </div>
          </div>

          <div className="lab-panel-low flex items-center gap-2 px-3 py-2">
            <Wifi className="h-4 w-4 text-emerald-400" />

            <div>
              <div className="lab-mono text-[10px] text-slate-500">
                CONNECTION
              </div>

              <div className="lab-mono text-xs font-medium text-slate-200">
                98.4%
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/40 bg-surface-low text-slate-400 transition hover:border-primary/30 hover:text-primary"
          >
            <Bell className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary"
          >
            <CircleUserRound className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}