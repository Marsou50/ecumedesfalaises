import { useEffect, useState } from "react";
import {
  X, Check, Cpu, Cloud, Palette, KeyRound, ShieldCheck, ShieldAlert,
  Loader2, ExternalLink, Play, Info, Trash2, Zap, Sparkles, AlertTriangle,
} from "lucide-react";
import { cn } from "../utils/cn";
import {
  PROVIDER_LABELS, PROVIDER_DEFAULT_MODEL, PROVIDER_DEFAULT_URL,
  ENGINE_LABELS, hasWebGL, isMobileNetLoaded, loadMobileNet,
  runApiEngine, prepareImage, sampleColors,
  type ApiProvider, type EngineId,
} from "../lib/recognition";
import { useApp } from "../lib/store";

type TestState =
  | { status: "idle" }
  | { status: "running"; detail: string }
  | { status: "ok"; detail: string }
  | { status: "error"; detail: string };

const ENGINES: {
  id: EngineId;
  icon: typeof Cpu;
  title: string;
  tag: string;
  lines: string[];
  cost: string;
}[] = [
  {
    id: "heuristique",
    icon: Palette,
    title: "Analyse locale des couleurs",
    tag: "Par défaut · instantané",
    lines: [
      "Teinte, saturation, luminosité et niveau de remplissage mesurés sur l'image.",
      "Aucun téléchargement, aucun réseau, fonctionne hors ligne.",
    ],
    cost: "0 Mo · 0 €",
  },
  {
    id: "tensorflow",
    icon: Cpu,
    title: "TensorFlow.js · MobileNet v2",
    tag: "100 % dans le navigateur",
    lines: [
      "Vrai réseau de neurones (ImageNet, 1 000 classes) exécuté en WebGL sur l'appareil.",
      "Détecte verres, bouteilles, bars et contextes de boisson — pas le degré d'alcool.",
    ],
    cost: "~14 Mo au 1er chargement · gratuit",
  },
  {
    id: "api",
    icon: Cloud,
    title: "API vision multimodale",
    tag: "Précision maximale",
    lines: [
      "La photo est envoyée à un modèle vision (Gemini, OpenAI, Mistral…) qui renvoie un JSON de boissons.",
      "Meilleure reconnaissance des cocktails et des verres réels, mais la clé est exposée dans le navigateur.",
    ],
    cost: "Payant selon le fournisseur",
  },
];

const PROVIDERS: { id: ApiProvider; hint: string; keyUrl: string }[] = [
  { id: "gemini", hint: "aistudio.google.com/apikey", keyUrl: "https://aistudio.google.com/apikey" },
  { id: "openai", hint: "platform.openai.com/api-keys", keyUrl: "https://platform.openai.com/api-keys" },
  { id: "mistral", hint: "console.mistral.ai/api-keys", keyUrl: "https://console.mistral.ai/api-keys" },
  { id: "compatible", hint: "URL compatible OpenAI", keyUrl: "" },
];

