import type { GlassShape } from "../lib/drinks";
import { cn } from "../utils/cn";

const PATHS: Record<GlassShape, { d: string; liquid: string; scale: number }> = {
  wine: {
    d: "M22 12h56l-3 34c-1 12-10 18-25 18s-24-6-25-18L22 12Z",
    liquid: "M25 32h50l-2.4 14c-1 8-9 12-22.6 12S28.6 54 27.6 46L25 32Z",
    scale: 1,
  },
  flute: {
    d: "M34 8h32l-2 40c-.6 9-6.4 14-14 14s-13.4-5-14-14L34 8Z",
    liquid: "M36 18h28l-1.6 30c-.5 7-5.4 11-12.4 11s-11.9-4-12.4-11L36 18Z",
    scale: 1.2,
  },
  coupe: {
    d: "M20 16h60c0 22-13 34-30 34S20 38 20 16Z",
    liquid: "M23 22h54c-1.6 17-12 24-27 24S24.6 39 23 22Z",
    scale: 1.05,
  },
  tumbler: {
    d: "M30 16h40l-5 60H35L30 16Z",
    liquid: "M33 38h34l-3 35H36l-3-35Z",
    scale: 0.95,
  },
  highball: {
    d: "M36 8h28l-4 70H40L36 8Z",
    liquid: "M38 24h24l-3 50H41l-3-50Z",
    scale: 1.15,
  },
  pint: {
    d: "M31 10h38l-4 68c-.3 5-3 7-15 7s-14.7-2-15-7L31 10Z",
    liquid: "M33 18h34l-3.6 58c-.3 4-2.6 5.6-13.4 5.6S36.9 80 36.6 76L33 18Z",
    scale: 1.1,
  },
  cocktail: {
    d: "M18 18h64L56 54v20l12 6H32l12-6V54L18 18Z",
    liquid: "M25 24h50L54 51.5v19l6 3H40l6-3v-19L25 24Z",
    scale: 1,
  },
  shot: {
    d: "M33 26h34l-3 42c-.3 6-6 9-14 9s-13.7-3-14-9l-3-42Z",
    liquid: "M36 38h28l-2.4 30c-.3 4-4.6 6-11.6 6s-11.3-2-11.6-6L36 38Z",
    scale: 0.9,
  },
  mug: {
    d: "M24 22h44l-4 52c-.3 6-4 8-18 8s-17.7-2-18-8L24 22Z",
    liquid: "M27 28h38l-3.4 44c-.3 5-3 6.4-15.6 6.4S30.7 77 30.4 72L27 28Z",
    scale: 1,
  },
};

export function Glass({
  shape,
  color,
  fill = 0.62,
  className,
  size = 96,
  bubbles = false,
  ice = false,
}: {
  shape: GlassShape;
  color: string;
  fill?: number;
  className?: string;
  size?: number;
  bubbles?: boolean;
  ice?: boolean;
}) {
  const p = PATHS[shape] ?? PATHS.wine;
  const id = `g-${shape}-${color.replace("#", "")}`;
  const level = Math.max(0, Math.min(1, fill));
  const top = 78 - level * 66;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-liq`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.92" />
          <stop offset="100%" stopColor={color} stopOpacity="0.72" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={p.d} />
        </clipPath>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* ombre */}
      <ellipse cx="50" cy="92" rx="26" ry="4" fill="#082032" opacity="0.1" />

      {/* pied / tige */}
      {shape === "cocktail" && (
        <path d="M50 54v27" stroke="rgb(8 32 50 / 0.3)" strokeWidth="2.5" strokeLinecap="round" />
      )}

      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y={top} width="100" height={100 - top} fill={`url(#${id}-liq)`} />
        <rect x="0" y={top - 0.6} width="100" height="1.6" fill="#fff" opacity="0.5" />
        {bubbles &&
          Array.from({ length: 7 }).map((_, i) => (
            <circle
              key={i}
              cx={38 + ((i * 13) % 26)}
              cy={top + 6 + ((i * 17) % 40)}
              r={1 + (i % 2) * 0.7}
              fill="#fff"
              opacity={0.45}
            />
          ))}
        {ice && (
          <g opacity="0.5" fill="#fff">
            <rect x="40" y={top + 3} width="9" height="9" rx="2" transform="rotate(18 44 47)" />
            <rect x="53" y={top + 9} width="9" height="9" rx="2" transform="rotate(-14 57 53)" />
          </g>
        )}
      </g>

      <path
        d={p.d}
        fill={`url(#${id}-glass)`}
        stroke="rgb(8 32 50 / 0.28)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* reflet */}
      <path
        d={p.d}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.75"
        strokeWidth="1.1"
        strokeLinecap="round"
        transform="translate(-3,-2) scale(0.94)"
        style={{ transformOrigin: "50px 50px" }}
      />
    </svg>
  );
}

/** Petit pictogramme de verre pour les listes. */
export function GlassBadge({
  shape,
  color,
  size = 34,
}: {
  shape: GlassShape;
  color: string;
  size?: number;
}) {
  return (
    <span
      className="grid place-items-center rounded-xl bg-white ring-1 ring-marine-950/[0.07]"
      style={{ width: size + 14, height: size + 14 }}
    >
      <Glass shape={shape} color={color} size={size} fill={0.7} />
    </span>
  );
}
