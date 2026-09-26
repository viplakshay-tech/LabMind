import type { ReactNode } from "react";

import BottomNavDock from "./BottomNavDock";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

interface PageShellProps {
  children: ReactNode;
}

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-void text-slate-100">
      <TopHeader />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      <BottomNavDock />
    </div>
  );
}