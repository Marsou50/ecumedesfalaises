/**
 * Moteur d'estimation de l'alcoolémie.
 *
 * Modèle : formule de Widmark + absorption progressive + élimination linéaire.
 *   A(t) absorbé (g)
 *   BAC(t) = A(t) / (Poids × r)   puis élimination β (g/L/h)
 *
 * L'élimination est appliquée par récurrence « max-plus » :
 *   BAC(t) = max( BAC_raw(t), BAC(t-Δt) − β·Δt )
 * ce qui reproduit fidèlement une montée pendant la consommation puis
 * une descente linéaire après le pic, y compris avec plusieurs verres
 * espacés dans le temps.
 *
 * ⚠️ Estimation statistique. Ne remplace ni un éthylotest ni une prise de sang.
 */

export type Sex = "homme" | "femme" | "autre";
export type Licence = "probatoire" | "confirme" | "sans";
export type FoodLevel = "jeun" | "leger" | "repas" | "copieux";
export type Metabolism = "lent" | "moyen" | "rapide";

export type Profile = {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  licence: Licence;
  metabolism: Metabolism;
  name?: string;
};

export type DrinkEvent = {
  id: string;
  drinkId: string;
  volumeCl: number;
  /** timestamp epoch ms */
  at: number;
  source: "photo" | "manuel";
  confidence?: number;
};

export type Session = {
  id: string;
  startedAt: number;
  events: DrinkEvent[];
  food: FoodLevel;
  updatedAt: number;
};

/* ------------------------------------------------------------------ */
/* Constantes physiologiques                                          */
/* ------------------------------------------------------------------ */

export const ETHANOL_DENSITY = 0.789; // g/mL

export const BETA_BY_METABOLISM: Record<Metabolism, number> = {
  lent: 0.12,
  moyen: 0.15,
  rapide: 0.18,
};

/** Durée d'absorption (minutes) selon l'état de l'estomac. */
export const ABSORPTION_MIN: Record<FoodLevel, number> = {
  jeun: 20,
  leger: 40,
  repas: 60,
  copieux: 80,
};

export const FOOD_LABEL: Record<FoodLevel, string> = {
  jeun: "À jeun",
  leger: "Grignotage",
  repas: "Repas complet",
  copieux: "Repas copieux",
};

export const FOOD_HINT: Record<FoodLevel, string> = {
  jeun: "Absorption très rapide : le pic arrive vite, et plus haut.",
  leger: "Quelques amandes ou un sandwich ralentissent un peu l'absorption.",
  repas: "Un repas complet lisse la montée, sans réduire l'alcool total.",
  copieux: "Repas riche en graisses : montée lente, pic plus tardif.",
};

/** Coefficients de diffusion de Widmark (base). */
const R_BASE: Record<Sex, number> = { homme: 0.7, femme: 0.6, autre: 0.65 };

/**
 * Ajustement morphologique : la masse grasse contient peu d'eau,
 * l'alcool s'y répartit mal. On corrige donc légèrement r (prudence :
 * on ne descend jamais sous la valeur de base de plus de 6 %).
 */
export function widmarkR(p: Pick<Profile, "sex" | "weightKg" | "heightCm" | "age">): number {
  const h = Math.max(120, p.heightCm) / 100;
  const bmi = p.weightKg / (h * h);
  let r = R_BASE[p.sex];
  if (bmi > 27) r *= 0.94;
  else if (bmi < 19) r *= 1.04;
  if (p.age >= 60) r *= 0.97; // moindre proportion d'eau corporelle
  if (p.age < 25) r *= 1.02;
  return r;
}

/** Grammes d'alcool pur dans un volume donné. */
export function alcoholGrams(volumeCl: number, abv: number): number {
  return volumeCl * 10 * (abv / 100) * ETHANOL_DENSITY;
}

/** Équivalence haleine (mg/L d'air expiré) — facteur 1/2. */
export function breathMgL(bac: number): number {
  return bac / 2;
}

/** Seuil légal français (g/L de sang). */
export function legalLimit(licence: Licence): number | null {
  if (licence === "sans") return null;
  return licence === "probatoire" ? 0.2 : 0.5;
}

export type Zone = "vert" | "orange" | "rouge" | "delit" | "na";

export const ZONE_META: Record<Exclude<Zone, "na">, { label: string; short: string }> = {
  vert: { label: "Sous le seuil, avec marge de prudence", short: "Marge de prudence OK" },
  orange: { label: "Zone limite — ne prenez pas le volant", short: "Zone limite" },
  rouge: { label: "Au-dessus du seuil légal", short: "Au-dessus du seuil" },
  delit: { label: "Seuil délictuel atteint", short: "Seuil délictuel" },
};

