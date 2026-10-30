import { useEffect, useState } from "react";
import { X, Check, User, Scale, Ruler, Cake, Activity, Info, Trash2, ShieldCheck } from "lucide-react";
import { cn } from "../utils/cn";
import { widmarkR, type Metabolism, type Profile, type Sex, type Licence } from "../lib/bac";
import { useApp } from "../lib/store";

const SEXES: { id: Sex; label: string; hint: string }[] = [
  { id: "homme", label: "Homme", hint: "r ≈ 0,70" },
  { id: "femme", label: "Femme", hint: "r ≈ 0,60" },
  { id: "autre", label: "Autre / je préfère ne pas dire", hint: "r ≈ 0,65" },
];

const LICENCES: { id: Licence; label: string; hint: string; limit: string }[] = [
  { id: "confirme", label: "Permis définitif", hint: "3 ans et plus", limit: "0,5 g/L" },
  { id: "probatoire", label: "Permis probatoire", hint: "Jeune conducteur", limit: "0,2 g/L" },
  { id: "sans", label: "Je ne conduis pas", hint: "Piéton, vélo, passager", limit: "—" },
];

const METABOS: { id: Metabolism; label: string; hint: string }[] = [
  { id: "lent", label: "Lent", hint: "0,12 g/L/h" },
  { id: "moyen", label: "Moyen", hint: "0,15 g/L/h" },
  { id: "rapide", label: "Rapide", hint: "0,18 g/L/h" },
];

const DEFAULT: Profile = {
  name: "",
  sex: "homme",
  weightKg: 75,
  heightCm: 175,
  age: 30,
  licence: "confirme",
  metabolism: "moyen",
};

