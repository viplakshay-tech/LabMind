import type { LabCatalogExperiment } from "@/data/labCatalog";

export const CORE_TWIN_EXPERIMENT_IDS = new Set([
  "logic-gates",
  "half-adder",
  "full-adder",
  "4-1-multiplexer",
  "1-4-demultiplexer",
  "2-4-decoder",
  "4-2-encoder",
  "sr-flip-flop",
]);

export type TwinCoverageKind = "core" | "asset" | "universal";

export type TwinCoverage = {
  kind: TwinCoverageKind;
  label: string;
  shortLabel: string;
  description: string;
  assetBacked3D: boolean;
  specializedHardware3D: boolean;
  specialized4D: boolean;
  universal3D: true;
  universal4D: true;
};

export function isCoreTwinExperiment(
  experiment: Pick<LabCatalogExperiment, "id" | "catalogStatus">,
): boolean {
  return (
    CORE_TWIN_EXPERIMENT_IDS.has(experiment.id) ||
    String(experiment.catalogStatus ?? "").trim().toLowerCase() === "core"
  );
}

export function getTwinCoverage(
  experiment: Pick<
    LabCatalogExperiment,
    "id" | "catalogStatus" | "capabilities"
  >,
): TwinCoverage {
  const core = isCoreTwinExperiment(experiment);
  const assetBacked = Boolean(experiment.capabilities?.digitalTwin3D);

  if (core) {
    return {
      kind: "core",
      label: "Specialized 3D + 4D Hardware Twin",
      shortLabel: "CORE 3D + 4D",
      description:
        "The original interactive circuit hardware twin is preserved, with the universal 4D session timeline layered on top.",
      assetBacked3D: assetBacked,
      specializedHardware3D: true,
      specialized4D: true,
      universal3D: true,
      universal4D: true,
    };
  }

  if (assetBacked) {
    return {
      kind: "asset",
      label: "Asset-Backed 3D + Universal 4D",
      shortLabel: "ASSET 3D + 4D",
      description:
        "This experiment already has an asset-backed 3D twin in the catalogue; the universal 4D timeline adds state replay and temporal context.",
      assetBacked3D: true,
      specializedHardware3D: false,
      specialized4D: false,
      universal3D: true,
      universal4D: true,
    };
  }

  return {
    kind: "universal",
    label: "Universal Procedural 3D + 4D",
    shortLabel: "UNIVERSAL 3D + 4D",
    description:
      "This experiment uses the new engine-aware procedural 3D twin and the shared 4D experiment timeline, even without a bespoke 3D asset.",
    assetBacked3D: false,
    specializedHardware3D: false,
    specialized4D: false,
    universal3D: true,
    universal4D: true,
  };
}

export function getTwinCoverageLabel(
  experiment: Pick<
    LabCatalogExperiment,
    "id" | "catalogStatus" | "capabilities"
  >,
): string {
  return getTwinCoverage(experiment).label;
}
