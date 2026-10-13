import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { cn } from "../utils/cn";

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({
  children,
  delay = 0,
  variant,
  className,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  delay?: number;
  variant?: "left" | "right" | "scale";
  className?: string;
  as?: ElementType;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      id={id}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(
        "reveal",
        variant === "left" && "reveal-left",
        variant === "right" && "reveal-right",
        variant === "scale" && "reveal-scale",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("stagger", className)}>
      {children}
    </div>
  );
}

/* ---------------- Count up ---------------- */
export function useCountUp(target: number, started: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return value;
}

export function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ---------------- Countdown to next Thursday 14h ---------------- */
export function useCountdown() {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const next = new Date(now);
      // next Thursday (4) 14:00
      const day = now.getDay();
      let delta = (4 - day + 7) % 7;
      next.setDate(now.getDate() + delta);
      next.setHours(14, 0, 0, 0);
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7);
      const diff = Math.max(0, next.getTime() - now.getTime());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, []);
  return left;
}

/* ---------------- Small atoms ---------------- */
export function Eyebrow({ icon, children, dark = false }: { icon?: ReactNode; children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]",
        dark
          ? "bg-white/10 text-seafoam-200 ring-1 ring-white/15 backdrop-blur"
          : "bg-marine-950/[0.06] text-marine-900 ring-1 ring-marine-950/10"
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Stars({ className, size = 14 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label="Note 5 sur 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className="text-gold-500" aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  dark = false,
  align = "center",
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <Reveal>
        <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={90}>
        <h2
          className={cn(
            "font-display mt-5 text-balance text-3xl font-medium leading-[1.08] tracking-tight sm:text-4xl lg:text-[3.4rem]",
            dark ? "text-white" : "text-marine-950"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={160}>
          <p className={cn("mt-5 text-pretty text-base leading-relaxed sm:text-lg", dark ? "text-white/70" : "text-marine-950/65")}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
