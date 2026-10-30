import type { DrinkEvent } from "./bac";

export type GlassShape =
  | "wine"
  | "flute"
  | "tumbler"
  | "pint"
  | "highball"
  | "cocktail"
  | "shot"
  | "coupe"
  | "mug";

export type Category = "vin" | "biere" | "spiritueux" | "cocktail" | "effervescent" | "cidre";

export type Drink = {
  id: string;
  name: string;
  short?: string;
  category: Category;
  abv: number;
  volumeCl: number;
  glass: GlassShape;
  color: string;
  colorLight: string;
  notes: string;
};

export const CATEGORY_META: Record<Category, { label: string; tint: string }> = {
  vin: { label: "Vin", tint: "bg-[#7b1f3a]/10 text-[#7b1f3a]" },
  biere: { label: "Bière", tint: "bg-amber-500/15 text-amber-800" },
  spiritueux: { label: "Spiritueux", tint: "bg-orange-600/10 text-orange-800" },
  cocktail: { label: "Cocktail", tint: "bg-rose-500/10 text-rose-800" },
  effervescent: { label: "Bulles", tint: "bg-yellow-400/20 text-yellow-800" },
  cidre: { label: "Cidre & poiré", tint: "bg-lime-600/10 text-lime-800" },
};

export const DRINKS: Drink[] = [
  // ---------------- Vins ----------------
  {
    id: "vin-rouge",
    name: "Vin rouge",
    category: "vin",
    abv: 13,
    volumeCl: 12,
    glass: "wine",
    color: "#6b1530",
    colorLight: "#a3284c",
    notes: "Bordeaux, Bourgogne, Côtes-du-Rhône…",
  },
  {
    id: "vin-blanc",
    name: "Vin blanc sec",
    category: "vin",
    abv: 12.5,
    volumeCl: 12,
    glass: "wine",
    color: "#e3cf86",
    colorLight: "#f4e8bd",
    notes: "Chablis, Muscadet, Sauvignon",
  },
  {
    id: "vin-rose",
    name: "Rosé",
    category: "vin",
    abv: 12.5,
    volumeCl: 12,
    glass: "wine",
    color: "#f0a9a0",
    colorLight: "#fbd6cf",
    notes: "Provence, Languedoc",
  },
  {
    id: "vin-doux",
    name: "Vin doux / moelleux",
    category: "vin",
    abv: 15,
    volumeCl: 8,
    glass: "wine",
    color: "#c98f1f",
    colorLight: "#e8be62",
    notes: "Sauternes, Jurançon, Banyuls",
  },
  {
    id: "vin-chaud",
    name: "Vin chaud",
    category: "vin",
    abv: 11,
    volumeCl: 20,
    glass: "mug",
    color: "#8a2233",
    colorLight: "#c04457",
    notes: "Marché de Noël",
  },
  // ---------------- Bulles ----------------
  {
    id: "champagne",
    name: "Champagne / Crémant",
    category: "effervescent",
    abv: 12.5,
    volumeCl: 12,
    glass: "flute",
    color: "#f0dfa4",
    colorLight: "#fbf3d4",
    notes: "Flûte de 12 cl",
  },
  {
    id: "champagne-coupe",
    name: "Coupe de champagne",
    category: "effervescent",
    abv: 12.5,
    volumeCl: 16,
    glass: "coupe",
    color: "#f2e3ad",
    colorLight: "#fcf5da",
    notes: "Coupe large, souvent resservie",
  },
  {
    id: "prosecco",
    name: "Prosecco / Spumante",
    category: "effervescent",
    abv: 11,
    volumeCl: 12,
    glass: "flute",
    color: "#f3e8b8",
    colorLight: "#fdf8e3",
    notes: "Italie",
  },
  {
    id: "kir",
    name: "Kir royal",
    category: "cocktail",
    abv: 12,
    volumeCl: 12,
    glass: "flute",
    color: "#c9a2d6",
    colorLight: "#eadcf0",
    notes: "Crème de cassis + bulles",
  },
  // ---------------- Bières ----------------
  {
    id: "biere-pression",
    name: "Demi pression",
    category: "biere",
    abv: 5,
    volumeCl: 25,
    glass: "pint",
    color: "#d9a01a",
    colorLight: "#f6d37a",
    notes: "Le « demi » de 25 cl",
  },
  {
    id: "biere-pinte",
    name: "Pinte",
    category: "biere",
    abv: 5,
    volumeCl: 50,
    glass: "pint",
    color: "#d9a01a",
    colorLight: "#f6d37a",
    notes: "50 cl — l'équivalent de 2 verres standard",
  },
  {
    id: "biere-ipa",
    name: "IPA / bière forte",
    category: "biere",
    abv: 7,
    volumeCl: 33,
    glass: "pint",
    color: "#c07f10",
    colorLight: "#ebbe5e",
    notes: "Houblon, 6–8°",
  },
  {
    id: "biere-blanche",
    name: "Bière blanche",
    category: "biere",
    abv: 4.8,
    volumeCl: 25,
    glass: "tumbler",
    color: "#e6d49a",
    colorLight: "#f8f0cf",
    notes: "Blanche, 4–5°",
  },
  {
    id: "biere-triple",
    name: "Triple belge",
    category: "biere",
    abv: 9,
    volumeCl: 33,
    glass: "tumbler",
    color: "#b97d10",
    colorLight: "#e8bc5e",
    notes: "Attention, ça pique",
  },
  // ---------------- Spiritueux ----------------
  {
    id: "whisky",
    name: "Whisky",
    category: "spiritueux",
    abv: 40,
    volumeCl: 4,
    glass: "tumbler",
    color: "#a35f14",
    colorLight: "#e2ac68",
    notes: "Dose bar 4 cl",
  },
  {
    id: "rhum",
    name: "Rhum / Cognac",
    category: "spiritueux",
    abv: 40,
    volumeCl: 4,
    glass: "tumbler",
    color: "#8f4a12",
    colorLight: "#d79a5c",
    notes: "Ambré, 40°",
  },
  {
    id: "vodka",
    name: "Vodka",
    category: "spiritueux",
    abv: 40,
    volumeCl: 4,
    glass: "shot",
    color: "#e8eef2",
    colorLight: "#ffffff",
    notes: "Transparente, 37–40°",
  },
  {
    id: "gin-tonic",
    name: "Gin tonic",
    category: "cocktail",
    abv: 10,
    volumeCl: 25,
    glass: "tumbler",
    color: "#d8e7ea",
    colorLight: "#f2fbfc",
    notes: "4 cl de gin + tonic",
  },
  {
    id: "rhum-coca",
    name: "Rhum-coca",
    category: "cocktail",
    abv: 10,
    volumeCl: 30,
    glass: "tumbler",
    color: "#4a2410",
    colorLight: "#8a5230",
    notes: "5 cl de rhum + cola",
  },
  {
    id: "shot",
    name: "Shot / Digestif",
    category: "spiritueux",
    abv: 40,
    volumeCl: 3,
    glass: "shot",
    color: "#d9b24a",
    colorLight: "#f5e2a2",
    notes: "3 cl, cul sec",
  },
  {
    id: "pastis",
    name: "Pastis",
    category: "spiritueux",
    abv: 5,
    volumeCl: 20,
    glass: "tumbler",
    color: "#e8d27a",
    colorLight: "#f7eec2",
    notes: "2 cl de pastis + eau",
  },
  {
    id: "porto",
    name: "Porto / Pineau",
    category: "spiritueux",
    abv: 18,
    volumeCl: 6,
    glass: "wine",
    color: "#7c1f2b",
    colorLight: "#b64b5b",
    notes: "Apéritif doux",
  },
  // ---------------- Cocktails ----------------
  {
    id: "mojito",
    name: "Mojito",
    category: "cocktail",
    abv: 11,
    volumeCl: 25,
    glass: "highball",
    color: "#d9efc4",
    colorLight: "#f2fbeb",
    notes: "5 cl de rhum, menthe, citron vert",
  },
  {
    id: "spritz",
    name: "Spritz",
    category: "cocktail",
    abv: 8,
    volumeCl: 20,
    glass: "wine",
    color: "#f2762c",
    colorLight: "#ffb579",
    notes: "Aperol, prosecco, eau gazeuse",
  },
  {
    id: "margarita",
    name: "Margarita",
    category: "cocktail",
    abv: 18,
    volumeCl: 15,
    glass: "coupe",
    color: "#e8efb0",
    colorLight: "#fbfcdd",
    notes: "Tequila, citron vert, triple sec",
  },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    category: "cocktail",
    abv: 15,
    volumeCl: 15,
    glass: "cocktail",
    color: "#e0466b",
    colorLight: "#f8a4b8",
    notes: "Vodka, cranberry, citron vert",
  },
  {
    id: "pina-colada",
    name: "Piña colada",
    category: "cocktail",
    abv: 9,
    volumeCl: 25,
    glass: "highball",
    color: "#f7f0d4",
    colorLight: "#fffdf2",
    notes: "Rhum, ananas, coco",
  },
  {
    id: "sangria",
    name: "Sangria",
    category: "cocktail",
    abv: 9,
    volumeCl: 20,
    glass: "wine",
    color: "#a81f34",
    colorLight: "#d95566",
    notes: "Vin, fruits, liqueur",
  },
  // ---------------- Cidre ----------------
  {
    id: "cidre",
    name: "Cidre brut",
    category: "cidre",
    abv: 4.5,
    volumeCl: 25,
    glass: "tumbler",
    color: "#e0a82c",
    colorLight: "#f7d982",
    notes: "Bolée normande de 25 cl",
  },
  {
    id: "cidre-bol",
    name: "Bolée de cidre",
    category: "cidre",
    abv: 4.5,
    volumeCl: 33,
    glass: "mug",
    color: "#d99a24",
    colorLight: "#f5cf76",
    notes: "La grande bolée du pays d'Auge",
  },
  // ---------------- Sans alcool ----------------
  {
    id: "sans-alcool",
    name: "Sans alcool",
    short: "Soft",
    category: "cidre",
    abv: 0,
    volumeCl: 25,
    glass: "highball",
    color: "#cfe8f2",
    colorLight: "#f0fafd",
    notes: "Soda, jus, bière 0 %",
  },
];

