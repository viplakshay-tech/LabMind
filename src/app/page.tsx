export default function Home() {
  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
        <div className="lab-panel w-full max-w-3xl p-8 text-center md:p-12">
          <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <span className="lab-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              SYSTEM INITIALIZED
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Welcome to LabMind
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            AI-powered smart laboratory platform for engineering students.
            The application shell is now online and ready for the experiment
            modules.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="lab-panel-low p-4">
              <div className="lab-mono text-xs text-primary">
                FRONTEND
              </div>
              <div className="mt-1 text-sm text-slate-300">
                Ready
              </div>
            </div>

            <div className="lab-panel-low p-4">
              <div className="lab-mono text-xs text-primary">
                AI ENGINE
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Phase 3
              </div>
            </div>

            <div className="lab-panel-low p-4">
              <div className="lab-mono text-xs text-primary">
                DIGITAL TWIN
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Phase 2
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}