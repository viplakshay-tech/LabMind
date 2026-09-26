"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FlaskConical,
  LayoutDashboard,
  Sparkles,
  BrainCircuit,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    shortLabel: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Experiments",
    shortLabel: "Labs",
    href: "/experiments",
    icon: FlaskConical,
  },
  {
    label: "Smart Lab",
    shortLabel: "Lab",
    href: "/smart-lab",
    icon: BrainCircuit,
  },
  {
    label: "Viva",
    shortLabel: "Viva",
    href: "/viva",
    icon: Sparkles,
  },
  {
    label: "Analytics",
    shortLabel: "Stats",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function BottomNavDock() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-700/40 bg-void-lowest/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-surface-low hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />

              <span className="text-[10px] font-medium">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}