// Valeurs de référence de l'application (validées côté serveur).

export const ROLES = ["ADMIN", "USER"] as const;
export type Role = (typeof ROLES)[number];

export const AMORT_METHODS = ["LINEAR", "DEGRESSIVE", "NONE"] as const;
export type AmortMethod = (typeof AMORT_METHODS)[number];

export const AMORT_METHOD_LABELS: Record<AmortMethod, string> = {
  LINEAR: "Linéaire",
  DEGRESSIVE: "Dégressif",
  NONE: "Non amortissable",
};

export const ASSET_STATUS = ["IN_SERVICE", "DISPOSED"] as const;
export type AssetStatus = (typeof ASSET_STATUS)[number];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  IN_SERVICE: "En service",
  DISPOSED: "Sorti / cédé",
};

export const CAMPAIGN_STATUS = ["OPEN", "CLOSED"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUS)[number];

export const SCAN_CONDITIONS = ["BON", "ENDOMMAGE", "HORS_SERVICE"] as const;
export type ScanCondition = (typeof SCAN_CONDITIONS)[number];

export const SCAN_CONDITION_LABELS: Record<ScanCondition, string> = {
  BON: "Bon état",
  ENDOMMAGE: "Endommagé",
  HORS_SERVICE: "Hors service",
};

// Coefficients dégressifs usuels selon la durée (référence fiscale FR/MA).
// Utilisés par défaut si aucun coefficient n'est renseigné sur l'immobilisation.
export function defaultDegressiveCoef(durationYears: number): number {
  if (durationYears <= 4) return 1.5;
  if (durationYears <= 6) return 2;
  return 3;
}

// Devise d'affichage par défaut (fallback). La devise réelle vient de la société.
export const DEFAULT_CURRENCY = "MAD";

export function formatMoney(
  value: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // devise inconnue de l'environnement : repli simple
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(value)} ${currency}`;
  }
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR").format(date);
}
