"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Database,
  Eye,
  FlaskConical,
  Grid3X3,
  Layers3,
  List,
  Microscope,
  Network,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Telescope,
  Wrench,
  Zap,
} from "lucide-react";

import { catalogExperiments } from "@/data/labCatalog";
import { coreExperiments } from "@/data/experimentsData";
import {
  CORE_TWIN_EXPERIMENT_IDS,
  getTwinCoverage,
  type TwinCoverageKind,
} from "@/lib/digitalTwinCoverage";

type ViewMode = "grid" | "list";
type SortMode = "relevance" | "az" | "za" | "department";

type SmartLabRecord = {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  department: string;
  subject: string;
  module: string;
  semester: number | string;
  learningMode: string;
  engineType: string;
  catalogStatus: "CORE" | "CATALOG";
  difficulty: string;
  objective: string;
  capabilities: Record<string, boolean>;
};

const CORE_IDS = new Set([
  ...CORE_TWIN_EXPERIMENT_IDS,
  "logic-gates",
  "half-adder",
  "full-adder",
  "4-1-multiplexer",
  "1-4-demultiplexer",
  "2-4-decoder",
  "4-2-encoder",
  "sr-flip-flop",
]);

const CORE_CAPABILITIES: Record<string, boolean> = {
  simulation: true,
  aiTutor: true,
  troubleshooting: true,
  vision: true,
  viva: true,
  report: true,
  analytics: true,
  digitalTwin3D: true,
  timeline4D: true,
};

const CAPABILITY_LABELS: Record<string, string> = {
  simulation: "Simulation",
  aiTutor: "AI Tutor",
  troubleshooting: "Troubleshooting",
  vision: "Vision",
  viva: "AI Viva",
  report: "Reports",
  analytics: "Analytics",
  digitalTwin3D: "3D Twin",
  timeline4D: "4D Timeline",
};

const ENGINE_LABELS: Record<string, string> = {
  circuit: "Circuit",
  "software-lab": "Software Lab",
  "ai-dataset": "AI Dataset",
  numerical: "Numerical",
  "bio-lab": "Biology",
  "chemistry-lab": "Chemistry",
  "engineering-lab": "Engineering",
  generic: "Generic",
};

const DEPARTMENT_ICONS: Record<string, typeof Cpu> = {
  ECE: Cpu,
  CSE: Database,
  AIML: BrainCircuit,
  EEE: Zap,
  Mechanical: Wrench,
  Civil: Boxes,
  Physics: Activity,
  Chemistry: FlaskConical,
  Mathematics: Target,
  Biotechnology: Microscope,
  Instrumentation: Network,
  Automobile: Boxes,
};

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function prettify(value: unknown) {
  return String(value ?? "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function asCoreRecord(
  experiment: (typeof coreExperiments)[number],
): SmartLabRecord {
  return {
    id: experiment.id,
    code: experiment.code,
    title: experiment.title,
    shortTitle: experiment.shortTitle ?? experiment.title,
    department: "ECE",
    subject: "Digital Electronics",
    module: "Digital Logic",
    semester: 2,
    learningMode: "Interactive",
    engineType: "circuit",
    catalogStatus: "CORE",
    difficulty: experiment.difficulty,
    objective: experiment.objective,
    capabilities: CORE_CAPABILITIES,
  };
}

function asCatalogRecord(
  experiment: (typeof catalogExperiments)[number],
): SmartLabRecord {
  return {
    id: String(experiment.id),
    code: String(experiment.code ?? experiment.id),
    title: String(experiment.title),
    shortTitle: String(experiment.title),
    department: String(experiment.department ?? "General"),
    subject: String(experiment.subject ?? "General"),
    module: String(experiment.module ?? "General"),
    semester: experiment.semester ?? "",
    learningMode: String(experiment.learningMode ?? "Structured"),
    engineType: String(experiment.engineType ?? "generic"),
    catalogStatus:
      String(experiment.catalogStatus ?? "").toLowerCase() === "core"
        ? "CORE"
        : "CATALOG",
    difficulty: String(experiment.difficulty ?? "Standard"),
    objective: String(experiment.objective ?? ""),
    capabilities: Object.fromEntries(
      Object.entries(experiment.capabilities ?? {}).map(([key, value]) => [
        key,
        Boolean(value),
      ]),
    ),
  };
}

const coreRecords = coreExperiments.map(asCoreRecord);

/*
 * Build ONE authoritative Smart Lab list.
 * - Core experiments come from the legacy interactive engine.
 * - Catalog experiments come from the multidisciplinary catalogue.
 * - Duplicate IDs are removed at the registry boundary.
 * - Core IDs are excluded from the catalogue side so each experiment is rendered once.
 */
const smartLabRecords: SmartLabRecord[] = Array.from(
  new Map(
    [
      ...coreRecords,
      ...catalogExperiments
        .filter((item) => !CORE_IDS.has(String(item.id)))
        .map(asCatalogRecord),
    ].map((item) => [item.id, item] as const),
  ).values(),
);

function isCore(record: SmartLabRecord) {
  return record.catalogStatus === "CORE" || CORE_IDS.has(record.id);
}

function matchesSearch(record: SmartLabRecord, query: string) {
  if (!query) return true;

  const normalizedQuery = normalize(query);

  const fields = [
    record.id,
    record.code,
    record.title,
    record.shortTitle,
    record.department,
    record.subject,
    record.module,
    record.engineType,
    record.learningMode,
    record.difficulty,
    record.objective,
  ];

  /*
   * Search ONLY experiment metadata.
   * Classification/capability/twin state are handled by their dedicated filters.
   */
  const normalizedFields = fields.map(normalize);

  if (normalizedFields.some((field) => field.includes(normalizedQuery))) {
    return true;
  }

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);

  if (queryTokens.length <= 1) return false;

  return queryTokens.every((token) =>
    normalizedFields.some((field) => field.includes(token)),
  );
}

