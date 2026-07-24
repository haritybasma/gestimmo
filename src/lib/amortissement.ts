// Calcul d'amortissement — linéaire et dégressif.
//
// Modèle retenu (adapté à un outil de gestion, pas à une clôture fiscale au jour
// près) : les annuités sont calculées par année d'amortissement à partir de la
// DATE D'ACQUISITION (prorata temporis « à l'anniversaire »). La valeur nette
// comptable (VNC) à une date quelconque est obtenue par interpolation linéaire
// à l'intérieur de l'année en cours.
//
// - Linéaire   : annuité constante = base amortissable / durée.
// - Dégressif  : taux = (1/durée) × coefficient, appliqué à la VNC ; bascule
//                automatique vers le linéaire sur la durée restante dès qu'il
//                devient plus avantageux (règle usuelle).

import { defaultDegressiveCoef, type AmortMethod } from "./constants";

export interface AmortInput {
  acquisitionValue: number;
  residualValue: number;
  duration: number; // années
  method: AmortMethod;
  degressiveCoef?: number | null;
  acquisitionDate: Date;
}

export interface ScheduleRow {
  year: number; // 1..durée
  startValue: number; // VNC début de période
  annuity: number; // dotation de l'année
  cumulative: number; // amortissements cumulés en fin de période
  endValue: number; // VNC fin de période
  rate: number; // taux appliqué (indicatif)
}

const YEAR_MS = 365.25 * 24 * 3600 * 1000;

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Nombre d'années (décimal) écoulées entre l'acquisition et `asOf`. */
export function elapsedYears(acquisitionDate: Date, asOf: Date): number {
  return (asOf.getTime() - acquisitionDate.getTime()) / YEAR_MS;
}

/** Tableau d'amortissement année par année. */
export function buildSchedule(input: AmortInput): ScheduleRow[] {
  const { acquisitionValue, residualValue, duration, method } = input;
  const base = Math.max(0, acquisitionValue - residualValue);

  if (method === "NONE" || duration <= 0 || base <= 0) {
    return [];
  }

  const rows: ScheduleRow[] = [];

  if (method === "LINEAR") {
    const annuity = base / duration;
    let cumulative = 0;
    for (let y = 1; y <= duration; y++) {
      const startValue = acquisitionValue - cumulative;
      const thisAnnuity = y === duration ? base - cumulative : annuity;
      cumulative += thisAnnuity;
      rows.push({
        year: y,
        startValue: round2(startValue),
        annuity: round2(thisAnnuity),
        cumulative: round2(cumulative),
        endValue: round2(acquisitionValue - cumulative),
        rate: 1 / duration,
      });
    }
    return rows;
  }

  // DEGRESSIVE
  const coef = input.degressiveCoef ?? defaultDegressiveCoef(duration);
  const degRate = Math.min(1, (1 / duration) * coef);
  let netValue = acquisitionValue;
  let cumulative = 0;

  for (let y = 1; y <= duration; y++) {
    const remaining = duration - (y - 1);
    const amortizableNet = netValue - residualValue;
    const degressive = netValue * degRate;
    const linear = amortizableNet / remaining;
    let annuity = Math.max(degressive, linear);
    // Dernière année ou dépassement : on solde jusqu'à la valeur résiduelle.
    if (y === duration || annuity >= amortizableNet) {
      annuity = amortizableNet;
    }
    const appliedRate = netValue > 0 ? annuity / netValue : 0;
    cumulative += annuity;
    netValue -= annuity;
    rows.push({
      year: y,
      startValue: round2(netValue + annuity),
      annuity: round2(annuity),
      cumulative: round2(cumulative),
      endValue: round2(netValue),
      rate: appliedRate,
    });
    if (netValue <= residualValue + 0.005) break;
  }
  return rows;
}

/** Amortissements cumulés à la date `asOf` (interpolation intra-annuelle). */
export function cumulativeDepreciation(input: AmortInput, asOf: Date): number {
  const schedule = buildSchedule(input);
  if (schedule.length === 0) return 0;

  const t = elapsedYears(input.acquisitionDate, asOf);
  if (t <= 0) return 0;

  const fullYears = Math.floor(t);
  const frac = t - fullYears;

  let cumulative = 0;
  for (let i = 0; i < schedule.length; i++) {
    if (i < fullYears) {
      cumulative = schedule[i].cumulative;
    } else {
      // année en cours : prorata sur la dotation de l'année
      cumulative += frac * schedule[i].annuity;
      return round2(cumulative);
    }
  }
  // au-delà de la durée : totalement amorti
  return schedule[schedule.length - 1].cumulative;
}

/** Valeur nette comptable à la date `asOf`. */
export function netBookValue(input: AmortInput, asOf: Date): number {
  const cum = cumulativeDepreciation(input, asOf);
  return round2(input.acquisitionValue - cum);
}

/** Calcul des deux méthodes en parallèle (pour les états comparatifs). */
export function valuationBothMethods(
  input: Omit<AmortInput, "method">,
  asOf: Date,
) {
  const linear = netBookValue({ ...input, method: "LINEAR" }, asOf);
  const degressive = netBookValue({ ...input, method: "DEGRESSIVE" }, asOf);
  return {
    linear,
    degressive,
    depreciationLinear: round2(input.acquisitionValue - linear),
    depreciationDegressive: round2(input.acquisitionValue - degressive),
  };
}