export function EngineSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setEngine } = useApp();
  const [engine, setLocalEngine] = useState<EngineId>(state.engine.engine);
  const [provider, setProvider] = useState<ApiProvider>(state.engine.api.provider);
  const [apiKey, setApiKey] = useState(state.engine.api.apiKey);
  const [model, setModel] = useState(state.engine.api.model);
  const [baseUrl, setBaseUrl] = useState(state.engine.api.baseUrl);
  const [remember, setRemember] = useState(Boolean(state.engine.api.apiKey));
  const [test, setTest] = useState<TestState>({ status: "idle" });
  const [tfState, setTfState] = useState<TestState>({ status: "idle" });

  useEffect(() => {
    if (!open) return;
    setLocalEngine(state.engine.engine);
    setProvider(state.engine.api.provider);
    setApiKey(state.engine.api.apiKey);
    setModel(state.engine.api.model);
    setBaseUrl(state.engine.api.baseUrl);
    setRemember(Boolean(state.engine.api.apiKey));
    setTest({ status: "idle" });
    setTfState({ status: "idle" });
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, state.engine]);

  if (!open) return null;

  const webgl = hasWebGL();

  const save = () => {
    // Une clé vierge signifie « je conserve la clé déjà enregistrée » ;
    // pour l'effacer, on utilise la corbeille (qui vide le champ).
    const existing = state.engine.api.apiKey;
    setEngine({
      engine,
      api: {
        provider,
        apiKey: remember ? (apiKey.trim() || existing) : "",
        model: model.trim() || PROVIDER_DEFAULT_MODEL[provider],
        baseUrl: baseUrl.trim(),
      },
    });
    onClose();
  };

  /* ---------------- tests ---------------- */

  const testTensorFlow = async () => {
    setTfState({ status: "running", detail: "Chargement du modèle…" });
    const t0 = performance.now();
    try {
      const model = await loadMobileNet((p) =>
        setTfState({ status: "running", detail: p.detail ?? "Préparation…" })
      );
      // image de test : un verre dessiné sur canvas
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponible");
      ctx.fillStyle = "#f3f8f7";
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = "#e8c877";
      ctx.beginPath();
      ctx.moveTo(110, 60);
      ctx.lineTo(190, 60);
      ctx.lineTo(180, 230);
      ctx.lineTo(120, 230);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#082032";
      ctx.lineWidth = 4;
      ctx.stroke();
      const preds = await model.classify(canvas, 3);
      const ms = Math.round(performance.now() - t0);
      setTfState({
        status: "ok",
        detail: `Modèle chargé en ${(ms / 1000).toFixed(1)} s · test : ${
          preds[0] ? `${preds[0].className.split(",")[0]} (${Math.round(preds[0].probability * 100)} %)` : "aucune classe"
        }`,
      });
    } catch (err) {
      setTfState({
        status: "error",
        detail: err instanceof Error ? err.message : "Échec du chargement",
      });
    }
  };

  const testApi = async () => {
    if (!apiKey.trim()) {
      setTest({ status: "error", detail: "Renseignez une clé API." });
      return;
    }
    setTest({ status: "running", detail: "Appel de l'API…" });
    const t0 = performance.now();
    try {
      // image de test générée localement (pas de photo utilisateur dans les réglages)
      const canvas = document.createElement("canvas");
      canvas.width = 420;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponible");
      const grad = ctx.createLinearGradient(0, 0, 0, 420);
      grad.addColorStop(0, "#f7e6b9");
      grad.addColorStop(1, "#8e7440");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 420, 420);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "700 22px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Test de connexion", 210, 210);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      const prepared = await prepareImage(dataUrl, 512);
      const colors = sampleColors(prepared.canvas);
      void colors;
      const out = await runApiEngine(
        {
          engine: "api",
          colors: colors,
          api: {
            provider,
            apiKey: apiKey.trim(),
            model: model.trim() || PROVIDER_DEFAULT_MODEL[provider],
            baseUrl: baseUrl.trim(),
          },
        },
        prepared,
        { timeoutMs: 20_000 }
      );
      const ms = Math.round(performance.now() - t0);
      setTest({
        status: "ok",
        detail: `Réponse en ${(ms / 1000).toFixed(1)} s · ${out.candidates[0]?.drink.name ?? "aucune boisson"}${out.raw ? ` · « ${String(out.raw).slice(0, 70)} »` : ""}`,
      });
    } catch (err) {
      setTest({
        status: "error",
        detail: err instanceof Error ? err.message : "Échec de l'appel",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[86] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Moteur de reconnaissance">
      <button className="absolute inset-0 cursor-default bg-abyss/55 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
      <div className="relative flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-ivory shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-3 border-b border-marine-950/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-marine-950 text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-display text-[17px] font-semibold leading-tight text-marine-950">
                Moteur de reconnaissance
              </p>
              <p className="text-[11.5px] font-semibold text-marine-950/50">
                Comment la photo est analysée
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-marine-950/[0.06] text-marine-950/60 transition hover:bg-marine-950/10"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-5">
          <div className="space-y-2.5">
            {ENGINES.map((e) => {
              const active = engine === e.id;
              return (
                <div key={e.id}>
                <button
                  onClick={() => setLocalEngine(e.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-lagoon-600/50 bg-lagoon-500/[0.07] shadow-sm"
                      : "border-marine-950/10 bg-white hover:border-marine-950/25"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition",
                      active ? "bg-lagoon-600 text-white" : "bg-marine-950/[0.05] text-marine-950/55"
                    )}>
                      <e.icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-[13.5px] font-extrabold text-marine-950">{e.title}</p>
                        <span className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                          active ? "bg-lagoon-600/15 text-lagoon-700" : "bg-marine-950/[0.06] text-marine-950/45"
                        )}>
                          {e.tag}
                        </span>
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {e.lines.map((l) => (
                          <li key={l} className="text-[11.5px] leading-relaxed text-marine-950/55">{l}</li>
                        ))}
                      </ul>
                      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-marine-950/35">{e.cost}</p>
                    </div>
                    {active && (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lagoon-600 text-white">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </div>

                </button>
                {active && e.id === "tensorflow" && (
                  <div className="mt-2 rounded-xl border border-marine-950/8 bg-white p-3">
                    <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-marine-950/50">
                      <Zap className="h-3 w-3" aria-hidden /> WebGL {webgl ? "disponible" : "indisponible (CPU)"} ·{" "}
                      {isMobileNetLoaded() ? "modèle déjà en mémoire" : "modèle non chargé"}
                    </p>
                    <button
                      onClick={testTensorFlow}
                      disabled={tfState.status === "running"}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-marine-950 px-3 py-1.5 text-[11.5px] font-bold text-white disabled:opacity-60"
                    >
                      {tfState.status === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      Charger et tester le modèle
                    </button>
                    {tfState.status !== "idle" && (
                      <p className={cn(
                        "mt-2 text-[11px] font-semibold leading-relaxed",
                        tfState.status === "ok" ? "text-lagoon-700"
                          : tfState.status === "error" ? "text-red-600"
                          : "text-marine-950/50"
                      )}>
                        {tfState.detail}
                      </p>
                    )}
                  </div>
                )}
                {active && e.id === "api" && (
                  <div className="mt-2 space-y-2.5 rounded-xl border border-marine-950/8 bg-white p-3">
                    <div>
                      <p className="mb-1 text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950/40">Fournisseur</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PROVIDERS.map((prov) => (
                          <button
                            key={prov.id}
                            onClick={() => {
                              setProvider(prov.id);
                              setModel(PROVIDER_DEFAULT_MODEL[prov.id]);
                              setBaseUrl("");
                              setTest({ status: "idle" });
                            }}
                            className={cn(
                              "rounded-lg border px-2 py-1.5 text-left transition",
                              provider === prov.id
                                ? "border-lagoon-600/50 bg-lagoon-500/10"
                                : "border-marine-950/10 bg-white hover:border-marine-950/25"
                            )}
                          >
                            <span className="block text-[11.5px] font-bold text-marine-950">{PROVIDER_LABELS[prov.id]}</span>
                            <span className="block truncate text-[9px] font-semibold text-marine-950/40">{prov.hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="block">
                      <span className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950/40">
                        <KeyRound className="h-3 w-3" aria-hidden /> Clé API
                      </span>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(ev) => setApiKey(ev.target.value)}
                        placeholder={provider === "gemini" ? "AIza…" : provider === "openai" ? "sk-…" : "clé du fournisseur"}
                        autoComplete="off"
                        spellCheck={false}
                        className="mt-1 w-full rounded-lg border border-marine-950/12 bg-white px-2.5 py-2 font-mono text-[12px] text-marine-950 outline-none focus:border-lagoon-600 focus:ring-2 focus:ring-lagoon-600/15"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950/40">Modèle</span>
                        <input
                          value={model}
                          onChange={(ev) => setModel(ev.target.value)}
                          placeholder={PROVIDER_DEFAULT_MODEL[provider]}
                          className="mt-1 w-full rounded-lg border border-marine-950/12 bg-white px-2.5 py-2 font-mono text-[11.5px] text-marine-950 outline-none focus:border-lagoon-600"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-marine-950/40">URL de base</span>
                        <input
                          value={baseUrl}
                          onChange={(ev) => setBaseUrl(ev.target.value)}
                          placeholder={PROVIDER_DEFAULT_URL[provider]}
                          className="mt-1 w-full rounded-lg border border-marine-950/12 bg-white px-2.5 py-2 font-mono text-[11.5px] text-marine-950 outline-none focus:border-lagoon-600"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={testApi}
                        disabled={test.status === "running"}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-lagoon-600 px-3 py-1.5 text-[11.5px] font-bold text-white disabled:opacity-60"
                      >
                        {test.status === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Tester la connexion
                      </button>
                      {PROVIDERS.find((prov) => prov.id === provider)?.keyUrl && (
                        <a
                          href={PROVIDERS.find((prov) => prov.id === provider)?.keyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-marine-950/45 hover:text-marine-950"
                        >
                          Obtenir une clé <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      )}
                    </div>

                    {test.status !== "idle" && (
                      <p className={cn(
                        "text-[11px] font-semibold leading-relaxed",
                        test.status === "ok" ? "text-lagoon-700"
                          : test.status === "error" ? "text-red-600"
                          : "text-marine-950/50"
                      )}>
                        {test.detail}
                      </p>
                    )}

                    <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-marine-950/[0.03] p-2">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(ev) => setRemember(ev.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 accent-lagoon-600"
                      />
                      <span className="text-[10.5px] font-semibold leading-snug text-marine-950/60">
                        Mémoriser la clé sur cet appareil (localStorage). Sinon, elle est effacée à la fermeture.
                      </span>
                    </label>

                    <div className="flex items-start gap-1.5 rounded-lg bg-gold-100/70 p-2 text-[10px] font-semibold leading-relaxed text-gold-700">
                      <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                      Une clé saisie dans un navigateur est visible par toute personne ayant accès à
                      l'appareil et par les extensions installées. Pour un usage public, passez par un proxy serveur.
                    </div>
                  </div>
                )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-marine-950/[0.04] p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-marine-950/45" aria-hidden />
            <p className="text-[10.5px] leading-relaxed text-marine-950/55">
              Aucun moteur ne lit le degré d'alcool sur une photo : il identifie une <strong className="font-bold">famille de boisson</strong>.
              La confirmation humaine et le volume restent indispensables au calcul.
            </p>
          </div>

          {!apiKey && engine === "api" && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-orange-50 p-3 ring-1 ring-orange-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
              <p className="text-[10.5px] leading-relaxed text-orange-700">
                Sans clé, l'application basculera automatiquement sur l'analyse locale.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-marine-950/8 bg-white/70 px-5 py-4">
          <div className="flex gap-2">
            <button
              onClick={save}
              className="btn-shine flex flex-1 items-center justify-center gap-2 rounded-2xl bg-lagoon-600 px-5 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-lagoon-700/25 transition hover:-translate-y-0.5 hover:bg-lagoon-700"
            >
              <Check className="h-4 w-4" aria-hidden /> Enregistrer
            </button>
            {apiKey && (
              <button
                onClick={() => {
                  setApiKey("");
                  setRemember(false);
                  setEngine({ api: { apiKey: "" } });
                }}
                className="grid h-[46px] w-[46px] place-items-center rounded-2xl border border-marine-950/10 text-marine-950/40 transition hover:border-red-200 hover:text-red-600"
                aria-label="Effacer la clé"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-marine-950/40">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            Moteur actif : {ENGINE_LABELS[state.engine.engine]}
          </p>
        </div>
      </div>
    </div>
  );
}