export const DRINK_BY_ID: Record<string, Drink> = Object.fromEntries(
  DRINKS.map((d) => [d.id, d])
);

export function getAbv(drinkId: string): number {
  return DRINK_BY_ID[drinkId]?.abv ?? 0;
}

export function getDrink(drinkId: string): Drink {
  return DRINK_BY_ID[drinkId] ?? DRINKS[0];
}

/* ------------------------------------------------------------------ */
/* Volumes suggérés selon la forme du verre                           */
/* ------------------------------------------------------------------ */

export const VOLUME_PRESETS: Record<GlassShape, number[]> = {
  wine: [8, 10, 12, 15, 20, 25],
  flute: [10, 12, 15, 20],
  coupe: [12, 16, 20, 25],
  tumbler: [3, 4, 6, 10, 20, 25, 33],
  pint: [15, 25, 33, 50, 100],
  highball: [20, 25, 30, 35, 40],
  cocktail: [10, 15, 20, 25, 35],
  shot: [2, 3, 4, 6],
  mug: [20, 25, 33, 50],
};

/**
 * Le contenu du verre n'est jamais plein à ras bord : on applique
 * un remplissage de service typique.
 */
export const FILL_RATIO: Record<GlassShape, number> = {
  wine: 0.55,
  flute: 0.7,
  coupe: 0.6,
  tumbler: 0.55,
  pint: 0.85,
  highball: 0.8,
  cocktail: 0.8,
  shot: 0.9,
  mug: 0.8,
};

