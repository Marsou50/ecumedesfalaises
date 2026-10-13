import { useState } from "react";
import {
  ArrowRight, BadgeCheck, Thermometer, Timer, Anchor, Fish, Snowflake,
  PackageCheck, Leaf, Star, Plus, Minus, ShoppingBag, Truck, ShieldCheck,
  Sparkles, Quote, Award, ChefHat, Newspaper, Check, Play, ChevronRight,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Reveal, Stagger, Stars, SectionHeading, Eyebrow, useCountUp, useInView } from "./ui";

/* ================= HERO ================= */
export function Hero({ onAdd }: { onAdd: (label: string, count?: number) => void }) {
  return (
    <section id="haut" className="mesh-hero grain relative overflow-hidden" aria-label="Présentation">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] animate-drift rounded-full bg-lagoon-400/20 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute -right-40 top-64 h-[520px] w-[520px] animate-drift rounded-full bg-gold-500/20 blur-[130px] [animation-delay:-6s]" aria-hidden />
      {/* floating bubbles */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        {[
          { l: "6%", t: "22%", s: 10, d: "0s" },
          { l: "10%", t: "68%", s: 14, d: "-2s" },
          { l: "46%", t: "12%", s: 8, d: "-4s" },
          { l: "92%", t: "30%", s: 12, d: "-1s" },
          { l: "88%", t: "74%", s: 9, d: "-5s" },
        ].map((b, i) => (
          <span
            key={i}
            style={{ left: b.l, top: b.t, width: b.s, height: b.s, animationDelay: b.d }}
            className="absolute animate-bubble rounded-full border border-lagoon-600/30 bg-lagoon-400/10"
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
        {/* copy */}
        <div className="max-w-2xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5">
              <Eyebrow icon={<span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-pulse-dot rounded-full bg-lagoon-500" /><span className="h-2 w-2 rounded-full bg-lagoon-600" /></span>}>
                Prochaine marée · Jeudi 6h12
              </Eyebrow>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1.5 text-[12px] font-bold text-gold-700 ring-1 ring-gold-500/25">
                <Award className="h-3.5 w-3.5" aria-hidden /> Médaille d'Or 2025
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 text-[12px] font-extrabold uppercase tracking-[0.28em] text-lagoon-700">
              Maison ostréicole · Étretat depuis 1962
            </p>
            <h1 className="font-display mt-3 text-balance text-[2.7rem] font-medium leading-[1.02] tracking-tight text-marine-950 sm:text-6xl lg:text-[4.6rem]">
              La marée du matin,
              <br />
              <em className="text-gradient-lagoon font-light italic">à votre table</em> demain.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-pretty text-[16.5px] leading-relaxed text-marine-950/65 sm:text-lg">
              Huîtres spéciales affinées au pied des falaises, récoltées à l'aube{" "}
              <strong className="font-bold text-marine-950">à la commande</strong> et livrées en 24h chrono.
              Réservé aux abonnés newsletter : <strong className="font-bold text-lagoon-700">-15% + livraison offerte dès 79€</strong>.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#coffrets"
                className="btn-shine group inline-flex items-center justify-center gap-2.5 rounded-full bg-marine-950 px-7 py-4 text-[15px] font-bold text-white shadow-[0_20px_50px_-12px_rgb(8_32_50/0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-12px_rgb(8_32_50/0.55)]"
              >
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
                Commander en ligne
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </a>
              <a
                href="#savoir-faire"
                className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-marine-950/15 bg-white/70 px-7 py-4 text-[15px] font-bold text-marine-950 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-lagoon-600/40 hover:shadow-xl"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-lagoon-600/10 transition group-hover:bg-lagoon-600 group-hover:text-white">
                  <Play className="h-3 w-3 fill-current" aria-hidden />
                </span>
                Notre savoir-faire
              </a>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13.5px] font-semibold text-marine-950/60">
              <span className="flex items-center gap-2">
                <span className="flex -space-x-2" aria-hidden>
                  {["CL", "MR", "JB", "SA"].map((n, i) => (
                    <span key={n} className={cn("grid h-7 w-7 place-items-center rounded-full text-[9px] font-extrabold text-white ring-2 ring-ivory", ["bg-marine-800", "bg-lagoon-600", "bg-gold-600", "bg-marine-950"][i])}>{n}</span>
                  ))}
                </span>
                <span><strong className="text-marine-950">12 400+</strong> gourmets conquis</span>
              </span>
              <span className="flex items-center gap-1.5"><Stars size={13} /> <strong className="text-marine-950">4,9/5</strong> · avis vérifiés</span>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <dl className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: Timer, v: "24h", l: "Pêche → assiette" },
                { icon: Thermometer, v: "0-2°C", l: "Chaîne du froid" },
                { icon: ShieldCheck, v: "100%", l: "Fraîcheur garantie" },
              ].map((s) => (
                <div key={s.l} className="glass-soft rounded-2xl px-3 py-3 text-center transition hover:-translate-y-1 hover:shadow-lg">
                  <s.icon className="mx-auto h-4 w-4 text-lagoon-700" aria-hidden />
                  <dt className="sr-only">{s.l}</dt>
                  <dd className="font-display mt-1 text-lg font-semibold text-marine-950">{s.v}</dd>
                  <dd className="text-[11px] font-bold uppercase tracking-wide text-marine-950/50">{s.l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* visual */}
        <Reveal variant="scale" delay={140} className="relative">
          <div className="relative mx-auto max-w-[560px]">
            {/* conic ring */}
            <div className="ring-conic absolute -inset-3 rounded-[2.2rem] opacity-25 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-20px_rgb(8_32_50/0.45)] ring-1 ring-marine-950/10">
              <img
                src="https://images.pexels.com/photos/35751130/pexels-photo-35751130.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="Huîtres spéciales d'Étretat servies sur glace avec citron et aneth"
                className="aspect-[5/5.4] w-full object-cover sm:aspect-[5/4.6] lg:aspect-[5/5.2]"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss/55 via-transparent to-transparent" aria-hidden />
              {/* bottom info inside image */}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
                <div className="glass-dark flex items-center gap-3 rounded-2xl px-4 py-3 text-white">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-lagoon-500/90"><Fish className="h-4 w-4" aria-hidden /></span>
                  <span>
                    <span className="block text-[13px] font-bold">Spéciales N°3 · 24 pièces</span>
                    <span className="block text-[12px] text-white/65">Récoltées jeudi à l'aube</span>
                  </span>
                </div>
                <button
                  onClick={() => onAdd("Spéciales N°3 ajoutées au panier")}
                  className="btn-shine hidden h-12 items-center gap-2 rounded-2xl bg-white px-5 text-[14px] font-extrabold text-marine-950 shadow-xl transition hover:-translate-y-0.5 sm:inline-flex"
                  aria-label="Ajouter les Spéciales N°3 au panier"
                >
                  <Plus className="h-4 w-4" aria-hidden /> 42€
                </button>
              </div>
            </div>

            {/* floating card top-right */}
            <div className="glass absolute -right-3 top-6 hidden w-52 animate-float rounded-2xl p-4 shadow-xl sm:block lg:-right-8" aria-hidden>
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-lagoon-700">
                <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-pulse-dot rounded-full bg-emerald-500" /><span className="h-2 w-2 rounded-full bg-emerald-500" /></span>
                En direct du parc
              </div>
              <p className="font-display mt-1.5 text-2xl font-semibold text-marine-950">2,4°C</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-marine-950/10">
                <div className="h-full w-[34%] rounded-full bg-gradient-to-r from-lagoon-500 to-seafoam-200" />
              </div>
              <p className="mt-1.5 text-[11.5px] font-semibold text-marine-950/55">Eau à marée montante · salinité 33‰</p>
            </div>

            {/* floating card left */}
            <div className="glass absolute -left-3 top-1/3 hidden w-56 animate-float-slow rounded-2xl p-4 shadow-xl sm:block lg:-left-10" aria-hidden>
              <div className="flex items-center gap-2.5">
                <img src="https://images.pexels.com/photos/39123533/pexels-photo-39123533.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
                <div>
                  <p className="text-[13px] font-bold text-marine-950">Famille Aubert</p>
                  <p className="text-[11.5px] font-semibold text-marine-950/55">3<sup>e</sup> génération</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-marine-950/[0.05] px-3 py-2 text-[12px] font-bold text-marine-950">
                <Snowflake className="h-3.5 w-3.5 text-lagoon-600" /> Expédition isotherme 24h
              </div>
            </div>

            {/* rating pill */}
            <div className="glass absolute -bottom-5 left-1/2 flex w-max -translate-x-1/2 items-center gap-3 rounded-full py-2.5 pl-3 pr-5 shadow-xl">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-white"><Star className="h-4 w-4 fill-current" aria-hidden /></span>
              <span className="text-[13px] font-bold text-marine-950">4,9/5 — « Les meilleures huîtres hors Bretagne » <span className="font-semibold text-marine-950/50">· Gault & Millau</span></span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* wave divider */}
      <svg viewBox="0 0 1440 72" className="relative block w-full text-white" preserveAspectRatio="none" aria-hidden>
        <path d="M0,40 C240,72 480,0 720,28 C960,56 1200,64 1440,24 L1440,72 L0,72 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

/* ================= SOCIAL PROOF ================= */
export function SocialProof() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const stats = [
    { v: 62, suffix: " ans", label: "de savoir-faire" },
    { v: 12400, suffix: "+", label: "avis vérifiés 4,9/5", format: true },
    { v: 98, suffix: "%", label: "recommandent la Maison" },
    { v: 24, suffix: "h", label: "de la mer à votre porte" },
  ];
  return (
    <section className="relative bg-white" aria-label="Preuves de confiance">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Reveal>
          <p className="text-center text-[12px] font-extrabold uppercase tracking-[0.26em] text-marine-950/40">
            Plébiscités par la presse gastronomique
          </p>
        </Reveal>
        <Reveal delay={100}>
          <div className="mask-fade-x mt-7 overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-12 pr-12">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center gap-12" aria-hidden={copy === 1}>
                  {[
                    { n: "Gault & Millau", s: "★★★★ · 2026", icon: Award },
                    { n: "Guide MICHELIN", s: "Sélection Producteurs", icon: ChefHat },
                    { n: "Elle à Table", s: "« L'huître parfaite »", icon: Newspaper },
                    { n: "Le Fooding", s: "Prix Mer & Terroir", icon: Sparkles },
                    { n: "Saveurs de Normandie", s: "Médaille d'Or 2025", icon: BadgeCheck },
                    { n: "Tables d'Exception", s: "120+ chefs étoilés", icon: Quote },
                  ].map((p) => (
                    <div key={p.n + copy} className="flex shrink-0 items-center gap-3 opacity-70 transition hover:opacity-100">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-foam ring-1 ring-marine-950/10">
                        <p.icon className="h-4 w-4 text-lagoon-700" aria-hidden />
                      </span>
                      <span>
                        <span className="font-display block text-[16px] font-semibold text-marine-950">{p.n}</span>
                        <span className="block text-[12px] font-bold text-marine-950/45">{p.s}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div ref={ref} className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} value={s.v} suffix={s.suffix} label={s.label} started={inView} delay={i * 90} format={s.format} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, suffix, label, started, delay, format }: { value: number; suffix: string; label: string; started: boolean; delay: number; format?: boolean }) {
  const v = useCountUp(value, started);
  const display = format ? v.toLocaleString("fr-FR") : v;
  return (
    <div
      className={cn("reveal group rounded-3xl border border-marine-950/[0.07] bg-gradient-to-b from-foam to-white p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-16px_rgb(8_32_50/0.25)] sm:p-6", started && "is-visible")}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      <p className="font-display text-3xl font-semibold tracking-tight text-marine-950 sm:text-4xl">
        {display}<span className="text-lagoon-600">{suffix}</span>
      </p>
      <p className="mt-1.5 text-[12.5px] font-bold uppercase tracking-wider text-marine-950/50">{label}</p>
    </div>
  );
}

/* ================= FEATURES / LA MAISON ================= */
const FEATURES = [
  {
    icon: Anchor,
    tint: "from-lagoon-600 to-marine-800",
    title: "Affinées au pied des falaises",
    text: "Nos claires d'Étretat, bercées par les marées les plus pures de la Manche, donnent une chair croquante, iodée et longue en bouche.",
    tag: "Terroir unique",
  },
  {
    icon: Timer,
    tint: "from-gold-600 to-gold-700",
    title: "Récoltées à la commande",
    text: "Zéro stock dormant : vos huîtres sont pêchées à l'aube le jour de l'expédition, triées et calibrées à la main par nos maîtres-écaillers.",
    tag: "Ultra-frais",
  },
  {
    icon: Snowflake,
    tint: "from-marine-700 to-lagoon-600",
    title: "Chaîne du froid 0-2°C",
    text: "Coffrets isothermes biosourcés, pains de glace et suivi de température en temps réel. Fraîcheur absolue garantie — ou remboursées.",
    tag: "Livraison 24h",
  },
  {
    icon: Leaf,
    tint: "from-emerald-600 to-lagoon-600",
    title: "Zéro intermédiaire, prix juste",
    text: "Direct ostréiculteur, sans centrale d'achat : jusqu'à 30% moins cher qu'en poissonnerie parisienne, pour une qualité supérieure.",
    tag: "Circuit court",
  },
];

export function Features() {
  return (
    <section id="maison" className="relative overflow-hidden bg-white pb-20 pt-6 lg:pb-28" aria-label="La Maison">
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-seafoam-100/60 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="La Maison · Étretat"
          title={<>Pourquoi nos abonnés ne commandent <em className="text-gradient-lagoon font-light italic">plus ailleurs</em></>}
          lead="Trois générations, un seul obsession : vous livrer l'huître exactement comme nous la dégustons sur le port — vivante, charnue, éclatante."
        />

        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="card-lift group relative overflow-hidden rounded-[1.6rem] border border-marine-950/[0.07] bg-white p-6 shadow-[0_10px_36px_-14px_rgb(8_32_50/0.18)] lg:p-7"
            >
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100", f.tint)} aria-hidden />
              <span className={cn("inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110", f.tint)}>
                <f.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-5 inline-block rounded-full bg-foam px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-lagoon-700 ring-1 ring-marine-950/[0.06]">{f.tag}</p>
              <h3 className="font-display mt-2.5 text-[21px] font-semibold leading-snug tracking-tight text-marine-950">{f.title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-marine-950/60">{f.text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-lagoon-700 opacity-0 transition-all duration-500 group-hover:opacity-100">
                En savoir plus <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            </article>
          ))}
        </Stagger>

        {/* wide banner */}
        <Reveal delay={120}>
          <div className="relative mt-6 overflow-hidden rounded-[1.8rem] bg-marine-950 text-white shadow-[0_30px_70px_-20px_rgb(8_32_50/0.5)]">
            <img
              src="https://images.pexels.com/photos/28735691/pexels-photo-28735691.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Falaises d'Étretat battues par les vagues"
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/80 to-transparent" aria-hidden />
            <div className="relative grid items-center gap-6 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-[0.24em] text-gold-300">Engagement terroir</p>
                <p className="font-display mt-3 max-w-2xl text-balance text-2xl font-medium leading-tight sm:text-3xl">
                  « Une huître qui voyage moins de 24h a le goût de l'endroit où elle est née. »
                </p>
                <p className="mt-3 text-[14px] font-semibold text-white/60">Hélène Aubert — Maître affineur, 3<sup>e</sup> génération</p>
              </div>
              <a href="#savoir-faire" className="btn-shine inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3.5 text-[14px] font-extrabold text-marine-950 transition hover:-translate-y-1 hover:shadow-2xl">
                Visiter nos parcs <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= PRODUCT SHOWCASE ================= */
type Product = {
  id: string;
  cat: "huitres" | "plateaux" | "coffrets";
  name: string;
  desc: string;
  price: number;
  old?: number;
  img: string;
  badge?: string;
  badgeTone?: "gold" | "lagoon" | "dark";
  rating: string;
  pieces: string;
};

const PRODUCTS: Product[] = [
  { id: "s1", cat: "huitres", name: "Spéciales d'Étretat N°3", desc: "Charnues, iodées, finales de noisette. L'icône de la Maison.", price: 42, old: 49, img: "https://images.pexels.com/photos/35751130/pexels-photo-35751130.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", badge: "Best-seller", badgeTone: "gold", rating: "4,9 (3 210)", pieces: "24 pièces" },
  { id: "s2", cat: "huitres", name: "Fines de Normandie N°2", desc: "Délicates et croquantes, parfaites pour les grandes tablées.", price: 72, old: 84, img: "https://images.pexels.com/photos/10375841/pexels-photo-10375841.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", badge: "-15% abonnés", badgeTone: "lagoon", rating: "4,8 (1 940)", pieces: "48 pièces" },
  { id: "p1", cat: "plateaux", name: "Plateau Royal · 4 pers.", desc: "Huîtres, bulots, crevettes, tourteau — prêt à déguster.", price: 89, old: 105, img: "https://images.pexels.com/photos/19193031/pexels-photo-19193031.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", badge: "Prêt à servir", badgeTone: "dark", rating: "5,0 (862)", pieces: "2,4 kg" },
  { id: "p2", cat: "plateaux", name: "Plateau Prestige Homard", desc: "Homard breton, 12 spéciales, praires — l'extraordinaire.", price: 129, img: "https://images.pexels.com/photos/18255861/pexels-photo-18255861.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", badge: "Édition fêtes", badgeTone: "gold", rating: "4,9 (514)", pieces: "2 pers." },
  { id: "c1", cat: "coffrets", name: "Coffret Découverte Abonnés", desc: "3 variétés + couteau + vinaigre à l'échalote. Le favori newsletter.", price: 59, old: 69, img: "https://images.pexels.com/photos/35751138/pexels-photo-35751138.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", badge: "Offre newsletter", badgeTone: "lagoon", rating: "4,9 (2 108)", pieces: "36 pièces" },
  { id: "c2", cat: "coffrets", name: "Coffret Grande Marée", desc: "Le meilleur de nos parcs + champagne normand. À offrir.", price: 149, img: "https://images.pexels.com/photos/10375844/pexels-photo-10375844.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", badge: "Cadeau d'exception", badgeTone: "dark", rating: "5,0 (689)", pieces: "48 pièces" },
];

const TABS = [
  { id: "all", label: "Tout" },
  { id: "huitres", label: "Huîtres" },
  { id: "plateaux", label: "Plateaux" },
  { id: "coffrets", label: "Coffrets" },
] as const;

export function Showcase({ onAdd }: { onAdd: (label: string, count?: number) => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [qty, setQty] = useState<Record<string, number>>({});
  const filtered = tab === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === tab);

  return (
    <section id="coffrets" className="relative overflow-hidden bg-foam py-20 lg:py-28" aria-label="Nos coffrets">
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-lagoon-400/15 blur-[120px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Commander en ligne · Expédition jeudi"
          title={<>Les coffrets <em className="text-gradient-lagoon font-light italic">les plus désirés</em> de la côte</>}
          lead="Préparés à la commande, livrés en 24h dans un écrin isotherme. Code ECOME15 : -15% automatiquement appliqué pour nos abonnés."
        />

        <Reveal delay={140}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Filtrer les produits">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-[14px] font-bold transition-all duration-300",
                  tab === t.id
                    ? "bg-marine-950 text-white shadow-lg shadow-marine-950/25 scale-[1.02]"
                    : "bg-white text-marine-950/60 ring-1 ring-marine-950/10 hover:-translate-y-0.5 hover:text-marine-950 hover:shadow-md"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 flex items-center justify-center gap-2 text-[13px] font-bold text-marine-950/60" aria-live="polite">
          <Truck className="h-4 w-4 text-lagoon-600" aria-hidden />
          Plus que <span className="rounded-full bg-marine-950 px-2 py-0.5 text-[12px] text-white">38 coffrets</span> pour l'expédition de jeudi
        </div>

        <div key={tab} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <article
              key={p.id}
              style={{ animation: `rise-in 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 90}ms both` }}
              className="card-lift group overflow-hidden rounded-[1.6rem] border border-marine-950/[0.07] bg-white shadow-[0_14px_44px_-16px_rgb(8_32_50/0.2)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-[16/10.5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                {p.badge && (
                  <span className={cn(
                    "absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider shadow-lg",
                    p.badgeTone === "gold" && "bg-gold-500 text-white",
                    p.badgeTone === "lagoon" && "bg-lagoon-600 text-white",
                    p.badgeTone === "dark" && "glass-dark text-white",
                  )}>
                    {p.badge}
                  </span>
                )}
                <span className="glass absolute right-3 top-3 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold text-marine-950">
                  {p.pieces}
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Stars size={12} />
                  <span className="text-[12.5px] font-bold text-marine-950/55">{p.rating}</span>
                </div>
                <h3 className="font-display mt-2 text-[20px] font-semibold tracking-tight text-marine-950">{p.name}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-marine-950/60">{p.desc}</p>
                <div className="mt-4 flex items-end justify-between border-t border-dashed border-marine-950/10 pt-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[26px] font-semibold text-marine-950">{p.price}€</span>
                      {p.old && <span className="text-[14px] font-bold text-marine-950/35 line-through">{p.old}€</span>}
                    </div>
                    <p className="text-[12px] font-semibold text-lagoon-700">-15% inclus avec ECOME15</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-full ring-1 ring-marine-950/10">
                      <button
                        onClick={() => setQty((q) => ({ ...q, [p.id]: Math.max(0, (q[p.id] ?? 1) - 1) }))}
                        className="grid h-9 w-8 place-items-center rounded-l-full transition hover:bg-foam"
                        aria-label={`Diminuer la quantité de ${p.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-[14px] font-extrabold" aria-live="polite">{qty[p.id] ?? 1}</span>
                      <button
                        onClick={() => setQty((q) => ({ ...q, [p.id]: (q[p.id] ?? 1) + 1 }))}
                        className="grid h-9 w-8 place-items-center rounded-r-full transition hover:bg-foam"
                        aria-label={`Augmenter la quantité de ${p.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const q = qty[p.id] ?? 1;
                        onAdd(q === 1 ? `${p.name} ajouté au panier` : `${q}× ${p.name} ajoutés au panier`, Math.max(1, q));
                      }}
                      className="btn-shine grid h-10 w-10 place-items-center rounded-full bg-marine-950 text-white shadow-lg transition hover:scale-110 hover:bg-lagoon-700 active:scale-95"
                      aria-label={`Ajouter ${p.name} au panier`}
                    >
                      <Plus className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#commander" className="btn-shine group inline-flex items-center gap-2 rounded-full bg-lagoon-600 px-8 py-4 text-[15px] font-bold text-white shadow-xl shadow-lagoon-600/25 transition hover:-translate-y-1 hover:bg-lagoon-700">
              <PackageCheck className="h-5 w-5" aria-hidden /> Voir toute la boutique
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            <p className="flex items-center gap-2 text-[13px] font-semibold text-marine-950/55">
              <ShieldCheck className="h-4 w-4 text-lagoon-600" aria-hidden /> Fraîcheur garantie ou remboursé
              <span className="text-marine-950/25">·</span>
              <Check className="h-4 w-4 text-lagoon-600" aria-hidden /> Paiement sécurisé
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
