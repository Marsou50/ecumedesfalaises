import { useEffect, useState } from "react";
import {
  Waves, ShoppingBag, Menu, X, Truck, ShieldCheck, Star,
  MapPin, Phone, Mail, Clock, ArrowRight, ArrowUp, Check,
  Camera, AtSign, Play, CreditCard, Leaf,
} from "lucide-react";
import { cn } from "../utils/cn";

/* ============ Announcement bar ============ */
export function Announcement() {
  const [codeCopied, setCodeCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText("ECOME15");
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch { /* noop */ }
  };
  return (
    <div className="relative z-[60] overflow-hidden bg-abyss text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_120%_at_20%_50%,rgb(20_145_143/0.35),transparent),radial-gradient(ellipse_50%_120%_at_80%_50%,rgb(201_168_106/0.22),transparent)]" />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2.5 text-center text-[12.5px] sm:text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" aria-hidden />
          <span className="tracking-wide">Exclusif newsletter</span>
        </span>
        <span className="hidden text-white/40 sm:inline">·</span>
        <span className="text-white/80">-15% + livraison offerte dès 79€</span>
        <button
          onClick={copy}
          className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold-500/60 bg-gold-500/10 px-2.5 py-0.5 font-mono text-[12px] font-bold tracking-widest text-gold-300 transition hover:border-gold-300 hover:bg-gold-500/20 focus-visible:outline-gold-300"
          aria-label="Copier le code ECOME15"
        >
          ECOME15
          {codeCopied ? <Check className="h-3 w-3" /> : <span className="text-[10px] font-sans font-semibold uppercase opacity-60 group-hover:opacity-100">copier</span>}
        </button>
        <span className="hidden text-white/50 md:inline">· Expédition jeudi — encore 38 coffrets disponibles</span>
      </div>
    </div>
  );
}

/* ============ Navbar ============ */
const LINKS = [
  { label: "La brasserie", href: "#maison" },
  { label: "Coffrets", href: "#coffrets" },
  { label: "Savoir-faire", href: "#savoir-faire" },
  { label: "Avis", href: "#avis" },
  { label: "Abonnements", href: "#abonnements" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open ]);

  return (
    <header className="sticky top-0 z-50">
      {/* scroll progress */}
      <div className="absolute inset-x-0 top-0 z-[60] h-[2.5px] bg-transparent" aria-hidden>
        <div
          className="h-full bg-gradient-to-r from-lagoon-500 via-seafoam-200 to-gold-500 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div
        className={cn(
          "transition-all duration-500",
          scrolled ? "glass shadow-[0_12px_40px_-12px_rgb(8_32_50/0.18)]" : "bg-ivory/80 backdrop-blur-md"
        )}
      >
        <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Navigation principale">
          <a href="#haut" className="group flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-marine-900 via-marine-800 to-lagoon-600 text-white shadow-lg shadow-marine-900/20 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105">
              <Waves className="h-5 w-5" aria-hidden />
              <span className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/20" aria-hidden />
            </span>
            <span className="leading-none">
              <span className="font-display block text-[17px] font-semibold tracking-tight text-marine-950">
                L'Écume <span className="italic font-light text-lagoon-700">des falaises</span>
              </span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-marine-950/50">
                Étretat · depuis 1962
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="link-underline text-[14px] font-semibold text-marine-950/70 transition hover:text-marine-950"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onCart}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-marine-950/10 bg-white/70 text-marine-950 backdrop-blur transition hover:-translate-y-0.5 hover:border-lagoon-600/30 hover:shadow-lg"
              aria-label={`Voir le panier, ${cartCount} articles`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-[rise-in_0.4s_ease] place-items-center rounded-full bg-lagoon-600 px-1 text-[11px] font-extrabold text-white shadow">
                  {cartCount}
                </span>
              )}
            </button>
            <a
              href="#commander"
              className="btn-shine group hidden items-center gap-2 rounded-full bg-marine-950 px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-marine-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-marine-900 hover:shadow-xl sm:inline-flex"
            >
              Commander
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </a>
            <button
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center rounded-full border border-marine-950/10 bg-white/70 lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* mobile menu */}
      <div
        className={cn(
          "fixed inset-0 top-[68px] z-40 origin-top transition-all duration-500 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-abyss/30 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
        <div
          className={cn(
            "glass relative mx-3 mt-3 overflow-hidden rounded-3xl p-3 shadow-2xl transition-all duration-500",
            open ? "translate-y-0 scale-100" : "-translate-y-4 scale-[0.98]"
          )}
        >
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-bold text-marine-950 transition-all duration-300 hover:bg-marine-950/5",
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
              )}
            >
              {l.label}
              <ArrowRight className="h-4 w-4 text-marine-950/30" aria-hidden />
            </a>
          ))}
          <a
            href="#commander"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-marine-950 px-4 py-4 text-[15px] font-bold text-white"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden /> Commander en ligne — -15%
          </a>
          <p className="flex items-center justify-center gap-2 px-4 py-3 text-[12px] font-semibold text-marine-950/50">
            <Truck className="h-3.5 w-3.5" /> Expédition jeudi · Livraison 24h offerte dès 79€
          </p>
        </div>
      </div>
    </header>
  );
}

