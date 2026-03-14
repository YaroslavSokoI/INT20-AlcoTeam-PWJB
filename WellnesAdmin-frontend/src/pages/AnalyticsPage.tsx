import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Users, TrendingUp, Target, AlertTriangle, ArrowUpRight } from 'lucide-react';

const COMPLETION_TREND = [
  { week: 'W1', rate: 58 }, { week: 'W2', rate: 63 }, { week: 'W3', rate: 71 }, { week: 'W4', rate: 68 },
  { week: 'W5', rate: 74 }, { week: 'W6', rate: 79 }, { week: 'W7', rate: 76 }, { week: 'W8', rate: 82 },
];

const TOP_ANSWERS = [
  { label: 'Lose weight', count: 3840, color: '#4f8ef7' },
  { label: 'Build strength', count: 2910, color: '#2cb67d' },
  { label: 'Reduce stress', count: 2240, color: '#f5924a' },
  { label: 'Flexibility', count: 1890, color: '#9b59b6' },
  { label: 'Endurance', count: 1430, color: '#ef4444' },
];

const FUNNEL_DATA = [
  { name: 'Started', value: 10000, fill: '#4f8ef7' },
  { name: 'Q1 – Goal', value: 9200, fill: '#5a96fb' },
  { name: 'Q2 – Gender', value: 7800, fill: '#6ea0fc' },
  { name: 'Q3 – Workout', value: 6500, fill: '#82acfe' },
  { name: 'Q4 – Limits', value: 5400, fill: '#96b8ff' },
  { name: 'Info Page', value: 4900, fill: '#aac5ff' },
  { name: 'Offer Seen', value: 4100, fill: '#bed2ff' },
  { name: 'Converted', value: 2847, fill: '#d2dfff' },
];

const KPI_CARDS = [
  { label: 'Completion Rate', value: '82%', change: '+4%', icon: <Target />, color: '#4f8ef7' },
  { label: 'Total Users', value: '10,000', change: '+12%', icon: <Users />, color: '#2cb67d' },
  { label: 'Avg. Time to Complete', value: '3m 24s', change: '-18s', icon: <TrendingUp />, color: '#f5924a' },
  { label: 'Top Drop-off Step', value: 'Q3 – Workout', change: 'Step 3', icon: <AlertTriangle />, color: '#ef4444' },
];

export function AnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Flow performance overview · Last 8 weeks</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartCard title="Completion Rate Trend" subtitle="Weekly average %">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={COMPLETION_TREND} margin={{ top: 4, right: 12, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 12, boxShadow: 'var(--shadow-card)' }}
                labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="rate" stroke="#4f8ef7" strokeWidth={2.5} dot={{ r: 3, fill: '#4f8ef7', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Selected Answers" subtitle="All time total responses">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TOP_ANSWERS} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {TOP_ANSWERS.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Drop-off Funnel" subtitle="User progression through each step">
        <div className="flex gap-4 py-2">
          {FUNNEL_DATA.map((step, i) => {
            const prev = FUNNEL_DATA[i - 1];
            const dropoff = prev ? Math.round(((prev.value - step.value) / prev.value) * 100) : 0;
            const pct = Math.round((step.value / FUNNEL_DATA[0].value) * 100);
            return (
              <div key={step.name} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-xs font-semibold text-[var(--color-text-primary)]">{pct}%</div>
                <div className="w-full rounded-lg transition-all" style={{ height: `${Math.max(pct * 1.4, 12)}px`, backgroundColor: step.fill, opacity: 0.85 }} />
                <div className="text-[9px] text-center text-[var(--color-text-muted)] leading-tight">{step.name}</div>
                {dropoff > 0 && <div className="text-[9px] font-medium text-red-400">-{dropoff}%</div>}
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}

function KpiCard({ label, value, change, icon, color }: any) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18', color }}>
          <span style={{ transform: 'scale(0.82)', display: 'flex' }}>{icon}</span>
        </div>
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
          <ArrowUpRight className="w-2.5 h-2.5" />
          <span className="text-[9px] font-semibold">{change}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-0.5">{value}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
