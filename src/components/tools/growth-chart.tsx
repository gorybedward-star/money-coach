import { formatCompactUSD, formatUSD } from "@/lib/calculators";

type Series = { key: string; label: string; color: string; values: number[] };

/**
 * Lightweight dependency-free SVG line chart.
 * x = index (labelled with xLabels), y = dollar value.
 */
export function GrowthChart({
  xLabels,
  series,
  title,
}: {
  xLabels: (string | number)[];
  series: Series[];
  title: string;
}) {
  const W = 640;
  const H = 300;
  const pad = { l: 56, r: 16, t: 16, b: 36 };
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const n = Math.max(1, xLabels.length - 1);
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const step = Math.ceil(xLabels.length / 6);

  return (
    <figure className="rounded-2xl border border-navy/10 bg-white p-4 sm:p-6">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold">{title}</span>
        <span className="flex flex-wrap gap-4 text-xs">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className="h-1 w-5 rounded-full" style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`${title}. ${series.map((s) => `${s.label}: ${formatUSD(s.values.at(-1) ?? 0)} at the end`).join(". ")}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#10243A" strokeOpacity={0.08} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#526073">{formatCompactUSD(t)}</text>
          </g>
        ))}
        {xLabels.map((l, i) =>
          i % step === 0 || i === xLabels.length - 1 ? (
            <text key={i} x={x(i)} y={H - 12} textAnchor="middle" fontSize={11} fill="#526073">{l}</text>
          ) : null,
        )}
        {series.map((s, si) => {
          const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
          const area = `${d} L${x(s.values.length - 1).toFixed(1)},${y(0)} L${x(0)},${y(0)} Z`;
          return (
            <g key={s.key}>
              <path d={area} fill={s.color} opacity={si === 0 ? 0.12 : 0.18} />
              <path d={d} fill="none" stroke={s.color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
