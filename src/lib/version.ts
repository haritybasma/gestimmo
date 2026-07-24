// Informations de version de l'application (injectées au build via next.config).
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
export const GIT_SHA = process.env.NEXT_PUBLIC_GIT_SHA ?? "local";
export const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE ?? "";

/** Libellé court affiché dans l'interface, ex. "v0.3.0". */
export const versionLabel = `v${APP_VERSION}`;

/** Libellé détaillé, ex. "v0.3.0 · a1b2c3d · 07/07/2026". */
export function versionDetail(): string {
  const parts = [versionLabel, GIT_SHA];
  if (BUILD_DATE) {
    try {
      parts.push(new Intl.DateTimeFormat("fr-FR").format(new Date(BUILD_DATE)));
    } catch {
      /* ignore */
    }
  }
  return parts.join(" · ");
}
