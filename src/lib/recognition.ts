/**
 * Reconnaissance de boisson : architecture à plusieurs moteurs.
 *
 * 1. `heuristique` (par défaut) — analyse locale des couleurs, aucun téléchargement.
 * 2. `tensorflow`            — MobileNet v2 (ImageNet) exécuté dans le navigateur.
 * 3. `api`                   — modèle vision multimodal via API (Gemini, OpenAI,
 *                              Mistral, ou tout endpoint compatible OpenAI).
 *
 * Chaque moteur renvoie la même structure normalisée (`EngineOutput`), ce qui permet
 * d'afficher, comparer et changer de moteur sans toucher à l'écran de scan.
 *
 * ⚠️ Aucun de ces moteurs n'est un classifieur de boissons entraîné spécifiquement :
 * ImageNet ne contient pas de classes « pinte » ou « mojito », et un LLM vision
 * reconnaît une famille de boisson, jamais un degré d'alcool. La validation
 * humaine reste obligatoire — c'est pour cela que l'écran de résultats demande
 * toujours une confirmation.
 */

import {
  DRINKS,
  identifyFromPhoto,
  type Category,
  type Drink,
  type ScanCandidate,
} from "./drinks";

export type EngineId = "heuristique" | "tensorflow" | "api";
export type ApiProvider = "gemini" | "openai" | "mistral" | "compatible";

export type EngineConfig = {
  engine: EngineId;
  api: {
    provider: ApiProvider;
    apiKey: string;
    model: string;
    baseUrl: string;
  };
  /** valeurs observées par l'analyse locale des couleurs */
  colors?: ColorSamples;
};

export type ColorSamples = {
  hue: number;
  saturation: number;
  brightness: number;
  fillPct: number;
};

export type Signal = {
  label: string;
  detail?: string;
  weight: number;
};

export type EngineOutput = {
  engine: EngineId;
  engineLabel: string;
  candidates: ScanCandidate[];
  signals: Signal[];
  /** avertissements / erreurs lisibles */
  warnings: string[];
  /** temps de traitement mesuré */
  elapsedMs?: number;
  /** ce que le moteur a réellement vu (classes, description) */
  raw?: { label: string; score?: number }[] | string;
  /** moteur de secours si l'appel a échoué */
  fellBack?: boolean;
};

/* ------------------------------------------------------------------ */
/* Normalisation texte → catalogue                                    */
/* ------------------------------------------------------------------ */

const SYNONYMS: Record<string, string[]> = {
  "vin-rouge": ["vin rouge", "red wine", "wine glass", "wine bottle", "bordeaux", "bourgogne", "cotes du rhone", "merlot", "cabernet", "pinot noir", "malbec", "syrah", "chianti", "tempranillo", "rioja", "shiraz", "rouge"],
  "vin-blanc": ["vin blanc", "white wine", "chablis", "chardonnay", "sauvignon", "riesling", "muscadet", "aligote", "viognier", "pinot gris", "blanc sec"],
  "vin-rose": ["rose", "vin rose", "provence", "grenache", "rosado"],
  "vin-doux": ["sauternes", "moelleux", "vin doux", "banyuls", "jurancon", "monbazillac", "tokaji", "sherry", "xeres"],
  champagne: ["champagne", "cremant", "mousseux", "petillant", "spumante", "cava", "brut", "bulles", "flute", "goblet"],
  "champagne-coupe": ["coupe", "coupe de champagne"],
  prosecco: ["prosecco", "pignoletto", "millesimato"],
  kir: ["kir", "kir royal", "cassis", "creme de cassis"],
  "biere-pression": ["pression", "demi", "draft beer", "draught", "beer glass", "lager draft"],
  "biere-pinte": ["pinte", "pint", "ipa", "ale", "biere blonde", "beer", "biere", "lager", "pilsner", "blonde"],
  "biere-ipa": ["india pale ale", "apa", "houblon", "hops"],
  "biere-blanche": ["blanche", "weiss", "weizen", "witbier", "hefeweizen"],
  "biere-triple": ["triple", "tripel", "quadrupel", "dubbel", "abbaye", "belgian strong"],
  whisky: ["whisky", "whiskey", "scotch", "bourbon", "single malt", "rye", "jameson", "jack daniel"],
  rhum: ["rhum", "rum", "cognac", "armagnac", "brandy", "calvados", "eau de vie", "bas armagnac"],
  vodka: ["vodka", "vodka shot"],
  "gin-tonic": ["gin tonic", "gin and tonic", "g t", "gin"],
  "rhum-coca": ["rhum coca", "rum and coke", "cuba libre", "coca rhum"],
  shot: ["shot", "shooter", "digestif", "liqueur", "schnaps", "tequila", "sambuca", "limoncello", "amaretto", "baileys"],
  pastis: ["pastis", "ricard", "anis", "ouzo", "arak", "pernod"],
  porto: ["porto", "pineau", "port wine", "maury", "rivesaltes"],
  mojito: ["mojito", "menthe", "mint julep"],
  spritz: ["spritz", "aperol", "hugo", "negroni sbagliato"],
  margarita: ["margarita", "tequila cocktail"],
  cosmopolitan: ["cosmopolitan", "cosmo", "cranberry"],
  "pina-colada": ["pina colada", "colada", "ananas coco"],
  sangria: ["sangria", "sangria blanca", "clairette"],
  cidre: ["cidre", "cider", "pomme", "apple cider", "hard cider"],
  "cidre-bol": ["bolee", "cidre brut", "poire", "poire"],
  "sans-alcool": ["sans alcool", "non alcoolise", "mocktail", "soda", "jus", "eau", "coca", "limonade", "coffee", "cafe", "the", "zero"],
};

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Meilleur score de correspondance entre un texte libre et une boisson du catalogue. */
export function textToDrinkScore(text: string, drink: Drink): number {
  const t = normalize(text);
  if (!t) return 0;
  const keys = [drink.id, drink.name, drink.short ?? "", ...(SYNONYMS[drink.id] ?? [])];
  let best = 0;
  for (const raw of keys) {
    const k = normalize(raw);
    if (!k) continue;
    if (t === k) best = Math.max(best, 1);
    else if (t.includes(k) && k.length >= 4) best = Math.max(best, 0.85);
    else if (k.includes(t) && t.length >= 4) best = Math.max(best, 0.7);
  }
  return best;
}

