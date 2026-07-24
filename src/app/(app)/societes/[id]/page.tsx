import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { CompanyForm } from "../CompanyForm";
import { updateCompany } from "../actions";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");
  const { id } = await params;
  const company = await prisma.company.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!company) notFound();

  const boundUpdate = updateCompany.bind(null, id);

  return (
    <>
      <PageHeader title="Modifier la société" subtitle={company.name} />
      <Card className="p-6 max-w-xl">
        <CompanyForm
          action={boundUpdate}
          submitLabel="Enregistrer"
          onCancelHref="/societes"
          values={{
            name: company.name,
            country: company.country,
            currency: company.currency,
            legalId: company.legalId ?? "",
          }}
        />
      </Card>
    </>
  );
}
