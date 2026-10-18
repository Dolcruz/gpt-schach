import { winPercent } from '../engine';
import type { PlyAnalysis } from '../lib/data';
import { CLASS_INFO } from '../coach';

interface Props {
  startCp: number;
  plies: PlyAnalysis[];
  cursor: number;
  onSelect: (ply: number) => void;
}

/** Bewertungsverlauf: Fläche = Gewinnchance Weiß, Punkte = Fehler */
export function EvalGraph({ startCp, plies, cursor, onSelect }: Props) {
  const W = 400;
  const H = 84;
  const pts = [startCp, ...plies.map((p) => p.cp)].map((cp) => winPercent(cp));
  const n = Math.max(pts.length - 1, 1);
  const x = (i: number) => (i / n) * W;
  const y = (p: number) => H - (p / 100) * H;
  const area = `M0,${H} ` + pts.map((p, i) => `L${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' ') + ` L${W},${H} Z`;
  const marks = plies
    .map((p, i) => ({ p, i: i + 1 }))
    .filter(({ p }) => p.c === 'mistake' || p.c === 'blunder' || p.c === 'great');

  return (
    <svg
      className="eval-graph"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      onClick={(e) => {
        const r = (e.currentTarget as SVGElement).getBoundingClientRect();
        onSelect(Math.round(((e.clientX - r.left) / r.width) * n));
      }}
    >
      <rect width={W} height={H} className="g-bg" />
      <path d={area} className="g-white" />
      <line x1={0} x2={W} y1={H / 2} y2={H / 2} className="g-mid" />
      <line x1={x(cursor)} x2={x(cursor)} y1={0} y2={H} className="g-cursor" />
      {marks.map(({ p, i }) => (
        <circle key={i} cx={x(i)} cy={y(pts[i])} r={3.2} fill={CLASS_INFO[p.c].color} className="g-dot" />
      ))}
    </svg>
  );
}
