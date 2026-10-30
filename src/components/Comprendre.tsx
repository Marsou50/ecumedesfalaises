import { useState } from "react";
import {
  ChevronDown, Droplets, Clock, Car, Info, Utensils, Wine, ShieldCheck,
  AlertTriangle, Phone, Scale, Ban, Coffee, Footprints, Moon, Sparkles,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Reveal } from "./ui";
import { SAFETY_MARGIN, widmarkR, type Profile } from "../lib/bac";
import { describeEngine } from "../lib/recognition";
import { useApp } from "../lib/store";

const STANDARD = [
  { name: "Bière 5°", v: "25 cl", g: 10, color: "#d9a01a", glass: "pint" as const },
  { name: "Vin 12°", v: "10 cl", g: 9.5, color: "#6b1530", glass: "wine" as const },
  { name: "Champagne 12,5°", v: "10 cl", g: 9.9, color: "#f0dfa4", glass: "flute" as const },
  { name: "Spiritueux 40°", v: "3 cl", g: 9.5, color: "#a35f14", glass: "shot" as const },
  { name: "Porto 18°", v: "6 cl", g: 8.5, color: "#7c1f2b", glass: "wine" as const },
];

const FAQ = [
  {
    q: "Pourquoi la même quantité d'alcool donne-t-elle un taux différent selon la personne ?",
    a: "L'alcool se répartit dans l'eau de l'organisme. Plus vous êtes léger, plus la concentration est élevée à dose égale. La formule de Widmark divise les grammes d'alcool absorbés par le poids corporel multiplié par un coefficient de diffusion : environ 0,70 pour un homme et 0,60 pour une femme, du fait d'une proportion d'eau corporelle différente. Ce coefficient est ici légèrement ajusté selon l'IMC et l'âge.",
  },
  {
    q: "Le fait de manger change quoi exactement ?",
    a: "Un repas ne détruit pas l'alcool, mais il ralentit son passage dans le sang : le pic est plus bas et arrive plus tard. À jeun, l'absorption peut être complète en 20 à 30 minutes ; après un repas copieux, elle peut s'étaler sur plus d'une heure. L'application modélise cet étalement (20, 40, 60 ou 80 minutes).",
  },
  {
    q: "Quel est le seuil légal en France ?",
    a: "Moins de 0,5 g/L de sang (0,25 mg/L d'air expiré) pour un conducteur confirmé, et moins de 0,2 g/L pendant le permis probatoire, en transport en commun ou en apprentissage. À partir de 0,8 g/L, il s'agit d'un délit. L'application applique toujours une marge de sécurité de 0,10 g/L avant de vous dire que reprendre le volant est envisageable.",
  },
  {
    q: "Peut-on accélérer l'élimination ?",
    a: "Non. Le foie élimine en moyenne 0,10 à 0,15 g/L par heure, et rien ne l'accélère : ni café, ni douche froide, ni sport, ni grands verres d'eau. Ces méthodes masquent la sensation d'ivresse sans abaisser le taux mesuré au volant.",
  },
  {
    q: "La reconnaissance photo est-elle fiable ?",
    a: "Cette démonstration analyse la forme, la teinte moyenne et le niveau de remplissage pour proposer jusqu'à 3 boissons candidates avec un indice de confiance. Le degré d'alcool n'est jamais lisible sur une photo : vous devez toujours vérifier et ajuster la proposition. Un modèle de vision entraîné serait nécessaire pour une reconnaissance robuste en conditions réelles.",
  },
  {
    q: "Pourquoi ajouter une marge de sécurité ?",
    a: "Parce que l'estimation repose sur des valeurs moyennes. Reins, foie, génétique, médicaments, fatigue, cycle hormonal, estomac plein ou vide : tellement de facteurs déplacent le taux réel. Annoncer une heure exacte serait trompeur ; annoncer une heure prudente est utile.",
  },
];

/** Réponse à la question « reconnaissance photo » selon le moteur actif. */
const FAQ_RECOGNITION: Record<
  "heuristique" | "tensorflow" | "api",
  (engine: string) => string
> = {
  heuristique: () =>
    "Le moteur actif (analyse locale des couleurs, mode de secours) mesure la teinte, la saturation, la luminosité et le niveau de remplissage, puis propose jusqu'à 3 boissons avec un indice de confiance. Il ne lit jamais le degré d'alcool : vous devez vérifier et ajuster la proposition.",
  tensorflow: (engine) =>
    `Le moteur actif (${engine}) exécute un vrai réseau de neurones entraîné sur ImageNet (1 000 classes générales), directement sur votre appareil : la photo ne quitte jamais le téléphone et aucun compte n'est nécessaire. Il reconnaît très bien un verre, une bouteille, un bar ou un cocktail, mais ImageNet ne contient aucune classe « pinte » ou « mojito » : les familles détectées sont croisées avec la teinte mesurée pour proposer une boisson. Le degré reste donc estimé, jamais lu.`,
  api: (engine) =>
    `Le moteur actif (${engine}) envoie la photo à un modèle multimodal qui répond en JSON avec une liste de boissons de notre catalogue, un volume et un degré estimés. C'est le plus précis des trois, mais l'image quitte l'appareil, la clé est exposée au navigateur et une erreur du modèle reste possible : la confirmation humaine est obligatoire.`,
};

