import { notFound } from "next/navigation";

import ExperimentWorkspaceView from "@/components/workspace/ExperimentWorkspaceView";
import { experiments } from "@/data/experimentsData";
import { isWorkspaceExperimentId } from "@/lib/circuitSimulation";

interface WorkspacePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params;

  const experiment = experiments.find((item) => item.id === id);

  if (!experiment || !isWorkspaceExperimentId(experiment.id)) {
    notFound();
  }

  return <ExperimentWorkspaceView experiment={experiment} />;
}
