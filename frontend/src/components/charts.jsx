import React, { useState } from 'react';

/** Fixed colour per entity (never per rank) so a status looks the same on every chart. */
export const chartColors = {
  active: '#4f46e5',
  completed: '#059669',
  dropped: '#94a3b8',
  primary: '#4f46e5',
  teal: '#0d9488',
  amber: '#d97706',
  rose: '#e11d48',
};
export const categorical = [chartColors.primary, chartColors.teal, chartColors.amber, chartColors.rose, '#0284c7', '#7c3aed'];

/** Donut with centre total, hover highlight and a legend that doubles as a table view. */
export function DonutChart({ data, centerLabel = 'Total', size = 168 }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 62;
  const c = 2 * Math.PI * r;
  const gap = data.filter((d) => d.value > 0).length > 1 ? 2 : 0;
  let offset = 0;

  const active = hover != null ? data[hover] : null;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label={`${centerLabel}: ${total}`}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="#e2e8f0" strokeWidth="16" />
          {total > 0 && data.map((d, i) => {
            const len = (d.value / total) * c;
            const dash = Math.max(len - gap, 0);
            const el = (
              <circle
                key={d.label}
                cx="80" cy="80" r={r} fill="none" stroke={d.color}
                strokeWidth={hover === i ? 20 : 16}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${d.label}: ${d.value}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{active ? active.value : total}</span>
          <span className="text-xs text-slate-500">{active ? active.label : centerLabel}</span>
        </div>
      </div>
      <ul className="min-w-[10rem] flex-1 space-y-2 text-sm">
        {data.map((d, i) => (
          <li
            key={d.label}
            className={`flex items-center justify-between gap-3 rounded-md px-2 py-1 ${hover === i ? 'bg-slate-100' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="flex items-center gap-2 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="font-medium text-slate-900">
              {d.value} <span className="font-normal text-slate-400">({total ? Math.round((d.value / total) * 100) : 0}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal bars: good for ranked / labelled categories with long names. */
export function BarList({ data, max, format = (v) => v, color = chartColors.primary, empty = 'No data yet' }) {
  if (!data.length) return <p className="py-6 text-center text-sm text-slate-500">{empty}</p>;
  const top = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} title={`${d.label}: ${format(d.value)}`}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-slate-700">{d.label}</span>
            <span className="shrink-0 font-medium text-slate-900">{format(d.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.max((d.value / top) * 100, d.value > 0 ? 2 : 0)}%`, background: d.color || color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Area/line trend with hover crosshair + tooltip. */
export function TrendChart({ data, color = chartColors.primary, height = 220, empty = 'No data yet' }) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <p className="py-10 text-center text-sm text-slate-500">{empty}</p>;

  const W = 600;
  const H = height;
  const pad = { l: 32, r: 12, t: 12, b: 28 };
  const maxV = Math.max(...data.map((d) => d.value), 1);
  const niceMax = Math.ceil(maxV / 4) * 4 || 4;
  const x = (i) => pad.l + (data.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (data.length - 1)) * (W - pad.l - pad.r));
  const y = (v) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, 1, 2, 3, 4].map((t) => (niceMax / 4) * t);
  const step = Math.ceil(data.length / 6);
  const h = hover != null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trend chart" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">{Math.round(t)}</text>
          </g>
        ))}
        <path d={area} fill={color} opacity="0.1" />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (i % step === 0 || i === data.length - 1) && (
          <text key={d.label} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b">{d.label}</text>
        ))}
        {h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#94a3b8" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.value)} r="5" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}
        {data.map((d, i) => (
          <rect
            key={d.label} x={x(i) - (W - pad.l - pad.r) / data.length / 2} y={pad.t}
            width={(W - pad.l - pad.r) / data.length} height={H - pad.t - pad.b}
            fill="transparent" onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}
        >
          {h.label}: <strong>{h.value}</strong>
        </div>
      )}
    </div>
  );
}

/** Vertical columns, e.g. progress per course. */
export function ColumnChart({ data, max = 100, format = (v) => `${v}%`, color = chartColors.primary, empty = 'No data yet' }) {
  const [hover, setHover] = useState(null);
  if (!data.length) return <p className="py-10 text-center text-sm text-slate-500">{empty}</p>;
  return (
    <div>
      <div className="flex h-44 items-end gap-3 border-b border-slate-200 px-1">
        {data.map((d, i) => (
          <div
            key={d.label}
            className="group relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {hover === i && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-0.5 text-xs text-white">{d.label}: {format(d.value)}</span>
            )}
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0)}%`, background: d.color || color, opacity: hover == null || hover === i ? 1 : 0.55 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 px-1">
        {data.map((d) => <span key={d.label} className="flex-1 truncate text-center text-xs text-slate-500" title={d.label}>{d.label}</span>)}
      </div>
    </div>
  );
}
