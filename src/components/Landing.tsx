import {
  ArrowRight, Camera, ScanEye, Gauge, Clock, ShieldCheck, Sparkles,
  ChevronRight, Beer, Wine, Martini, Utensils, Car, Smartphone, Lock,
  Check, AlertTriangle, Info, Cpu, Cloud, Palette, ArrowUpRight,
} from "lucide-react";
import { BrandMark } from "./chrome";
import { Glass } from "./Glass";
import { BacGauge } from "./charts";
import { Reveal } from "./ui";
import barGlasses from "../assets/bar-glasses.jpg";

export function Landing({
  onStart,
  onDemo,
  onEngine,
  engineLabel,
}: {
  onStart: () => void;
  onDemo: () => void;
  onEngine: () => void;
  engineLabel: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-lagoon-400/20 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-gold-500/20 blur-[120px]" aria-hidden />

      <header className="relative mx-auto flex h-[68px] max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="leading-none">
            <span className="font-display block text-[17px] font-semibold tracking-tight text-marine-950">L'Écume</span>
            <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.24em] text-marine-950/45">Fin de soirée</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEngine}
            className="hidden items-center gap-1.5 rounded-full border border-marine-950/12 bg-white/70 px-3 py-2 text-[11px] font-bold text-marine-950/60 backdrop-blur transition hover:border-marine-950/30 hover:text-marine-950 sm:flex"
            title="Changer de moteur de reconnaissance"
          >
            <Cpu className="h-3.5 w-3.5" aria-hidden />
            <span className="max-w-[150px] truncate">{engineLabel}</span>
          </button>
          <button
            onClick={onStart}
            className="rounded-full border border-marine-950/12 bg-white/70 px-4 py-2 text-[12.5px] font-bold text-marine-950 backdrop-blur transition hover:border-marine-950/30"
          >
            J'ai déjà un profil
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pt-12">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-marine-950/[0.06] px-3.5 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-marine-900 ring-1 ring-marine-950/10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-pulse-dot rounded-full bg-lagoon-500" />
                  <span className="h-2 w-2 rounded-full bg-lagoon-600" />
                </span>
                Prévention routière · France
              </span>
            </Reveal>

            <Reveal delay={70}>
              <h1 className="font-display mt-5 text-balance text-[2.6rem] font-medium leading-[1.02] tracking-tight text-marine-950 sm:text-[3.4rem]">
                Un verre en photo,
                <br />
                <em className="text-gradient-lagoon font-light italic">l'heure de conduire</em> en clair.
              </h1>
            </Reveal>

            <Reveal delay={130}>
              <p className="mt-5 max-w-xl text-pretty text-[15.5px] leading-relaxed text-marine-950/65 sm:text-[16.5px]">
                Photographiez chaque verre de la soirée. À partir de votre gabarit, de votre sexe,
                de votre permis et de ce que vous avez mangé, l'application estime votre alcoolémie
                et vous dit <strong className="font-bold text-marine-950">à quelle heure reprendre le volant</strong>.
              </p>
            </Reveal>

            <Reveal delay={190}>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <button
                  onClick={onStart}
                  className="btn-shine group inline-flex items-center justify-center gap-2.5 rounded-full bg-marine-950 px-6 py-4 text-[14.5px] font-extrabold text-white shadow-[0_18px_45px_-14px_rgb(8_32_50/0.55)] transition hover:-translate-y-0.5"
                >
                  <Camera className="h-[18px] w-[18px]" aria-hidden />
                  Créer mon profil en 30 s
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                </button>
                <button
                  onClick={onDemo}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-marine-950/12 bg-white/70 px-6 py-4 text-[14.5px] font-bold text-marine-950 backdrop-blur transition hover:-translate-y-0.5 hover:border-lagoon-600/40"
                >
                  <Sparkles className="h-4 w-4 text-gold-600" aria-hidden />
                  Voir un exemple de soirée
                </button>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] font-bold text-marine-950/45">
                <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" aria-hidden /> 100 % sur votre appareil</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-lagoon-600" aria-hidden /> Sans compte</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-lagoon-600" aria-hidden /> Gratuit</li>
              </ul>
            </Reveal>
          </div>

          {/* mock */}
          <Reveal delay={120} variant="scale">
            <div className="relative mx-auto w-full max-w-[320px]">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-lagoon-400/25 via-transparent to-gold-500/25 blur-2xl" aria-hidden />
              <div className="relative rounded-[2.4rem] border border-white/60 bg-marine-950 p-2.5 shadow-[0_40px_80px_-30px_rgb(8_32_50/0.55)]">
                <div className="overflow-hidden rounded-[1.9rem] bg-ivory">
                  <div className="flex items-center justify-between bg-marine-950 px-4 py-2.5 text-white">
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/45">Maintenant</span>
                    <span className="flex items-center gap-1 rounded-full bg-lagoon-500/25 px-2 py-0.5 text-[9px] font-extrabold text-seafoam-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-seafoam-200" /> LIVE
                    </span>
                  </div>
                  <div className="px-3 pt-1">
                    <BacGauge bac={0.62} limit={0.5} licence="confirme" animate={false} />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
                    <div className="rounded-xl bg-lagoon-500/10 p-2">
                      <p className="text-[8.5px] font-extrabold uppercase tracking-wider text-lagoon-700/70">Sous le seuil</p>
                      <p className="font-display text-[15px] font-semibold text-marine-950">2 h 05</p>
                    </div>
                    <div className="rounded-xl bg-marine-950/[0.04] p-2">
                      <p className="text-[8.5px] font-extrabold uppercase tracking-wider text-marine-950/40">À zéro</p>
                      <p className="font-display text-[15px] font-semibold text-marine-950">4 h 40</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 border-t border-marine-950/8 p-3">
                    {[
                      { n: "Coupe de blanc", t: "20 h 15" },
                      { n: "Pinte", t: "21 h 40" },
                    ].map((d) => (
                      <div key={d.n} className="flex items-center gap-2 rounded-lg bg-white p-1.5 ring-1 ring-marine-950/6">
                        <Glass shape={d.n === "Pinte" ? "pint" : "flute"} color={d.n === "Pinte" ? "#d9a01a" : "#f0dfa4"} size={20} />
                        <span className="flex-1 text-[10px] font-bold text-marine-950">{d.n}</span>
                        <span className="text-[9.5px] font-bold text-marine-950/45">{d.t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 pt-0">
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-lagoon-600 py-2.5 text-[11px] font-extrabold text-white">
                      <Camera className="h-3.5 w-3.5" aria-hidden /> Scanner un verre
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass absolute -left-4 top-28 hidden animate-float rounded-2xl px-3 py-2 shadow-xl sm:block">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold text-marine-950">
                  <ScanEye className="h-3.5 w-3.5 text-lagoon-700" aria-hidden /> Verre reconnu
                </p>
                <p className="text-[9.5px] font-semibold text-marine-950/50">Champagne · 12 cl · 87 %</p>
              </div>
              <div className="glass absolute -right-3 bottom-24 hidden animate-float rounded-2xl px-3 py-2 shadow-xl [animation-delay:-3s] sm:block">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold text-marine-950">
                  <Car className="h-3.5 w-3.5 text-gold-600" aria-hidden /> Conduite à 1 h 12
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* how it works */}
        <section className="mt-20">
          <Reveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-lagoon-700">Comment ça marche</p>
            <h2 className="font-display mt-2 max-w-2xl text-balance text-[28px] font-medium leading-tight tracking-tight text-marine-950 sm:text-[34px]">
              Trois gestes, un calcul personnalisé
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Smartphone,
                n: "01",
                t: "Votre profil, une fois",
                d: "Sexe, poids, taille, âge, type de permis. Le coefficient de diffusion en découle.",
              },
              {
                icon: Camera,
                n: "02",
                t: "Un photo par verre",
                d: "La forme, la teinte et le niveau du verre donnent une proposition : vous confirmez le volume.",
              },
              {
                icon: Gauge,
                n: "03",
                t: "L'heure de repartir",
                d: "Courbe, pic, seuil légal et retour à zéro : la réponse est une heure, pas un ressenti.",
              },
            ].map((s) => (
              <div key={s.n} className="group relative overflow-hidden rounded-[1.6rem] border border-marine-950/8 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="absolute right-4 top-3 font-display text-[38px] font-semibold leading-none text-marine-950/[0.05]">{s.n}</span>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-marine-950 text-white transition group-hover:bg-lagoon-600">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-display mt-3.5 text-[17px] font-semibold tracking-tight text-marine-950">{s.t}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-marine-950/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* photo band */}
        <section className="mt-16 overflow-hidden rounded-[2rem] bg-marine-950">
          <div className="grid sm:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8">
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-seafoam-200">
                Ce que l'application prend en compte
              </p>
              <h2 className="font-display mt-2 text-balance text-[24px] font-medium leading-tight text-white sm:text-[28px]">
                Le verre, mais aussi <em className="italic text-gold-300">la personne</em> et le contexte.
              </h2>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {[
                  { icon: Beer, t: "Boisson & degré" },
                  { icon: Sparkles, t: "Volume servi" },
                  { icon: Utensils, t: "Repas ou à jeun" },
                  { icon: Gauge, t: "Gabarit & sexe" },
                  { icon: Clock, t: "Heure de chaque verre" },
                  { icon: ShieldCheck, t: "Permis (0,5 ou 0,2 g/L)" },
                ].map((f) => (
                  <li key={f.t} className="flex items-center gap-2 text-[12.5px] font-semibold text-white/80">
                    <f.icon className="h-4 w-4 shrink-0 text-lagoon-300" aria-hidden />
                    {f.t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-white/[0.06] p-3 text-[11px] leading-relaxed text-white/55">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-300" aria-hidden />
                L'alcoolémie réelle varie fortement d'une personne à l'autre. Une estimation ne
                remplace jamais un éthylotest, et ne doit jamais servir à décider de conduire.
              </p>
            </div>
            <div className="relative min-h-[220px]">
              <img
                src={barGlasses}
                alt="Verres suspendus dans un bar éclairé à la lumière chaude"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-marine-950 via-marine-950/40 to-transparent sm:bg-gradient-to-r" />
              <div className="glass-dark absolute bottom-4 left-4 right-4 rounded-2xl p-3 text-white">
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-seafoam-200">
                  <Wine className="h-3 w-3" aria-hidden /> 30 boissons référencées
                </p>
                <p className="mt-1 text-[11.5px] font-semibold text-white/75">
                  Vin, bière, cocktails, spiritueux, cidre… et les volumes réels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* moteurs disponibles */}
        <section className="mt-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-lagoon-700">Sous le capot</p>
                <h2 className="font-display mt-2 max-w-xl text-balance text-[26px] font-medium leading-tight tracking-tight text-marine-950 sm:text-[30px]">
                  Trois moteurs, <em className="italic text-lagoon-700">un seul écran</em>
                </h2>
              </div>
              <button
                onClick={onEngine}
                className="inline-flex items-center gap-1.5 rounded-full bg-marine-950 px-4 py-2.5 text-[12px] font-bold text-white transition hover:-translate-y-0.5"
              >
                Choisir mon moteur <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </Reveal>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Palette,
                t: "Couleurs",
                d: "Analyse locale instantanée, zéro réseau, zéro téléchargement.",
                tag: "par défaut",
              },
              {
                icon: Cpu,
                t: "TensorFlow.js",
                d: "MobileNet v2 en WebGL sur l'appareil : détecte verres, bouteilles et bars.",
                tag: "~14 Mo au 1er chargement",
              },
              {
                icon: Cloud,
                t: "API vision",
                d: "Gemini, OpenAI, Mistral : un modèle multimodal identifie la boisson en JSON.",
                tag: "clé requise",
              },
            ].map((m) => (
              <div key={m.t} className="rounded-2xl border border-marine-950/8 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-marine-950/[0.05] text-marine-950/70">
                    <m.icon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <span className="rounded-full bg-lagoon-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-lagoon-700">
                    {m.tag}
                  </span>
                </div>
                <p className="mt-2.5 text-[13.5px] font-bold text-marine-950">{m.t}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-marine-950/55">{m.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-marine-950/40">
            <span className="h-1.5 w-1.5 rounded-full bg-lagoon-500" />
            Moteur actif : {engineLabel} — modifiable à tout moment.
          </p>
        </section>

        {/* stats */}
        <section className="mt-14 grid gap-3 sm:grid-cols-3">
          {[
            { v: "0,5 g/L", l: "Seuil légal conducteur confirmé", icon: ShieldCheck },
            { v: "0,2 g/L", l: "Seuil permis probatoire", icon: Info },
            { v: "0,10–0,15", l: "g/L éliminés par heure, pas plus", icon: Clock },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-marine-950/8 bg-white p-4">
              <s.icon className="h-4 w-4 text-lagoon-700" aria-hidden />
              <p className="font-display mt-2 text-[24px] font-semibold leading-none text-marine-950">{s.v}</p>
              <p className="mt-1.5 text-[11.5px] font-semibold leading-snug text-marine-950/50">{s.l}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 flex flex-col items-center rounded-[2rem] bg-gradient-to-br from-lagoon-700 via-marine-900 to-abyss px-6 py-10 text-center">
          <Martini className="h-7 w-7 text-seafoam-200" aria-hidden />
          <h2 className="font-display mt-3 max-w-lg text-balance text-[26px] font-medium leading-tight text-white sm:text-[32px]">
            Ce soir, vous saurez <em className="italic text-gold-300">quand</em> rentrer.
          </h2>
          <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-white/60">
            Le profil se crée une seule fois. Ensuite, un verre, une photo, et la réponse se met à jour.
          </p>
          <button
            onClick={onStart}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-extrabold text-marine-950 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Démarrer <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </section>
      </main>


      <div className="mx-auto max-w-5xl px-4 pb-12 text-center sm:px-6">
        <p className="text-[10.5px] leading-relaxed text-marine-950/40">
          L'Écume · application de démonstration à but de prévention. L'abus d'alcool est dangereux pour la santé,
          à consommer avec modération. Alcool Info Service : 0 980 980 930 (7j/7, 8 h – 2 h, appel anonyme et non surtaxé).
        </p>
      </div>
    </div>
  );
}
