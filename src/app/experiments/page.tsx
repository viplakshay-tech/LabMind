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
  X,
  Zap,
} from "lucide-react";

import { catalogExperiments } from "@/data/labCatalog";
import { coreExperiments } from "@/data/experimentsData";
import { getExperimentLaunchPath } from "@/lib/experimentEngineRouter";
import { getTwinCoverage, type TwinCoverageKind } from "@/lib/digitalTwinCoverage";

type ViewMode = "grid" | "list";
type SortMode = "relevance" | "az" | "za" | "department";

const CORE_IDS = new Set([
  "logic-gates",
  "half-adder",
  "full-adder",
  "4-1-multiplexer",
  "1-4-demultiplexer",
  "2-4-decoder",
  "4-2-encoder",
  "sr-flip-flop",
]);

const CORE_CAPABILITIES = {
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

function toCoreCatalogExperiment(
  experiment: (typeof coreExperiments)[number],
) {
  return {
    ...experiment,
    department: "ECE",
    subject: "Digital Electronics",
    module: "Digital Logic",
    semester: 2,
    learningMode: "interactive",
    engineType: "circuit",
    catalogStatus: "CORE",
    capabilities: CORE_CAPABILITIES,
  } as unknown as (typeof catalogExperiments)[number];
}

// The multidisciplinary catalog contains 620 structured records.
// The original 8 interactive ECE experiments live in experimentsData.ts,
// so this page must merge both sources into one searchable 628-experiment view.
const allExperiments = [
  ...coreExperiments.map(toCoreCatalogExperiment),
  ...catalogExperiments.filter((item) => !CORE_IDS.has(item.id)),
];

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

function isCoreExperiment(
  experiment: (typeof allExperiments)[number],
) {
  return (
    CORE_IDS.has(experiment.id) ||
    normalize(experiment.catalogStatus) === "core"
  );
}

function capabilityLabel(capability: string) {
  return CAPABILITY_LABELS[capability] ?? prettify(capability);
}

function engineLabel(engine: string) {
  return ENGINE_LABELS[engine] ?? prettify(engine);
}

function engineIcon(engine: string) {
  switch (engine) {
    case "circuit":
      return Cpu;
    case "ai-dataset":
      return BrainCircuit;
    case "software-lab":
      return Database;
    case "numerical":
      return Activity;
    case "bio-lab":
      return Microscope;
    case "chemistry-lab":
      return FlaskConical;
    case "engineering-lab":
      return Wrench;
    default:
      return Boxes;
  }
}

export default function ExperimentsPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [subject, setSubject] = useState("all");
  const [module, setModule] = useState("all");
  const [engine, setEngine] = useState("all");
  const [semester, setSemester] = useState("all");
  const [learningMode, setLearningMode] = useState("all");
  const [capability, setCapability] = useState("all");
  const [classification, setClassification] = useState("all");
  const [twinCoverage, setTwinCoverage] = useState<"all" | TwinCoverageKind>("all");
  const [sortMode, setSortMode] =
    useState<SortMode>("relevance");
  const [viewMode, setViewMode] =
    useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(true);

  const departments = useMemo(
    () =>
      [...new Set(
        allExperiments.map((item) =>
          String(item.department),
        ),
      )]
        .filter(Boolean)
        .sort(),
    [],
  );

  const subjects = useMemo(
    () =>
      [...new Set(
        allExperiments
          .filter(
            (item) =>
              department === "all" ||
              String(item.department) === department,
          )
          .map((item) => String(item.subject)),
      )]
        .filter(Boolean)
        .sort(),
    [department],
  );

  const modules = useMemo(
    () =>
      [...new Set(
        allExperiments
          .filter(
            (item) =>
              department === "all" ||
              String(item.department) === department,
          )
          .filter(
            (item) =>
              subject === "all" ||
              String(item.subject) === subject,
          )
          .map((item) => String(item.module)),
      )]
        .filter(Boolean)
        .sort(),
    [department, subject],
  );

  const engines = useMemo(
    () =>
      [...new Set(
        allExperiments
          .filter(
            (item) =>
              department === "all" ||
              String(item.department) === department,
          )
          .map((item) => String(item.engineType)),
      )]
        .filter(Boolean)
        .sort(),
    [department],
  );

  const semesters = useMemo(
    () =>
      [...new Set(
        allExperiments.map((item) =>
          String(item.semester),
        ),
      )]
        .filter(
          (value) =>
            value &&
            value !== "undefined" &&
            value !== "null",
        )
        .sort((a, b) => {
          const na = Number(a);
          const nb = Number(b);

          if (
            !Number.isNaN(na) &&
            !Number.isNaN(nb)
          ) {
            return na - nb;
          }

          return a.localeCompare(b);
        }),
    [],
  );

  const learningModes = useMemo(
    () =>
      [...new Set(
        allExperiments.map((item) =>
          String(item.learningMode),
        ),
      )]
        .filter(
          (value) =>
            value &&
            value !== "undefined" &&
            value !== "null",
        )
        .sort(),
    [],
  );

  const capabilities = useMemo(
    () =>
      [
        ...new Set(
          allExperiments.flatMap((item) =>
            Object.entries(item.capabilities)
              .filter(([, enabled]) => Boolean(enabled))
              .map(([key]) => key),
          ),
        ),
      ].sort(),
    [],
  );

  const departmentStats = useMemo(
    () =>
      departments.map((name) => {
        const records = allExperiments.filter(
          (item) => String(item.department) === name,
        );

        return {
          name,
          experiments: records.length,
          subjects: new Set(
            records.map((item) =>
              String(item.subject),
            ),
          ).size,
          modules: new Set(
            records.map((item) =>
              String(item.module),
            ),
          ).size,
        };
      }),
    [departments],
  );

  const filteredExperiments = useMemo(() => {
    const query = normalize(search);

    const records = allExperiments.filter(
      (item) => {
        const haystack = [
          item.id,
          item.code,
          item.title,
          item.department,
          item.subject,
          item.module,
          item.objective,
          item.engineType,
          item.learningMode,
          item.semester,
          ...Object.keys(item.capabilities ?? {}),
          ...Object.entries(item.capabilities ?? {})
            .filter(([, enabled]) => Boolean(enabled))
            .map(([key]) => key),
        ]
          .map(normalize)
          .filter(Boolean)
          .join(" ");

        const queryTokens = query.split(" ").filter(Boolean);
        const searchMatches =
          !query ||
          queryTokens.every((token) => haystack.includes(token));

        return (
          searchMatches &&
          (department === "all" ||
            String(item.department) === department) &&
          (subject === "all" ||
            String(item.subject) === subject) &&
          (module === "all" ||
            String(item.module) === module) &&
          (engine === "all" ||
            String(item.engineType) === engine) &&
          (semester === "all" ||
            String(item.semester) === semester) &&
          (learningMode === "all" ||
            String(item.learningMode) === learningMode) &&
          (capability === "all" ||
            Boolean(
              item.capabilities[
                capability as keyof typeof item.capabilities
              ],
            )) &&
          (classification === "all" ||
            (classification === "core" &&
              isCoreExperiment(item)) ||
            (classification === "catalog" &&
              !isCoreExperiment(item))) &&
          (twinCoverage === "all" ||
            getTwinCoverage(item).kind === twinCoverage)
        );
      },
    );

    records.sort((a, b) => {
      switch (sortMode) {
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "department":
          return (
            String(a.department).localeCompare(
              String(b.department),
            ) ||
            a.title.localeCompare(b.title)
          );
        default:
          return (
            Number(isCoreExperiment(b)) -
              Number(isCoreExperiment(a)) ||
            a.title.localeCompare(b.title)
          );
      }
    });

    return records;
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

  const coreCount = useMemo(
    () =>
      allExperiments.filter(
        isCoreExperiment,
      ).length,
    [],
  );

  const catalogCount =
    allExperiments.length - coreCount;

  const coreTwinCount = useMemo(
    () => allExperiments.filter((item) => getTwinCoverage(item).kind === "core").length,
    [],
  );

  const assetTwinCount = useMemo(
    () => allExperiments.filter((item) => getTwinCoverage(item).kind === "asset").length,
    [],
  );

  const universalTwinCount = useMemo(
    () => allExperiments.filter((item) => getTwinCoverage(item).kind === "universal").length,
    [],
  );

  const all4DCount = allExperiments.length;

  const hasActiveFilters =
    Boolean(search) ||
    department !== "all" ||
    subject !== "all" ||
    module !== "all" ||
    engine !== "all" ||
    semester !== "all" ||
    learningMode !== "all" ||
    capability !== "all" ||
    classification !== "all" ||
    twinCoverage !== "all" ||
    sortMode !== "relevance";

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
    setCapability("all");
  }

  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <div className="mx-auto max-w-[1750px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#0B1018]/80 backdrop-blur-xl">
          <div className="relative p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-cyan-400">
                  <Telescope className="h-4 w-4" />
                  Academic Experiment Catalog
                </div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
                  Find the right
                  <span className="text-cyan-400">
                    {" "}experiment.
                  </span>
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                  Explore LabMind through the same academic classification
                  system used by Smart Lab: department → subject → module
                  → experiment → engine → capability.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricCard
                  label="Experiments"
                  value={allExperiments.length}
                  icon={Boxes}
                />
                <MetricCard
                  label="Core Labs"
                  value={coreCount}
                  icon={Cpu}
                />
                <MetricCard
                  label="Catalog Labs"
                  value={catalogCount}
                  icon={Layers3}
                />
                <MetricCard
                  label="Departments"
                  value={departments.length}
                  icon={Network}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-slate-500">
              Department navigator
            </div>

            <div className="text-sm text-slate-400">
              Jump directly into a department environment.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <button
              type="button"
              onClick={() => selectDepartment("all")}
              className={`rounded-2xl border p-4 text-left transition ${
                department === "all"
                  ? "border-cyan-400/30 bg-cyan-400/10"
                  : "border-slate-800 bg-[#080C12]/70 hover:border-slate-700"
              }`}
            >
              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-2.5 text-cyan-300 w-fit">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-semibold">
                All Departments
              </div>
              <div className="mt-1 text-[10px] text-slate-600">
                {allExperiments.length} experiments
              </div>
            </button>

            {departmentStats.map((item) => {
              const Icon =
                DEPARTMENT_ICONS[item.name] ?? Boxes;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    selectDepartment(item.name)
                  }
                  className={`group rounded-2xl border p-4 text-left transition ${
                    department === item.name
                      ? "border-cyan-400/30 bg-cyan-400/10"
                      : "border-slate-800 bg-[#080C12]/70 hover:border-slate-700"
                  }`}
                >
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-slate-500 group-hover:text-cyan-300 w-fit">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="mt-3 text-sm font-semibold">
                    {item.name}
                  </div>

                  <div className="mt-1 text-[10px] text-slate-600">
                    {item.experiments} experiments ·{" "}
                    {item.subjects} subjects
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-slate-800 bg-[#0B1018]/75 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
                <Boxes className="h-4 w-4" />
                Digital Twin Coverage
              </div>
              <div className="mt-2 text-sm text-slate-400">
                Every catalogue record now receives the universal 3D + 4D layer. These classes show the depth of twin implementation.
              </div>
            </div>
            <div className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300">
              {all4DCount} / {allExperiments.length} have 4D replay
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <TwinCoverageCard active={twinCoverage === "core"} onClick={() => { resetFilters(); setTwinCoverage("core"); }} title="Specialized Core" count={coreTwinCount} detail="Original interactive hardware 3D + specialized circuit 4D." tone="green" />
            <TwinCoverageCard active={twinCoverage === "asset"} onClick={() => { resetFilters(); setTwinCoverage("asset"); }} title="Asset-Backed" count={assetTwinCount} detail="Existing 3D assets + new shared 4D replay layer." tone="cyan" />
            <TwinCoverageCard active={twinCoverage === "universal"} onClick={() => { resetFilters(); setTwinCoverage("universal"); }} title="Universal Procedural" count={universalTwinCount} detail="Engine-aware 3D scene + 4D replay without a bespoke asset." tone="violet" />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#0B1018]/80 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search experiment, code, subject, module or objective..."
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
                active={engine === "ai-dataset"}
                onClick={() => {
                  resetFilters();
                  setEngine("ai-dataset");
                }}
              >
                AI / ML
              </QuickButton>

              <QuickButton
                active={twinCoverage === "all" && capability === "all"}
                onClick={() => {
                  resetFilters();
                }}
              >
                All 3D + 4D
              </QuickButton>

              <QuickButton
                active={twinCoverage === "core"}
                onClick={() => {
                  resetFilters();
                  setTwinCoverage("core");
                }}
              >
                Core Twin
              </QuickButton>

              <QuickButton
                active={twinCoverage === "asset"}
                onClick={() => {
                  resetFilters();
                  setTwinCoverage("asset");
                }}
              >
                Asset 3D + 4D
              </QuickButton>

              <QuickButton
                active={twinCoverage === "universal"}
                onClick={() => {
                  resetFilters();
                  setTwinCoverage("universal");
                }}
              >
                Universal Twin
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
                onClick={() =>
                  setShowFilters((value) => !value)
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-4 text-xs text-cyan-300"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <FilterSelect
                label="Department"
                value={department}
                onChange={selectDepartment}
                options={departments}
              />

              <FilterSelect
                label="Subject"
                value={subject}
                onChange={setSubject}
                options={subjects}
              />

              <FilterSelect
                label="Module"
                value={module}
                onChange={setModule}
                options={modules}
              />

              <FilterSelect
                label="Engine"
                value={engine}
                onChange={setEngine}
                options={engines}
                formatter={engineLabel}
              />

              <FilterSelect
                label="Semester"
                value={semester}
                onChange={setSemester}
                options={semesters}
              />

              <FilterSelect
                label="Learning Mode"
                value={learningMode}
                onChange={setLearningMode}
                options={learningModes}
                formatter={prettify}
              />

              <FilterSelect
                label="Capability"
                value={capability}
                onChange={setCapability}
                options={capabilities}
                formatter={capabilityLabel}
              />

              <FilterSelect
                label="Classification"
                value={classification}
                onChange={setClassification}
                options={["core", "catalog"]}
                formatter={(value) =>
                  value === "core"
                    ? "Core Interactive"
                    : "Catalog Labs"
                }
              />

              <FilterSelect
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

              <FilterSelect
                label="Sort"
                value={sortMode}
                onChange={(value) =>
                  setSortMode(value as SortMode)
                }
                options={[
                  "relevance",
                  "az",
                  "za",
                  "department",
                ]}
                formatter={(value) => {
                  if (value === "az") return "A → Z";
                  if (value === "za") return "Z → A";
                  if (value === "department") {
                    return "Department";
                  }
                  return "Relevance";
                }}
              />

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </button>
            </div>
          )}
        </section>

        <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#0B1018]/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
              Experiment classification
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold">
                {filteredExperiments.length}
              </span>

              <span className="text-sm text-slate-500">
                matching experiments
              </span>

              {department !== "all" && (
                <FilterBadge
                  label={department}
                  onRemove={() =>
                    selectDepartment("all")
                  }
                />
              )}

              {subject !== "all" && (
                <FilterBadge
                  label={subject}
                  onRemove={() => setSubject("all")}
                />
              )}

              {engine !== "all" && (
                <FilterBadge
                  label={engineLabel(engine)}
                  onRemove={() => setEngine("all")}
                />
              )}

              {capability !== "all" && (
                <FilterBadge
                  label={capabilityLabel(capability)}
                  onRemove={() =>
                    setCapability("all")
                  }
                />
              )}

              {twinCoverage !== "all" && (
                <FilterBadge
                  label={
                    twinCoverage === "core"
                      ? "Specialized Core 3D + 4D"
                      : twinCoverage === "asset"
                        ? "Asset 3D + Universal 4D"
                        : "Universal Procedural 3D + 4D"
                  }
                  onRemove={() => setTwinCoverage("all")}
                />
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
        </section>

        {filteredExperiments.length === 0 ? (
          <section className="mt-5 rounded-2xl border border-dashed border-slate-800 bg-[#0B1018]/70 px-6 py-20 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-700" />
            <h2 className="mt-4 text-lg font-semibold">
              No experiments matched
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Try a broader search or reset the classification.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-2.5 text-sm text-cyan-300"
            >
              <RotateCcw className="h-4 w-4" />
              Reset classification
            </button>
          </section>
        ) : viewMode === "grid" ? (
          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredExperiments.map((experiment) => {
              const core =
                isCoreExperiment(experiment);
              const Icon = engineIcon(
                String(experiment.engineType),
              );
              const capabilities = Object.entries(
                experiment.capabilities,
              )
                .filter(([, enabled]) => Boolean(enabled))
                .map(([key]) => key);

              const launchPath =
                getExperimentLaunchPath(experiment);

              return (
                <article
                  key={experiment.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B1018]/80 p-5 transition hover:border-cyan-400/25 hover:bg-[#0D141E]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-400">
                          {experiment.code ||
                            experiment.id}
                        </div>

                        <h2 className="mt-1 truncate text-base font-semibold">
                          {experiment.title}
                        </h2>
                      </div>
                    </div>

                    {core ? (
                      <Badge tone="green">
                        CORE
                      </Badge>
                    ) : (
                      <Badge tone="violet">
                        CATALOG
                      </Badge>
                    )}

                    <TwinBadge experiment={experiment} />
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                    {experiment.objective}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge>
                      {experiment.department}
                    </Badge>
                    <Badge>
                      {experiment.subject}
                    </Badge>
                    <Badge>
                      {engineLabel(
                        String(experiment.engineType),
                      )}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <InfoCell
                      label="Module"
                      value={String(
                        experiment.module,
                      )}
                    />
                    <InfoCell
                      label="Semester"
                      value={String(
                        experiment.semester,
                      )}
                    />
                    <InfoCell
                      label="Learning Mode"
                      value={prettify(
                        experiment.learningMode,
                      )}
                    />
                    <InfoCell
                      label="Difficulty"
                      value={String(
                        experiment.difficulty,
                      )}
                    />
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <div className="mb-2 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-600">
                      Capability profile
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {capabilities
                        .slice(0, 6)
                        .map((item) => (
                          <span
                            key={item}
                            className="rounded-md border border-slate-800 bg-slate-950/50 px-2 py-1 text-[9px] text-slate-400"
                          >
                            {capabilityLabel(item)}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={launchPath}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#041018] transition hover:brightness-110"
                    >
                      Open Lab
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {core && (
                      <Link
                        href={`/experiments/${encodeURIComponent(
                          experiment.id,
                        )}/pre-lab`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
                      >
                        Pre-Lab
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="mt-5 space-y-2">
            {filteredExperiments.map((experiment) => {
              const core =
                isCoreExperiment(experiment);
              const Icon = engineIcon(
                String(experiment.engineType),
              );

              return (
                <div
                  key={experiment.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0B1018]/80 p-4 transition hover:border-cyan-400/20 sm:flex-row sm:items-center"
                >
                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-3 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-cyan-400">
                        {experiment.code ||
                          experiment.id}
                      </span>
                      <span className="text-slate-700">
                        •
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                        {experiment.department}
                      </span>
                      {core && (
                        <Badge tone="green">
                          CORE
                        </Badge>
                      )}
                      <TwinBadge experiment={experiment} />
                    </div>

                    <h2 className="mt-1 text-base font-semibold">
                      {experiment.title}
                    </h2>

                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                      {experiment.objective}
                    </p>
                  </div>

                  <div className="hidden text-right lg:block">
                    <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-slate-600">
                      Engine
                    </div>
                    <div className="mt-1 text-xs text-slate-300">
                      {engineLabel(
                        String(
                          experiment.engineType,
                        ),
                      )}
                    </div>
                  </div>

                  <Link
                    href={getExperimentLaunchPath(
                      experiment,
                    )}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-2.5 text-xs text-cyan-300"
                  >
                    Open Lab
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </section>
        )}

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-900 py-5 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            LabMind · Department → Subject → Module → Experiment → Engine
          </span>

          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Academic classification active
          </span>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Boxes;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080C12]/80 px-3 py-3">
      <div className="flex items-center justify-between gap-2 text-slate-500">
        <span className="text-[9px] font-mono uppercase tracking-[0.14em]">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="mt-2 text-xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function QuickButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center rounded-xl border px-3 text-xs font-medium transition ${
        active
          ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
          : "border-slate-800 bg-[#080C12] text-slate-400 hover:border-slate-700 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  formatter,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  formatter?: (value: string) => string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-mono uppercase tracking-[0.16em] text-slate-600">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-800 bg-[#080C12] px-3 text-xs text-slate-300 outline-none focus:border-cyan-400/30"
      >
        <option value="all">
          All
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {formatter
              ? formatter(option)
              : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/10 bg-cyan-400/5 px-2.5 py-1 text-[10px] text-cyan-300">
      {label}

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-0.5 text-cyan-500 hover:bg-cyan-400/10 hover:text-cyan-200"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "green" | "violet";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300"
      : tone === "violet"
        ? "border-violet-400/15 bg-violet-400/5 text-violet-300"
        : "border-slate-800 bg-slate-950/50 text-slate-400";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

function TwinCoverageCard({
  active,
  onClick,
  title,
  count,
  detail,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  count: number;
  detail: string;
  tone: "green" | "cyan" | "violet";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
      : tone === "violet"
        ? "border-violet-400/20 bg-violet-400/5 text-violet-300"
        : "border-cyan-400/20 bg-cyan-400/5 text-cyan-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active ? toneClass : "border-slate-800 bg-slate-950/35 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-white">{title}</span>
        <span className="text-2xl font-semibold">{count}</span>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-slate-500">{detail}</p>
    </button>
  );
}

function TwinBadge({
  experiment,
}: {
  experiment: (typeof allExperiments)[number];
}) {
  const coverage = getTwinCoverage(experiment);
  const tone = coverage.kind === "core" ? "green" : coverage.kind === "asset" ? "default" : "violet";
  return <Badge tone={tone}>{coverage.shortLabel}</Badge>;
}

function InfoCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2">
      <div className="text-[8px] font-mono uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div className="mt-1 truncate text-[10px] text-slate-400">
        {value}
      </div>
    </div>
  );
}
