import { useMemo } from "react";
import {
  Plus, Trash2, Clock, ArrowUpRight, ArrowDownRight, Camera, Hand,
  Wine, Utensils, Sparkles, Info, History, TrendingUp, CircleCheck,
} from "lucide-react";
import { cn } from "../utils/cn";
import { fmtBac, fmtTime, fmtDate, FOOD_LABEL, FOOD_HINT, analyze as analyzeSession, type FoodLevel, type Profile, type Session } from "../lib/bac";
import { getAbv as abvOf, getDrink, totalGrams } from "../lib/drinks";
import { GlassBadge, Glass } from "./Glass";
import { useApp } from "../lib/store";
import { BacGauge } from "./charts";
import { StartSoiree } from "./StartSoiree";
import { analyze, computeCurve, legalLimit } from "../lib/bac";
import { getAbv } from "../lib/drinks";

const FOODS: FoodLevel[] = ["jeun", "leger", "repas", "copieux"];

const FOOD_ICON: Record<FoodLevel, string> = {
  jeun: "🫗",
  leger: "🥨",
  repas: "🍽️",
  copieux: "🥘",
};

export function Journal({
  profile,
  now,
  onScan,
  onDashboard,
}: {
  profile: Profile | null;
  now: number;
  onScan: () => void;
  onDashboard: () => void;
}) {
  const { state, removeEvent, shiftEvent, setFood, resetSession, loadDemo } = useApp();
  const events = state.session.events;

  const curve = useMemo(
    () => (profile ? computeCurve(events, profile, state.session.food, getAbv, { stepMin: 5 }) : { t: [], bac: [], doses: [], r: 0.7, volumeL: 50 }),
    [events, profile, state.session.food]
  );

  const grams = useMemo(() => totalGrams(events), [events]);
  const rec = profile ? analyze(curve, profile, now, grams) : null;

  const sorted = [...events].sort((a, b) => b.at - a.at);

  if (events.length === 0) {
    return (
      <div className="space-y-5">
        <StartSoiree
          profile={profile}
          onScan={onScan}
          onDemo={loadDemo}
          onProfile={() => {}}
        />
        <HistorySection history={state.history} profile={profile} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-marine-950 via-marine-900 to-lagoon-700 p-5 text-white shadow-[0_24px_60px_-30px_rgb(8_32_50/0.6)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-seafoam-200">
              Journal de la soirée
            </p>
            <p className="font-display mt-1 text-[26px] font-semibold leading-tight">
              {events.length === 0
                ? "Rien encore ce soir"
                : `${events.length} verre${events.length > 1 ? "s" : ""} · ${(grams / 10).toFixed(1).replace(".", ",")} verres standard`}
            </p>
            <p className="mt-1.5 max-w-md text-[12.5px] font-medium leading-relaxed text-white/60">
              {events.length === 0
                ? "Photographiez votre premier verre : l'application estime le reste de la soirée à partir de votre profil."
                : `Soit ${grams.toFixed(0)} g d'alcool pur. Alcoolémie estimée actuelle : ${fmtBac(rec?.current ?? 0)} g/L.`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onScan}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-extrabold text-marine-950 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Camera className="h-4 w-4" aria-hidden /> Scanner
            </button>
            <button
              onClick={onDashboard}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              Bilan <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-white/45">
              <Utensils className="h-3 w-3" aria-hidden /> Contexte du dernier repas
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {FOODS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFood(f)}
                  className={cn(
                    "rounded-xl px-2.5 py-2 text-left text-[11.5px] font-bold transition",
                    state.session.food === f
                      ? "bg-white text-marine-950 shadow"
                      : "bg-white/[0.07] text-white/70 ring-1 ring-white/10 hover:bg-white/10"
                  )}
                >
                  <span className="mr-1" aria-hidden>{FOOD_ICON[f]}</span>
                  {FOOD_LABEL[f]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-white/50">
              {FOOD_HINT[state.session.food]}
            </p>
          </div>
          {profile && (
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/40">Pic prévu</p>
              <p className="font-display text-[22px] font-semibold leading-none">{rec ? fmtBac(rec.peak) : "0,00"}</p>
              <p className="text-[10px] font-semibold text-white/45">g/L vers {rec ? fmtTime(rec.peakAt) : "—"}</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h3 className="font-display text-[19px] font-semibold text-marine-950">Verres de la soirée</h3>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <button
                onClick={resetSession}
                className="text-[11.5px] font-bold text-marine-950/45 transition hover:text-red-600"
              >
                Clôturer la soirée
              </button>
            )}
            <button
              onClick={onScan}
              className="flex items-center gap-1 rounded-full bg-marine-950 px-3 py-1.5 text-[11.5px] font-bold text-white"
            >
              <Plus className="h-3 w-3" aria-hidden /> Ajouter
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="mt-3 grid place-items-center rounded-[2rem] border border-dashed border-marine-950/15 bg-white/60 px-6 py-12 text-center">
            <Glass shape="wine" color="#a3284c" size={72} fill={0} />
            <p className="font-display mt-3 text-[18px] font-semibold text-marine-950">Aucun verre enregistré</p>
            <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-marine-950/50">
              Chaque verre ajouté affine le calcul : type de boisson, volume, heure et contexte du repas.
            </p>
            <button
              onClick={onScan}
              className="mt-4 flex items-center gap-2 rounded-xl bg-lagoon-600 px-4 py-2.5 text-[13px] font-extrabold text-white shadow-lg shadow-lagoon-700/20 transition hover:-translate-y-0.5"
            >
              <Camera className="h-4 w-4" aria-hidden /> Photographier un verre
            </button>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {sorted.map((e, idx) => {
              const d = getDrink(e.drinkId);
              const g = e.volumeCl * 10 * (getAbv(e.drinkId) / 100) * 0.789;
              const isLast = idx === sorted.length - 1;
              return (
                <li
                  key={e.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 transition",
                    isLast ? "ring-lagoon-600/25 shadow-sm" : "ring-marine-950/8"
                  )}
                >
                  <GlassBadge shape={d.glass} color={d.color} size={30} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-[13.5px] font-bold text-marine-950">{d.name}</p>
                      {e.source === "photo" ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-lagoon-500/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-lagoon-700">
                          <Camera className="h-2.5 w-2.5" aria-hidden /> scan
                          {e.confidence != null && ` ${Math.round(e.confidence * 100)}%`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded bg-marine-950/[0.06] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-marine-950/50">
                          <Hand className="h-2.5 w-2.5" aria-hidden /> manuel
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11.5px] font-semibold text-marine-950/50">
                      {e.volumeCl} cl · {String(d.abv).replace(".", ",")}° · {g.toFixed(1).replace(".", ",")} g
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <div className="mr-1 flex flex-col items-center">
                      <span className="font-display text-[15px] font-semibold leading-none text-marine-950">{fmtTime(e.at)}</span>
                      <span className="mt-1 flex items-center gap-0.5">
                        <button
                          onClick={() => shiftEvent(e.id, -15 * 60_000)}
                          className="grid h-5 w-5 place-items-center rounded bg-marine-950/[0.05] text-marine-950/50 transition hover:bg-marine-950/10 hover:text-marine-950"
                          aria-label="Reculer de 15 minutes"
                        >
                          <ArrowDownRight className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => shiftEvent(e.id, 15 * 60_000)}
                          className="grid h-5 w-5 place-items-center rounded bg-marine-950/[0.05] text-marine-950/50 transition hover:bg-marine-950/10 hover:text-marine-950"
                          aria-label="Avancer de 15 minutes"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                    <button
                      onClick={() => removeEvent(e.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-marine-950/30 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Supprimer ${d.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {profile && events.length > 0 && (
        <section className="rounded-[2rem] bg-white p-5 ring-1 ring-marine-950/8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-marine-950/40">
            Où vous en êtes
          </p>
          <div className="mt-2 grid items-center gap-4 sm:grid-cols-[200px_1fr]">
            <BacGauge bac={rec?.current ?? 0} limit={legalLimit(profile.licence)} licence={profile.licence} />
            <ul className="space-y-2 text-[12.5px] font-semibold text-marine-950/65">
              <li className="flex items-center justify-between gap-2 rounded-xl bg-marine-950/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Conduite possible</span>
                <span className="font-display text-[15px] text-marine-950">
                  {rec?.limitAt != null ? fmtTime(rec.limitAt) : "—"}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-xl bg-marine-950/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Alcoolémie nulle</span>
                <span className="font-display text-[15px] text-marine-950">
                  {rec?.soberAt != null ? fmtTime(rec.soberAt) : "—"}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2 rounded-xl bg-marine-950/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5"><Wine className="h-3.5 w-3.5" /> Élimination</span>
                <span className="font-display text-[15px] text-marine-950">
                  {rec ? `${rec.dropPerHour.toFixed(2).replace(".", ",")} g/L/h` : "—"}
                </span>
              </li>
            </ul>
          </div>
        </section>
      )}

      <HistorySection history={state.history} profile={profile} />

      <section className="rounded-2xl bg-gold-100/60 p-4 ring-1 ring-gold-500/20">
        <p className="flex items-start gap-2 text-[11.5px] font-semibold leading-relaxed text-gold-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Les horaires peuvent être décalés de 15 minutes pour retrouver la chronologie exacte de la soirée.
          L'heure du dernier verre change fortement l'heure de retour sous le seuil.
        </p>
      </section>
    </div>
  );
}

function HistorySection({ history, profile }: { history: Session[]; profile: Profile | null }) {
  return (
        <section className="rounded-[2rem] bg-white p-5 ring-1 ring-marine-950/8">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-marine-950/45" aria-hidden />
            <h3 className="font-display text-[17px] font-semibold text-marine-950">Soirées précédentes</h3>
            <span className="rounded-full bg-marine-950/[0.05] px-2 py-0.5 text-[10px] font-extrabold text-marine-950/45">
              {history.length}
            </span>
          </div>
          {history.length === 0 ? (
            <p className="mt-2 text-[12px] leading-relaxed text-marine-950/50">
              Les soirées clôturées apparaissent ici : nombre de verres, dose totale et pic estimé.
              Utile pour repérer les habitudes qui coûtent le plus cher au lendemain.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((h) => {
                const g = totalGrams(h.events);
                const peak = profile
                  ? analyzeSession(
                      computeCurve(h.events, profile, h.food, abvOf, { stepMin: 10 }),
                      profile,
                      h.startedAt + 12 * 3600_000,
                      g
                    ).peak
                  : null;
                return (
                  <li key={h.id} className="flex items-center gap-3 rounded-xl bg-foam/70 p-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-marine-950/45">
                      <CircleCheck className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-bold capitalize text-marine-950">{fmtDate(h.startedAt)}</p>
                      <p className="text-[10.5px] font-semibold text-marine-950/45">
                        {h.events.length} verre{h.events.length > 1 ? "s" : ""} · {g.toFixed(0)} g · {FOOD_LABEL[h.food]}
                      </p>
                    </div>
                    {peak != null && (
                      <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10.5px] font-extrabold text-marine-950/60">
                        <TrendingUp className="h-3 w-3" aria-hidden /> pic {fmtBac(peak)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
  );
}
