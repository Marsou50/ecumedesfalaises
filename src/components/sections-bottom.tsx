import { useState } from "react";
import {
  ArrowRight, Check, Minus, Plus, ShoppingBag, Truck, ShieldCheck, Snowflake,
  Sunrise, HandPlatter, PackageCheck, Timer, BadgeCheck, Quote,
  Gift, Crown, Waves, Sparkles, ChevronDown, Mail, Lock, PartyPopper,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Reveal, Stagger, Stars, SectionHeading, Eyebrow, useCountUp, useInView, useCountdown } from "./ui";

/* ================= BENEFITS / SAVOIR-FAIRE ================= */
const STEPS = [
  { icon: Sunrise, n: "01", t: "Récolte à l'aube", d: "Jeudi 6h12 : nos ostréiculteurs lèvent les poches à marée basse et sélectionnent les plus belles pièces." },
  { icon: HandPlatter, n: "02", t: "Tri & calibrage main", d: "Chaque huître est pesée, sondée, calibrée. Seules 60% passent notre contrôle qualité drastique." },
  { icon: Snowflake, n: "03", t: "Écrin isotherme 0-2°C", d: "Coffret biosourcé, glace alimentaire et sonde connectée : la chaîne du froid ne rompt jamais." },
  { icon: Truck, n: "04", t: "Livrée en 24h chrono", d: "Vendredi avant 13h partout en France. Encore vivantes, encore iodées, encore d'Étretat." },
];

const CHECKS = [
  "Huîtres ouvertes au couteau avec guide + tutoriel vidéo",
  "Vinaigre à l'échalote & citron bio offerts dès 59€",
  "Conservation 7 jours au réfrigérateur, garantie fraîcheur",
  "Emballage 100% recyclable et compostable",
  "Service client 7j/7 par des écaillers passionnés",
];

