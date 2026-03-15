import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
  Users, TrendingUp, Target, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Calendar, CheckCircle, ChevronDown, Download, FileJson, FileSpreadsheet, Upload, Timer
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import { apiService, type AnalyticsStats, type DropoffItem } from '@/services/api';
import { X } from 'lucide-react';

type DateRange = '7D' | '30D' | '90D' | 'ALL';

const GOAL_COLORS: Record<string, string> = {
  weight_loss: '#4f8ef7',
  strength: '#2cb67d',
  stress_relief: '#f5924a',
  flexibility: '#9b59b6',
  endurance: '#ef4444',
};

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  strength: 'Strength',
  stress_relief: 'Stress Relief',
  flexibility: 'Flexibility',
  endurance: 'Endurance',
};

const PIE_COLORS = ['#4f8ef7', '#2cb67d', '#f5924a', '#9b59b6', '#ef4444', '#f59e0b', '#06b6d4'];
const SOURCE_COLORS = ['#e1306c', '#69c9d0', '#1877f2', '#f77737', '#25d366', '#ff4500', '#6c5ce7'];
const LANG_COLORS = ['#00b894', '#fdcb6e', '#e17055', '#0984e3', '#6c5ce7', '#d63031', '#00cec9', '#e84393', '#2d3436', '#a29bfe'];

const tooltipStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  fontSize: 12,
  fontWeight: 700,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};

function NoData() {
  return (
    <div className="flex items-center justify-center h-full min-h-[180px] text-sm font-bold text-[var(--color-text-muted)]">
      No data available
    </div>
  );
}

