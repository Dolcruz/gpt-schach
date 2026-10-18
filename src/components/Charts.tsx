import { L, locale } from '../i18n';
import { useMemo, useRef, useState } from 'react';

const fmtDate = (d: Date) => d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });

interface LinePoint {
  date: string;
  value: number;
  label?: string;
}

/** Einfacher Verlauf (eine Serie) mit Fadenkreuz-Tooltip */
export function LineChart({ points, color = 'var(--series-1)', height = 180, unit = '' }: { points: LinePoint[]; color?: string; height?: number; unit?: string }) {
  const W = 600;
  const H = height;
  const pad = { l: 40, r: 12, t: 12, b: 24 };
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    if (!points.length) return null;
    const vals = points.map((p) => p.value);
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    const span = Math.max(hi - lo, 40);
    lo = Math.floor((lo - span * 0.12) / 10) * 10;
    hi = Math.ceil((hi + span * 0.12) / 10) * 10;
    const n = points.length;
    const x = (i: number) => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : (i / (n - 1)) * (W - pad.l - pad.r));
    const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
    const ticks = [lo, Math.round((lo + hi) / 20) * 10, hi];
    return { x, y, lo, hi, ticks };
  }, [points, H]);

  if (!geo) return <div className="chart-empty">{L('Noch keine Daten', 'No data yet')}</div>;
  const { x, y, ticks } = geo;
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const hp = hover !== null ? points[hover] : null;

  return (
    <div className="chart-wrap">
      <svg
        ref={ref}
        className="line-chart"
        viewBox={`0 0 ${W} ${H}`}
        onMouseMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          let best = 0;
          points.forEach((_, i) => {
            if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
          });
          setHover(best);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 8} y={y(t) + 4} className="axis" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        <text x={pad.l} y={H - 6} className="axis">
          {fmtDate(new Date(points[0].date))}
        </text>
        <text x={W - pad.r} y={H - 6} className="axis" textAnchor="end">
          {fmtDate(new Date(points[points.length - 1].date))}
        </text>
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(points.length - 1)} cy={y(points[points.length - 1].value)} r={4} fill={color} className="end-dot" />
        {hp && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} className="crosshair" />
            <circle cx={x(hover)} cy={y(hp.value)} r={5} fill={color} className="end-dot" />
          </g>
        )}
      </svg>
      {hp && hover !== null && (
        <div className="tooltip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>
            {hp.value}
            {unit}
          </b>
          <span>{hp.label ?? new Date(hp.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      )}
    </div>
  );
}

interface BarGroup {
  label: string;
  values: { value: number | null; n: number }[];
}

/** Gruppierte Balken (Prozent), z. B. früher vs. zuletzt */
export function GroupedBars({ groups, series }: { groups: BarGroup[]; series: { name: string; color: string }[] }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="bars">
      <div className="legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
      <div className="bar-groups">
        {groups.map((g) => (
          <div key={g.label} className="bar-group">
            <div className="bar-stack">
              {g.values.map((v, i) => {
                const key = `${g.label}-${i}`;
                return (
                  <div key={i} className="bar-slot" onMouseEnter={() => setHover(key)} onMouseLeave={() => setHover(null)}>
                    <span className="bar-val">{v.value === null ? '–' : `${Math.round(v.value)}%`}</span>
                    <div className="bar" style={{ height: `${v.value ?? 0}%`, background: series[i].color, opacity: v.value === null ? 0 : 1 }} />
                    {hover === key && (
                      <div className="tooltip bar-tip">
                        <b>{v.value === null ? L('keine Partien', 'no games') : L(`${Math.round(v.value)}% Siege`, `${Math.round(v.value)}% wins`)}</b>
                        <span>
                          {series[i].name} · {v.n} {v.n === 1 ? L('Partie', 'game') : L('Partien', 'games')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="bar-label">{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
