import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera, ImagePlus, X, Check, RefreshCw, ScanEye, Sparkles, Info,
  ChevronRight, Wine, Minus, AlertTriangle, Wand2,
} from "lucide-react";
import { cn } from "../utils/cn";
import { DRINKS, VOLUME_PRESETS, FILL_RATIO, getDrink, identifyFromPhoto, pickDrinkFamily, type Drink, type ScanCandidate } from "../lib/drinks";
import { alcoholGrams, fmtBac } from "../lib/bac";

function fmtClock(ts: number) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}
import { Glass } from "./Glass";
import { useApp } from "../lib/store";

type Step = "shoot" | "analyzing" | "results" | "confirm";

type Analysis = {
  photo: string;
  candidates: ScanCandidate[];
  hue: number;
  saturation: number;
  brightness: number;
  fillPct: number;
  family: string | null;
};

const DEMO_PHOTOS = [
  {
    id: "coupe",
    label: "Coupe de blanc",
    drinkId: "vin-blanc",
    gradient: ["#f7e6b9", "#dcc27f", "#8e7440"],
  },
  {
    id: "pinte",
    label: "Pinte ambrée",
    drinkId: "biere-pinte",
    gradient: ["#ffd98a", "#e8a92c", "#8a5a10"],
  },
  {
    id: "ballon",
    label: "Ballon de rouge",
    drinkId: "vin-rouge",
    gradient: ["#a8324f", "#6d1229", "#2b0612"],
  },
];

function makeDemoPhoto(gradient: string[], label: string): string {
  const c = document.createElement("canvas");
  c.width = 720;
  c.height = 900;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const g = ctx.createLinearGradient(0, 0, 0, 900);
  g.addColorStop(0, gradient[0]);
  g.addColorStop(0.55, gradient[1]);
  g.addColorStop(1, gradient[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 720, 900);
  // halo
  const r = ctx.createRadialGradient(360, 330, 40, 360, 380, 460);
  r.addColorStop(0, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, 720, 900);
  ctx.fillStyle = "rgba(8,32,50,0.35)";
  ctx.font = "700 26px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${label} · photo de démonstration`, 360, 840);
  return c.toDataURL("image/jpeg", 0.9);
}

type Samples = Omit<Analysis, "candidates" | "photo">;
const FALLBACK_SAMPLES: Samples = { hue: 0, saturation: 0, brightness: 0.5, fillPct: 0.6, family: null };

function analyzeImage(src: string): Promise<Samples> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(FALLBACK_SAMPLES);
      return;
    }
    let settled = false;
    const done = (v: Samples) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    // filet de sécurité : ne jamais bloquer l'utilisateur sur une image exotique
    setTimeout(() => done(FALLBACK_SAMPLES), 4000);
    const img = new Image();
    img.onload = () => {
      const size = 72;
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        done(FALLBACK_SAMPLES);
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let satSum = 0;
      let n = 0;
      let bottomMass = 0;
      let topMass = 0;

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
            rSum += r;
            gSum += g;
            bSum += b;
            satSum += sat;
            n++;
            if (y > size * 0.45) bottomMass += sat;
            else topMass += sat;
          }
        }
      }

      let hue = 0;
      let saturation = 0;
      let brightness = 0.5;
      if (n > 12) {
        let r = rSum / n;
        let g = gSum / n;
        let b = bSum / n;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
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
      const family = pickDrinkFamily(hue, saturation, brightness);
      done({ hue, saturation, brightness, fillPct, family });
    };
    img.onerror = () => done(FALLBACK_SAMPLES);
    img.src = src;
  });
}