export function Benefits() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const c1 = useCountUp(24, inView);
  const c2 = useCountUp(60, inView);
  const c3 = useCountUp(120, inView);

  return (
    <section id="savoir-faire" className="relative overflow-hidden bg-white py-20 lg:py-28" aria-label="Savoir-faire">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-foam blur-[100px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* sticky visual */}
          <div className="relative lg:sticky lg:top-28">
            <Reveal variant="left">
              <div className="relative">
                <div className="overflow-hidden rounded-[2rem] shadow-[0_36px_80px_-24px_rgb(8_32_50/0.4)] ring-1 ring-marine-950/10">
                  <img
                    src="https://images.pexels.com/photos/33733332/pexels-photo-33733332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                    alt="Ostréiculteurs au travail sur les parcs à huîtres à marée basse"
                    className="aspect-[4/4.6] w-full object-cover sm:aspect-[4/3.4] lg:aspect-[4/4.4]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-abyss/60 via-transparent to-transparent" aria-hidden />
                  <div className="absolute inset-x-5 bottom-5">
                    <div className="glass-dark rounded-2xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-seafoam-200">De la falaise à votre table</p>
                        <Timer className="h-4 w-4 text-gold-300" aria-hidden />
                      </div>
                      <div ref={ref} className="mt-3 grid grid-cols-3 gap-3 text-center">
                        {[
                          { v: c1, s: "h chrono", l: "livraison" },
                          { v: c2, s: "% triées", l: "sélection" },
                          { v: c3, s: "+ chefs", l: "nous suivent" },
                        ].map((s) => (
                          <div key={s.l} className="rounded-xl bg-white/[0.07] py-2.5 ring-1 ring-white/10">
                            <p className="font-display text-xl font-semibold">{s.v}<span className="text-[12px] font-sans font-bold text-seafoam-200">{s.s}</span></p>
                            <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/55">{s.l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* mini polaroid */}
                <div className="absolute -bottom-8 -right-3 hidden w-52 rotate-[5deg] animate-float rounded-2xl bg-white p-2.5 shadow-2xl ring-1 ring-marine-950/10 sm:block lg:-right-8" aria-hidden>
                  <img src="https://images.pexels.com/photos/10432748/pexels-photo-10432748.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="" className="aspect-square w-full rounded-xl object-cover" loading="lazy" />
                  <p className="px-1 py-2 text-center text-[11.5px] font-bold text-marine-950/70">Spéciales N°3 · claire n°7</p>
                </div>
                {/* badge */}
                <div className="glass absolute -left-3 -top-5 flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 shadow-xl lg:-left-6" aria-hidden>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-lagoon-600 text-white"><ShieldCheck className="h-4 w-4" /></span>
                  <span className="text-[13px] font-extrabold text-marine-950">Fraîcheur garantie<br /><span className="font-semibold text-marine-950/55">ou intégralement remboursé</span></span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* steps */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Savoir-faire · 24h chrono"
              title={<>De la vague à l'assiette, <em className="text-gradient-lagoon font-light italic">sans jamais attendre</em></>}
              lead="Un circuit si court qu'il tient en une marée. Voici exactement ce qui se passe entre votre clic et votre première huître."
            />
            <Stagger className="mt-9 space-y-3">
              {STEPS.map((s) => (
                <div key={s.n} className="group flex gap-4 rounded-3xl border border-marine-950/[0.07] bg-gradient-to-b from-white to-foam/60 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-lagoon-600/25 hover:shadow-[0_20px_50px_-18px_rgb(8_32_50/0.3)] sm:gap-5 sm:p-6">
                  <div className="flex flex-col items-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-marine-950 text-white shadow-lg transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-lagoon-600">
                      <s.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="font-display mt-2 text-[12px] font-bold tracking-widest text-marine-950/25">{s.n}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-[19px] font-semibold tracking-tight text-marine-950">{s.t}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-marine-950/60">{s.d}</p>
                  </div>
                </div>
              ))}
            </Stagger>

            <Reveal delay={120}>
              <ul className="mt-7 grid gap-2.5 rounded-3xl bg-marine-950 p-6 text-white shadow-xl sm:grid-cols-1 sm:p-7">
                {CHECKS.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-[14.5px] font-medium text-white/85">
                    <span className="mt-0.5 grid h-5.5 w-5.5 shrink-0 place-items-center rounded-full bg-lagoon-500 p-1"><Check className="h-3.5 w-3.5" aria-hidden /></span>
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= TESTIMONIALS ================= */
const TESTIMONIALS = [
  { n: "Claire L.", l: "Paris 7e", t: "Abonnée depuis 2022", q: "Commandées jeudi soir, dégustées samedi midi encore ruisselantes. Je n'achète plus d'huîtres ailleurs — même ma poissonnerie du marché ne suit plus.", p: "Coffret Découverte", c: "bg-lagoon-600" },
  { n: "Marc R.", l: "Lyon", t: "Abonné Prestige", q: "Le plateau homard pour nos 20 ans de mariage : arrivage parfait, glace encore dure, présentation digne d'un palace. Ma femme a cru à un traiteur étoilé.", p: "Plateau Prestige", c: "bg-marine-800" },
  { n: "Sophie & Julien", l: "Bordeaux", t: "Abonnés newsletter", q: "Le code -15% + la livraison offerte, et surtout cette fraîcheur… On entend encore la mer quand on les ouvre. Le tutoriel d'ouverture est génial.", p: "Spéciales N°3 ×48", c: "bg-gold-600" },
  { n: "Chef É. Moreau", l: "Table étoilée, Rouen", t: "Chef partenaire", q: "En 25 ans de métier, rarement vu une régularité pareille. Calibre parfait, chair dense, zéro coquille vide. Mes clients les réclament par leur nom.", p: "Pro · hebdo", c: "bg-marine-950" },
  { n: "Aïcha B.", l: "Nantes", t: "Abonnée depuis 2024", q: "Offerte à mon père, ancien marin : il a eu les larmes aux yeux. « Comme à Étretat en 78 », m'a-t-il dit. Le coffret cadeau est somptueux.", p: "Grande Marée", c: "bg-emerald-700" },
  { n: "Jean-Baptiste D.", l: "Lille", t: "Abonné Essentiel", q: "Service client adorable : une bourriche abîmée par le transporteur, renvoyée le lendemain sans discussion + geste commercial. C'est ça, une grande maison.", p: "L'Essentiel", c: "bg-teal-700" },
];

export function Testimonials() {
  return (
    <section id="avis" className="mesh-dark grain relative overflow-hidden py-20 lg:py-28" aria-label="Avis clients">
      <div className="pointer-events-none absolute left-0 top-1/3 h-[420px] w-[420px] rounded-full bg-lagoon-500/20 blur-[140px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="12 400+ avis vérifiés · 4,9/5"
          title={<>Ils ont goûté la marée, <em className="text-gradient-foam font-light italic">ils racontent</em></>}
          lead="98% de nos abonnés newsletter recommandent la Maison. Voici pourquoi ils reviennent marée après marée."
        />

        <Reveal delay={120}>
          <div className="mx-auto mt-8 flex w-fit flex-wrap items-center justify-center gap-3 rounded-full bg-white/[0.06] px-5 py-3 ring-1 ring-white/10 backdrop-blur">
            <Stars size={15} />
            <span className="text-[14px] font-bold text-white">4,9/5 sur 12 400+ avis</span>
            <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
            <span className="hidden items-center gap-1.5 text-[13px] font-semibold text-white/60 sm:inline-flex">
              <BadgeCheck className="h-4 w-4 text-seafoam-200" aria-hidden /> Avis vérifiés · Trustpilot Excellent
            </span>
          </div>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.n}
              className="group relative flex flex-col rounded-[1.6rem] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/[0.08] hover:ring-white/20 hover:shadow-[0_28px_60px_-16px_rgb(0_0_0/0.5)]"
            >
              <Quote className="absolute right-5 top-5 h-7 w-7 text-white/10 transition group-hover:text-gold-500/30" aria-hidden />
              <Stars size={13} />
              <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-white/80">« {t.q} »</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-white ring-2 ring-white/15", t.c)} aria-hidden>
                  {t.n.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[14px] font-bold text-white">
                    {t.n}
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-seafoam-200" aria-label="Achat vérifié" />
                  </span>
                  <span className="block truncate text-[12.5px] font-semibold text-white/50">{t.l} · {t.t}</span>
                </span>
                <span className="ml-auto hidden shrink-0 rounded-full bg-gold-500/15 px-2.5 py-1 text-[11px] font-bold text-gold-300 ring-1 ring-gold-500/25 xl:block">{t.p}</span>
              </figcaption>
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ================= PRICING ================= */
const PLANS = [
  {
    id: "essentiel", icon: Waves, name: "L'Essentiel", tagline: "Pour les amoureux du vendredi soir",
    monthly: 49, trimestriel: 42, unit: "/mois",
    features: ["24 Spéciales N°3 chaque mois", "Expédition offerte (valeur 12€)", "Vinaigre échalote + guide offerts", "Pause ou annulation à tout moment", "Parrainage : -10€ par filleul"],
    cta: "Choisir l'Essentiel", featured: false,
  },
  {
    id: "prestige", icon: Crown, name: "Le Prestige", tagline: "Le favori de nos abonnés newsletter",
    monthly: 89, trimestriel: 75, unit: "/mois",
    features: ["36 Spéciales + 12 Fines / mois", "1 plateau surprise offert / trimestre", "Accès prioritaire aux éditions limitées", "Couteau d'écailler Laguiole offert", "Conciergerie 7j/7 dédiée", "Livraison créneau 2h au choix"],
    cta: "Choisir le Prestige", featured: true,
  },
  {
    id: "maree", icon: Gift, name: "La Grande Marée", tagline: "Pour les grandes tablées & cadeaux",
    monthly: 149, trimestriel: 127, unit: "/mois",
    features: ["60 huîtres panachées / mois", "Plateau Royal 4 pers. offert / semestre", "Invitation dégustation à Étretat (2 pers.)", "Champagne normand offert à Noël", "Écailler à domicile -20% (Paris & Normandie)"],
    cta: "Choisir la Grande Marée", featured: false,
  },
];

export function Pricing({ onAdd }: { onAdd: (label: string, count?: number) => void }) {
  const [yearly, setYearly] = useState(true); // trimestriel = -15%
  return (
    <section id="abonnements" className="relative overflow-hidden bg-ivory py-20 lg:py-28" aria-label="Abonnements">
      <div className="pointer-events-none absolute right-0 top-20 h-[380px] w-[380px] rounded-full bg-gold-500/10 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Abonnements marée · sans engagement"
          title={<>Recevez la marée <em className="text-gradient-lagoon font-light italic">chaque mois</em>, sans y penser</>}
          lead="Économisez jusqu'à 25% vs à la carte, recevez en priorité les plus belles récoltes. Pause, report ou résiliation en un clic."
        />

        <Reveal delay={130}>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setYearly(false)}
              aria-pressed={!yearly}
              className={cn("rounded-full px-5 py-2.5 text-[14px] font-bold transition", !yearly ? "bg-marine-950 text-white shadow-lg" : "bg-white text-marine-950/55 ring-1 ring-marine-950/10 hover:text-marine-950")}
            >
              Mensuel
            </button>
            <button
              onClick={() => setYearly(true)}
              aria-pressed={yearly}
              className={cn("relative rounded-full px-5 py-2.5 text-[14px] font-bold transition", yearly ? "bg-marine-950 text-white shadow-lg" : "bg-white text-marine-950/55 ring-1 ring-marine-950/10 hover:text-marine-950")}
            >
              Trimestriel
              <span className="absolute -right-3 -top-3 rounded-full bg-lagoon-600 px-2 py-0.5 text-[10.5px] font-extrabold text-white shadow">-15%</span>
            </button>
          </div>
        </Reveal>

        <Stagger className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((p) => {
            const price = yearly ? p.trimestriel : p.monthly;
            return (
              <article
                key={p.id}
                className={cn(
                  "relative flex flex-col overflow-hidden rounded-[1.8rem] p-7 transition-all duration-500 hover:-translate-y-2 sm:p-8",
                  p.featured
                    ? "bg-marine-950 text-white shadow-[0_36px_80px_-20px_rgb(8_32_50/0.55)] ring-1 ring-gold-500/30 lg:scale-[1.04]"
                    : "border border-marine-950/[0.08] bg-white shadow-[0_16px_50px_-18px_rgb(8_32_50/0.22)] hover:shadow-[0_30px_70px_-20px_rgb(8_32_50/0.35)]"
                )}
              >
                {p.featured && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgb(20_145_143/0.3),transparent)]" aria-hidden />
                    <span className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-500 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-abyss shadow-lg">
                      <Sparkles className="h-3 w-3" aria-hidden /> Le plus choisi · 6 200+ abonnés
                    </span>
                  </>
                )}
                <div className={cn("mt-2 flex items-center gap-3", p.featured && "mt-8")}>
                  <span className={cn("grid h-11 w-11 place-items-center rounded-2xl shadow", p.featured ? "bg-gradient-to-br from-gold-500 to-gold-700 text-white" : "bg-foam text-lagoon-700 ring-1 ring-marine-950/10")}>
                    <p.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className={cn("font-display text-[22px] font-semibold tracking-tight", p.featured ? "text-white" : "text-marine-950")}>{p.name}</h3>
                    <p className={cn("text-[12.5px] font-semibold", p.featured ? "text-white/55" : "text-marine-950/50")}>{p.tagline}</p>
                  </div>
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className={cn("font-display text-[3.2rem] font-medium leading-none tracking-tight", p.featured ? "text-white" : "text-marine-950")}>
                    {price}€
                  </span>
                  <span className={cn("text-[14px] font-bold", p.featured ? "text-white/55" : "text-marine-950/50")}>{p.unit}</span>
                  {yearly && (
                    <span className={cn("ml-2 rounded-full px-2 py-0.5 text-[12px] font-bold line-through opacity-60", p.featured ? "bg-white/10" : "bg-foam")}>{p.monthly}€</span>
                  )}
                </div>
                <p className={cn("mt-1 text-[13px] font-semibold", p.featured ? "text-seafoam-200" : "text-lagoon-700")}>
                  {yearly ? "Facturé trimestriellement · -15% inclus" : "Sans engagement · résiliable à tout moment"}
                </p>
                <ul className={cn("mt-6 flex-1 space-y-3 border-t pt-6 text-[14px] font-medium", p.featured ? "border-white/10 text-white/85" : "border-marine-950/10 text-marine-950/75")}>
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", p.featured ? "bg-lagoon-500" : "bg-lagoon-600/10")}>
                        <Check className={cn("h-3 w-3", p.featured ? "text-white" : "text-lagoon-700")} aria-hidden />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onAdd(`Abonnement ${p.name} ajouté`)}
                  className={cn(
                    "btn-shine group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-bold transition-all duration-300 hover:-translate-y-0.5",
                    p.featured
                      ? "bg-gradient-to-r from-gold-600 to-gold-500 text-abyss shadow-xl shadow-gold-600/25 hover:shadow-2xl"
                      : "bg-marine-950 text-white shadow-lg hover:bg-marine-900"
                  )}
                >
                  {p.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </button>
                <p className={cn("mt-3 text-center text-[12px] font-semibold", p.featured ? "text-white/50" : "text-marine-950/45")}>
                  Code ECOME15 cumulable sur la 1<sup>re</sup> box
                </p>
              </article>
            );
          })}
        </Stagger>

        <Reveal delay={100}>
          <p className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-[13px] font-semibold text-marine-950/55">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-lagoon-600" aria-hidden /> Satisfait ou remboursé 30 jours</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-lagoon-600" aria-hidden /> Livraison offerte dès 79€</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-lagoon-600" aria-hidden /> Paiement 3D Secure</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */
const FAQS = [
  { q: "Comment garantissez-vous la fraîcheur pendant le transport ?", a: "Vos huîtres sont récoltées le matin même de l'expédition, placées dans un coffret isotherme biosourcé avec pains de glace alimentaire, et livrées en moins de 24h via Chronofresh (0-2°C suivis en continu). À l'arrivée, elles sont encore vivantes et fermées — sinon, nous les remboursons intégralement, sans photo ni discussion." },
  { q: "Quand serai-je livré si je commande aujourd'hui ?", a: "Nous expédions chaque mardi et jeudi pour garantir une pêche du jour. Toute commande passée avant jeudi 14h est récoltée jeudi à l'aube et livrée vendredi avant 13h partout en France métropolitaine. Vous recevez un SMS de suivi avec créneau de 2h." },
  { q: "Comment fonctionne l'offre newsletter -15% ?", a: "En tant qu'abonné(e), le code ECOME15 vous offre -15% sur tout le site + la livraison offerte dès 79€ (au lieu de 99€). Il est cumulable avec les prix abonnement sur votre première box, et valable jusqu'à dimanche minuit sur l'expédition de cette semaine." },
  { q: "Combien de temps se conservent les huîtres ?", a: "Jusqu'à 7 jours au réfrigérateur (entre 4 et 8°C), pointe vers le bas, dans leur bourriche. Nous indiquons la date limite optimale sur chaque coffret. En pratique, nos clients les dégustent dans les 48h — difficile de résister plus longtemps." },
  { q: "Je ne sais pas ouvrir les huîtres, que faire ?", a: "Chaque première commande inclut notre guide illustré + un accès à notre tutoriel vidéo de 3 minutes. Le couteau d'écailler professionnel est offert dès 69€ d'achat. Et nos écaillers répondent en direct 7j/7 si besoin — promis, au bout de 3 huîtres, vous serez autonome." },
  { q: "Puis-je offrir un coffret ou un abonnement ?", a: "Absolument — 40% de nos coffrets sont des cadeaux. Choisissez l'option 'Coffret cadeau' : message manuscrit, papier de soie aux couleurs de la Maison, et aucune facture dans le colis. Pour les abonnements, la carte cadeau est envoyée par email ou courrier, à activer quand le destinataire le souhaite." },
  { q: "Et si mes huîtres arrivent ouvertes ou abîmées ?", a: "Cela arrive dans moins de 0,4% des cas, mais le transport reste une aventure : photographiez simplement le coffret, écrivez-nous, et nous renvoyons une bourriche neuve ou remboursons intégralement sous 24h. Sans formulaire compliqué, sans conditions cachées." },
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-white py-20 lg:py-28" aria-label="Questions fréquentes">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="Questions fréquentes"
              title={<>Tout ce que nos abonnés <em className="text-gradient-lagoon font-light italic">nous demandent</em></>}
              lead="Livraison, fraîcheur, conservation, cadeaux… Et pour le reste, nos écaillers vous répondent 7j/7 au 02 35 00 00 00."
            />
            <Reveal delay={180}>
              <div className="mt-7 rounded-3xl border border-marine-950/[0.08] bg-foam/70 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-marine-950 text-white"><PartyPopper className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <p className="text-[15px] font-extrabold text-marine-950">Une grande occasion ?</p>
                    <p className="text-[13px] font-semibold text-marine-950/55">Mariage, fêtes, comité d'entreprise</p>
                  </div>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-marine-950/65">Devis en 2h, écailler à domicile et bourriches personnalisées dès 100 pièces.</p>
                <a href="#commander" className="group mt-4 inline-flex items-center gap-2 text-[14px] font-extrabold text-lagoon-700">
                  Demander un devis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </a>
              </div>
            </Reveal>
          </div>

          <Stagger className="space-y-3">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={f.q}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all duration-500",
                    isOpen ? "border-lagoon-600/30 bg-gradient-to-b from-seafoam-100/40 to-white shadow-[0_18px_44px_-18px_rgb(8_32_50/0.3)]" : "border-marine-950/[0.08] bg-white hover:border-marine-950/20 hover:shadow-md"
                  )}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span className={cn("font-display text-[16.5px] font-semibold tracking-tight sm:text-[17.5px]", isOpen ? "text-marine-950" : "text-marine-950/85")}>
                      {f.q}
                    </span>
                    <span className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500",
                      isOpen ? "rotate-180 bg-lagoon-600 text-white shadow-lg" : "bg-foam text-marine-950"
                    )}>
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                  <div
                    className={cn("grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-6 text-[14.5px] leading-relaxed text-marine-950/65 sm:px-6">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ================= FINAL CTA ================= */
export function FinalCTA({ onAdd }: { onAdd: (label: string, count?: number) => void }) {
  const { d, h, m, s } = useCountdown();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [qty, setQty] = useState(1);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true);
    onAdd("Code ECOME15 activé sur votre commande");
  };

  return (
    <section id="commander" className="relative bg-white px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28" aria-label="Commander">
      <Reveal variant="scale">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-abyss text-white shadow-[0_50px_120px_-30px_rgb(6_18_30/0.7)] lg:rounded-[2.6rem]">
          <img
            src="https://images.pexels.com/photos/28637034/pexels-photo-28637034.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-abyss/95 via-marine-950/85 to-lagoon-700/60" aria-hidden />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 animate-drift rounded-full bg-lagoon-500/25 blur-[100px]" aria-hidden />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gold-500/15 blur-[110px]" aria-hidden />

          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:p-16">
            <div>
              <Eyebrow dark icon={<Timer className="h-3.5 w-3.5" aria-hidden />}>
                Expédition jeudi · clôture des commandes
              </Eyebrow>
              <h2 className="font-display mt-5 text-balance text-3xl font-medium leading-[1.06] tracking-tight sm:text-4xl lg:text-[3.4rem]">
                Votre marée de jeudi est <em className="text-gradient-foam font-light italic">presque complète</em>
              </h2>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/70">
                38 coffrets restants sur 400. Commandez avant jeudi 14h et dégustez vendredi :
                huîtres encore vivantes, <strong className="text-white">-15% abonnés + livraison offerte dès 79€</strong>.
              </p>

              {/* countdown */}
              <div className="mt-7 flex items-center gap-2.5" role="timer" aria-label={`Il reste ${d} jours, ${h} heures, ${m} minutes et ${s} secondes avant la clôture`}>
                {[
                  { v: d, l: "jours" },
                  { v: h, l: "heures" },
                  { v: m, l: "min" },
                  { v: s, l: "sec" },
                ].map((u) => (
                  <div key={u.l} className="min-w-[70px] rounded-2xl bg-white/[0.08] px-3 py-3 text-center ring-1 ring-white/12 backdrop-blur">
                    <p className="font-display text-3xl font-semibold tabular-nums">{String(u.v).padStart(2, "0")}</p>
                    <p className="text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-white/50">{u.l}</p>
                  </div>
                ))}
                <p className="ml-2 hidden max-w-[140px] text-[12.5px] font-semibold leading-snug text-white/55 sm:block">avant la levée des poches à Étretat</p>
              </div>

              {/* email capture */}
              {!sent ? (
                <form onSubmit={submit} className="mt-7 max-w-xl">
                  <label htmlFor="cta-email" className="text-[13px] font-bold uppercase tracking-[0.14em] text-seafoam-200">
                    Recevoir mon code -15% par email
                  </label>
                  <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
                      <input
                        id="cta-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.fr"
                        className="w-full rounded-full border border-white/15 bg-white/[0.08] py-4 pl-11 pr-4 text-[15px] font-semibold text-white placeholder:text-white/35 backdrop-blur transition focus:border-seafoam-200/60 focus:bg-white/[0.12] focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="btn-shine inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-7 py-4 text-[15px] font-extrabold text-marine-950 transition hover:-translate-y-0.5 hover:shadow-2xl">
                      Activer -15% <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-medium text-white/45">
                    <Lock className="h-3 w-3" aria-hidden /> Zéro spam. Désinscription en 1 clic. Offre cumulable 1<sup>re</sup> box.
                  </p>
                </form>
              ) : (
                <div className="mt-7 flex max-w-xl animate-[rise-in_0.5s_ease] items-center gap-4 rounded-2xl bg-emerald-500/15 p-5 ring-1 ring-emerald-400/30">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <p className="text-[15px] font-extrabold">Code ECOME15 activé — bravo !</p>
                    <p className="text-[13.5px] text-white/65">Vérifiez votre boîte mail : votre bon de -15% + livraison offerte vous attend.</p>
                  </div>
                </div>
              )}
            </div>

            {/* order card */}
            <div className="self-center">
              <div className="glass rounded-[1.8rem] p-6 text-marine-950 shadow-2xl sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-lagoon-700">Le choix des abonnés</p>
                    <h3 className="font-display mt-1 text-[22px] font-semibold tracking-tight">Coffret Découverte · 36 pièces</h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Stars size={12} />
                      <span className="text-[12.5px] font-bold text-marine-950/55">4,9 · 2 108 avis</span>
                    </div>
                  </div>
                  <img
                    src="https://images.pexels.com/photos/35751138/pexels-photo-35751138.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                    alt="Coffret découverte d'huîtres sur glace"
                    className="h-20 w-20 rounded-2xl object-cover shadow-lg"
                    loading="lazy"
                  />
                </div>
                <ul className="mt-4 space-y-2 border-y border-dashed border-marine-950/12 py-4 text-[13.5px] font-semibold text-marine-950/70">
                  <li className="flex justify-between"><span>12 Spéciales N°3 + 12 Fines + 12 Claires</span><Check className="h-4 w-4 text-lagoon-600" aria-hidden /></li>
                  <li className="flex justify-between"><span>Couteau + vinaigre échalote offerts</span><Check className="h-4 w-4 text-lagoon-600" aria-hidden /></li>
                  <li className="flex justify-between"><span>Livrée vendredi avant 13h</span><Truck className="h-4 w-4 text-lagoon-600" aria-hidden /></li>
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-semibold">50€</span>
                    <span className="text-[15px] font-bold text-marine-950/35 line-through">69€</span>
                    <span className="rounded-full bg-lagoon-600 px-2 py-0.5 text-[11px] font-extrabold text-white">-15% inclus</span>
                  </div>
                  <div className="flex items-center rounded-full bg-white ring-1 ring-marine-950/10">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center rounded-l-full hover:bg-foam" aria-label="Diminuer la quantité"><Minus className="h-4 w-4" /></button>
                    <span className="w-7 text-center text-[15px] font-extrabold">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="grid h-9 w-9 place-items-center rounded-r-full hover:bg-foam" aria-label="Augmenter la quantité"><Plus className="h-4 w-4" /></button>
                  </div>
                </div>
                <button
                  onClick={() => onAdd(`Coffret Découverte ×${qty} ajouté au panier`, qty)}
                  className="btn-shine group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-marine-950 py-4 text-[15.5px] font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-marine-900"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
                  Commander — {(50 * qty).toFixed(0)}€ au lieu de {(69 * qty).toFixed(0)}€
                </button>
                <div className="mt-3 flex items-center justify-center gap-4 text-[12px] font-bold text-marine-950/50">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-lagoon-600" /> Remboursé si déçu</span>
                  <span className="inline-flex items-center gap-1"><PackageCheck className="h-3.5 w-3.5 text-lagoon-600" /> Paiement sécurisé</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[12px] font-bold text-marine-950/60">
                    <span>Jauge de la marée de jeudi</span><span className="text-lagoon-700">90% complet</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-marine-950/10">
                    <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-lagoon-600 via-lagoon-400 to-gold-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