function matchesCapability(
  record: SmartLabRecord,
  capability: string,
) {
  if (capability === "all") return true;
  return Boolean(record.capabilities[capability]);
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  detail: string;
  icon: typeof Boxes;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#080C12]/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-2 text-cyan-300">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-right">
          <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-slate-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {value}
          </div>
        </div>
      </div>
      <div className="mt-4 text-[10px] text-slate-600">{detail}</div>
    </div>
  );
}

function QuickButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
          : "border-slate-800 bg-[#080C12] text-slate-400 hover:border-slate-700 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  formatter = prettify,
}: {
  label: string;
  value: string;
  options?: string[];
  onChange: (value: string) => void;
  formatter?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-800 bg-[#080C12] px-3 pr-9 text-xs text-slate-300 outline-none focus:border-cyan-400/30"
        >
          <option value="all">All</option>
          {(options ?? []).map((option) => (
            <option key={`${label}-${option}`} value={option}>
              {formatter(option)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </label>
  );
}

function CapabilityBadge({ name }: { name: string }) {
  const label = CAPABILITY_LABELS[name] ?? prettify(name);

  return (
    <span className="rounded-full border border-slate-800 bg-slate-950/40 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] text-slate-400">
      {label}
    </span>
  );
}

export default function SmartLabPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [subject, setSubject] = useState("all");
  const [module, setModule] = useState("all");
  const [engine, setEngine] = useState("all");
  const [semester, setSemester] = useState("all");
  const [learningMode, setLearningMode] = useState("all");
  const [capability, setCapability] = useState("all");
  const [classification, setClassification] = useState("all");
  const [twinCoverage, setTwinCoverage] =
    useState<"all" | TwinCoverageKind>("all");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(true);

  const departments = useMemo(
    () =>
      [...new Set(smartLabRecords.map((item) => item.department))]
        .filter(Boolean)
        .sort(),
    [],
  );

  const subjects = useMemo(
    () =>
      [...new Set(
        smartLabRecords
          .filter(
            (item) =>
              department === "all" || item.department === department,
          )
          .map((item) => item.subject),
      )]
        .filter(Boolean)
        .sort(),
    [department],
  );

  const modules = useMemo(
    () =>
      [...new Set(
        smartLabRecords
          .filter(
            (item) =>
              department === "all" || item.department === department,
          )
          .filter(
            (item) => subject === "all" || item.subject === subject,
          )
          .map((item) => item.module),
      )]
        .filter(Boolean)
        .sort(),
    [department, subject],
  );

  const engines = useMemo(
    () =>
      [...new Set(
        smartLabRecords
          .filter(
            (item) =>
              department === "all" || item.department === department,
          )
          .map((item) => item.engineType),
      )]
        .filter(Boolean)
        .sort(),
    [department],
  );

  const semesters = useMemo(
    () =>
      [...new Set(
        smartLabRecords
          .map((item) => String(item.semester))
          .filter((value) => value && value !== "undefined" && value !== "null"),
      )].sort((a, b) => {
        const na = Number(a);
        const nb = Number(b);
        return Number.isNaN(na) || Number.isNaN(nb)
          ? a.localeCompare(b)
          : na - nb;
      }),
    [],
  );

  const learningModes = useMemo(
    () =>
      [...new Set(smartLabRecords.map((item) => item.learningMode))]
        .filter(Boolean)
        .sort(),
    [],
  );

  const capabilities = useMemo(
    () =>
      [...new Set(
        smartLabRecords.flatMap((item) =>
          Object.entries(item.capabilities)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key),
        ),
      )].sort(),
    [],
  );

  const digitalTwin3DCount = useMemo(
    () =>
      smartLabRecords.filter(
        (item) => item.capabilities.digitalTwin3D,
      ).length,
    [],
  );

  const timeline4DCount = useMemo(
    () =>
      smartLabRecords.filter(
        (item) => item.capabilities.timeline4D,
      ).length,
    [],
  );

  const filteredExperiments = useMemo(() => {
    const records = smartLabRecords.filter((item) => {
      if (!matchesSearch(item, search)) return false;
      if (department !== "all" && item.department !== department) return false;
      if (subject !== "all" && item.subject !== subject) return false;
      if (module !== "all" && item.module !== module) return false;
      if (engine !== "all" && item.engineType !== engine) return false;
      if (semester !== "all" && String(item.semester) !== semester) return false;
      if (learningMode !== "all" && item.learningMode !== learningMode) return false;
      if (!matchesCapability(item, capability)) return false;

      if (
        classification === "core" &&
        !isCore(item)
      ) {
        return false;
      }

      if (
        classification === "catalog" &&
        isCore(item)
      ) {
        return false;
      }

      if (twinCoverage !== "all") {
        if (getTwinCoverage(item as never).kind !== twinCoverage) {
          return false;
        }
      }

      return true;
    });

    return [...records].sort((a, b) => {
      switch (sortMode) {
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "department":
          return (
            a.department.localeCompare(b.department) ||
            a.title.localeCompare(b.title)
          );
        default:
          return (
            Number(isCore(b)) - Number(isCore(a)) ||
            a.title.localeCompare(b.title)
          );
      }
    });
  }, [
    search,
    department,
    subject,
    module,
    engine,
    semester,
    learningMode,
    capability,
    classification,
    twinCoverage,
    sortMode,
  ]);

  const coreCount = smartLabRecords.filter(isCore).length;
  const catalogCount = smartLabRecords.length - coreCount;

  function resetFilters() {
    setSearch("");
    setDepartment("all");
    setSubject("all");
    setModule("all");
    setEngine("all");
    setSemester("all");
    setLearningMode("all");
    setCapability("all");
    setClassification("all");
    setTwinCoverage("all");
    setSortMode("relevance");
  }

  function selectDepartment(value: string) {
    setDepartment(value);
    setSubject("all");
    setModule("all");
    setEngine("all");
  }

  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#0B1018]/80 backdrop-blur-xl">
          <div className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-400">
                  <Telescope className="h-4 w-4" />
                  Virtual Smart Lab · Digital Twin Platform
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                  Explore the
                  <span className="text-cyan-400"> Smart Lab.</span>
                </h1>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400 sm:text-base">
                  Search experiments directly, then use the separate
                  classification and Digital Twin filters to discover the
                  exact laboratory capability available for each experiment.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricCard
                  label="Experiments"
                  value={smartLabRecords.length}
                  detail="Unique Smart Lab registry"
                  icon={Boxes}
                />
                <MetricCard
                  label="Core Interactive"
                  value={coreCount}
                  detail="High-fidelity circuit twins"
                  icon={Cpu}
                />
                <MetricCard
                  label="Catalog Labs"
                  value={catalogCount}
                  detail="Multidisciplinary records"
                  icon={Layers3}
                />
                <MetricCard
                  label="3D + 4D"
                  value={`${digitalTwin3DCount}/${timeline4DCount}`}
                  detail="3D Twin / 4D Timeline coverage"
                  icon={Activity}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search experiments by name, code, ID, subject, module, department or objective..."
                className="h-12 w-full rounded-xl border border-slate-800 bg-[#080C12] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <QuickButton
                active={classification === "core"}
                onClick={() => {
                  resetFilters();
                  setClassification("core");
                }}
              >
                Core Labs
              </QuickButton>

              <QuickButton
                active={engine === "circuit"}
                onClick={() => {
                  resetFilters();
                  setEngine("circuit");
                }}
              >
                Circuits
              </QuickButton>

              <QuickButton
                active={capability === "digitalTwin3D"}
                onClick={() => {
                  resetFilters();
                  setCapability("digitalTwin3D");
                }}
              >
                3D Twin
              </QuickButton>

              <QuickButton
                active={capability === "timeline4D"}
                onClick={() => {
                  resetFilters();
                  setCapability("timeline4D");
                }}
              >
                4D Timeline
              </QuickButton>

              <QuickButton
                active={capability === "viva"}
                onClick={() => {
                  resetFilters();
                  setCapability("viva");
                }}
              >
                AI Viva
              </QuickButton>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-4 text-xs text-cyan-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <SelectField
                label="Department"
                value={department}
                onChange={selectDepartment}
                options={departments}
              />
              <SelectField
                label="Subject"
                value={subject}
                onChange={setSubject}
                options={subjects}
              />
              <SelectField
                label="Module"
                value={module}
                onChange={setModule}
                options={modules}
              />
              <SelectField
                label="Engine"
                value={engine}
                onChange={setEngine}
                options={engines}
                formatter={(value) => ENGINE_LABELS[value] ?? prettify(value)}
              />
              <SelectField
                label="Semester"
                value={semester}
                onChange={setSemester}
                options={semesters}
              />
              <SelectField
                label="Learning Mode"
                value={learningMode}
                onChange={setLearningMode}
                options={learningModes}
              />
              <SelectField
                label="Capability"
                value={capability}
                onChange={setCapability}
                options={capabilities}
                formatter={(value) =>
                  CAPABILITY_LABELS[value] ?? prettify(value)
                }
              />
              <SelectField
                label="Classification"
                value={classification}
                onChange={setClassification}
                options={["core", "catalog"]}
                formatter={(value) =>
                  value === "core" ? "Core Interactive" : "Catalog Labs"
                }
              />
              <SelectField
                label="Digital Twin Coverage"
                value={twinCoverage}
                onChange={(value) =>
                  setTwinCoverage(value as "all" | TwinCoverageKind)
                }
                options={["core", "asset", "universal"]}
                formatter={(value) => {
                  if (value === "core") return "Specialized Core 3D + 4D";
                  if (value === "asset") return "Asset 3D + Universal 4D";
                  return "Universal Procedural 3D + 4D";
                }}
              />
              <SelectField
                label="Sort"
                value={sortMode}
                onChange={(value) => setSortMode(value as SortMode)}
                options={["relevance", "az", "za", "department"]}
                formatter={(value) => {
                  if (value === "az") return "A → Z";
                  if (value === "za") return "Z → A";
                  if (value === "department") return "Department";
                  return "Relevance";
                }}
              />

              <button
                type="button"
                onClick={resetFilters}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </button>
            </div>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-800 bg-[#0B1018]/70 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                Experiment Results
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-2xl font-semibold text-white">
                  {filteredExperiments.length}
                </span>
                <span className="text-sm text-slate-500">
                  matching experiments
                </span>
                {search && (
                  <span className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] text-cyan-300">
                    Search: {search}
                  </span>
                )}
              </div>
            </div>

            <div className="flex rounded-xl border border-slate-800 bg-[#080C12] p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 ${
                  viewMode === "grid"
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-500"
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 ${
                  viewMode === "list"
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-500"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {filteredExperiments.length === 0 ? (
          <section className="mt-5 rounded-3xl border border-dashed border-slate-800 bg-[#0B1018]/70 px-6 py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-700" />
            <h2 className="mt-4 text-lg font-semibold">
              No experiments found
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Search matches experiment metadata only. Remove filters or try
              a broader experiment name, code, subject, module or department.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm text-cyan-300"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Smart Lab
            </button>
          </section>
        ) : viewMode === "grid" ? (
          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredExperiments.map((experiment) => {
              const twin = getTwinCoverage(experiment as never);
              const Icon =
                DEPARTMENT_ICONS[experiment.department] ?? Boxes;

              const enabledCapabilities = Object.entries(
                experiment.capabilities,
              )
                .filter(([, enabled]) => enabled)
                .map(([key]) => key)
                .slice(0, 5);

              return (
                <Link
                  key={`smart-lab-${experiment.id}`}
                  href={`/smart-lab/${encodeURIComponent(experiment.id)}`}
                  className="group rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-[#0C121B]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">
                          {experiment.code}
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-white">
                          {experiment.title}
                        </h3>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] ${
                        isCore(experiment)
                          ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-300"
                          : "border-violet-400/15 bg-violet-400/5 text-violet-300"
                      }`}
                    >
                      {isCore(experiment)
                        ? "CORE INTERACTIVE"
                        : "CATALOG LAB"}
                    </span>

                    <span className="rounded-full border border-slate-800 bg-slate-950/50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] text-slate-400">
                      {ENGINE_LABELS[experiment.engineType] ??
                        prettify(experiment.engineType)}
                    </span>

                    <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] text-emerald-300">
                      {twin.shortLabel}
                    </span>
                  </div>

                  <p className="mt-4 min-h-[48px] text-sm leading-6 text-slate-500">
                    {experiment.objective}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-slate-800 bg-slate-950/30 px-2.5 py-1 text-[9px] text-slate-500">
                      {experiment.department}
                    </span>
                    <span className="rounded-full border border-slate-800 bg-slate-950/30 px-2.5 py-1 text-[9px] text-slate-500">
                      {experiment.subject}
                    </span>
                    <span className="rounded-full border border-slate-800 bg-slate-950/30 px-2.5 py-1 text-[9px] text-slate-500">
                      {experiment.module}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-slate-800/80 pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {enabledCapabilities.map((name) => (
                        <CapabilityBadge
                          key={`${experiment.id}-capability-${name}`}
                          name={name}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="mt-5 space-y-2">
            {filteredExperiments.map((experiment) => {
              const twin = getTwinCoverage(experiment as never);

              return (
                <Link
                  key={`smart-lab-list-${experiment.id}`}
                  href={`/smart-lab/${encodeURIComponent(experiment.id)}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0B1018]/75 p-4 transition hover:border-cyan-400/25 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-[0.16em] text-slate-600">
                        {experiment.code}
                      </span>
                      <span className="text-base font-semibold text-white">
                        {experiment.title}
                      </span>
                      <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-2 py-1 text-[8px] font-mono uppercase tracking-[0.12em] text-emerald-300">
                        {twin.shortLabel}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {experiment.department} · {experiment.subject} ·{" "}
                      {experiment.module} ·{" "}
                      {ENGINE_LABELS[experiment.engineType] ??
                        prettify(experiment.engineType)}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
                </Link>
              );
            })}
          </section>
        )}

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
              <CheckCircle2 className="h-4 w-4" />
              Core Digital Twin
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">
              {coreCount}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Original high-fidelity interactive circuit twins with
              specialized 3D hardware and 4D state history.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400">
              <Eye className="h-4 w-4" />
              Asset-Backed Coverage
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">
              {smartLabRecords.filter(
                (item) =>
                  !isCore(item) && Boolean(item.capabilities.digitalTwin3D),
              ).length}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Catalogue experiments marked as already having a dedicated
              asset-backed 3D twin.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-violet-400">
              <Activity className="h-4 w-4" />
              Universal 4D Layer
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">
              {timeline4DCount}
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Experiments carrying the shared temporal experiment-session
              timeline.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