/** Mappe un texte libre (description LLM, classe ImageNet) vers les 3 meilleures boissons. */
export function mapTextToCandidates(
  text: string,
  baseConfidence = 0.7
): ScanCandidate[] {
  const scored = DRINKS.filter((d) => d.abv > 0)
    .map((drink) => ({ drink, score: textToDrinkScore(text, drink) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const out: ScanCandidate[] = [];
  const seenFamilies = new Set<string>();
  for (const s of scored) {
    const fam = s.drink.glass + s.drink.category;
    if (seenFamilies.has(fam)) continue;
    seenFamilies.add(fam);
    out.push({
      drink: s.drink,
      confidence: Math.min(0.96, baseConfidence * s.score + 0.1),
      volumeCl: s.drink.volumeCl,
      clues: [`correspondance « ${s.drink.name} »`, `degré ${String(s.drink.abv).replace(".", ",")}°`],
    });
    if (out.length === 3) break;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Moteur 1 — heuristique locale                                      */
/* ------------------------------------------------------------------ */

export const ENGINE_LABELS: Record<EngineId, string> = {
  heuristique: "Analyse locale des couleurs",
  tensorflow: "TensorFlow.js · MobileNet v2",
  api: "API vision (multimodale)",
};

export const PROVIDER_LABELS: Record<ApiProvider, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  mistral: "Mistral AI",
  compatible: "Endpoint compatible OpenAI",
};

export const PROVIDER_DEFAULT_MODEL: Record<ApiProvider, string> = {
  gemini: "gemini-2.5-flash",
  openai: "gpt-4.1-mini",
  mistral: "pixtral-12b-2409",
  compatible: "gpt-4o-mini",
};

/**
 * Modèles suggérés par fournisseur (les noms évoluent vite : le champ reste
 * libre, ces valeurs ne sont que des propositions affichées dans l'interface).
 */
export const PROVIDER_MODEL_SUGGESTIONS: Record<ApiProvider, string[]> = {
  gemini: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3-flash", "gemini-2.5-pro"],
  openai: ["gpt-4.1-mini", "gpt-4o-mini", "gpt-4.1"],
  mistral: ["pixtral-12b-2409", "pixtral-large-latest", "mistral-small-latest"],
  compatible: ["gpt-4o-mini", "llama-3.2-11b-vision-preview", "qwen2.5-vl-72b-instruct"],
};

/** Palier gratuit connu, affiché à titre indicatif. */
export const PROVIDER_FREE_TIER: Record<ApiProvider, string> = {
  gemini: "Palier gratuit Google AI Studio, sans carte bancaire",
  openai: "Pas de palier gratuit — facturation requise",
  mistral: "Palier gratuit d'évaluation sur La Plateforme",
  compatible: "Selon le fournisseur de l'endpoint",
};

/** Description du moteur actif, pour la pédagogie et les journaux. */
export function describeEngine(cfg: EngineConfig): string {
  if (cfg.engine === "tensorflow") return "TensorFlow.js — MobileNet v2 (WebGL)";
  if (cfg.engine === "api")
    return `${PROVIDER_LABELS[cfg.api.provider]} · ${cfg.api.model || PROVIDER_DEFAULT_MODEL[cfg.api.provider]}`;
  return "analyse locale des couleurs";
}

export const PROVIDER_DEFAULT_URL: Record<ApiProvider, string> = {
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  openai: "https://api.openai.com/v1",
  mistral: "https://api.mistral.ai/v1",
  compatible: "https://api.openai.com/v1",
};

/* ------------------------------------------------------------------ */
/* Images : redimensionnement + encodage                              */
/* ------------------------------------------------------------------ */

export type PreparedImage = {
  dataUrl: string;
  base64: string;
  mime: string;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

/**
 * Charge une image puis la réduit (max 1024 px, JPEG qualité 0.86) pour limiter
 * le payload. Rejette toujours (jamais de promesse pendante) après 6 s.
 */
export function prepareImage(src: string, maxSide = 1024): Promise<PreparedImage> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error("Image vide"));
      return;
    }
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    const timer = setTimeout(
      () => finish(() => reject(new Error("Délai de chargement de l'image dépassé"))),
      6000
    );

    const img = new Image();
    img.onload = () =>
      finish(() => {
        const iw = img.naturalWidth || img.width || 640;
        const ih = img.naturalHeight || img.height || 640;
        if (!iw || !ih) {
          reject(new Error("Dimensions d'image invalides"));
          return;
        }
        const ratio = Math.min(1, maxSide / Math.max(iw, ih));
        const w = Math.max(64, Math.round(iw * ratio));
        const h = Math.max(64, Math.round(ih * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D indisponible"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL("image/jpeg", 0.86);
        } catch {
          // canvas « tainted » (image distante sans CORS) : on garde la source
          dataUrl = src;
        }
        const base64 = dataUrl.startsWith("data:") ? dataUrl.split(",")[1] ?? "" : "";
        resolve({ dataUrl, base64, mime: "image/jpeg", canvas, width: w, height: h });
      });
    img.onerror = () => finish(() => reject(new Error("Image illisible (format non supporté)")));
    img.src = src;
  });
}

/* ------------------------------------------------------------------ */
/* Moteur 2 — TensorFlow.js / MobileNet                                */
/* ------------------------------------------------------------------ */

type MobileNetLike = {
  classify: (
    input: HTMLCanvasElement,
    topk?: number
  ) => Promise<{ className: string; probability: number }[]>;
  dispose?: () => void;
};

let mobileNetPromise: Promise<MobileNetLike> | null = null;

export type TfProgress = { status: "loading" | "ready" | "running" | "error"; detail?: string };

/* ------------------------------------------------------------------ */
/* Chargement des libs TensorFlow depuis le CDN                        */
/* ------------------------------------------------------------------ */

const TF_CDN = "https://cdn.jsdelivr.net/npm";
const TF_URLS = [
  `${TF_CDN}/@tensorflow/tfjs@4.22.0/dist/tf.min.js`,
  `${TF_CDN}/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js`,
];

type TfGlobals = { tf?: unknown; mobilenet?: unknown };
let tfScriptsPromise: Promise<TfGlobals> | null = null;

/**
 * Injecte les scripts TF.js + MobileNet (UMD) depuis jsDelivr, une seule fois.
 * Les paquets npm restent en dépendance de développement pour les types,
 * mais ne sont jamais bundlés : le build single-file reste léger.
 */
export function loadTfScripts(): Promise<TfGlobals> {
  if (tfScriptsPromise) return tfScriptsPromise;
  tfScriptsPromise = (async () => {
    const w = window as unknown as TfGlobals;
    if (w.tf && w.mobilenet) return w;
    const inject = (url: string) =>
      new Promise<void>((resolve, reject) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        // filet de sécurité : un script bloqué (CSP, réseau) n'émet pas toujours d'événement
        const timer = setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(
            new Error(
              "Impossible de charger TensorFlow.js depuis le CDN (délai dépassé). Vérifiez la connexion internet."
            )
          );
        }, 20_000);

        const existing = document.querySelector<HTMLScriptElement>(`script[data-tfjs="${url}"]`);
        if (existing) {
          if (existing.dataset.loaded === "1") {
            clearTimeout(timer);
            done();
          } else {
            existing.addEventListener("load", () => {
              clearTimeout(timer);
              done();
            }, { once: true });
            existing.addEventListener(
              "error",
              () => {
                clearTimeout(timer);
                if (!settled) {
                  settled = true;
                  reject(new Error("CDN inaccessible (script existant en erreur)."));
                }
              },
              { once: true }
            );
          }
          return;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = false; // ordre garanti : tf avant mobilenet
        script.crossOrigin = "anonymous";
        script.dataset.tfjs = url;
        script.onload = () => {
          script.dataset.loaded = "1";
          clearTimeout(timer);
          done();
        };
        script.onerror = () => {
          clearTimeout(timer);
          if (!settled) {
            settled = true;
            reject(
              new Error(
                "Impossible de charger TensorFlow.js depuis le CDN. Vérifiez la connexion internet."
              )
            );
          }
        };
        document.head.appendChild(script);
      });

    for (const url of TF_URLS) await inject(url);
    if (!w.tf || !w.mobilenet) {
      throw new Error("Scripts TensorFlow chargés mais API introuvable (CDN incomplet).");
    }
    return w;
  })().catch((err) => {
    tfScriptsPromise = null; // permet de réessayer
    throw err;
  });
  return tfScriptsPromise;
}

