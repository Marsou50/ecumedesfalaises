import { Camera, Sparkles, UserRound, Wine, ArrowRight, Clock, ShieldCheck, Moon } from "lucide-react";
import { Glass } from "./Glass";
import { fmtTime, type Profile } from "../lib/bac";
import { cn } from "../utils/cn";

export function StartSoiree({
  profile,
  onScan,
  onDemo,
  onProfile,
}: {
  profile: Profile | null;
  onScan: () => void;
  onDemo: () => void;
  onProfile: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 6 ? "Fin de nuit" : hour < 12 ? "Bonjour" : hour < 18 ? "Bonsoir" : "Bonne soirée";

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-marine-950 via-marine-900 to-lagoon-800 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-lagoon-400/25 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-gold-500/20 blur-3xl" aria-hidden />

        <div className="relative">
          <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-seafoam-200">
            <Moon className="h-3.5 w-3.5" aria-hidden /> {greeting} {profile?.name ? `· ${profile.name}` : ""}
          </p>
          <h1 className="font-display mt-2 max-w-md text-balance text-[30px] font-medium leading-[1.06] tracking-tight sm:text-[36px]">
            Photographiez votre <em className="italic text-gold-300">premier verre</em>.
          </h1>
          <p className="mt-2.5 max-w-md text-[13px] leading-relaxed text-white/60">
            L'application reconnaît le verre, calcule votre alcoolémie et vous donne
            l'heure à laquelle vous repasserez sous le seuil légal.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={onScan}
              className="btn-shine group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-3.5 text-[14px] font-extrabold text-marine-950 shadow-lg transition hover:-translate-y-0.5"
            >
              <Camera className="h-[18px] w-[18px]" aria-hidden />
              Scanner un verre
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </button>
            <button
              onClick={onDemo}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3.5 text-[14px] font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <Sparkles className="h-4 w-4 text-gold-300" aria-hidden />
              Exemple de soirée
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Champagne", "Pinte", "Ballon de rouge", "Mojito"].map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-bold text-white/65 ring-1 ring-white/10"
              >
                <Wine className="h-3 w-3 text-lagoon-300" aria-hidden /> {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[19px] font-semibold text-marine-950">Votre profil de calcul</h2>
          <button
            onClick={onProfile}
            className="flex items-center gap-1 text-[11.5px] font-bold text-lagoon-700 hover:underline"
          >
            {profile ? "Modifier" : "Compléter"} <ArrowRight className="h-3 w-3" aria-hidden />
          </button>
        </div>

        {profile ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { k: "Gabarit", v: `${profile.weightKg} kg · ${profile.heightCm} cm`, i: UserRound },
              { k: "Diffusion", v: `${profile.sex} · ${profile.age} ans`, i: Wine },
              {
                k: "Seuil appliqué",
                v:
                  profile.licence === "probatoire"
                    ? "0,2 g/L (probatoire)"
                    : profile.licence === "sans"
                    ? "Pas de conduite"
                    : "0,5 g/L (confirmé)",
                i: ShieldCheck,
              },
              { k: "Élimination", v: `${profile.metabolism} · 0,15 g/L/h`, i: Clock },
            ].map((s) => (
              <div key={s.k} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-marine-950/8">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-marine-950/[0.05] text-marine-950/55">
                  <s.i className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-marine-950/40">{s.k}</p>
                  <p className="mt-0.5 truncate text-[12.5px] font-bold capitalize text-marine-950">{s.v}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={onProfile}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-marine-950/20 bg-white/60 p-4 text-left transition hover:border-lagoon-600/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lagoon-500/10 text-lagoon-700">
              <UserRound className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-[13.5px] font-bold text-marine-950">Renseignez votre gabarit</span>
              <span className="block text-[11.5px] font-medium text-marine-950/50">
                30 secondes — sexe, poids, taille, âge et type de permis.
              </span>
            </span>
          </button>
        )}
      </section>

      <section className="grid gap-2.5 sm:grid-cols-3">
        {[
          { t: "Reconnaissance photo", d: "Forme, teinte et remplissage du verre", glass: "wine" as const, c: "#a3284c" },
          { t: "Journal horodaté", d: "Chaque verre compte dans le calcul", glass: "pint" as const, c: "#d9a01a" },
          { t: "Heure de conduite", d: "Seuil légal + marge de sécurité", glass: "flute" as const, c: "#f0dfa4" },
        ].map((s) => (
          <div key={s.t} className="rounded-2xl bg-white p-4 ring-1 ring-marine-950/8">
            <Glass shape={s.glass} color={s.c} size={40} fill={0.66} className={cn("mx-auto", s.glass === "flute" && "-mb-1")} />
            <p className="mt-2 text-center text-[12.5px] font-bold text-marine-950">{s.t}</p>
            <p className="mt-0.5 text-center text-[10.5px] font-medium leading-snug text-marine-950/45">{s.d}</p>
          </div>
        ))}
      </section>

      <p className="rounded-2xl bg-marine-950/[0.04] p-3.5 text-[10.5px] leading-relaxed text-marine-950/50">
        Estimations indicatives fondées sur la formule de Widmark. Elles ne remplacent pas un
        éthylotest et ne doivent jamais servir à décider de conduire. Il est {fmtTime(Date.now())} —
        si vous avez bu, ne prenez pas le volant.
      </p>
    </div>
  );
}