export type ScanCandidate = {
  drink: Drink;
  confidence: number;
  volumeCl: number;
  /** composition estimée (pour l'affichage détaillé) */
  clues: string[];
};

/**
 * « Reconnaissance » du verre.
 *
 * L'application ne dispose pas d'un modèle de vision entraîné : cette
 * fonction simule un pipeline de détection (forme du verre → teinte →
 * volume) et renvoie plusieurs candidats classés par confiance.
 * Les signaux sont dérivés de la luminosité / saturation réelles de la
 * photo et d'un tirage déterministe pondéré par la forme du verre.
 */
export function identifyFromPhoto(
  seed: number,
  dominantFamily: Category | null,
  hintDrinkId?: string,
  /** historique personnel : boisson → nombre de verres confirmés */
  learned: Record<string, number> = {}
): ScanCandidate[] {
  const rand = mulberry32(seed);
  const pool = DRINKS.filter((d) => d.abv > 0);
  const favored = dominantFamily ? pool.filter((d) => d.category === dominantFamily) : [];

  const scored = pool.map((d) => {
    let s = rand() * 0.55 + 0.2;
    if (favored.some((f) => f.id === d.id)) s += 0.3;
    if (["vin-rouge", "biere-pinte", "biere-pression", "champagne", "spritz", "mojito"].includes(d.id)) s += 0.1;
    // Une photo de démonstration est étiquetée : on s'en sert comme vérité terrain.
    if (hintDrinkId && d.id === hintDrinkId) s += 0.6;
    // Habitudes de l'utilisateur : ses boissons favorites remontent doucement.
    const habit = learned[d.id] ?? 0;
    if (habit > 0) s += Math.min(0.28, habit * 0.05);
    return { d, s };
  });

  scored.sort((a, b) => b.s - a.s);
  const kept = dedupeByFamily(scored, 3);

  return kept.map((entry, i) => {
    const conf = Math.max(0.32, Math.min(0.94, entry.s - i * 0.16));
    const jitter = 1 + (rand() - 0.5) * 0.18;
    return {
      drink: entry.d,
      confidence: conf,
      volumeCl: Math.max(2, Math.round(entry.d.volumeCl * jitter)),
      clues: buildClues(entry.d),
    };
  });
}