/**
 * Charge MobileNet v2 (alpha 1.0) depuis le CDN TFHub, une seule fois par session.
 * Le modèle n'est téléchargé que si l'utilisateur choisit ce moteur.
 */
export async function loadMobileNet(onProgress?: (p: TfProgress) => void): Promise<MobileNetLike> {
  if (mobileNetPromise) return mobileNetPromise;
  mobileNetPromise = (async () => {
    onProgress?.({ status: "loading", detail: "Chargement de TensorFlow.js…" });
    const g = await loadTfScripts();
    const tf = g.tf as { ready: () => Promise<void> };
    const mobilenet = g.mobilenet as {
      load: (cfg?: unknown) => Promise<MobileNetLike>;
    };
    onProgress?.({ status: "loading", detail: "Téléchargement du modèle (~14 Mo)…" });
    await tf.ready();
    const model = await mobilenet.load({ version: 2, alpha: 1.0 });
    onProgress?.({ status: "ready" });
    return model as unknown as MobileNetLike;
  })().catch((err) => {
    mobileNetPromise = null; // permet de réessayer
    throw err;
  });
  return mobileNetPromise;
}

export function isMobileNetLoaded(): boolean {
  return mobileNetPromise !== null;
}

/** Classes ImageNet génériques → familles de boissons plausibles. */
const IMAGENET_FAMILY_HINTS: { key: string; families: Category[]; generic?: boolean }[] = [
  { key: "goblet", families: ["vin", "effervescent"] },
  { key: "wine glass", families: ["vin", "effervescent"] },
  { key: "red wine", families: ["vin"] },
  { key: "white wine", families: ["vin", "effervescent"] },
  { key: "wine bottle", families: ["vin"], generic: true },
  { key: "beer glass", families: ["biere", "cidre"] },
  { key: "beer bottle", families: ["biere"], generic: true },
  { key: "cocktail shaker", families: ["cocktail", "spiritueux"], generic: true },
  { key: "eggnog", families: ["cocktail"] },
  { key: "punch", families: ["cocktail"] },
  { key: "tumbler", families: ["spiritueux", "cocktail"] },
  { key: "coffee mug", families: ["biere", "cidre"], generic: true },
  { key: "pitcher", families: ["sangria", "cocktail"] as unknown as Category[], generic: true },
  { key: "water bottle", families: [], generic: true },
  { key: "pop bottle", families: [], generic: true },
  { key: "espresso", families: [], generic: true },
  { key: "cup", families: ["cidre", "cocktail"], generic: true },
  { key: "bar", families: ["cocktail", "biere"], generic: true },
  { key: "tavern", families: ["biere"], generic: true },
  { key: "confectionery", families: [], generic: true },
];

