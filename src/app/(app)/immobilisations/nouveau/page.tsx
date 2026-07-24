import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { requireContext } from "@/lib/company";
import { AssetForm } from "../AssetForm";
import { createAsset, nextAssetCode } from "../actions";

export default async function NewAssetPage() {
  const { user, company } = await requireContext();
  const [categories, locations, code] = await Promise.all([
    prisma.category.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
    }),
    nextAssetCode(),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Nouvelle immobilisation"
        subtitle={`Société : ${company.name} · code incrémenté automatiquement.`}
      />
      <Card className="p-6">
        <AssetForm
          action={createAsset}
          categories={categories}
          locations={locations}
          submitLabel="Créer l'immobilisation"
          values={{
            code,
            designation: "",
            categoryId: null,
            locationId: null,
            acquisitionDate: today,
            acquisitionValue: "",
            residualValue: 0,
            duration: "",
            method: "LINEAR",
            degressiveCoef: null,
            serialNumber: null,
            supplier: null,
            notes: null,
            status: "IN_SERVICE",
          }}
        />
      </Card>
    </>
  );
}
