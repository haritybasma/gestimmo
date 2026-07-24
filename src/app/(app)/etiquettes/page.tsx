import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { requireContext } from "@/lib/company";
import { LabelBuilder } from "./LabelBuilder";

export default async function LabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { user, company } = await requireContext();
  const sp = await searchParams;
  const preselected = sp.ids ? sp.ids.split(",").filter(Boolean) : [];

  const assets = await prisma.asset.findMany({
    where: { organizationId: user.organizationId, companyId: company.id },
    orderBy: { code: "asc" },
    include: { category: true, location: true },
  });

  const items = assets.map((a) => ({
    id: a.id,
    code: a.code,
    designation: a.designation,
    category: a.category?.name ?? "",
    location: a.location?.name ?? "",
  }));

  return (
    <>
      <div className="no-print">
        <PageHeader
          title="Étiquettes code-barres"
          subtitle="Sélectionnez les biens, ajustez la mise en page puis imprimez."
        />
      </div>
      <LabelBuilder items={items} preselected={preselected} />
    </>
  );
}
