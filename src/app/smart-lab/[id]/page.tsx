import { notFound } from "next/navigation";
import { CircuitWorkspaceProvider } from "@/context/CircuitWorkspaceContext";
import SmartLab3D from "@/components/smart-lab/SmartLab3D";
import UniversalDigitalTwin from "@/components/smart-lab/UniversalDigitalTwin";
import UniversalLabWorkspace from "@/components/lab/UniversalLabWorkspace";
import { catalogExperiments } from "@/data/labCatalog";
import { experiments } from "@/data/experimentsData";
import { getTwinCoverage } from "@/lib/digitalTwinCoverage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CatalogExperiment = (typeof catalogExperiments)[number];

const CORE_EXPERIMENT_IDS = new Set([
  "logic-gates",
  "half-adder",
  "full-adder",
  "4-1-multiplexer",
  "1-4-demultiplexer",
  "2-4-decoder",
  "4-2-encoder",
  "sr-flip-flop",
]);

// decodeURIComponent throws a URIError on malformed input (e.g. "%E0%A4%A"),
// which would crash the page with a 500 instead of a 404.
function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export default async function SmartLabExperimentPage({ params }: PageProps) {
  const { id } = await params;
  const decodedId = safeDecode(id);

  if (!decodedId) {
    notFound();
  }

  const catalogExperiment = catalogExperiments.find(
    (item) => item.id === decodedId,
  );

  const coreExperiment = experiments.find((item) => item.id === decodedId);

  const isCoreCircuit = CORE_EXPERIMENT_IDS.has(decodedId);

  if (!catalogExperiment && !coreExperiment) {
    notFound();
  }

  // The eight original interactive circuit experiments live in
  // experimentsData.ts, while the multidisciplinary catalogue lives in
  // labCatalog.ts. Build a catalogue-shaped adapter for core experiments
  // so both sources use the same Digital Twin classification and UI.
  const resolvedExperiment: CatalogExperiment =
    catalogExperiment ??
    (({
      ...coreExperiment,
      department: "ECE",
      subject: "Digital Electronics",
      module: "Digital Logic",
      semester: 2,
      learningMode: "interactive",
      engineType: "circuit",
      catalogStatus: "CORE",
      capabilities: {
        simulation: true,
        aiTutor: true,
        troubleshooting: true,
        vision: true,
        viva: true,
        report: true,
        analytics: true,
        digitalTwin3D: true,
        timeline4D: true,
      },
    } as unknown) as CatalogExperiment);

  const coverage = getTwinCoverage(resolvedExperiment);

  const capabilities = (
    resolvedExperiment as unknown as {
      capabilities?: { digitalTwin3D?: boolean; timeline4D?: boolean };
    }
  ).capabilities;

  const twin3DAvailable = capabilities?.digitalTwin3D ?? true;
  const timeline4DAvailable = capabilities?.timeline4D ?? true;

  return (
    <main className="min-h-screen bg-[#05070B] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1550px] space-y-6">
        <section className="overflow-hidden rounded-2xl border border-cyan-500/10 bg-[#0B1018]/80 p-6 backdrop-blur-xl">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400">
            Virtual Smart Lab · Universal Digital Twin Platform
          </div>

          <div className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {resolvedExperiment.title}
                </h1>
                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.13em] text-cyan-300">
                  {coverage.shortLabel}
                </span>
              </div>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
                {resolvedExperiment.objective}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-cyan-300">
                {resolvedExperiment.department}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
                {resolvedExperiment.subject}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
                {resolvedExperiment.engineType}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <StatusChip
              label="3D Twin"
              value={twin3DAvailable ? "AVAILABLE" : "UNAVAILABLE"}
              tone="cyan"
            />
            <StatusChip
              label="4D Timeline"
              value={timeline4DAvailable ? "AVAILABLE" : "UNAVAILABLE"}
              tone="green"
            />
            <StatusChip
              label="Twin Class"
              value={coverage.shortLabel}
              tone="violet"
            />
          </div>
        </section>

        {isCoreCircuit && coreExperiment ? (
          <section className="rounded-2xl border border-cyan-500/10 bg-[#0B1018]/70 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                  Specialized Hardware Twin
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  The original deterministic circuit twin remains the
                  high-fidelity hardware scene for the eight core ECE
                  experiments.
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-300">
                CORE ENGINE
              </div>
            </div>

            {/* key forces a clean remount when switching between experiments */}
            <CircuitWorkspaceProvider
              key={coreExperiment.id}
              experiment={coreExperiment}
            >
              <SmartLab3D />
            </CircuitWorkspaceProvider>
          </section>
        ) : (
          <section className="rounded-2xl border border-violet-500/10 bg-[#0B1018]/70 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-300">
                  Universal Experiment Engine
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Deterministic engine workspace for the multidisciplinary
                  catalogue.
                </p>
              </div>
              <div className="rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-violet-300">
                {resolvedExperiment.engineType}
              </div>
            </div>

            <UniversalLabWorkspace
              key={resolvedExperiment.id}
              experiment={resolvedExperiment}
            />
          </section>
        )}

        <UniversalDigitalTwin
          key={resolvedExperiment.id}
          experiment={resolvedExperiment}
        />
      </div>
    </main>
  );
}

function StatusChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green" | "violet";
}) {
  const toneClass =
    tone === "cyan"
      ? "border-cyan-400/15 bg-cyan-400/5 text-cyan-300"
      : tone === "green"
        ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300"
        : "border-violet-400/15 bg-violet-400/5 text-violet-300";

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClass}`}>
      <div className="text-[9px] font-mono uppercase tracking-[0.16em] opacity-70">
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.08em]">
        {value}
      </div>
    </div>
  );
}