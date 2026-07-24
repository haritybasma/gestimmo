import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { AssetForm } from "../../AssetForm";
import { updateAsset } from "../../actions";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  const { id } = await params;
  const [asset, categories, locations] = await Promise.all([
    prisma.asset.findFirst({ where: { id, organizationId: user?.organizationId } }),
    prisma.category.findMany({
      where: { organizationId: user?.organizationId },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { organizationId: user?.organizationId },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!asset) notFound();

  const boundUpdate = updateAsset.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier l'immobilisation" subtitle={asset.code} />
      <Card className="p-6">
        <AssetForm
          action={boundUpdate}
          categories={categories}
          locations={locations}
          submitLabel="Enregistrer les modifications"
          values={{
            code: asset.code,
            designation: asset.designation,
            categoryId: asset.categoryId,
            locationId: asset.locationId,
            acquisitionDate: asset.acquisitionDate.toISOString().slice(0, 10),
            acquisitionValue: asset.acquisitionValue,
            residualValue: asset.residualValue,
            duration: asset.duration,
            method: asset.method,
            degressiveCoef: asset.degressiveCoef,
            serialNumber: asset.serialNumber,
            supplier: asset.supplier,
            notes: asset.notes,
            status: asset.status,
          }}
        />
      </Card>
    </>
  );
}