export function ProfileSheet({
  open,
  onClose,
  onboard = false,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onboard?: boolean;
  initial?: Profile | null;
}) {
  const { setProfile, state, clearAll, dismissOnboarding } = useApp();
  const [form, setForm] = useState<Profile>(initial ?? state.profile ?? DEFAULT);

  useEffect(() => {
    if (open) setForm(initial ?? state.profile ?? DEFAULT);
  }, [open, initial, state.profile]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onboard) dismissOnboarding();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, onboard, dismissOnboarding]);

  if (!open) return null;

  const r = widmarkR(form);
  const volume = form.weightKg * r;
  // Un verre standard (10 g) fait monter de :
  const perStandard = 10 / volume;

  const save = () => {
    setProfile({ ...form, weightKg: Math.round(form.weightKg) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Profil">
      <button className="absolute inset-0 cursor-default bg-abyss/55 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
      <div className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-ivory shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between gap-3 border-b border-marine-950/8 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-marine-950 text-white">
              <User className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-display text-[17px] font-semibold leading-tight text-marine-950">
                {onboard ? "Faisons connaissance" : "Mon profil"}
              </p>
              <p className="text-[11.5px] font-semibold text-marine-950/50">
                {onboard ? "3 réglages suffisent pour un calcul personnalisé" : "Le calcul s'ajuste immédiatement"}
              </p>
            </div>
          </div>
          {!onboard && (
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-marine-950/[0.06] text-marine-950/60 transition hover:bg-marine-950/10"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-5">
          <div className="space-y-5">
            <Field label="Prénom (facultatif)">
              <input
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Camille"
                className="w-full rounded-xl border border-marine-950/12 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-marine-950 outline-none transition placeholder:font-medium placeholder:text-marine-950/30 focus:border-lagoon-600 focus:ring-2 focus:ring-lagoon-600/15"
              />
            </Field>

            <Field label="Sexe biologique (utilisé pour le coefficient de diffusion)">
              <div className="grid gap-1.5 sm:grid-cols-3">
                {SEXES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setForm({ ...form, sex: s.id })}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] font-bold transition",
                      form.sex === s.id
                        ? "border-lagoon-600/50 bg-lagoon-500/[0.08] text-marine-950"
                        : "border-marine-950/10 bg-white text-marine-950/70 hover:border-marine-950/25"
                    )}
                  >
                    {s.label}
                    <span className="flex items-center gap-2">
                      <span className="text-[10.5px] font-semibold text-marine-950/40">{s.hint}</span>
                      {form.sex === s.id && <Check className="h-3.5 w-3.5 text-lagoon-700" />}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Slider
                icon={<Scale className="h-3.5 w-3.5" />}
                label="Poids"
                value={form.weightKg}
                unit="kg"
                min={40}
                max={140}
                step={1}
                onChange={(v) => setForm({ ...form, weightKg: v })}
              />
              <Slider
                icon={<Ruler className="h-3.5 w-3.5" />}
                label="Taille"
                value={form.heightCm}
                unit="cm"
                min={145}
                max={210}
                step={1}
                onChange={(v) => setForm({ ...form, heightCm: v })}
              />
            </div>

            <Slider
              icon={<Cake className="h-3.5 w-3.5" />}
              label="Âge"
              value={form.age}
              unit="ans"
              min={18}
              max={90}
              step={1}
              onChange={(v) => setForm({ ...form, age: v })}
            />

            <Field label="Permis de conduire">
              <div className="grid gap-1.5 sm:grid-cols-3">
                {LICENCES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setForm({ ...form, licence: l.id })}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition",
                      form.licence === l.id
                        ? "border-lagoon-600/50 bg-lagoon-500/[0.08]"
                        : "border-marine-950/10 bg-white hover:border-marine-950/25"
                    )}
                  >
                    <span>
                      <span className="block text-[13.5px] font-bold text-marine-950">{l.label}</span>
                      <span className="block text-[10.5px] font-semibold text-marine-950/45">{l.hint}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10.5px] font-extrabold",
                        l.id === "probatoire" ? "bg-gold-100 text-gold-700" : "bg-marine-950/[0.06] text-marine-950/60"
                      )}>
                        {l.limit}
                      </span>
                      {form.licence === l.id && <Check className="h-3.5 w-3.5 text-lagoon-700" />}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Vitesse d'élimination" hint="Varie d'une personne à l'autre, impossible à deviner sans mesure.">
              <div className="grid grid-cols-3 gap-1.5">
                {METABOS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setForm({ ...form, metabolism: m.id })}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-center transition",
                      form.metabolism === m.id
                        ? "border-lagoon-600/50 bg-lagoon-500/[0.08]"
                        : "border-marine-950/10 bg-white hover:border-marine-950/25"
                    )}
                  >
                    <span className="block text-[13px] font-bold text-marine-950">{m.label}</span>
                    <span className="block text-[10px] font-semibold text-marine-950/45">{m.hint}</span>
                  </button>
                ))}
              </div>
            </Field>

            <div className="rounded-2xl bg-marine-950 p-4 text-white">
              <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-seafoam-200">
                <Activity className="h-3.5 w-3.5" aria-hidden /> Aperçu du calcul
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                <Preview label="Coefficient r" value={r.toFixed(2).replace(".", ",")} />
                <Preview label="Volume de diffusion" value={`${volume.toFixed(0)} L`} />
                <Preview label="1 verre standard" value={`+${perStandard.toFixed(2).replace(".", ",")} g/L`} />
              </div>
              <p className="mt-2.5 text-[10.5px] leading-relaxed text-white/50">
                {form.sex === "femme"
                  ? "À poids égal, la formule de Widmark donne une alcoolémie plus élevée chez la femme (moins d'eau corporelle)."
                  : "Le coefficient est ajusté selon l'IMC et l'âge pour rester au plus près de la physiologie moyenne."}
              </p>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-gold-100/70 p-3 text-[11px] font-semibold leading-relaxed text-gold-700 ring-1 ring-gold-500/20">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Données stockées uniquement sur cet appareil (navigateur). Aucun envoi, aucun compte, aucune pub.
            </div>

            {!onboard && (
              <button
                onClick={() => {
                  clearAll();
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-marine-950/10 py-2.5 text-[12px] font-bold text-marine-950/45 transition hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Effacer mon profil et tout l'historique
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-marine-950/8 bg-white/70 px-5 py-4">
          <button
            onClick={save}
            className="btn-shine flex w-full items-center justify-center gap-2 rounded-2xl bg-lagoon-600 px-5 py-3.5 text-[14.5px] font-extrabold text-white shadow-lg shadow-lagoon-700/25 transition hover:-translate-y-0.5 hover:bg-lagoon-700"
          >
            <Check className="h-4 w-4" aria-hidden />
            {onboard ? "Commencer" : "Enregistrer"}
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px] font-semibold text-marine-950/40">
            <Info className="h-3 w-3" aria-hidden /> Réservé aux personnes majeures.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-bold text-marine-950/70">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[10.5px] font-medium text-marine-950/40">{hint}</p>}
    </div>
  );
}

function Slider({
  icon, label, value, unit, min, max, step, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-marine-950/10 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-marine-950/60">
          {icon} {label}
        </p>
        <p className="font-display text-[17px] font-semibold leading-none text-marine-950">
          {value}
          <span className="ml-0.5 text-[10px] font-sans font-bold text-marine-950/40">{unit}</span>
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-lagoon-600"
        aria-label={label}
      />
    </div>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.07] py-2">
      <p className="font-display text-[16px] font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/45">{label}</p>
    </div>
  );
}
