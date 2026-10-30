import {
  Camera, BookOpen, LayoutDashboard, NotebookPen, UserRound, ShieldCheck,
  Phone, Info, Waves, Check, X,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { Profile } from "../lib/bac";

export type Tab = "soir" | "journal" | "comprendre";

const TABS: { id: Tab; label: string; icon: typeof Camera }[] = [
  { id: "soir", label: "Ce soir", icon: LayoutDashboard },
  { id: "journal", label: "Journal", icon: NotebookPen },
  { id: "comprendre", label: "Comprendre", icon: BookOpen },
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-marine-950 via-marine-800 to-lagoon-600 text-white shadow-lg shadow-marine-950/25", className)}>
      <svg viewBox="0 0 24 24" className="h-5.5 w-5.5" fill="none" aria-hidden>
        <path d="M6.5 3.5h11l-1.2 10.2a4.6 4.6 0 0 1-8.6 0L6.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7.4 8.6h9.2" stroke="#a7e8df" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 14v6.5M9 20.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="pointer-events-none absolute inset-x-1 top-1/2 h-px bg-seafoam-200/80" aria-hidden />
    </span>
  );
}

export function AppBar({
  tab,
  onTab,
  onProfile,
  onScan,
  profile,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  onProfile: () => void;
  onScan: () => void;
  profile: Profile | null;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-marine-950/[0.04] bg-ivory/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <button onClick={() => onTab("soir")} className="flex items-center gap-2.5 text-left" aria-label="Accueil">
          <BrandMark />
          <span className="leading-none">
            <span className="font-display block text-[16.5px] font-semibold tracking-tight text-marine-950">
              L'Écume
            </span>
            <span className="mt-1 block text-[9px] font-extrabold uppercase tracking-[0.24em] text-marine-950/45">
              Fin de soirée
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full bg-marine-950/[0.045] p-1 md:flex" aria-label="Navigation">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition",
                tab === t.id ? "bg-white text-marine-950 shadow-sm" : "text-marine-950/55 hover:text-marine-950"
              )}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <t.icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onScan}
            className="hidden items-center gap-1.5 rounded-full bg-marine-950 px-3.5 py-2 text-[12.5px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-marine-900 sm:flex"
          >
            <Camera className="h-3.5 w-3.5" aria-hidden /> Scanner
          </button>
          <button
            onClick={onProfile}
            className="flex items-center gap-2 rounded-full border border-marine-950/10 bg-white/80 py-1 pl-1 pr-3 transition hover:border-marine-950/25"
            aria-label="Mon profil"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-lagoon-600 to-marine-900 text-[11px] font-extrabold text-white">
              {profile?.name ? profile.name.slice(0, 1).toUpperCase() : <UserRound className="h-3.5 w-3.5" />}
            </span>
            <span className="hidden text-[12px] font-bold text-marine-950/70 sm:block">
              {profile ? `${profile.name || "Profil"} · ${profile.weightKg} kg` : "Mon profil"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function TabBar({ tab, onTab, onScan }: { tab: Tab; onTab: (t: Tab) => void; onScan: () => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-marine-950/8 bg-ivory/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 items-end px-2 pb-1.5 pt-1">
        {TABS.slice(0, 1).map((t) => (
          <TabBtn key={t.id} active={tab === t.id} onClick={() => onTab(t.id)} icon={<t.icon className="h-[18px] w-[18px]" />} label={t.label} />
        ))}
        <button
          onClick={onScan}
          className="relative -mt-5 flex flex-col items-center gap-1"
          aria-label="Scanner un verre"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-white shadow-lg shadow-lagoon-700/35 transition active:scale-95">
            <Camera className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-[10px] font-extrabold text-lagoon-700">Scanner</span>
        </button>
        {TABS.slice(1).map((t) => (
          <TabBtn key={t.id} active={tab === t.id} onClick={() => onTab(t.id)} icon={<t.icon className="h-[18px] w-[18px]" />} label={t.label} />
        ))}
      </div>
    </nav>
  );
}

function TabBtn({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl py-1.5 transition",
        active ? "text-marine-950" : "text-marine-950/40"
      )}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span className="text-[10px] font-extrabold">{label}</span>
    </button>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-10 max-w-5xl px-4 pb-24 sm:px-6 md:pb-10">
      <div className="rounded-[2rem] bg-marine-950 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-9 w-9" />
              <span className="font-display text-[16px] font-semibold">L'Écume · Fin de soirée</span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-white/55">
              Un outil de prévention, pas un permis de conduire. Estimations basées sur la formule de
              Widmark (1932) et des valeurs physiologiques moyennes. Aucune donnée ne quitte cet appareil.
            </p>
          </div>
          <div className="space-y-2.5 text-[12px] font-semibold text-white/70">
            <p className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-lagoon-500/20 text-seafoam-200"><Phone className="h-3.5 w-3.5" aria-hidden /></span>
              <a href="tel:0980980930" className="hover:text-white">Alcool Info Service · 0 980 980 930</a>
            </p>
            <p className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white/70"><Info className="h-3.5 w-3.5" aria-hidden /></span>
              <a href="https://www.alcool-info-service.fr" target="_blank" rel="noreferrer" className="hover:text-white">alcool-info-service.fr</a>
            </p>
            <p className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-white/70"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /></span>
              7j/7 de 8 h à 2 h · appel anonyme et gratuit
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 L'Écume — Application de démonstration. L'abus d'alcool est dangereux pour la santé.</p>
          <p className="flex items-center gap-1.5"><Waves className="h-3.5 w-3.5" aria-hidden /> Étretat · fabriqué en Normandie</p>
        </div>
      </div>
    </footer>
  );
}

export function Toast({ message, tone = "ok" }: { message: string | null; tone?: "ok" | "warn" }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex justify-center px-4 transition-all duration-400 md:bottom-8",
        message ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {message && (
        <div className={cn(
          "flex max-w-sm items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-4 text-white shadow-2xl",
          tone === "warn" ? "bg-gold-700" : "bg-marine-950"
        )}>
          <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", tone === "warn" ? "bg-white/20" : "bg-lagoon-500")}>
            {tone === "warn" ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          </span>
          <span className="text-[12.5px] font-semibold leading-tight">{message}</span>
        </div>
      )}
    </div>
  );
}