export function Comprendre({ profile }: { profile: Profile | null }) {
  const { state } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const engineName = describeEngine(state.engine);
  const faq = FAQ.map((f) =>
    f.q.startsWith("La reconnaissance photo") ? { ...f, a: FAQ_RECOGNITION[state.engine.engine](engineName) } : f
  );
  const r = profile ? widmarkR(profile) : 0.7;
  const volume = profile ? Math.round(profile.weightKg * r) : 52;

  return (
    <div className="space-y-5">
      <section>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-lagoon-700">Comprendre</p>
        <h1 className="font-display mt-1.5 text-balance text-[28px] font-medium leading-[1.08] tracking-tight text-marine-950 sm:text-[34px]">
          Ce qui se passe dans votre corps, <em className="italic text-lagoon-700">et dans la loi</em>.
        </h1>
        <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-marine-950/60">
          Pas de morale, juste des chiffres : seuils, délais, unités d'alcool et pièges classiques.
        </p>
      </section>

      {/* seuils */}
      <section className="grid gap-2.5 sm:grid-cols-3">
        {[
          { v: "0,2 g/L", l: "Permis probatoire", d: "En pratique, zéro verre", icon: AlertTriangle, tone: "gold" },
          { v: "0,5 g/L", l: "Conducteur confirmé", d: "Contravention au-delà", icon: ShieldCheck, tone: "orange" },
          { v: "0,8 g/L", l: "Délit", d: "Tribunal correctionnel", icon: Ban, tone: "red" },
        ].map((s) => (
          <div
            key={s.v}
            className={cn(
              "rounded-2xl p-4 ring-1",
              s.tone === "gold" ? "bg-gold-100/70 ring-gold-500/25"
                : s.tone === "orange" ? "bg-orange-50 ring-orange-200"
                : "bg-red-50 ring-red-200"
            )}
          >
            <s.icon className={cn("h-4 w-4", s.tone === "gold" ? "text-gold-700" : s.tone === "orange" ? "text-orange-600" : "text-red-600")} aria-hidden />
            <p className="font-display mt-2 text-[24px] font-semibold leading-none text-marine-950">{s.v}</p>
            <p className="mt-1.5 text-[11.5px] font-extrabold text-marine-950/70">{s.l}</p>
            <p className="text-[10.5px] font-semibold text-marine-950/45">{s.d}</p>
          </div>
        ))}
      </section>

      {/* unité d'alcool */}
      <section className="rounded-[2rem] bg-white p-5 ring-1 ring-marine-950/8">
        <div className="flex items-center gap-2">
          <Wine className="h-4 w-4 text-lagoon-700" aria-hidden />
          <h2 className="font-display text-[19px] font-semibold text-marine-950">Le verre standard = 10 g</h2>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-marine-950/55">
          Un « verre » n'a de sens que rapporté à sa quantité d'alcool pur. Ces cinq services contiennent
          tous environ 10 g d'alcool — mais les verres servis au bar sont souvent 1,5 à 2 fois plus grands.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STANDARD.map((s) => (
            <div key={s.name} className="flex items-center gap-3 rounded-xl bg-foam/70 p-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path d="M6 5h12l-1.4 11a4 4 0 0 1-4 3.5h-1.2a4 4 0 0 1-4-3.5L6 5Z" fill={s.color} fillOpacity="0.75" stroke="#082032" strokeOpacity="0.3" strokeWidth="1.2" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold text-marine-950">{s.name}</p>
                <p className="text-[10.5px] font-semibold text-marine-950/45">{s.v}</p>
              </div>
              <span className="rounded-md bg-lagoon-500/10 px-1.5 py-0.5 text-[10.5px] font-extrabold text-lagoon-700">
                {String(s.g).replace(".", ",")} g
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* formule */}
      <section className="overflow-hidden rounded-[2rem] bg-marine-950 p-5 text-white sm:p-6">
        <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-seafoam-200">
          <Scale className="h-3.5 w-3.5" aria-hidden /> La formule utilisée
        </p>
        <div className="mt-3 rounded-xl bg-white/[0.06] p-4 font-mono text-[12.5px] leading-relaxed text-white/85 ring-1 ring-white/10">
          <div>alcoolémie (g/L) =</div>
          <div className="mt-1 pl-3">
            grammes d'alcool absorbés
            <div className="mt-0.5 border-t border-white/20 pt-0.5">
              poids (kg) × coefficient r
            </div>
          </div>
          <div className="mt-2 text-white/55">− élimination (0,10 à 0,15 g/L par heure)</div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-white/[0.06] p-3">
            <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-white/40">Votre coefficient r</p>
            <p className="font-display mt-0.5 text-[19px] font-semibold">{r.toFixed(2).replace(".", ",")}</p>
          </div>
          <div className="rounded-xl bg-white/[0.06] p-3">
            <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-white/40">Volume de diffusion</p>
            <p className="font-display mt-0.5 text-[19px] font-semibold">{volume} L</p>
          </div>
          <div className="rounded-xl bg-white/[0.06] p-3">
            <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-white/40">Marge de sécurité</p>
            <p className="font-display mt-0.5 text-[19px] font-semibold">{String(SAFETY_MARGIN).replace(".", ",")} g/L</p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-seafoam-200/80">
          <Sparkles className="h-3 w-3" aria-hidden /> Moteur de reconnaissance actif : {engineName}
        </p>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-white/50">
          Grammes d'alcool = volume (cl) × 10 × degré (%) × 0,789 (densité de l'éthanol).
          Le coefficient r vaut 0,70 (homme) ou 0,60 (femme), ajusté selon l'IMC et l'âge.
          L'élimination est appliquée heure par heure, après une phase d'absorption progressive.
        </p>
      </section>

      {/* mythes */}
      <section>
        <h2 className="font-display text-[19px] font-semibold text-marine-950">Les faux amis</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {[
            { icon: Coffee, mythe: "« Un café fort ça dégrise »", vrai: "Non : la caféine masque la somnolence, le foie élimine l'alcool au même rythme." },
            { icon: Droplets, mythe: "« Une douche froide et c'est bon »", vrai: "L'alcoolémie ne change pas d'un milligramme. Vous aurez juste froid." },
            { icon: Footprints, mythe: "« Danser élimine plus vite »", vrai: "L'effort déshydrate et augmente le risque, pas la vitesse d'élimination." },
            { icon: Moon, mythe: "« Le temps de sommeil suffit »", vrai: "Le sommeil n'accélère rien, mais le taux continue de baisser heure après heure." },
            { icon: Clock, mythe: "« Une heure par verre »", vrai: "Ordre de grandeur : 1 à 2 h par verre standard selon le gabarit et l'heure de consommation." },
            { icon: Utensils, mythe: "« Manger après boire annule »", vrai: "Manger avant ralentit l'absorption ; manger après ne retire rien." },
          ].map((m) => (
            <div key={m.mythe} className="rounded-2xl bg-white p-4 ring-1 ring-marine-950/8">
              <div className="flex items-start gap-2">
                <m.icon className="mt-0.5 h-4 w-4 shrink-0 text-marine-950/30" aria-hidden />
                <div>
                  <p className="text-[12.5px] font-bold text-marine-950/40 line-through decoration-red-400/60 decoration-2">{m.mythe}</p>
                  <p className="mt-1 text-[12px] font-semibold leading-relaxed text-marine-950/70">{m.vrai}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* plan sécurité */}
      <section className="rounded-[2rem] bg-gradient-to-br from-lagoon-700 to-marine-950 p-5 text-white">
        <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-seafoam-200">
          <Car className="h-3.5 w-3.5" aria-hidden /> Le plan B, décidé avant le premier verre
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            "Désignez un conducteur sobre pour la soirée (et un deuxième, au cas où).",
            "Gardez 15 € en liquide ou une appli VTC installée pour le retour.",
            "Repérez le dernier bus / train / tram avant de commencer à boire.",
            "Un verre d'eau entre chaque verre d'alcool, jamais à jeun.",
            "Prévenez quelqu'un de votre heure de retour prévue.",
            "Dormez sur place si vous pouvez : c'est la seule certitude.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[12px] font-semibold leading-relaxed text-white/80">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-300" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-display text-[19px] font-semibold text-marine-950">Questions fréquentes</h2>
        <div className="mt-3 space-y-2">
          {faq.map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-marine-950/8">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="text-[12.5px] font-bold text-marine-950">{f.q}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-marine-950/35 transition-transform", open === i && "rotate-180")} aria-hidden />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 pb-4 text-[12px] leading-relaxed text-marine-950/60">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* aide */}
      <section className="rounded-[2rem] bg-white p-5 ring-1 ring-marine-950/8">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-gold-600" aria-hidden />
          <h2 className="font-display text-[17px] font-semibold text-marine-950">Besoin d'en parler ?</h2>
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-marine-950/55">
          Alcool Info Service : écoute anonyme et confidentielle, 7 jours sur 7 de 8 h à 2 h.
          Gratuit depuis un poste fixe.
        </p>
        <a
          href="tel:0980980930"
          className="mt-3 flex items-center justify-between rounded-xl bg-marine-950 px-4 py-3 text-white transition hover:bg-marine-900"
        >
          <span className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
              <Phone className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[13.5px] font-extrabold">0 980 980 930</span>
          </span>
          <span className="text-[10.5px] font-bold text-white/50">Appeler</span>
        </a>
      </section>
    </div>
  );
}