/** Teinte (0-360) d'une couleur hexadécimale. */
function hexHue(hex: string): number | null {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return null;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

/** Proximité chromatique entre la boisson et la photo (0 → 1). */
export function colorFit(drink: Drink, colors?: ColorSamples): number {
  if (!colors || colors.saturation < 0.12) return 0.45;
  const h = hexHue(drink.colorLight);
  if (h == null) return 0.35; // boisson quasi incolore (vodka, gin…)
  const raw = Math.abs(h - colors.hue);
  const dist = Math.min(raw, 360 - raw); // distance circulaire
  const hueScore = Math.max(0, 1 - dist / 110);
  // une vodka très claire ne colle pas à une photo très saturée
  const lum = colorLuminance(drink.colorLight);
  const satPenalty = Math.abs(colors.saturation - (lum > 0.7 ? 0.25 : 0.65));
  return Math.max(0, Math.min(1, hueScore * 0.8 + (1 - satPenalty) * 0.2));
}

function colorLuminance(hex: string): number {
  const v = hex.replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Construit les candidats à partir des classes ImageNet : familles détectées
 * + teinte mesurée, puis classement des boissons du catalogue.
 */
export function candidatesFromImagenet(
  predictions: { className: string; probability: number }[],
  colors?: ColorSamples,
  learned: Record<string, number> = {}
): ScanCandidate[] {
  const families = new Set<Category>();
  let genericOnly = true;
  for (const p of predictions) {
    const cls = p.className.toLowerCase();
    for (const hint of IMAGENET_FAMILY_HINTS) {
      if (!cls.includes(hint.key)) continue;
      hint.families.forEach((f) => families.add(f));
      if (!hint.generic) genericOnly = false;
    }
  }
  const colorFamily = colors ? guessFamilyFromColors(colors) : null;
  if (colorFamily) {
    families.add(colorFamily);
    genericOnly = false;
  }

  const pool = DRINKS.filter((d) => d.abv > 0);
  const scored = pool
    .map((drink) => {
      const familyBonus = families.size === 0 ? 0.1 : families.has(drink.category) ? 0.6 : 0;
      const fit = colorFit(drink, colors);
      const prior = POPULAR_PRIOR[drink.id] ?? 0;
      const habit = Math.min(0.12, (learned[drink.id] ?? 0) * 0.02);
      return { drink, score: familyBonus + fit * 0.4 + prior + habit };
    })
    .sort((a, b) => b.score - a.score);

  const out: ScanCandidate[] = [];
  const seen = new Set<string>();
  const max = scored[0]?.score ?? 1;
  for (const { drink, score } of scored) {
    if (seen.has(drink.category + drink.glass)) continue;
    seen.add(drink.category + drink.glass);
    out.push({
      drink,
      // score relatif (0 → 1), volontairement plafonné : MobileNet ne sait pas
      // distinguer un mojito d'une pinte, la confiance reste donc modérée.
      confidence: Math.max(0.22, Math.min(0.82, (score / (max || 1)) * 0.82)),
      volumeCl: drink.volumeCl,
      clues: [
        families.has(drink.category) ? `famille ${drink.category} détectée` : "aucune famille détectée",
        `teinte ${Math.round(colorFit(drink, colors) * 100)} % compatible`,
      ],
    });
    if (out.length === 3) break;
  }
  void genericOnly;
  return out;
}

/** Légère préférence pour les boissons les plus servies, pour départager les familles. */
const POPULAR_PRIOR: Record<string, number> = {
  "vin-rouge": 0.08,
  "vin-blanc": 0.07,
  "biere-pinte": 0.07,
  "biere-pression": 0.06,
  champagne: 0.06,
  mojito: 0.05,
  spritz: 0.05,
  "gin-tonic": 0.03,
  whisky: 0.03,
  cidre: 0.03,
};

/** Classes ImageNet qui parlent de verres, de boissons ou de bar. */
const IMAGENET_BEVERAGE_KEYS = [
  "wine bottle",
  "beer bottle",
  "beer glass",
  "wine glass",
  "goblet",
  "cocktail shaker",
  "eggnog",
  "red wine",
  "white wine",
  "punch",
  "coffee mug",
  "cup",
  "espresso",
  "water bottle",
  "pop bottle",
  "pitcher",
  "vase",
  "bar",
  "tavern",
  "beer",
  "liquor",
  "whiskey",
  "goblet",
];

export async function runTensorFlow(
  prepared: PreparedImage,
  colors: ColorSamples | undefined,
  onProgress?: (p: TfProgress) => void
): Promise<EngineOutput> {
  const started = performance.now();
  const warnings: string[] = [];
  const model = await loadMobileNet(onProgress);
  onProgress?.({ status: "running", detail: "Classification de l'image…" });

  const predictions = await model.classify(prepared.canvas, 6);
  const raw = predictions.map((p) => ({ label: p.className, score: p.probability }));

  // Indice de confiance : les classes « verre / boisson » de l'image ?
  const beverageHits = predictions.filter((p) =>
    IMAGENET_BEVERAGE_KEYS.some((k) => p.className.toLowerCase().includes(k))
  );
  const glassSignal = Math.min(
    1,
    beverageHits.reduce((s, p) => s + p.probability, 0) * 1.6
  );

  // MobileNet ne connaît pas les boissons : on croise les familles détectées
  // (classe ImageNet) avec la teinte mesurée localement.
  const topClass = predictions[0]?.className ?? "";
  let candidates = candidatesFromImagenet(predictions, colors);
  if (candidates.length === 0) candidates = heuristicCandidates(colors);

  // Le classifieur ne sait pas distinguer un cola d'une bière : si aucun signal
  // « verre » n'est détecté, on signale la faible fiabilité.
  if (glassSignal < 0.12) {
    warnings.push(
      "Le modèle ne détecte pas clairement de verre sur cette photo : vérifiez la proposition."
    );
  }

  // La confiance finale combine le classement relatif et la certitude
  // que l'image contient bien un verre / une boisson.
  const detection = Math.max(0.35, Math.min(1, 0.45 + glassSignal * 0.6));
  candidates = candidates.map((c, i) => ({
    ...c,
    confidence: Math.max(0.15, Math.min(0.88, c.confidence * detection - i * 0.03)),
    clues: [
      `${((predictions[0]?.probability ?? 0) * 100).toFixed(0)} % « ${shortClass(topClass)} »`,
      ...c.clues.slice(1),
    ],
  }));

  if (beverageHits.length === 0) {
    warnings.push(
      "Aucune classe de verre ni de boisson reconnue : la proposition repose surtout sur la couleur."
    );
  }

  onProgress?.({ status: "ready" });

  return {
    engine: "tensorflow",
    engineLabel: ENGINE_LABELS.tensorflow,
    candidates,
    signals: [
      {
        label: "Classe la plus probable",
        detail: `${shortClass(topClass)} · ${((predictions[0]?.probability ?? 0) * 100).toFixed(0)} %`,
        weight: predictions[0]?.probability ?? 0,
      },
      {
        label: "Indice « verre / boisson »",
        detail: beverageHits.length
          ? beverageHits.map((h) => shortClass(h.className)).slice(0, 3).join(", ")
          : "aucune classe de verre détectée",
        weight: glassSignal,
      },
      {
        label: "Teinte mesurée",
        detail: colors
          ? `teinte ${Math.round(colors.hue)}° · saturation ${Math.round(colors.saturation * 100)} %`
          : "non disponible",
        weight: colors ? 0.5 : 0,
      },
    ],
    warnings,
    elapsedMs: Math.round(performance.now() - started),
    raw,
  };
}

function shortClass(c: string): string {
  return (c || "inconnu").split(",")[0].slice(0, 42);
}

/* ------------------------------------------------------------------ */
/* Moteur 3 — API vision                                              */
/* ------------------------------------------------------------------ */

const DRINK_IDS = DRINKS.filter((d) => d.abv > 0).map((d) => d.id);

export function buildVisionPrompt(): string {
  return [
    "Tu analyses la photo d'un verre dans un contexte de soirée (bar, restaurant, maison).",
    "Ta mission : identifier la boisson alcoolisée la plus probable, dans la liste fermée fournie.",
    "",
    "Règles :",
    "- Choisis uniquement des identifiants de la liste, jamais d'invention.",
    "- Si plusieurs boissons sont plausibles, classe-les par probabilité décroissante.",
    "- Estime le volume réellement présent dans le verre, en centilitres.",
    "- Estime le degré d'alcool typique de la boisson identifiée.",
    "- Si aucun verre ou aucune boisson alcoolisée n'est visible, renvoie une liste vide.",
    "",
    `Identifiants autorisés : ${DRINK_IDS.join(", ")}.`,
    "",
    "Réponds STRICTEMENT en JSON, sans texte autour, au format :",
    '{"drinks":[{"id":"vin-rouge","confidence":0.0,"volume_cl":0,"abv":0}],',
    ' "glass_shape":"wine|flute|tumbler|pint|highball|cocktail|shot|coupe|mug|unknown",',
    ' "description":"courte description factuelle de ce que tu vois",',
    ' "notes":"incertitudes éventuelles"}',
  ].join("\n");
}

export type ApiResult = {
  drinks: { id: string; confidence: number; volume_cl?: number; abv?: number }[];
  glass_shape?: string;
  description?: string;
  notes?: string;
};

function clamp01(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n > 1 ? n / 100 : n));
}