/** Marge de sécurité appliquée avant de considérer la conduite comme possible. */
export const SAFETY_MARGIN = 0.1;

export function zoneFor(bac: number, licence: Licence): Zone {
  const limit = legalLimit(licence);
  if (limit == null) return "na";
  if (bac >= 0.8) return "delit";
  if (bac >= limit) return "rouge";
  if (bac >= limit - SAFETY_MARGIN) return "orange";
  return "vert";
}

/* ------------------------------------------------------------------ */
/* Modèle temporel                                                    */
/* ------------------------------------------------------------------ */

type Dose = { grams: number; at: number; absorptionMin: number };

function buildDoses(
  events: DrinkEvent[],
  getAbv: (drinkId: string) => number,
  food: FoodLevel
): Dose[] {
  const base = ABSORPTION_MIN[food];
  return events
    .filter((e) => getAbv(e.drinkId) > 0)
    .map((e) => {
      const abv = getAbv(e.drinkId);
      // Les boissons gazeuses et les petits volumes passent plus vite.
      const fizzy = /biere|champagne|spritz|mojito|gin|tonic|pinte|pression/i.test(e.drinkId);
      const factor = (fizzy ? 0.8 : 1) * (abv > 25 ? 0.9 : 1);
      return {
        grams: alcoholGrams(e.volumeCl, abv),
        at: e.at,
        absorptionMin: Math.max(10, base * factor),
      };
    });
}

/**
 * Calcule la courbe d'alcoolémie sur une grille régulière.
 */
export function computeCurve(
  events: DrinkEvent[],
  profile: Profile,
  food: FoodLevel,
  getAbv: (drinkId: string) => number,
  opts: { stepMin?: number; horizonH?: number; from?: number } = {}
): { t: number[]; bac: number[]; doses: Dose[]; r: number; volumeL: number } {
  const stepMin = opts.stepMin ?? 5;
  const horizonH = opts.horizonH ?? 48;
  const doses = buildDoses(events, getAbv, food);
  const r = widmarkR(profile);
  const volumeL = Math.max(20, profile.weightKg * r);
  const beta = BETA_BY_METABOLISM[profile.metabolism];

  if (doses.length === 0) {
    return { t: [], bac: [], doses, r, volumeL };
  }

  const first = Math.min(...doses.map((d) => d.at), opts.from ?? Infinity);
  const start = first - 10 * 60_000;
  const totalGrams = doses.reduce((s, d) => s + d.grams, 0);
  // durée max : le temps d'éliminer tout + absorption + marge
  const tailMin = (totalGrams / volumeL / beta) * 60 + 180;
  const end = Math.max(...doses.map((d) => d.at + d.absorptionMin * 60_000)) + tailMin * 60_000;
  const cappedEnd = Math.min(end, start + horizonH * 3600_000);

  const stepMs = stepMin * 60_000;
  const n = Math.max(2, Math.ceil((cappedEnd - start) / stepMs));
  const t: number[] = [];
  const bac: number[] = [];

  // Intégration : chaque pas ajoute l'alcool absorbé pendant le pas,
  // puis retire l'alcool éliminé par le foie (β · V par heure).
  let level = 0;
  let absorbedPrev = 0;

  for (let i = 0; i <= n; i++) {
    const now = start + i * stepMs;
    let absorbed = 0;
    for (const d of doses) {
      const span = d.absorptionMin * 60_000;
      const p = now <= d.at ? 0 : Math.min(1, (now - d.at) / span);
      absorbed += d.grams * p;
    }
    const delta = Math.max(0, absorbed - absorbedPrev);
    absorbedPrev = absorbed;
    level = Math.max(0, level + delta / volumeL - (beta * stepMs) / 3600_000);
    t.push(now);
    bac.push(level);
  }

  return { t, bac, doses, r, volumeL };
}

export function bacAt(
  t: number,
  curve: { t: number[]; bac: number[] }
): number {
  const { t: times, bac } = curve;
  if (times.length === 0) return 0;
  if (t <= times[0]) return 0;
  if (t >= times[times.length - 1]) return 0;
  let lo = 0;
  let hi = times.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = times[hi] - times[lo] || 1;
  const p = (t - times[lo]) / span;
  return bac[lo] + (bac[hi] - bac[lo]) * p;
}

export type Recovery = {
  peak: number;
  peakAt: number;
  current: number;
  /** heures restantes avant de repasser sous le seuil légal (marge incluse) */
  timeToLimit: number | null;
  /** heures restantes avant une alcoolémie quasi nulle */
  timeToSober: number | null;
  /** date absolue (epoch ms) correspondant à timeToLimit / timeToSober */
  limitAt: number | null;
  soberAt: number | null;
  /** le taux va-t-il encore monter ? (absorption en cours) */
  willRise: boolean;
  totalGrams: number;
  standardDrinks: number;
  limit: number | null;
  dropPerHour: number;
};

