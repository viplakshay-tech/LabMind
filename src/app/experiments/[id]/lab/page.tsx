import { notFound } from "next/navigation";

import { catalogExperiments } from "@/data/labCatalog";
import UniversalLabWorkspace from "@/components/lab/UniversalLabWorkspace";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UniversalLabPage({
  params,
}: PageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const experiment = catalogExperiments.find(
    (item) => item.id === decodedId,
  );

  if (!experiment) {
    notFound();
  }

  return <UniversalLabWorkspace experiment={experiment} />;
}