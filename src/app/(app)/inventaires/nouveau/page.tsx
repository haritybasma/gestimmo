import { PageHeader, Card } from "@/components/ui";
import { requireContext, listCompanies } from "@/lib/company";
import { CampaignForm } from "./CampaignForm";

export default async function NewCampaignPage() {
  const { user, company } = await requireContext();
  const companies = await listCompanies(user.organizationId);

  return (
    <>
      <PageHeader
        title="Nouvel inventaire"
        subtitle="La référence est générée automatiquement."
      />
      <Card className="p-6 max-w-lg">
        <CampaignForm
          companies={companies.map((c) => ({ id: c.id, name: c.name }))}
          currentCompanyId={company.id}
        />
      </Card>
    </>
  );
}