/** Parse tolérant : accepte du JSON brut, du JSON dans des backticks, ou du texte. */
export function parseVisionResponse(text: string): ApiResult | null {
  const cleaned = text
    .replace(/^```(?:json)?/gim, "")
    .replace(/```$/gim, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    const parsed = JSON.parse(slice) as ApiResult;
    if (parsed && Array.isArray(parsed.drinks)) {
      return {
        ...parsed,
        drinks: parsed.drinks
          .filter((d) => d && typeof d.id === "string")
          .map((d) => ({
            id: String(d.id),
            confidence: clamp01(d.confidence),
            volume_cl: d.volume_cl == null ? undefined : Math.max(1, Math.min(150, Number(d.volume_cl))),
            abv: d.abv == null ? undefined : Math.max(0, Math.min(80, Number(d.abv))),
          })),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function callGemini(
  cfg: EngineConfig,
  prepared: PreparedImage,
  signal: AbortSignal
): Promise<string> {
  const base = cfg.api.baseUrl || PROVIDER_DEFAULT_URL.gemini;
  const url = `${base.replace(/\/$/, "")}/models/${encodeURIComponent(cfg.api.model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": cfg.api.apiKey },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: buildVisionPrompt() },
            { inlineData: { mimeType: prepared.mime, data: prepared.base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 700, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(await describeError(res));
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

async function callOpenAiCompatible(
  cfg: EngineConfig,
  prepared: PreparedImage,
  signal: AbortSignal
): Promise<string> {
  const base = cfg.api.baseUrl || PROVIDER_DEFAULT_URL[cfg.api.provider];
  const url = `${base.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.api.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.api.model,
      temperature: 0.1,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildVisionPrompt() },
            { type: "image_url", image_url: { url: prepared.dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(await describeError(res));
  const json = (await res.json()) as {
    choices?: { message?: { content?: string | { text?: string }[] } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((c) => c.text ?? "").join("");
  return "";
}

async function describeError(res: Response): Promise<string> {
  let detail = "";
  try {
    const body = (await res.json()) as { error?: { message?: string; status?: string }; message?: string };
    detail = body.error?.message || body.message || body.error?.status || "";
  } catch {
    /* ignore */
  }
  const hint =
    res.status === 401 || res.status === 403
      ? "clé refusée"
      : res.status === 429
      ? "quota dépassé"
      : res.status === 404
      ? "modèle ou URL introuvable"
      : res.status === 400
      ? "requête refusée par l'API"
      : "échec de l'appel";
  return `HTTP ${res.status} — ${hint}${detail ? ` · ${detail.slice(0, 160)}` : ""}`;
}

export async function runApiEngine(
  cfg: EngineConfig,
  prepared: PreparedImage,
  opts: { timeoutMs?: number } = {}
): Promise<EngineOutput> {
  const started = performance.now();
  if (!cfg.api.apiKey) throw new Error("Aucune clé API renseignée.");
  if (!cfg.api.model) throw new Error("Aucun modèle renseigné.");

  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 25_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const text =
      cfg.api.provider === "gemini"
        ? await callGemini(cfg, prepared, controller.signal)
        : await callOpenAiCompatible(cfg, prepared, controller.signal);

    const parsed = parseVisionResponse(text);
    if (!parsed) {
      throw new Error("Réponse du modèle illisible (JSON attendu).");
    }

    const candidates: ScanCandidate[] = [];
    const seen = new Set<string>();
    for (const d of parsed.drinks) {
      const drink = DRINKS.find((x) => x.id === d.id);
      if (!drink || seen.has(drink.id)) continue;
      seen.add(drink.id);
      candidates.push({
        drink,
        confidence: Math.max(0.2, d.confidence),
        volumeCl: d.volume_cl ?? drink.volumeCl,
        clues: [
          `${PROVIDER_LABELS[cfg.api.provider]} ${Math.round(d.confidence * 100)} %`,
          d.abv ? `≈ ${String(d.abv).replace(".", ",")}°` : `degré ${String(drink.abv).replace(".", ",")}°`,
          parsed.glass_shape && parsed.glass_shape !== "unknown" ? `verre ${parsed.glass_shape}` : `volume ${d.volume_cl ?? drink.volumeCl} cl`,
        ],
      });
      if (candidates.length === 3) break;
    }

    const warnings: string[] = [];

    // Le modèle peut renvoyer une description sans identifiant exploitable :
    // on tente alors un mapping texte → catalogue.
    if (candidates.length === 0 && parsed.description) {
      for (const c of mapTextToCandidates(parsed.description, 0.45)) {
        if (!candidates.some((x) => x.drink.id === c.drink.id)) candidates.push(c);
        if (candidates.length >= 3) break;
      }
      if (candidates.length > 0) {
        warnings.push("Réponse libre du modèle : boissons déduites de sa description, à vérifier.");
      }
    }

    if (candidates.length === 0) {
      warnings.push(
        "Le modèle n'a pas reconnu de boisson alcoolisée sur cette photo. Choisissez la boisson à la main."
      );
    }
    if (parsed.notes) warnings.push(parsed.notes);
    if (candidates[0] && candidates[0].confidence < 0.45) {
      warnings.push("Confiance faible du modèle : vérifiez attentivement la proposition.");
    }

    return {
      engine: "api",
      engineLabel: `${PROVIDER_LABELS[cfg.api.provider]} · ${cfg.api.model}`,
      candidates: candidates.length ? candidates : [fallbackCandidate()],
      signals: candidates[0]
        ? [
            {
              label: "Boisson reconnue",
              detail: parsed.description || candidates[0].drink.name,
              weight: candidates[0].confidence,
            },
            {
              label: "Forme de verre",
              detail: parsed.glass_shape || "inconnue",
              weight: parsed.glass_shape && parsed.glass_shape !== "unknown" ? 0.7 : 0.2,
            },
          ]
        : [],
      warnings,
      elapsedMs: Math.round(performance.now() - started),
      raw: parsed.description,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        `Délai dépassé (${Math.round(timeoutMs / 1000)} s) — le fournisseur n'a pas répondu.`
      );
    }
    if (err instanceof TypeError) {
      throw new Error(
        "Réseau injoignable ou CORS bloqué : vérifiez la connexion et l'URL de base."
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function fallbackCandidate(): ScanCandidate {
  const d = DRINKS[0];
  return { drink: d, confidence: 0.2, volumeCl: d.volumeCl, clues: ["aucune correspondance", "à confirmer"] };
}

/* ------------------------------------------------------------------ */
/* Heuristique locale (moteur par défaut)                              */
/* ------------------------------------------------------------------ */

function guessFamilyFromColors(c: ColorSamples): Category | null {
  if (c.saturation < 0.08) return null;
  if (c.hue >= 320 || c.hue < 12) return "vin";
  if (c.hue >= 12 && c.hue < 32) {
    if (c.saturation > 0.62 && c.brightness < 0.42) return "spiritueux";
    if (c.saturation < 0.32 && c.brightness > 0.6) return "effervescent";
    return "biere";
  }
  if (c.hue >= 32 && c.hue < 62) {
    if (c.brightness > 0.62 && c.saturation < 0.5) return "effervescent";
    return c.saturation > 0.55 && c.brightness < 0.4 ? "spiritueux" : "biere";
  }
  return "cocktail";
}

export function heuristicCandidates(colors?: ColorSamples): ScanCandidate[] {
  const family = colors ? guessFamilyFromColors(colors) : null;
  const seed = colors
    ? Math.floor(colors.hue * 977 + colors.saturation * 3313 + colors.brightness * 97)
    : 42;
  return identifyFromPhoto(seed, family);
}

/* ------------------------------------------------------------------ */
/* Analyse chromatique partagée                                       */
/* ------------------------------------------------------------------ */

/**
 * Mesure la teinte dominante, la saturation, la luminosité et le niveau
 * de remplissage perçu à partir des pixels de l'image.
 */
export function sampleColors(source: CanvasImageSource, size = 72): ColorSamples {
  const fallback: ColorSamples = { hue: 0, saturation: 0, brightness: 0.5, fillPct: 0.6 };
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallback;
  try {
    ctx.drawImage(source, 0, 0, size, size);
  } catch {
    return fallback;
  }
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return fallback;
  }

  let rSum = 0, gSum = 0, bSum = 0, satSum = 0, n = 0, bottomMass = 0, topMass = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      // on ignore les pixels quasi blancs (fond, reflets) pour la teinte
      if (sat > 0.18 && max > 0.18) {
        rSum += r; gSum += g; bSum += b; satSum += sat; n++;
        if (y > size * 0.45) bottomMass += sat;
        else topMass += sat;
      }
    }
  }

  let hue = 0, saturation = 0, brightness = 0.5;
  if (n > 12) {
    const r = rSum / n, g = gSum / n, b = bSum / n;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (d !== 0) {
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
    }
    saturation = satSum / n;
    brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 0.5 + 0.35;
  }
  const fillPct = Math.max(0.35, Math.min(0.95, 0.45 + (bottomMass / (topMass + bottomMass + 0.0001)) * 0.5));
  return { hue, saturation, brightness, fillPct };
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                      */
/* ------------------------------------------------------------------ */

export type RecognizeOptions = {
  config: EngineConfig;
  /** identifiant de boisson connu (photos de démonstration) */
  hintDrinkId?: string;
  /** historique personnel : boisson → nombre de verres */
  learned?: Record<string, number>;
  onProgress?: (p: TfProgress) => void;
};

/**
 * Point d'entrée unique : choisit le moteur, prépare l'image, mesure les couleurs
 * et retombe proprement sur l'heuristique si le moteur choisi échoue.
 */
export async function recognize(
  photo: string,
  opts: RecognizeOptions
): Promise<EngineOutput & { colors: ColorSamples }> {
  const started = performance.now();
  const warnings: string[] = [];

  let prepared: PreparedImage | null = null;
  let colors: ColorSamples = { hue: 0, saturation: 0, brightness: 0.5, fillPct: 0.6 };
  try {
    prepared = await prepareImage(photo);
    colors = sampleColors(prepared.canvas);
  } catch {
    warnings.push("Image illisible : le calcul repose sur l'estimation par défaut.");
  }

  const finish = (out: EngineOutput): EngineOutput & { colors: ColorSamples } => ({
    ...out,
    warnings: [...warnings, ...out.warnings],
    elapsedMs: out.elapsedMs ?? Math.round(performance.now() - started),
    colors,
  });

  const heuristicOutput = (): EngineOutput => {
    const candidates = identifyFromPhoto(
      Math.floor(colors.hue * 977 + colors.saturation * 3313 + colors.brightness * 97),
      guessFamilyFromColors(colors),
      opts.hintDrinkId,
      opts.learned ?? {}
    );
    return {
      engine: "heuristique",
      engineLabel: ENGINE_LABELS.heuristique,
      candidates: candidates.map((c) => ({
        ...c,
        clues: [
          `teinte ${Math.round(colors.hue)}° · saturation ${Math.round(colors.saturation * 100)} %`,
          ...c.clues.slice(1),
        ],
      })),
      signals: [
        { label: "Teinte dominante", detail: `${Math.round(colors.hue)}°`, weight: 0.6 },
        { label: "Saturation", detail: `${Math.round(colors.saturation * 100)} %`, weight: colors.saturation },
        { label: "Remplissage perçu", detail: `${Math.round(colors.fillPct * 100)} %`, weight: colors.fillPct },
      ],
      warnings: [],
    };
  };

  if (opts.config.engine === "heuristique" || !prepared) {
    return finish(heuristicOutput());
  }

  try {
    if (opts.config.engine === "tensorflow") {
      if (!hasWebGL()) {
        warnings.push("WebGL indisponible : TensorFlow.js utilise le CPU, l'analyse sera plus lente.");
      }
      return finish(await runTensorFlow(prepared, colors, opts.onProgress));
    }
    return finish(await runApiEngine(opts.config, prepared));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return finish({
      ...heuristicOutput(),
      fellBack: true,
      warnings: [
        `${ENGINE_LABELS[opts.config.engine]} indisponible : ${message}`,
        "Repli sur l'analyse locale des couleurs.",
      ],
    });
  }
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(
      c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}