const STANDARD_DRINK_G = 10;

/** Le taux va-t-il monter de plus de 0,02 g/L dans l'heure qui suit ? */
function willRiseSoon(t: number[], bac: number[], now: number, beta: number): boolean {
  if (t.length === 0) return false;
  const horizon = now + 60 * 60_000;
  const current = bacAt(now, { t, bac });
  const later = bacAt(Math.min(horizon, t[t.length - 1]), { t, bac });
  const plateau = current - beta; // ce que donnerait une simple élimination
  return later > plateau + 0.02;
}

export function analyze(
  curve: { t: number[]; bac: number[] },
  profile: Profile,
  now: number,
  totalGrams: number
): Recovery {
  const { t, bac } = curve;
  const limit = legalLimit(profile.licence);
  const beta = BETA_BY_METABOLISM[profile.metabolism];

  let peak = 0;
  let peakAt = now;
  for (let i = 0; i < bac.length; i++) {
    if (bac[i] > peak) {
      peak = bac[i];
      peakAt = t[i];
    }
  }

  const current = bacAt(now, curve);

  const crossTime = (threshold: number): number | null => {
    if (t.length === 0) return null;
    // Déjà sous le seuil : aucune attente nécessaire.
    if (current < threshold) return 0;
    // dernier instant où la courbe est encore >= seuil ; on rend le point suivant
    let lastAbove = -1;
    for (let i = t.length - 1; i >= 0; i--) {
      if (t[i] < now) break;
      if (bac[i] >= threshold) {
        lastAbove = i;
        break;
      }
    }
    if (lastAbove === -1) {
      return current >= threshold ? null : 0;
    }
    if (lastAbove + 1 >= t.length) return null;
    const t0 = t[lastAbove];
    const t1 = t[lastAbove + 1];
    const b0 = bac[lastAbove];
    const b1 = bac[lastAbove + 1];
    if (b0 === b1) return t1;
    const p = (b0 - threshold) / (b0 - b1);
    return t0 + (t1 - t0) * p;
  };

  // Aucune consommation : les deux échéances sont immédiates.
  if (t.length < 2) {
    return {
      peak: 0,
      peakAt: now,
      current: 0,
      timeToLimit: 0,
      timeToSober: 0,
      limitAt: now,
      soberAt: now,
      willRise: false,
      totalGrams: 0,
      standardDrinks: 0,
      limit,
      dropPerHour: beta,
    };
  }

  // crossTime renvoie un instant absolu : on le ramène en durée restante.
  const remaining = (abs: number | null) => (abs == null ? null : Math.max(0, abs - now));

  // Si la courbe sort de l'horizon de calcul, on extrapole linéairement
  // à partir du taux courant : c'est l'élimination qui gouverne la fin de courbe.
  const extrapolate = (threshold: number): number | null => {
    if (current <= threshold) return 0;
    if (curveReachedZero) return null;
    return ((current - threshold) / beta) * 3_600_000;
  };
  const curveReachedZero = t.length > 0 && bac[bac.length - 1] <= 0.0001;

  const limitTarget = limit == null ? null : Math.max(0, limit - SAFETY_MARGIN);
  const timeToLimit =
    limitTarget == null
      ? null
      : remaining(crossTime(limitTarget)) ?? extrapolate(limitTarget);

  // sobriété : sous 0,05 g/L (arrondi d'un éthylotest)
  const timeToSober = remaining(crossTime(0.05)) ?? extrapolate(0.05);

  return {
    peak,
    peakAt,
    current,
    timeToLimit,
    timeToSober,
    limitAt: timeToLimit == null ? null : now + timeToLimit,
    soberAt: timeToSober == null ? null : now + timeToSober,
    willRise: willRiseSoon(t, bac, now, beta),
    totalGrams,
    standardDrinks: totalGrams / STANDARD_DRINK_G,
    limit,
    dropPerHour: beta,
  };
}

/* ------------------------------------------------------------------ */
/* Formatage                                                          */
/* ------------------------------------------------------------------ */

export function fmtBac(v: number): string {
  if (v <= 0.001) return "0,00";
  return v.toFixed(2).replace(".", ",");
}

export function fmtTime(ts: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function fmtDelay(ms: number): string {
  if (ms <= 0) return "maintenant";
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

export function fmtDate(ts: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(ts));
}

export function fmtRelative(ts: number, now: number): string {
  const diff = now - ts;
  if (diff < 60_000) return "à l'instant";
  const min = Math.round(diff / 60_000);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  return `il y a ${h} h`;
}
