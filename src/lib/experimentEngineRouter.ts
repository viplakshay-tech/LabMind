import type { LabCatalogExperiment } from "@/data/labCatalog";

export type ExperimentEngineKey =
  | "circuit"
  | "software-lab"
  | "ai-dataset"
  | "numerical"
  | "bio-lab"
  | "chemistry-lab"
  | "engineering-lab"
  | "generic";

export type ExperimentEngineDescriptor = {
  key: ExperimentEngineKey;
  title: string;
  shortTitle: string;
  description: string;
  workspaceLabel: string;
  route: "workspace" | "lab";
  icon:
    | "circuit"
    | "code"
    | "brain"
    | "calculator"
    | "dna"
    | "flask"
    | "engineering"
    | "lab";
  supports: {
    interactiveSimulation: boolean;
    datasets: boolean;
    parameterControls: boolean;
    faultInjection: boolean;
    vision: boolean;
    digitalTwin3D: boolean;
    timeline4D: boolean;
  };
};

const ENGINE_REGISTRY: Record<
  ExperimentEngineKey,
  ExperimentEngineDescriptor
> = {
  circuit: {
    key: "circuit",
    title: "Circuit Simulation Engine",
    shortTitle: "Circuit Lab",
    description:
      "Deterministic digital-electronics workspace with live inputs, truth tables, fault injection and circuit diagnostics.",
    workspaceLabel: "Open Circuit Workspace",
    route: "workspace",
    icon: "circuit",
    supports: {
      interactiveSimulation: true,
      datasets: false,
      parameterControls: true,
      faultInjection: true,
      vision: true,
      digitalTwin3D: true,
      timeline4D: true,
    },
  },

  "software-lab": {
    key: "software-lab",
    title: "Software Laboratory Engine",
    shortTitle: "Software Lab",
    description:
      "Structured programming and systems workspace for implementation, debugging, benchmarking and algorithmic reasoning.",
    workspaceLabel: "Open Software Lab",
    route: "lab",
    icon: "code",
    supports: {
      interactiveSimulation: true,
      datasets: false,
      parameterControls: true,
      faultInjection: true,
      vision: false,
      digitalTwin3D: false,
      timeline4D: true,
    },
  },

  "ai-dataset": {
    key: "ai-dataset",
    title: "AI / Dataset Laboratory Engine",
    shortTitle: "AI Lab",
    description:
      "Dataset-driven workspace for preparation, model training, evaluation, hyperparameter studies and explainability.",
    workspaceLabel: "Open AI Lab",
    route: "lab",
    icon: "brain",
    supports: {
      interactiveSimulation: true,
      datasets: true,
      parameterControls: true,
      faultInjection: false,
      vision: true,
      digitalTwin3D: false,
      timeline4D: true,
    },
  },

  numerical: {
    key: "numerical",
    title: "Numerical & Mathematical Engine",
    shortTitle: "Numerical Lab",
    description:
      "Parameter-driven numerical workspace for solving equations, comparing methods, error analysis and convergence studies.",
    workspaceLabel: "Open Numerical Lab",
    route: "lab",
    icon: "calculator",
    supports: {
      interactiveSimulation: true,
      datasets: false,
      parameterControls: true,
      faultInjection: false,
      vision: false,
      digitalTwin3D: false,
      timeline4D: true,
    },
  },

  "bio-lab": {
    key: "bio-lab",
    title: "Biotechnology Laboratory Engine",
    shortTitle: "Bio Lab",
    description:
      "Procedure-aware biotechnology workspace for protocols, measurements, observations, comparisons and analysis.",
    workspaceLabel: "Open Bio Lab",
    route: "lab",
    icon: "dna",
    supports: {
      interactiveSimulation: true,
      datasets: true,
      parameterControls: true,
      faultInjection: true,
      vision: true,
      digitalTwin3D: false,
      timeline4D: true,
    },
  },

  "chemistry-lab": {
    key: "chemistry-lab",
    title: "Chemistry Laboratory Engine",
    shortTitle: "Chemistry Lab",
    description:
      "Procedure and measurement workspace for preparation, titration, quantitative analysis and characterization.",
    workspaceLabel: "Open Chemistry Lab",
    route: "lab",
    icon: "flask",
    supports: {
      interactiveSimulation: true,
      datasets: true,
      parameterControls: true,
      faultInjection: true,
      vision: true,
      digitalTwin3D: false,
      timeline4D: true,
    },
  },

  "engineering-lab": {
    key: "engineering-lab",
    title: "Engineering Laboratory Engine",
    shortTitle: "Engineering Lab",
    description:
      "General engineering workspace for hands-on procedures, parameters, observations, analysis and AI-guided reporting.",
    workspaceLabel: "Open Engineering Lab",
    route: "lab",
    icon: "engineering",
    supports: {
      interactiveSimulation: true,
      datasets: true,
      parameterControls: true,
      faultInjection: true,
      vision: true,
      digitalTwin3D: true,
      timeline4D: true,
    },
  },

  generic: {
    key: "generic",
    title: "Universal Laboratory Engine",
    shortTitle: "Lab Workspace",
    description:
      "Universal experiment workspace used when a subject-specific engine has not yet been registered.",
    workspaceLabel: "Open Lab Workspace",
    route: "lab",
    icon: "lab",
    supports: {
      interactiveSimulation: true,
      datasets: true,
      parameterControls: true,
      faultInjection: false,
      vision: false,
      digitalTwin3D: false,
      timeline4D: true,
    },
  },
};

const KNOWN_ENGINE_KEYS = new Set<ExperimentEngineKey>(
  Object.keys(ENGINE_REGISTRY) as ExperimentEngineKey[],
);

function normalizeEngineKey(value: unknown): ExperimentEngineKey {
  if (typeof value !== "string") {
    return "generic";
  }

  const key = value.trim().toLowerCase() as ExperimentEngineKey;

  return KNOWN_ENGINE_KEYS.has(key) ? key : "generic";
}

export function getExperimentEngine(
  experiment: Pick<LabCatalogExperiment, "engineType" | "catalogStatus">,
): ExperimentEngineDescriptor {
  const requested = normalizeEngineKey(experiment.engineType);

  if (experiment.catalogStatus === "CORE") {
    return ENGINE_REGISTRY.circuit;
  }

  return ENGINE_REGISTRY[requested];
}

export function getExperimentEngineByType(
  engineType: string | null | undefined,
): ExperimentEngineDescriptor {
  return ENGINE_REGISTRY[normalizeEngineKey(engineType)];
}

export function getExperimentLaunchPath(
  experiment: Pick<
    LabCatalogExperiment,
    "id" | "engineType" | "catalogStatus"
  >,
): string {
  const engine = getExperimentEngine(experiment);

  return `/experiments/${encodeURIComponent(experiment.id)}/${engine.route}`;
}

export function isInteractiveExperiment(
  experiment: Pick<LabCatalogExperiment, "catalogStatus" | "capabilities">,
): boolean {
  return (
    experiment.catalogStatus === "CORE" ||
    experiment.capabilities.simulation
  );
}

export function getEnabledCapabilities(
  experiment: Pick<LabCatalogExperiment, "capabilities">,
): Array<keyof LabCatalogExperiment["capabilities"]> {
  return Object.entries(experiment.capabilities)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as keyof LabCatalogExperiment["capabilities"]);
}

export const experimentEngineRegistry = ENGINE_REGISTRY;