function AnimatedDot({ cx, cy, index }: any) {
  return (
    <circle
      cx={cx} cy={cy} r={5} fill="#4f8ef7"
      style={{ animation: `dotFadeIn 0.4s ease-out ${0.05 + index * 0.06}s both` }}
    />
  );
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text
      x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={800}
      style={{ animation: 'pieLabel 0.4s ease-out 2s both' }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(stats: AnalyticsStats, range: string) {
  downloadFile(JSON.stringify(stats, null, 2), `analytics_${range}.json`, 'application/json');
}

function exportCSV(stats: AnalyticsStats, range: string) {
  const lines: string[] = [];

  lines.push('Section,Key,Value');
  lines.push(`Overview,Total Sessions,${stats.totalSessions}`);
  lines.push(`Overview,Completed Sessions,${stats.completedSessions}`);
  lines.push(`Overview,Completion Rate,${stats.completionRate}%`);

  lines.push('');
  lines.push('Goal,Count');
  stats.topGoals.forEach(g => lines.push(`${g.label},${g.count}`));

  lines.push('');
  lines.push('Week,Rate %');
  stats.weeklyTrend.forEach(w => lines.push(`${w.week},${w.rate}`));

  lines.push('');
  lines.push('Drop-off Step,Title,Type,Attribute Key,Count');
  stats.dropoffs.forEach(d => lines.push(`${d.step},"${d.title}",${d.type},${d.attributeKey || ''},${d.count}`));

  lines.push('');
  lines.push('Device,Count');
  stats.devices.forEach(d => lines.push(`${d.label},${d.count}`));

  lines.push('');
  lines.push('Source,Count');
  stats.sources.forEach(s => lines.push(`${s.label},${s.count}`));

  lines.push('');
  lines.push('Language,Count');
  stats.languages.forEach(l => lines.push(`${l.label},${l.count}`));

  downloadFile(lines.join('\n'), `analytics_${range}.csv`, 'text/csv');
}


export function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState<DateRange>('30D');
  const [liveStats, setLiveStats] = useState<AnalyticsStats | null>(null);
  const [importedStats, setImportedStats] = useState<AnalyticsStats | null>(() => {
    const saved = localStorage.getItem('analytics_imported');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [showDropoffs, setShowDropoffs] = useState(false);

  const isImported = importedStats !== null;
  const stats = isImported ? importedStats : liveStats;

  useEffect(() => {
    setLoading(true);
    apiService.getAnalyticsStats(dateRange)
      .then(setLiveStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);


  const handleClearImport = () => {
    setImportedStats(null);
    localStorage.removeItem('analytics_imported');
  };

  const topDropoff = stats?.dropoffs?.[0];

  const avgTimeLabel = stats?.avgCompletionMin != null ? `${stats.avgCompletionMin} min` : '—';

  const kpis = stats ? [
    { label: 'Completion Rate', value: `${stats.completionRate}%`, change: '', icon: <Target />, color: '#4f8ef7' },
    { label: 'Total Users', value: stats.totalSessions.toLocaleString(), change: '', icon: <Users />, color: '#2cb67d' },
    { label: 'Completed', value: stats.completedSessions.toLocaleString(), change: '', icon: <TrendingUp />, color: '#f5924a' },
    { label: 'Avg. Completion', value: avgTimeLabel, change: '', icon: <Timer />, color: '#8b5cf6' },
    { label: 'Drop-off Peak', value: topDropoff ? (topDropoff.attributeKey ? topDropoff.attributeKey.charAt(0).toUpperCase() + topDropoff.attributeKey.slice(1) : `Step ${topDropoff.step}`) : '—', change: '', icon: <AlertTriangle />, color: '#ef4444', onClick: topDropoff ? () => setShowDropoffs(true) : undefined },
  ] : [];

  const topGoals = stats?.topGoals.map(g => ({
    label: GOAL_LABELS[g.label] || g.label,
    count: g.count,
    color: GOAL_COLORS[g.label] || '#888',
  })) || [];

  const trend = stats?.weeklyTrend || [];

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-4 md:p-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Analytics</h1>
          <p className="text-sm font-bold text-[var(--color-text-muted)] mt-0.5">Real-time performance metrics</p>
        </div>

        <div className={cn("flex flex-wrap items-center gap-2", isImported && "[&>*:first-child]:opacity-40 [&>*:first-child]:pointer-events-none")}>
          <FilterDropdown
            label="Range"
            value={dateRange}
            options={[
              { value: '7D', label: 'Last 7 Days' },
              { value: '30D', label: 'Last 30 Days' },
              { value: '90D', label: 'Last 90 Days' },
              { value: 'ALL', label: 'Lifetime' },
            ]}
            icon={<Calendar className="w-3.5 h-3.5" />}
            onChange={(v: string) => setDateRange(v as DateRange)}
          />

          <ExportDropdown stats={stats} dateRange={dateRange} />
        </div>
      </div>

      {isImported && (
        <div className="flex items-center justify-between gap-3 mb-6 px-5 py-3.5 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2.5">
            <Upload className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800">
              Viewing imported data. Live analytics are hidden.
            </p>
          </div>
          <button
            onClick={handleClearImport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-black text-amber-700 hover:bg-amber-100 active:scale-95 transition-all shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Back to live
          </button>
        </div>
      )}

      {loading && !isImported ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[var(--color-border)] border-t-[var(--color-text-primary)] rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          key={dateRange}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {kpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} isMobile={isMobile} />
            ))}
          </div>

          {/* Row 1: Completion Trend + Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <ChartCard title="Completion Rate Trend" subtitle="Weekly completion percentage" className="lg:col-span-8">
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
                  <LineChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#000' }} />
                    <Line type="monotone" dataKey="rate" stroke="#4f8ef7" strokeWidth={4} dot={<AnimatedDot />} activeDot={{ r: 7, strokeWidth: 4, stroke: 'white' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Drop-off" subtitle="Steps where users abandon" className="lg:col-span-4">
              {stats?.dropoffs && stats.dropoffs.length > 0 ? (() => {
                const DROPOFF_COLORS = ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#06b6d4'];
                const items = stats.dropoffs.slice(0, 7).map((d, i) => ({
                  name: d.title,
                  count: d.count,
                  color: DROPOFF_COLORS[i % DROPOFF_COLORS.length],
                }));
                const othersCount = stats.dropoffs.slice(7).reduce((s, d) => s + d.count, 0);
                if (othersCount > 0) items.push({ name: 'Others', count: othersCount, color: '#94a3b8' });
                const totalDropoffs = items.reduce((s, d) => s + d.count, 0) || 1;
                return (
                  <div className="flex flex-col gap-2.5 mt-1">
                    {items.map((item, i) => {
                      const pct = Math.round((item.count / totalDropoffs) * 100);
                      return (
                        <div key={item.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-text-primary">{item.name}</span>
                            <span className="text-xs font-black text-[var(--color-text-muted)]">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: item.color, transformOrigin: 'left', animation: `barGrow 0.6s cubic-bezier(.4,0,.2,1) ${i * 0.08}s both` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : <NoData />}
            </ChartCard>
          </div>

          {/* Row 2: Devices + Source + Languages + Age Range + Drop-off */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <ChartCard title="Devices" subtitle="User device types">
              {stats?.devices && stats.devices.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart style={{ outline: 'none' }}>
                    <Pie data={stats.devices} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} cornerRadius={10} strokeWidth={0} label={renderPieLabel} labelLine={false}>
                      {stats.devices.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number, _: any, entry: any) => { const total = stats!.devices.reduce((s, d) => s + d.count, 0); return [`${value} (${Math.round((value / total) * 100)}%)`, 'Users']; }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Traffic Source" subtitle="In-app browser origin">
              {stats?.sources && stats.sources.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart style={{ outline: 'none' }}>
                    <Pie data={stats.sources} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} cornerRadius={10} strokeWidth={0} label={renderPieLabel} labelLine={false}>
                      {stats.sources.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => { const total = stats!.sources.reduce((s, d) => s + d.count, 0); return [`${value} (${Math.round((value / total) * 100)}%)`, 'Users']; }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Languages" subtitle="User browser language">
              {stats?.languages && stats.languages.length > 0 ? (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart style={{ outline: 'none' }}>
                    <Pie data={stats.languages} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} cornerRadius={10} strokeWidth={0} label={renderPieLabel} labelLine={false}>
                      {stats.languages.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => { const total = stats!.languages.reduce((s, d) => s + d.count, 0); return [`${value} (${Math.round((value / total) * 100)}%)`, 'Users']; }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </ChartCard>

            <ChartCard title="Age Range" subtitle="User age distribution">
              {stats?.ageRange && stats.ageRange.length > 0 ? (() => {
                const AGE_C = ['#a29bfe', '#6c5ce7', '#0984e3', '#00b894'];
                const AGE_L: Record<string, string> = { under_25: 'Under 25', '25_35': '25–35', '36_50': '36–50', over_50: '50+' };
                const ageData = stats.ageRange.map(r => ({ ...r, label: AGE_L[r.label] || r.label }));
                const ageTotal = stats.ageRange.reduce((s, d) => s + d.count, 0);
                return (
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart style={{ outline: 'none' }}>
                      <Pie data={ageData} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} cornerRadius={10} strokeWidth={0} label={renderPieLabel} labelLine={false}>
                        {ageData.map((_, i) => <Cell key={i} fill={AGE_C[i % AGE_C.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} (${Math.round((value / ageTotal) * 100)}%)`, 'Users']} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })() : <NoData />}
            </ChartCard>

            <ChartCard title="User Motivation" subtitle="Top goals selected">
              {topGoals.length > 0 ? (() => {
                const total = topGoals.reduce((s, g) => s + g.count, 0);
                return (
                  <div className="flex flex-col gap-3 mt-1">
                    {topGoals.map((g, i) => {
                      const pct = Math.round((g.count / total) * 100);
                      return (
                        <div key={g.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black">{g.label}</span>
                            <span className="text-xs font-black text-text-muted">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: g.color, transformOrigin: 'left', animation: `barGrow 0.6s cubic-bezier(.4,0,.2,1) ${i * 0.08}s both` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })() : <NoData />}
            </ChartCard>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-1 bg-surface rounded-3xl border border-border shadow-(--shadow-card) min-h-150" />
            <div className="col-span-4 bg-surface rounded-3xl border border-border shadow-(--shadow-card) min-h-150" />
          </div>
        </motion.div>
      )}

      {/* Drop-off Details Modal */}
      <AnimatePresence>
        {showDropoffs && stats?.dropoffs && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[200]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDropoffs(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-[15%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[420px] bg-white rounded-3xl border border-[var(--color-border)] shadow-2xl z-[201] p-6 max-h-[70vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h3 className="text-lg font-black text-[var(--color-text-primary)]">Drop-off Details</h3>
                <button onClick={() => setShowDropoffs(false)} className="p-1.5 rounded-xl hover:bg-[var(--color-bg)] transition-colors">
                  <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                </button>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto">
                {stats.dropoffs.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-sm font-black shrink-0">
                      {d.count}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{d.title}</p>
                      <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        {d.type}{d.attributeKey ? ` · ${d.attributeKey}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.dropoffs.length === 0 && (
                  <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No drop-offs recorded</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterDropdown({ label, value, options, icon, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-xs font-black text-[var(--color-text-primary)] shadow-sm hover:border-black/20 active:scale-95 transition-all"
      >
        <span className="opacity-60 flex items-center">{icon}</span>
        <span className="min-w-[70px] text-left">{selectedLabel}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white border border-[var(--color-border)] rounded-2xl shadow-2xl z-[101] overflow-hidden p-1.5"
            >
              {options.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors",
                    value === opt.value ? "bg-black text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-black"
                  )}
                >
                  {opt.label}
                  {value === opt.value && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function KpiCard({ label, value, change, icon, color, onClick }: any) {
  const isPositive = !change || !change.startsWith('-');
  return (
    <div
      className={cn(
        "bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)] p-3 md:p-4 shadow-[var(--shadow-card)] group overflow-hidden relative",
        onClick && "cursor-pointer hover:border-black/20"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: color + '12', color }}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-black text-[var(--color-text-primary)] leading-tight tracking-tighter wrap-break-word">{value}</p>
          <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{label}</p>
        </div>
        {onClick ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-[var(--color-text-muted)] border border-[var(--color-border)] shrink-0">
            <span className="text-[10px] font-black">Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        ) : change ? (
          <div className={cn(
            "flex items-center gap-0.5 px-2 py-1 rounded-full border shrink-0",
            isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span className="text-[10px] font-black">{change}</span>
          </div>
        ) : null}
      </div>
      <div
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none"
        style={{ background: color }}
      />
    </div>
  );
}

function ChartCard({ title, subtitle, children, className }: any) {
  return (
    <div className={cn("bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)] p-4 md:p-5 shadow-[var(--shadow-card)]", className)}>
      <div className="mb-4">
        <h3 className="text-base font-black text-[var(--color-text-primary)] tracking-tight">{title}</h3>
        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ExportDropdown({ stats, dateRange }: { stats: AnalyticsStats | null; dateRange: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!stats}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-xs font-black text-[var(--color-text-primary)] shadow-sm hover:border-black/20 active:scale-95 transition-all disabled:opacity-40"
      >
        <Download className="w-3.5 h-3.5 opacity-60" />
        <span>Export</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && stats && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-44 bg-white border border-[var(--color-border)] rounded-2xl shadow-2xl z-[101] overflow-hidden p-1.5"
            >
              <button
                onClick={() => { exportCSV(stats, dateRange); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-black transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Export as CSV
              </button>
              <button
                onClick={() => { exportJSON(stats, dateRange); setIsOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-black transition-colors"
              >
                <FileJson className="w-4 h-4 text-blue-500" />
                Export as JSON
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