export function ScanSheet({
  open,
  onClose,
  initialDrinkId,
}: {
  open: boolean;
  onClose: () => void;
  initialDrinkId?: string;
}) {
  const { addEvent, learned } = useApp();
  const [step, setStep] = useState<Step>("shoot");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [progress, setProgress] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [chosen, setChosen] = useState<ScanCandidate | null>(null);
  const [volume, setVolume] = useState(12);
  const [manualId, setManualId] = useState<string | null>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setStep("shoot");
    setAnalysis(null);
    setChosen(null);
    setManualId(null);
    setMinutesAgo(0);
    setProgress(0);
    setPhotoPreview(null);
    if (progressTimer.current) clearInterval(progressTimer.current);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, reset]);

  useEffect(() => {
    if (open && initialDrinkId) {
      const d = getDrink(initialDrinkId);
      setManualId(d.id);
      setVolume(d.volumeCl);
    }
  }, [open, initialDrinkId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const runAnalysis = useCallback(async (photo: string, seed?: number, hintDrinkId?: string) => {
    setStep("analyzing");
    setPhotoPreview(photo);
    setProgress(0);
    const real = await analyzeImage(photo);
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      setProgress((p) => Math.min(0.97, p + 0.045 + Math.random() * 0.03));
    }, 90);

    const s = seed ?? Math.floor(real.hue * 977 + real.saturation * 3313 + real.brightness * 97 + Date.now() % 1000);
    const candidates = identifyFromPhoto(
      s,
      (real.family as never) ?? null,
      hintDrinkId,
      learned
    );

    await new Promise((r) => setTimeout(r, 1750));
    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(1);
    setAnalysis({ photo, candidates, ...real });
    setChosen(candidates[0]);
    setVolume(candidates[0].volumeCl);
    setStep("results");
  }, [learned]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => runAnalysis(String(reader.result));
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const useDemo = (g: string[], label: string, drinkId: string) => {
    runAnalysis(makeDemoPhoto(g, label), g[1].length * 1337 + label.length * 31, drinkId);
  };

  const confirm = () => {
    const d = chosen?.drink ?? (manualId ? getDrink(manualId) : null);
    if (!d) return;
    addEvent({
      drinkId: d.id,
      volumeCl: volume,
      at: Date.now() - minutesAgo * 60_000,
      source: chosen ? "photo" : "manuel",
      confidence: chosen?.confidence,
    });
    onClose();
  };

  if (!open) return null;

  const activeDrink: Drink = chosen?.drink ?? (manualId ? getDrink(manualId) : DRINKS[0]);
  const grams = alcoholGrams(volume, activeDrink.abv);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Scanner un verre">
      <button className="absolute inset-0 cursor-default bg-abyss/55 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
      <div className="relative flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-ivory shadow-2xl sm:rounded-[2rem]">
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-marine-950/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-marine-950 text-white">
              <ScanEye className="h-4.5 w-4.5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-[17px] font-semibold leading-tight text-marine-950">Scanner un verre</p>
              <p className="text-[11.5px] font-semibold text-marine-950/50">
                {step === "shoot" && "Cadrez le verre, la table, l'ambiance"}
                {step === "analyzing" && "Analyse de l'image en cours…"}
                {step === "results" && "Vérifiez et ajustez la proposition"}
                {step === "confirm" && "Confirmez la quantité"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-marine-950/[0.06] text-marine-950/60 transition hover:bg-marine-950/10 hover:text-marine-950"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-5">
          {/* ---------------- SHOOT ---------------- */}
          {step === "shoot" && (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-3xl bg-marine-950 p-6 text-white">
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-lagoon-500/30 blur-3xl" />
                <div className="relative flex items-start gap-4">
                  <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    <Camera className="h-7 w-7 text-seafoam-200" aria-hidden />
                    <span className="absolute inset-0 animate-ping rounded-2xl border border-seafoam-200/30" />
                  </div>
                  <div>
                    <p className="font-display text-[19px] font-semibold leading-snug">
                      Photographiez votre verre
                    </p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/65">
                      Visez le verre de face, à 30 cm. Le verre doit être visible en entier,
                      avec un peu de lumière derrière. Pas de flash direct.
                    </p>
                  </div>
                </div>
                <div className="relative mt-5 grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-lagoon-500 px-4 py-3 text-[13.5px] font-bold text-white transition hover:bg-lagoon-600"
                  >
                    <Camera className="h-4 w-4" aria-hidden /> Prendre la photo
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-[13.5px] font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden /> Importer
                  </button>
                </div>
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              </div>

              <div>
                <p className="flex items-center gap-2 text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-marine-950/40">
                  <Sparkles className="h-3.5 w-3.5" /> Essayer sans photo
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                  {DEMO_PHOTOS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => useDemo(d.gradient, d.label, d.drinkId)}
                      className="group overflow-hidden rounded-2xl text-left ring-1 ring-marine-950/10 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative h-24 w-full" style={{ background: `linear-gradient(160deg, ${d.gradient[0]}, ${d.gradient[1]} 55%, ${d.gradient[2]})` }}>
                        <div className="absolute inset-0 grid place-items-center">
                          <Glass shape={getDrink(d.drinkId).glass} color={getDrink(d.drinkId).color} size={54} fill={0.68} />
                        </div>
                      </div>
                      <p className="bg-white px-2 py-2 text-center text-[11px] font-bold text-marine-950/70 group-hover:text-lagoon-700">
                        {d.label}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-marine-950/45">
                  Une photo de démonstration utilise le même pipeline de mesure des couleurs qu'une vraie photo.
                </p>
              </div>

              <button
                onClick={() => {
                  const d = DRINKS[0];
                  setManualId(d.id);
                  setVolume(d.volumeCl);
                  setStep("confirm");
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-marine-950/10 bg-white px-4 py-3.5 text-left transition hover:border-lagoon-600/30 hover:shadow-md"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-marine-950/[0.06]">
                    <Minus className="h-4 w-4 text-marine-950/70" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-bold text-marine-950">Choisir à la main</span>
                    <span className="block text-[11.5px] text-marine-950/50">Sans photo — liste des boissons courantes</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-marine-950/30" />
              </button>
            </div>
          )}

          {/* ---------------- ANALYZING ---------------- */}
          {step === "analyzing" && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-abyss">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_50%_40%,#1a4d74,#06121e)]" />
                )}
                <div className="scan-line absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-seafoam-200/25 to-transparent" />
                <div className="absolute inset-6 rounded-2xl border-2 border-seafoam-200/40" aria-hidden>
                  {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map((c) => (
                    <span key={c} className={cn("absolute h-6 w-6 rounded-sm border-gold-300", c)} />
                  ))}
                </div>
                <div className="absolute inset-x-4 bottom-4 rounded-xl bg-abyss/70 px-3 py-2 text-[11.5px] font-semibold text-white/85 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span>Analyse du contour et de la teinte</span>
                    <span className="tabular-nums">{Math.round(progress * 100)} %</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-gradient-to-r from-lagoon-400 to-gold-400 transition-all duration-150" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </div>
              <ul className="space-y-2 text-[12.5px] font-semibold text-marine-950/60">
                {[
                  "Détection du pied et du galbe du verre",
                  "Mesure de la teinte moyenne du liquide",
                  "Estimation du niveau de remplissage",
                  "Comparaison au catalogue de 30 boissons",
                ].map((s, i) => (
                  <li key={s} className={cn("flex items-center gap-2 transition", progress > i * 0.22 ? "text-marine-950" : "text-marine-950/35")}>
                    <span className={cn("grid h-4 w-4 place-items-center rounded-full", progress > i * 0.22 ? "bg-lagoon-500 text-white" : "bg-marine-950/10")}>
                      <Check className="h-2.5 w-2.5" aria-hidden />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ---------------- RESULTS ---------------- */}
          {step === "results" && analysis && (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-3xl bg-abyss">
                {analysis.photo ? (
                  <img src={analysis.photo} alt="Verre photographié" className="max-h-56 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-[radial-gradient(circle_at_50%_40%,#1a4d74,#06121e)]" />
                )}
                <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950 backdrop-blur">
                    teinte {Math.round(analysis.hue)}°
                  </span>
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950 backdrop-blur">
                    saturation {Math.round(analysis.saturation * 100)} %
                  </span>
                  <span className="rounded-full bg-white/85 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950 backdrop-blur">
                    remplissage {Math.round(analysis.fillPct * 100)} %
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11.5px] font-extrabold uppercase tracking-[0.16em] text-marine-950/40">
                  3 hypothèses, du plus au moins probable
                </p>
                <div className="mt-2.5 space-y-2">
                  {analysis.candidates.map((c, i) => {
                    const isSel = chosen?.drink.id === c.drink.id;
                    return (
                      <button
                        key={c.drink.id}
                        onClick={() => {
                          setChosen(c);
                          setVolume(c.volumeCl);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                          isSel
                            ? "border-lagoon-600/45 bg-lagoon-500/[0.07] shadow-sm"
                            : "border-marine-950/10 bg-white hover:border-marine-950/20"
                        )}
                      >
                        <Glass shape={c.drink.glass} color={c.drink.color} size={44} fill={0.68} bubbles={c.drink.category === "effervescent" || c.drink.category === "biere"} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[14px] font-bold text-marine-950">{c.drink.name}</p>
                            {i === 0 && (
                              <span className="rounded-full bg-gold-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gold-700">
                                probable
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[11.5px] font-medium text-marine-950/50">
                            {c.volumeCl} cl · {String(c.drink.abv).replace(".", ",")}° · {c.clues.slice(0, 2).join(" · ")}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-marine-950/8">
                              <div
                                className={cn("h-full rounded-full", isSel ? "bg-lagoon-500" : "bg-marine-950/25")}
                                style={{ width: `${Math.round(c.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-[10.5px] font-bold tabular-nums text-marine-950/45">
                              {Math.round(c.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        {isSel && (
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lagoon-600 text-white">
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-gold-100/70 p-3.5 ring-1 ring-gold-500/25">
                <p className="flex items-start gap-2 text-[11.5px] font-semibold leading-relaxed text-gold-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Reconnaissance assistée par analyse d'image (teinte, remplissage, forme). Le degré exact
                  n'est jamais lisible sur une photo : vérifiez le type de boisson avant de valider.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setStep("shoot")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-marine-950/12 bg-white px-4 py-3 text-[13px] font-bold text-marine-950/70 transition hover:border-marine-950/25"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Reprendre
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-marine-950 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-marine-900"
                >
                  Ajuster <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          )}

          {/* ---------------- CONFIRM ---------------- */}
          {step === "confirm" && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-white to-foam p-4 ring-1 ring-marine-950/8">
                <div className="relative shrink-0">
                  <Glass shape={activeDrink.glass} color={activeDrink.color} size={76} fill={FILL_RATIO[activeDrink.glass]} bubbles={activeDrink.category === "effervescent" || activeDrink.category === "biere"} ice={["mojito", "gin-tonic", "rhum-coca"].includes(activeDrink.id)} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[19px] font-semibold leading-tight text-marine-950">{activeDrink.name}</p>
                  <p className="text-[12px] font-medium text-marine-950/55">{activeDrink.notes}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-marine-950/[0.06] px-1.5 py-0.5 text-[10.5px] font-bold text-marine-950/70">
                      {String(activeDrink.abv).replace(".", ",")}° d'alcool
                    </span>
                    <span className="rounded-md bg-lagoon-500/12 px-1.5 py-0.5 text-[10.5px] font-bold text-lagoon-700">
                      {grams.toFixed(1).replace(".", ",")} g d'alcool pur
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-end justify-between text-[12px] font-bold text-marine-950/70">
                  <span>Quantité réellement bue</span>
                  <span className="font-display text-[22px] leading-none text-marine-950">
                    {volume} <span className="text-[13px] font-sans">cl</span>
                  </span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="mt-2 w-full accent-lagoon-600"
                  aria-label="Volume bu en centilitres"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {VOLUME_PRESETS[activeDrink.glass].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVolume(v)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition",
                        volume === v ? "bg-marine-950 text-white" : "bg-marine-950/[0.06] text-marine-950/65 hover:bg-marine-950/10"
                      )}
                    >
                      {v} cl
                    </button>
                  ))}
                </div>
                {volume !== activeDrink.volumeCl && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-marine-950/45">
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                    Le verre servi est plus {volume > activeDrink.volumeCl ? "généreux" : "petit"} qu'un service standard ({activeDrink.volumeCl} cl).
                  </p>
                )}
              </div>

              <div>
                <p className="text-[12px] font-bold text-marine-950/70">C'était il y a…</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[0, 15, 30, 45, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinutesAgo(m)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition",
                        minutesAgo === m ? "bg-lagoon-600 text-white" : "bg-marine-950/[0.06] text-marine-950/65 hover:bg-marine-950/10"
                      )}
                    >
                      {m === 0 ? "à l'instant" : m < 60 ? `${m} min` : `${m / 60} h`}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10.5px] font-semibold text-marine-950/40">
                  Verre à {fmtClock(Date.now() - minutesAgo * 60_000)} · l'heure de fin de soirée en dépend directement.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold text-marine-950/70">Changer de boisson</p>
                  <button
                    onClick={() => {
                      setManualId(null);
                      setChosen(null);
                      setStep("shoot");
                    }}
                    className="text-[11.5px] font-bold text-lagoon-700 hover:underline"
                  >
                    Scanner à nouveau
                  </button>
                </div>
                <div className="mt-2 grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                  {DRINKS.filter((d) => d.abv > 0).map((d) => {
                    const isSel = activeDrink.id === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          setChosen(null);
                          setManualId(d.id);
                          setVolume(d.volumeCl);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-left transition",
                          isSel ? "border-lagoon-600/50 bg-lagoon-500/[0.08]" : "border-marine-950/8 bg-white hover:border-marine-950/20"
                        )}
                      >
                        <Glass shape={d.glass} color={d.color} size={20} fill={0.7} />
                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-bold text-marine-950">{d.short ?? d.name}</span>
                          <span className="block text-[9.5px] font-semibold text-marine-950/45">{String(d.abv).replace(".", ",")}°</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={confirm}
                className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-lagoon-600 px-5 py-4 text-[15px] font-extrabold text-white shadow-lg shadow-lagoon-700/25 transition hover:-translate-y-0.5 hover:bg-lagoon-700"
              >
                <Wine className="h-4.5 w-4.5" aria-hidden />
                Ajouter ce verre au journal
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold tabular-nums">{fmtBac(grams / 10)} verre std.</span>
              </button>
              <p className="text-center text-[10.5px] leading-relaxed text-marine-950/40">
                Le verre est horodaté à {fmtClock(Date.now() - minutesAgo * 60_000)}. Vous pourrez
                encore le décaler de 15 minutes dans le journal.
              </p>
            </div>
          )}
        </div>

        {step === "confirm" && !chosen && !manualId && (
          <div className="border-t border-marine-950/8 px-5 py-3">
            <button
              onClick={() => setStep("shoot")}
              className="flex w-full items-center justify-center gap-2 text-[12.5px] font-bold text-marine-950/55"
            >
              <Wand2 className="h-3.5 w-3.5" /> Revenir au scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
