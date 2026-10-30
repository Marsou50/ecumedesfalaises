import { useMemo } from "react";
import {
  Car, Clock, Droplets, Utensils, Info, AlertTriangle, Sparkles,
  ArrowRight, Sunrise, Footprints, Coffee, Check, Ban, Timer,
  GlassWater, ShieldCheck, Baby,
} from "lucide-react";
import { cn } from "../utils/cn";
import {
  analyze, computeCurve, fmtBac, fmtDelay, fmtTime, legalLimit, zoneFor,
  ZONE_META, FOOD_LABEL, SAFETY_MARGIN, breathMgL,
  type Session, type Profile,
} from "../lib/bac";
import { getAbv, getDrink } from "../lib/drinks";
import { BacGauge, BacCurve } from "./charts";
import { StartSoiree } from "./StartSoiree";

function nextRoundTime(ts: number): number {
  const d = new Date(ts);
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.getTime();
}

export function Results({
  session,
  profile,
  now,
  onScan,
  onOpenProfile,
  onDemo,
}: {
  session: Session;
  profile: Profile | null;
  now: number;
  onScan: () => void;
  onOpenProfile: () => void;
  onDemo: () => void;
}) {
  const p = profile;

  const curve = useMemo(
    () =>
      p
        ? computeCurve(session.events, p, session.food, getAbv, { stepMin: 5 })
        : { t: [], bac: [], doses: [], r: 0.7, volumeL: 50 },
    [session.events, session.food, p]
  );

  const totalGrams = useMemo(
    () => session.events.reduce((s, e) => s + e.volumeCl * 10 * (getAbv(e.drinkId) / 100) * 0.789, 0),
    [session.events]
  );

  const rec = useMemo(
    () =>
      p
        ? analyze(curve, p, now, totalGrams)
        : {
            peak: 0, peakAt: now, current: 0, timeToLimit: 0, timeToSober: 0,
            limitAt: null, soberAt: null, willRise: false,
            totalGrams: 0, standardDrinks: 0, limit: null, dropPerHour: 0.15,
          },
    [curve, p, now, totalGrams]
  );

  const limit = p ? legalLimit(p.licence) : null;
  const zone = zoneFor(rec.current, p?.licence ?? "confirme");

  // garde d'affichage placée APRÈS les hooks (ordre des hooks stable)
  if (session.events.length === 0) {
    return (
      <StartSoiree
        profile={profile}
        onScan={onScan}
        onDemo={onDemo}
        onProfile={onOpenProfile}
      />
    );
  }
  const canDrive =
    limit != null && rec.current < limit - SAFETY_MARGIN && !rec.willRise;
  const underLimit = limit != null && rec.current < limit - SAFETY_MARGIN;

  const soberAt = rec.soberAt;
  const limitAt = rec.limitAt;

  const water = Math.max(1, Math.ceil(session.events.length * 1.5));
  const food = Math.max(1, Math.ceil(session.events.length / 2));

  const lastEvent = session.events.length
    ? Math.max(...session.events.map((e) => e.at))
    : now;

  return (
    <div className="space-y-5">
      {/* -------- verdict card -------- */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_-30px_rgb(8_32_50/0.4)] ring-1 ring-marine-950/8">
        <div className={cn(
          "h-1.5 w-full",
          zone === "vert" ? "bg-gradient-to-r from-lagoon-500 to-lagoon-300"
            : zone === "orange" ? "bg-gradient-to-r from-gold-500 to-gold-300"
            : zone === "na" ? "bg-marine-950/20"
            : "bg-gradient-to-r from-orange-600 to-red-600"
        )} />
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-marine-950/40">
                  Alcoolémie estimée · {fmtTime(now)}
                </p>
                <p className="font-display mt-1 text-[13.5px] font-medium text-marine-950/55">
                  {p ? `${p.name ?? "Profil"} · ${p.weightKg} kg · ${p.sex}${p.age ? ` · ${p.age} ans` : ""}` : "Profil non renseigné"}
                </p>
              </div>
              <button
                onClick={onOpenProfile}
                className="rounded-full border border-marine-950/10 px-3 py-1.5 text-[11.5px] font-bold text-marine-950/70 transition hover:border-marine-950/25"
              >
                Modifier
              </button>
            </div>

            <BacGauge bac={rec.current} limit={limit} licence={p?.licence ?? "confirme"} className="mt-1" />

            <div className={cn(
              "mt-2 flex items-start gap-2.5 rounded-2xl p-3.5",
              zone === "vert" ? "bg-lagoon-500/[0.09] text-lagoon-700"
                : zone === "orange" ? "bg-gold-100 text-gold-700"
                : zone === "na" ? "bg-marine-950/[0.05] text-marine-950/70"
                : "bg-red-50 text-red-700"
            )}>
              {zone === "vert" ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                : zone === "orange" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                : zone === "na" ? <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                : <Ban className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
              <div>
                <p className="text-[13px] font-extrabold leading-snug">
                  {zone === "na" ? "Vous avez indiqué ne pas conduire" : ZONE_META[zone].label}
                </p>
                <p className="mt-0.5 text-[11.5px] font-semibold leading-relaxed opacity-80">
                  {limit != null && zone !== "na"
                    ? `Seuil légal ${String(limit).replace(".", ",")} g/L${p?.licence === "probatoire" ? " (permis probatoire)" : ""} · marge de sécurité ${String(SAFETY_MARGIN).replace(".", ",")} g/L appliquée.`
                    : "Le calcul reste valable pour votre santé et votre temps de récupération."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <Stat
                icon={<Clock className="h-4 w-4" aria-hidden />}
                label="Conduite possible"
                value={limitAt ? fmtDelay(limitAt - now) : "—"}
                sub={
                  limitAt == null || limitAt - now < 60_000
                    ? "déjà sous le seuil"
                    : `à ${fmtTime(limitAt)}, marge incluse`
                }
                tone={canDrive ? "good" : "warn"}
              />
              <Stat
                icon={<GlassWater className="h-4 w-4" aria-hidden />}
                label="Retour à zéro"
                value={soberAt ? fmtDelay(soberAt - now) : "—"}
                sub={soberAt ? `à ${fmtTime(soberAt)}` : "—"}
                tone="neutral"
              />
              <Stat
                icon={<Timer className="h-4 w-4" aria-hidden />}
                label="Pic atteint à"
                value={fmtTime(rec.peakAt)}
                sub={`${fmtBac(rec.peak)} g/L max`}
                tone="neutral"
              />
              <Stat
                icon={<Droplets className="h-4 w-4" aria-hidden />}
                label="Alcool absorbé"
                value={`${rec.totalGrams.toFixed(0)} g`}
                sub={`${rec.standardDrinks.toFixed(1).replace(".", ",")} verres standard`}
                tone="neutral"
              />
            </div>

            <div className="rounded-2xl bg-marine-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-seafoam-200">
                  <Car className="h-3.5 w-3.5" aria-hidden /> Conseil conduite
                </p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
                  {fmtBac(breathMgL(rec.current))} mg/L air
                </span>
              </div>
              <p className="mt-2 text-[13.5px] font-semibold leading-relaxed text-white/85">
                {underLimit && rec.willRise ? (
                  <><strong className="text-white">Pas encore.</strong> Votre taux est sous le seuil, mais
                  l'absorption n'est pas terminée : il montera encore jusqu'à {fmtBac(rec.peak)} g/L vers{" "}
                  {fmtTime(rec.peakAt)}. Attendez {limitAt ? fmtDelay(limitAt - now) : "encore un peu"}.</>
                ) : canDrive ? (
                  <>Vous êtes sous le seuil réglementaire. Restez prudent : fatigue, médicaments et repas
                  modifient votre vigilance. Un éthylotest reste la seule mesure fiable avant de partir.</>
                ) : (
                  <>
                    <strong className="text-white">Ne prenez pas le volant.</strong> Il faut environ{" "}
                    {limitAt ? fmtDelay(limitAt - now) : "plusieurs heures"} avant de repasser sous le seuil légal,
                    marge de sécurité incluse. Taxi, VTC, transports ou hôte désigné : rien ne presse plus que vous.
                  </>
                )}
              </p>
              {limit != null && limit <= 0.2 && (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-gold-500/15 p-2 text-[11px] font-semibold text-gold-300">
                  <Baby className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  Permis probatoire : le seuil de 0,2 g/L est en pratique une tolérance zéro.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {p && (
        <section className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-marine-950/8">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-700">
            <ScaleIcon />
          </span>
          <p className="text-[12px] leading-relaxed text-marine-950/60">
            <strong className="font-extrabold text-marine-950">Le verre de trop, chez vous.</strong>{" "}
            Avec votre gabarit ({p.weightKg} kg, coefficient {curve.r.toFixed(2).replace(".", ",")}), un verre
            standard de 10 g fait monter votre alcoolémie d'environ{" "}
            <strong className="font-bold text-marine-950">{(10 / curve.volumeL).toFixed(2).replace(".", ",")} g/L</strong>
            {" "}et met <strong className="font-bold text-marine-950">{Math.round((10 / curve.volumeL / rec.dropPerHour) * 60)} min</strong> à
            être éliminé. {p.licence === "probatoire" ? "En permis probatoire, un seul verre suffit souvent à dépasser le seuil." : "Deux verres de vin rapprochés suffisent à dépasser 0,5 g/L."}
          </p>
        </section>
      )}

      {/* -------- curve -------- */}
      <section className="rounded-[2rem] bg-white p-5 shadow-[0_20px_50px_-30px_rgb(8_32_50/0.35)] ring-1 ring-marine-950/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-marine-950/40">
              Prévision sur 24 h
            </p>
            <h3 className="font-display mt-0.5 text-[19px] font-semibold text-marine-950">
              Votre courbe d'alcoolémie
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-marine-950/50">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-lagoon-500" /> estimé</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-marine-950/25" /> écoulé</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-red-500" /> seuil</span>
          </div>
        </div>
        <div className="mt-3">
          <BacCurve t={curve.t} bac={curve.bac} now={now} limit={limit} /></div>
        {curve.t.length > 0 && (
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-marine-950/45">
            Modèle de Widmark avec absorption progressive (
            {session.food === "jeun" ? "20" : session.food === "leger" ? "40" : session.food === "repas" ? "60" : "80"} min)
            et élimination {p ? `${rec.dropPerHour.toFixed(2).replace(".", ",")} g/L/h` : "0,15 g/L/h"}.
            Le pic de {fmtBac(rec.peak)} g/L est atteint vers {fmtTime(rec.peakAt)}.
          </p>
        )}
      </section>

      {/* -------- recommendations -------- */}
      <section>
        <div className="flex items-end justify-between">
          <h3 className="font-display text-[19px] font-semibold text-marine-950">
            Pour récupérer plus vite
          </h3>
          <span className="text-[11px] font-bold uppercase tracking-wider text-marine-950/35">
            {session.events.length} verre{session.events.length > 1 ? "s" : ""} ce soir
          </span>
        </div>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <Tip
            icon={<GlassWater className="h-4 w-4" />}
            title={`Buvez environ ${water} × 25 cl d'eau`}
            text="Un verre d'eau entre chaque verre d'alcool réduit la déshydratation et la vitesse de consommation. Ce n'est pas un antidote."
            tone="aqua"
          />
          <Tip
            icon={<Utensils className="h-4 w-4" />}
            title={food > 1 ? "Mangez, même à cette heure" : "Mangez un peu avant de dormir"}
            text="Les aliments ralentissent l'absorption de l'alcool et limitent les nausées du lendemain. Privilégiez lentilles, riz, banane, œufs."
            tone="gold"
          />
          <Tip
            icon={<Coffee className="h-4 w-4" />}
            title="Un café ne dégrisera pas"
            text="Ni café, ni douche froide, ni sport : seul le temps élimine l'alcool, à raison de 0,10 à 0,15 g/L par heure."
            tone="neutral"
          />
          <Tip
            icon={<Footprints className="h-4 w-4" />}
            title="Dormez, mais attention au réveil"
            text={
              soberAt
                ? `Le taux baisse aussi en dormant : prévoyez un réveil vers ${fmtTime(soberAt + 30 * 60_000)} pour repartir serein.`
                : "Le sommeil aide à récupérer, mais n'accélère pas l'élimination de l'alcool."
            }
            tone="neutral"
          />
        </div>
        <button
          onClick={onScan}
          className="mt-3 flex w-full items-center justify-between rounded-2xl border border-dashed border-lagoon-600/40 bg-lagoon-500/[0.05] px-4 py-3.5 text-left transition hover:bg-lagoon-500/10"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lagoon-600 text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-[13.5px] font-bold text-marine-950">Un nouveau verre ?</span>
              <span className="block text-[11.5px] font-medium text-marine-950/55">
                Quelques secondes pour le photographier, la courbe se met à jour.
              </span>
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-lagoon-700" aria-hidden />
        </button>
      </section>

      {/* -------- timeline -------- */}
      <section className="rounded-[2rem] bg-white p-5 shadow-[0_20px_50px_-30px_rgb(8_32_50/0.35)] ring-1 ring-marine-950/8">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[19px] font-semibold text-marine-950">Prochaines étapes</h3>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-marine-950/40">
            <Utensils className="h-3 w-3" aria-hidden /> {FOOD_LABEL[session.food]}
          </span>
        </div>
        <ol className="mt-4 space-y-0">
          <Milestone
            first
            done={now > lastEvent}
            icon={<Clock className="h-4 w-4" />}
            title="Dernier verre"
            detail={`${getDrink(session.events[session.events.length - 1]?.drinkId ?? "sans-alcool").name} · ${fmtTime(lastEvent)}`}
            delta={null}
          />
          <Milestone
            done={rec.current >= rec.peak - 0.02}
            icon={<Sparkles className="h-4 w-4" />}
            title="Pic d'alcoolémie"
            detail={`${fmtBac(rec.peak)} g/L maximum estimé`}
            delta={fmtTime(rec.peakAt)}
            highlight={rec.current >= rec.peak - 0.02}
          />
          {limit != null && (
            <Milestone
              done={canDrive}
              icon={<ShieldCheck className="h-4 w-4" />}
              title={`Sous le seuil avec marge (${String(limit).replace(".", ",")} g/L)`}
              detail={
                limitAt
                  ? `Conduite envisageable à ${fmtTime(limitAt)} — jamais un feu vert`
                  : "Déjà sous le seuil, prudence maintenue"
              }
              delta={limitAt ? fmtDelay(limitAt - now) : "maintenant"}
            />
          )}
          <Milestone
            last
            done={rec.timeToSober === 0}
            icon={<Sunrise className="h-4 w-4" />}
            title="Alcoolémie quasi nulle"
            detail="Retour à zéro (arrondi éthylotest)"
            delta={soberAt ? fmtDelay(soberAt - now) : "—"}
          />
          <Milestone
            done={false}
            icon={<GlassWater className="h-4 w-4" />}
            title="Verre d'eau + un peu de sucre"
            detail="Toutes les heures jusqu'au coucher"
            delta={fmtTime(nextRoundTime(now))}
          />
        </ol>
      </section>

      <p className="rounded-2xl bg-marine-950/[0.04] p-3.5 text-[10.5px] leading-relaxed text-marine-950/50">
        <strong className="font-extrabold text-marine-950/70">Estimation, pas mesure.</strong> Ce calcul repose sur la formule
        de Widmark et sur des paramètres moyens. Il ne remplace ni un éthylotest ni une prise de sang, ne constitue pas un avis
        médical et ne peut jamais justifier de prendre le volant. En cas de doute, ne conduisez pas.
      </p>
    </div>
  );
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a3 3 0 0 0 5 0L5 8ZM19 8l-2.5 6a3 3 0 0 0 5 0L19 8Z" />
    </svg>
  );
}

function Stat({
  icon, label, value, sub, tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "good" | "warn" | "neutral";
}) {
  return (
    <div className={cn(
      "rounded-2xl p-3 ring-1",
      tone === "good" ? "bg-lagoon-500/[0.07] ring-lagoon-600/20"
        : tone === "warn" ? "bg-gold-100/70 ring-gold-500/25"
        : "bg-marine-950/[0.03] ring-marine-950/8"
    )}>
      <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-marine-950/45">
        {icon} {label}
      </p>
      <p className="font-display mt-1 text-[21px] font-semibold leading-none tracking-tight text-marine-950">{value}</p>
      <p className="mt-1 text-[10.5px] font-semibold text-marine-950/45">{sub}</p>
    </div>
  );
}

function Tip({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: "aqua" | "gold" | "neutral" }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-marine-950/8">
      <span className={cn(
        "grid h-8 w-8 place-items-center rounded-xl",
        tone === "aqua" ? "bg-lagoon-500/12 text-lagoon-700" : tone === "gold" ? "bg-gold-100 text-gold-700" : "bg-marine-950/[0.06] text-marine-950/60"
      )}>
        {icon}
      </span>
      <p className="mt-2.5 text-[13.5px] font-bold leading-snug text-marine-950">{title}</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-marine-950/55">{text}</p>
    </div>
  );
}

function Milestone({
  icon, title, detail, delta, done, last, first, highlight,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  delta: string | null;
  done: boolean;
  last?: boolean;
  first?: boolean;
  highlight?: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last && <span className="absolute left-[15px] top-8 h-full w-px bg-marine-950/10" aria-hidden />}
      <span className={cn(
        "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1",
        done ? "bg-lagoon-600 text-white ring-lagoon-600"
          : highlight ? "bg-gold-500 text-white ring-gold-500"
          : "bg-white text-marine-950/45 ring-marine-950/12"
      )}>
        {done && !first ? <Check className="h-4 w-4" aria-hidden /> : icon}
      </span>
      <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pt-0.5">
        <div className="min-w-0">
          <p className={cn("text-[13px] font-bold leading-tight", done ? "text-marine-950" : "text-marine-950/75")}>{title}</p>
          <p className="mt-0.5 text-[11px] font-medium text-marine-950/45">{detail}</p>
        </div>
        {delta && (
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold tabular-nums",
            highlight ? "bg-gold-100 text-gold-700" : "bg-marine-950/[0.05] text-marine-950/55"
          )}>
            {delta}
          </span>
        )}
      </div>
    </li>
  );
}
