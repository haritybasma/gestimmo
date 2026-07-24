// Référentiel pays → devise par défaut (ISO 3166-1 alpha-2 / ISO 4217).
// Liste ciblée (Maghreb, zone euro, Afrique de l'Ouest, principaux partenaires).

export interface Country {
  code: string; // ISO2
  name: string; // français
  currency: string; // ISO 4217
}

export const COUNTRIES: Country[] = [
  { code: "MA", name: "Maroc", currency: "MAD" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "DZ", name: "Algérie", currency: "DZD" },
  { code: "TN", name: "Tunisie", currency: "TND" },
  { code: "MR", name: "Mauritanie", currency: "MRU" },
  { code: "SN", name: "Sénégal", currency: "XOF" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
  { code: "ML", name: "Mali", currency: "XOF" },
  { code: "BF", name: "Burkina Faso", currency: "XOF" },
  { code: "BJ", name: "Bénin", currency: "XOF" },
  { code: "TG", name: "Togo", currency: "XOF" },
  { code: "NE", name: "Niger", currency: "XOF" },
  { code: "CM", name: "Cameroun", currency: "XAF" },
  { code: "GA", name: "Gabon", currency: "XAF" },
  { code: "CG", name: "Congo", currency: "XAF" },
  { code: "TD", name: "Tchad", currency: "XAF" },
  { code: "BE", name: "Belgique", currency: "EUR" },
  { code: "ES", name: "Espagne", currency: "EUR" },
  { code: "IT", name: "Italie", currency: "EUR" },
  { code: "DE", name: "Allemagne", currency: "EUR" },
  { code: "PT", name: "Portugal", currency: "EUR" },
  { code: "NL", name: "Pays-Bas", currency: "EUR" },
  { code: "LU", name: "Luxembourg", currency: "EUR" },
  { code: "CH", name: "Suisse", currency: "CHF" },
  { code: "GB", name: "Royaume-Uni", currency: "GBP" },
  { code: "US", name: "États-Unis", currency: "USD" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AE", name: "Émirats arabes unis", currency: "AED" },
  { code: "SA", name: "Arabie saoudite", currency: "SAR" },
  { code: "QA", name: "Qatar", currency: "QAR" },
  { code: "EG", name: "Égypte", currency: "EGP" },
  { code: "TR", name: "Turquie", currency: "TRY" },
  { code: "CN", name: "Chine", currency: "CNY" },
];

export const COUNTRY_MAP: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

// Devises usuelles proposées (au cas où le pays et la devise diffèrent).
export const CURRENCIES: string[] = Array.from(
  new Set(COUNTRIES.map((c) => c.currency)),
).sort();

export function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  return COUNTRY_MAP[code]?.name ?? code;
}
