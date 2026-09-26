"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  FileText,
  FlaskConical,
  LayoutDashboard,
  ScanLine,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Experiments",
    href: "/experiments",
    icon: FlaskConical,
  },
  {
    label: "Troubleshooter",
    href: "/troubleshooter",
    icon: Stethoscope,
  },
  {
    label: "Vision Inspector",
    href: "/vision-inspector",
    icon: ScanLine,
  },
  {
    label: "Virtual Smart Lab",
    href: "/smart-lab",
    icon: BrainCircuit,
  },
  {
    label: "AI Viva",
    href: "/viva",
    icon: Sparkles,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-700/30 bg-void-lowest lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col px-3 py-4">
        <div className="mb-3 px-3">
          <p className="lab-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Navigation
          </p>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "border border-primary/15 bg-primary/10 text-primary shadow-glow-cyan"
                    : "text-slate-400 hover:bg-surface-low hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    active
                      ? "text-primary"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto lab-panel-low p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="lab-mono text-[10px] uppercase tracking-wider text-slate-500">
              Lab Network
            </span>

            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          </div>

          <p className="lab-mono text-xs text-slate-300">
            RIG-04 / DIGITAL ELECTRONICS
          </p>

          <p className="mt-1 lab-mono text-[10px] text-slate-500">
            SIMULATED LINK
          </p>
        </div>
      </div>
    </aside>
  );
}