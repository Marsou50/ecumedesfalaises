import { useId } from "react";
import { fmtBac, fmtTime, type Licence } from "../lib/bac";
import { cn } from "../utils/cn";

const MAX_BAC = 1.2;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
  const a = polar(cx, cy, r, fromDeg);
  const b = polar(cx, cy, r, toDeg);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

export function BacGauge({
  bac,
  limit,
  licence,
  className,
  animate = true,
}: {
  bac: number;
  limit: number | null;
  licence: Licence;
  className?: string;
  animate?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const cap = Math.max(MAX_BAC, (limit ?? 0) + 0.4);
  const clamp = (v: number) => Math.max(0, Math.min(1, v / cap));
  const toDeg = (v: number) => 180 + clamp(v) * 180;

  const cx = 150;
  const cy = 148;
  const r = 112;

  const zones: { from: number; to: number; color: string }[] = [];
  if (limit == null) {
    zones.push({ from: 0, to: cap, color: "#14918f" });
  } else {
    zones.push({ from: 0, to: Math.max(0.001, limit - 0.1), color: "#2bb3b1" });
    zones.push({ from: Math.max(0.001, limit - 0.1), to: limit, color: "#e6b53a" });
    zones.push({ from: limit, to: Math.min(cap, 0.8), color: "#e2703a" });
    zones.push({ from: Math.min(cap, 0.8), to: cap, color: "#c2352f" });
  }

  const needleDeg = toDeg(bac);
  // l'aiguille est dessinée à 180° (vers la gauche) puis tournée : une seule rotation
  const needleEnd = polar(cx, cy, r - 14, 180);
  const needleStart = polar(cx, cy, 26, 180);

  const tone =
    bac >= 0.8 ? "#c2352f" : limit != null && bac >= limit ? "#e2703a" : limit != null && bac >= limit - 0.1 ? "#c9932a" : "#0e7c7b";

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 300 190" className="w-full" role="img" aria-label={`Alcoolémie estimée ${fmtBac(bac)} grammes par litre`}>
        <defs>
          <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* rail */}
        <path d={arcPath(cx, cy, r, 180, 360)} fill="none" stroke="#082032" strokeOpacity="0.07" strokeWidth="18" strokeLinecap="round" />

        {zones.map((z, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, toDeg(z.from), Math.max(toDeg(z.from) + 0.4, toDeg(z.to)))}
            fill="none"
            stroke={z.color}
            strokeWidth="18"
            strokeLinecap="butt"
            opacity={bac >= z.from && bac <= z.to ? 1 : 0.42}
            style={{ transition: "opacity .6s ease" }}
          />
        ))}

        {/* graduations */}
        {[0, 0.25, 0.5, 0.75, 1].map((g) => {
          if (g > cap) return null;
          const d = toDeg(g);
          const a = polar(cx, cy, r - 13, d);
          const b = polar(cx, cy, r - 20, d);
          const label = polar(cx, cy, r - 32, d);
          return (
            <g key={g}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(8 32 50 / 0.28)" strokeWidth="1.5" strokeLinecap="round" />
              <text x={label.x} y={label.y + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="rgb(8 32 50 / 0.4)">
                {g.toString().replace(".", ",")}
              </text>
            </g>
          );
        })}

        {/* seuil légal */}
        {limit != null && (
          <g>
            <line
              x1={polar(cx, cy, r + 11, toDeg(limit)).x}
              y1={polar(cx, cy, r + 11, toDeg(limit)).y}
              x2={polar(cx, cy, r - 11, toDeg(limit)).x}
              y2={polar(cx, cy, r - 11, toDeg(limit)).y}
              stroke="#082032"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              x={polar(cx, cy, r + 22, toDeg(limit)).x}
              y={polar(cx, cy, r + 22, toDeg(limit)).y}
              textAnchor="middle"
              fontSize="9"
              fontWeight="800"
              fill="#082032"
              fillOpacity="0.55"
            >
              {licence === "probatoire" ? "0,2" : "0,5"}
            </text>
          </g>
        )}

        {/* aiguille */}
        <g
          filter={`url(#${uid}-glow)`}
          style={{
            transition: animate ? "transform 1.1s cubic-bezier(.22,1,.36,1)" : undefined,
            transformBox: "view-box",
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${needleDeg - 180}deg)`,
          }}
        >
          <line x1={needleStart.x} y1={needleStart.y} x2={needleEnd.x} y2={needleEnd.y} stroke={tone} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={needleStart.x} cy={needleStart.y} r="4.5" fill={tone} />
        </g>
        <circle cx={cx} cy={cy} r="7" fill="#082032" />
        <circle cx={cx} cy={cy} r="3" fill="#fff" />

        <text x={cx} y={cy - 34} textAnchor="middle" fontSize="46" fontWeight="800" fill={tone} style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em" }}>
          {fmtBac(bac)}
        </text>
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="rgb(8 32 50 / 0.45)" letterSpacing="0.12em">
          G / L DE SANG
        </text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize="10" fontWeight="700" fill="rgb(8 32 50 / 0.4)">
          {breathValue(bac)} mg/L d'air expiré
        </text>
      </svg>
    </div>
  );
}

function breathValue(bac: number) {
  return (bac / 2).toFixed(2).replace(".", ",");
}

/* ------------------------------------------------------------------ */

export function BacCurve({
  t,
  bac,
  now,
  limit,
  height = 150,
  showLabels = true,
}: {
  t: number[];
  bac: number[];
  now: number;
  limit: number | null;
  height?: number;
  showLabels?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  if (t.length < 2) {
    return (
      <div className="grid h-[150px] place-items-center rounded-2xl border border-dashed border-marine-950/15 bg-foam/60 text-[13px] font-semibold text-marine-950/45">
        Ajoutez un verre pour voir la courbe
      </div>
    );
  }
  const W = 340;
  const H = height;
  const padL = 30;
  const padR = 8;
  const padT = 12;
  const padB = showLabels ? 24 : 8;

  const t0 = t[0];
  const t1 = t[t.length - 1];
  const maxBac = Math.max(...bac, (limit ?? 0) + 0.15, 0.35);

  const x = (ts: number) => padL + ((ts - t0) / (t1 - t0 || 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / maxBac) * (H - padT - padB);

  const pts = t.map((ts, i) => `${x(ts).toFixed(1)},${y(bac[i]).toFixed(1)}`);
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${x(t1)} ${y(0)} L ${x(t0)} ${y(0)} Z`;

  // ticks d'heures
  const hours: number[] = [];
  const startH = new Date(t0);
  startH.setMinutes(0, 0, 0);
  for (let h = startH.getTime(); h <= t1; h += 3600_000) hours.push(h);

  const nowX = x(now);
  const nowIn = now >= t0 && now <= t1;
  const limitY = limit != null ? y(limit) : null;
  const peakIdx = bac.indexOf(Math.max(...bac));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} role="img" aria-label="Courbe prévisionnelle de l'alcoolémie">
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14918f" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#14918f" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id={`${uid}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0b5f5e" />
          <stop offset="60%" stopColor="#14918f" />
          <stop offset="100%" stopColor="#c9a86a" />
        </linearGradient>
        <linearGradient id={`${uid}-past`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#082032" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#082032" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-pastclip`}>
          <rect x="0" y="0" width={Math.max(0, Math.min(W, nowX))} height={H} />
        </clipPath>
      </defs>

      {hours.map((h) => (
        <g key={h}>
          <line x1={x(h)} y1={padT} x2={x(h)} y2={H - padB} stroke="rgb(8 32 50 / 0.07)" strokeWidth="1" strokeDasharray="2 3" />
          {showLabels && (
            <text x={x(h)} y={H - 8} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="rgb(8 32 50 / 0.35)">
              {fmtTime(h)}
            </text>
          )}
        </g>
      ))}

      {limitY != null && (
        <g>
          <line x1={padL} y1={limitY} x2={W - padR} y2={limitY} stroke="#c2352f" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.65" />
          <text x={padL + 2} y={limitY - 3} fontSize="8" fontWeight="800" fill="#c2352f" opacity="0.8">
            seuil {String(limit).replace(".", ",")}
          </text>
        </g>
      )}

      <path d={area} fill={`url(#${uid}-area)`} />
      <path d={area} fill={`url(#${uid}-past)`} clipPath={`url(#${uid}-pastclip)`} />
      <path d={line} fill="none" stroke={`url(#${uid}-line)`} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* pic */}
      <circle cx={x(t[peakIdx])} cy={y(bac[peakIdx])} r="3.4" fill="#0b5f5e" stroke="#fff" strokeWidth="1.5" />
      <text x={x(t[peakIdx])} y={y(bac[peakIdx]) - 8} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0b5f5e">
        pic {fmtBac(bac[peakIdx])}
      </text>

      {/* maintenant */}
      {nowIn && (
        <g>
          <line x1={nowX} y1={padT - 4} x2={nowX} y2={H - padB} stroke="#082032" strokeWidth="1.4" strokeDasharray="3 2" opacity="0.6" />
          <circle cx={nowX} cy={y(bacAtSafe(t, bac, now))} r="4.4" fill="#082032" stroke="#fff" strokeWidth="2" />
          <rect x={Math.min(W - 46, Math.max(padL, nowX - 22))} y={padT - 2} width="44" height="14" rx="7" fill="#082032" />
          <text x={Math.min(W - 24, Math.max(padL + 22, nowX))} y={padT + 8} textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">
            MAINTENANT
          </text>
        </g>
      )}

      {/* axe y */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="rgb(8 32 50 / 0.15)" strokeWidth="1" />
      <text x={padL - 4} y={y(maxBac) + 8} textAnchor="end" fontSize="8" fontWeight="700" fill="rgb(8 32 50 / 0.35)">
        {String(Math.round(maxBac * 100) / 100).replace(".", ",")}
      </text>
      <text x={padL - 4} y={y(0) - 1} textAnchor="end" fontSize="8" fontWeight="700" fill="rgb(8 32 50 / 0.35)">
        0
      </text>
    </svg>
  );
}

function bacAtSafe(t: number[], bac: number[], at: number): number {
  if (at <= t[0] || at >= t[t.length - 1]) return 0;
  let lo = 0;
  let hi = t.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (t[mid] <= at) lo = mid;
    else hi = mid;
  }
  const p = (at - t[lo]) / (t[hi] - t[lo] || 1);
  return bac[lo] + (bac[hi] - bac[lo]) * p;
}