function dedupeByFamily(
  list: { d: Drink; s: number }[],
  n: number
): { d: Drink; s: number }[] {
  const out: { d: Drink; s: number }[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const fam = item.d.glass + item.d.category;
    if (seen.has(fam)) continue;
    seen.add(fam);
    out.push(item);
    if (out.length === n) break;
  }
  return out;
}

function buildClues(d: Drink): string[] {
  const glassLabel: Record<GlassShape, string> = {
    wine: "verre ballon",
    flute: "flûte étroite",
    coupe: "coupe large",
    tumbler: "verre tulipe",
    pint: "verre haut élancé",
    highball: "verre long",
    cocktail: "verre à pied",
    shot: "petit verre",
    mug: "chope épaisse",
  };
  return [
    glassLabel[d.glass],
    d.abv >= 30 ? "forte concentration d'alcool" : d.abv >= 12 ? "degré moyen" : "faible degré",
    relativeLuminance(d.colorLight) > 0.55 ? "teinte claire" : "teinte soutenue",
  ];
}

function relativeLuminance(hex: string): number {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Journal / session helpers                                          */
/* ------------------------------------------------------------------ */

export function totalGrams(events: DrinkEvent[]): number {
  return events.reduce((s, e) => s + e.volumeCl * 10 * (getAbv(e.drinkId) / 100) * 0.789, 0);
}

export function pickDrinkFamily(
  hue: number,
  saturation: number,
  brightness = 0.5
): Category | null {
  // Heuristique teinte + luminosité : rouge sombre → vin, ambre clair → bière,
  // ambre très saturé et sombre → spiritueux, vert → cocktail, jaune pâle → bulles.
  if (saturation < 0.08) return null;
  if (hue >= 320 || hue < 12) return "vin";
  if (hue >= 12 && hue < 32) {
    if (saturation > 0.62 && brightness < 0.42) return "spiritueux";
    if (saturation < 0.32 && brightness > 0.6) return "effervescent";
    return "biere";
  }
  if (hue >= 32 && hue < 62) {
    if (brightness > 0.62 && saturation < 0.5) return "effervescent";
    return saturation > 0.55 && brightness < 0.4 ? "spiritueux" : "biere";
  }
  if (hue >= 62 && hue < 160) return "cocktail";
  if (hue >= 160 && hue < 265) return "cocktail";
  return "vin";
}
