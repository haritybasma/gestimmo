"use server";

import { revalidatePath } from "next/cache";
import { setCurrentCompany } from "@/lib/company";

export async function switchCompanyAction(companyId: string): Promise<void> {
  await setCurrentCompany(companyId);
  // rafraîchit toutes les données scoppées à la société courante
  revalidatePath("/", "layout");
}
