"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C, ChartTooltip, usd, usdCompact } from "./ui";

export type NWPoint = { label: string; netWorth: number; assets?: number; liabilities?: number };

export function NetWorthArea({ data, dark, height = 220 }: { data: NWPoint[]; dark?: boolean; height?: number }) {
  const stroke = dark ? C.greenSoft : C.green;
  const axis = dark ? "rgba(255,255,255,0.55)" : C.muted;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={dark ? "nwd" : "nwl"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={dark ? 0.35 : 0.22} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={dark ? "rgba(255,255,255,0.08)" : C.grid} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: axis }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tickFormatter={usdCompact} tick={{ fontSize: 11, fill: axis }} tickLine={false} axisLine={false} width={52} domain={["auto", "auto"]} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: dark ? "rgba(255,255,255,0.25)" : C.mist }} />
          <Area type="monotone" dataKey="netWorth" name="Net worth" stroke={stroke} strokeWidth={2.25} fill={`url(#${dark ? "nwd" : "nwl"})`} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AssetsLiabilitiesBars({ data, height = 240 }: { data: NWPoint[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} minTickGap={16} />
          <YAxis tickFormatter={usdCompact} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(11,31,58,0.04)" }} />
          <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 12, color: C.muted }} />
          <Bar dataKey="assets" name="Assets" fill={C.navy} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="liabilities" name="Liabilities" fill={C.mist} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({ data, height = 220, center }: { data: { label: string; amount: number; color: string }[]; height?: number; center?: { top: string; bottom: string } }) {
  return (
    <div style={{ height }} className="relative w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="label" innerRadius="64%" outerRadius="96%" paddingAngle={1.2} stroke="none" isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {center && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-lg font-semibold tabular-nums text-[#0b1f3a]">{center.top}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#5f6f86]">{center.bottom}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function GrowthChart({ data, showReal, height = 280 }: { data: { year: number; contributions: number; balance: number; real: number }[]; showReal: boolean; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} tickFormatter={(y) => `Yr ${y}`} minTickGap={20} />
          <YAxis tickFormatter={usdCompact} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={56} />
          <Tooltip content={<ChartTooltip labelFormat={(l) => `Year ${l}`} />} />
          <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 12, color: C.muted }} />
          <Area type="monotone" dataKey="balance" name="Projected balance" stroke={C.green} strokeWidth={2.25} fill={C.green} fillOpacity={0.12} isAnimationActive={false} />
          <Area type="monotone" dataKey="contributions" name="Your contributions" stroke={C.navy} strokeWidth={1.75} fill={C.navy} fillOpacity={0.08} isAnimationActive={false} />
          {showReal && <Area type="monotone" dataKey="real" name="In today's dollars" stroke={C.gold} strokeDasharray="5 4" strokeWidth={1.75} fill="none" isAnimationActive={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PayoffChart({ series, height = 240 }: { series: { month: number; snowball: number; avalanche: number; minimums: number }[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} tickFormatter={(m) => (m % 12 === 0 ? `Yr ${m / 12}` : `${m}m`)} minTickGap={24} />
          <YAxis tickFormatter={usdCompact} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} width={52} />
          <Tooltip content={<ChartTooltip labelFormat={(l) => `Month ${l}`} />} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: C.muted }} />
          <Line type="monotone" dataKey="avalanche" name="Avalanche" stroke={C.green} strokeWidth={2.25} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="snowball" name="Snowball" stroke={C.navy} strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="minimums" name="Minimums only" stroke={C.mist} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export { usd };