/* ============ Toast ============ */
export function Toast({ message }: { message: string | null }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 transition-all duration-500 sm:bottom-8",
        message ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      )}
    >
      {message && (
        <div className="glass-dark flex items-center gap-3 rounded-full py-3 pl-4 pr-5 text-white shadow-2xl">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-lagoon-500">
            <Check className="h-4 w-4" aria-hidden />
          </span>
          <span className="whitespace-nowrap text-[14px] font-semibold">{message}</span>
        </div>
      )}
    </div>
  );
}

/* ============ Back to top + sticky mobile CTA ============ */
export function FloatingActions({ cartCount }: { cartCount: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <>
      <a
        href="#commander"
        className={cn(
          "fixed inset-x-3 bottom-3 z-40 flex items-center justify-center gap-2 rounded-2xl bg-marine-950/95 py-4 text-[15px] font-bold text-white shadow-2xl backdrop-blur transition-all duration-500 sm:hidden",
          show ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Commander — -15% abonnés
        {cartCount > 0 && <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[12px] text-abyss">{cartCount}</span>}
      </a>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Retour en haut"
        className={cn(
          "fixed bottom-6 right-6 z-40 hidden h-11 w-11 place-items-center rounded-full bg-white text-marine-950 shadow-xl ring-1 ring-marine-950/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:grid",
          show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
        )}
      >
        <ArrowUp className="h-5 w-5" aria-hidden />
      </button>
    </>
  );
}

/* ============ Footer ============ */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-abyss text-white" aria-label="Pied de page">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(20_145_143/0.18),transparent),radial-gradient(ellipse_40%_40%_at_90%_90%,rgb(201_168_106/0.12),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <a href="#haut" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-lagoon-500 to-marine-800 ring-1 ring-white/15">
                <Waves className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="font-display block text-lg font-semibold">L'Écume des falaises</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/50">Maison ostréicole · Étretat</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-white/60">
              Depuis 1962, trois générations élèvent des huîtres d'exception au pied des falaises d'Étretat. Livrées en 24h, partout en France.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "Fraîcheur garantie" },
                { icon: Leaf, label: "Pêche durable" },
                { icon: CreditCard, label: "Paiement sécurisé" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] px-3 py-1.5 text-[12px] font-semibold text-white/75 ring-1 ring-white/10">
                  <b.icon className="h-3.5 w-3.5 text-seafoam-200" aria-hidden /> {b.label}
                </span>
              ))}
            </div>
            <div className="mt-6 flex gap-2.5">
              {[
                { icon: Camera, label: "Instagram" },
                { icon: AtSign, label: "Threads" },
                { icon: Play, label: "YouTube" },
              ].map((s) => (
                <a key={s.label} href="#haut" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-lagoon-600">
                  <s.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Boutique">
            <h3 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/40">Boutique</h3>
            <ul className="mt-4 space-y-2.5 text-[14px] font-medium text-white/75">
              {["Huîtres spéciales", "Plateaux de fruits de mer", "Coffrets cadeaux", "Abonnements marée", "Cartes cadeaux", "Offre newsletter -15%"].map((l) => (
                <li key={l}><a href="#coffrets" className="transition hover:text-gold-300">{l}</a></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="La Maison">
            <h3 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/40">La Maison</h3>
            <ul className="mt-4 space-y-2.5 text-[14px] font-medium text-white/75">
              {["Notre histoire", "Nos parcs à Étretat", "Engagements durables", "Les chefs partenaires", "Presse & distinctions", "Recrutement"].map((l) => (
                <li key={l}><a href="#maison" className="transition hover:text-gold-300">{l}</a></li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/40">Nous trouver</h3>
            <ul className="mt-4 space-y-3 text-[14px] text-white/75">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-seafoam-200" aria-hidden /> 12, rue des Pêcheurs<br />76790 Étretat, Normandie</li>
              <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-seafoam-200" aria-hidden /> <a href="tel:+33235000000" className="hover:text-gold-300">02 35 00 00 00</a></li>
              <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-seafoam-200" aria-hidden /> <a href="mailto:bonjour@ecume-falaises.fr" className="hover:text-gold-300">bonjour@ecume-falaises.fr</a></li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-seafoam-200" aria-hidden /> Mar. – Sam. · 9h à 19h<br />Expéditions mar. & jeu.</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-[12.5px] text-white/45 sm:flex-row">
          <p>© 2026 L'Écume des falaises — Tous droits réservés. L'abus d'alcool est dangereux pour la santé.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-medium">
            <a href="#haut" className="hover:text-white">CGV</a>
            <a href="#haut" className="hover:text-white">Confidentialité</a>
            <a href="#haut" className="hover:text-white">Cookies</a>
            <a href="#haut" className="hover:text-white">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
