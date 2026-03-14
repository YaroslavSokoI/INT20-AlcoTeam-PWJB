import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Users, TrendingUp, Target, AlertTriangle, ArrowUpRight,
  Calendar, Smartphone, CheckCircle, ChevronDown, Download, Filter
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';

type DateRange = '7D' | '30D' | '90D' | 'ALL';
type Platform = 'ALL' | 'iOS' | 'Android' | 'Web';

const RANGE_LABELS: Record<DateRange, string> = {
  '7D': 'Last 7 Days',
  '30D': 'Last 30 Days',
  '90D': 'Last 90 Days',
  'ALL': 'Lifetime'
};

// Data generation helper to simulate different values per filter
const generateMockData = (range: DateRange, platform: Platform) => {
  const seed = {
    '7D': 0.8,
    '30D': 1,
    '90D': 1.2,
    'ALL': 2.5
  }[range];

  const pMod = {
    'ALL': 1,
    'iOS': 0.6,
    'Android': 0.35,
    'Web': 0.15
  }[platform];

  const modifier = seed * pMod;

  const kpis = [
    { label: 'Completion Rate', value: `${Math.round(82 * (0.95 + Math.random() * 0.1))}%`, change: '+4%', icon: <Target />, color: '#4f8ef7' },
    { label: 'Total Users', value: `${Math.round(10200 * modifier).toLocaleString()}`, change: '+12%', icon: <Users />, color: '#2cb67d' },
    { label: 'Avg. Finish Time', value: '3m 24s', change: '-18s', icon: <TrendingUp />, color: '#f5924a' },
    { label: 'Drop-off Peak', value: 'Step 3', change: 'Workout', icon: <AlertTriangle />, color: '#ef4444' },
  ];

  const trend = [
    { week: 'W1', rate: Math.round(58 * (0.9 + Math.random() * 0.2)) },
    { week: 'W2', rate: Math.round(63 * (0.9 + Math.random() * 0.2)) },
    { week: 'W3', rate: Math.round(71 * (0.9 + Math.random() * 0.2)) },
    { week: 'W4', rate: Math.round(68 * (0.9 + Math.random() * 0.2)) },
    { week: 'W5', rate: Math.round(74 * (0.9 + Math.random() * 0.2)) },
    { week: 'W6', rate: Math.round(79 * (0.9 + Math.random() * 0.2)) },
    { week: 'W7', rate: Math.round(76 * (0.9 + Math.random() * 0.2)) },
    { week: 'W8', rate: Math.round(82 * (0.9 + Math.random() * 0.2)) },
  ];

  const topAnswers = [
    { label: 'Weight Loss', count: Math.round(3840 * modifier), color: '#4f8ef7' },
    { label: 'Strength', count: Math.round(2910 * modifier), color: '#2cb67d' },
    { label: 'Stress', count: Math.round(2240 * modifier), color: '#f5924a' },
    { label: 'Flexibility', count: Math.round(1890 * modifier), color: '#9b59b6' },
    { label: 'Endurance', count: Math.round(1430 * modifier), color: '#ef4444' },
  ];

  const funnel = [
    { name: 'Started', value: Math.round(10000 * modifier), fill: '#4f8ef7' },
    { name: 'Goal', value: Math.round(9200 * modifier), fill: '#5a96fb' },
    { name: 'Gender', value: Math.round(7800 * modifier), fill: '#6ea0fc' },
    { name: 'Workout', value: Math.round(6500 * modifier), fill: '#82acfe' },
    { name: 'Limits', value: Math.round(5400 * modifier), fill: '#96b8ff' },
    { name: 'Offer', value: Math.round(4100 * modifier), fill: '#bed2ff' },
    { name: 'Bought', value: Math.round(2847 * modifier), fill: '#d2dfff' },
  ];

  return { kpis, trend, topAnswers, funnel };
};

export function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState<DateRange>('30D');
  const [platform, setPlatform] = useState<Platform>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive data from filters
  const data = useMemo(() => generateMockData(dateRange, platform), [dateRange, platform]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-4 md:p-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">Analytics</h1>
          <p className="text-sm font-bold text-[var(--color-text-muted)] mt-0.5">Real-time performance metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter Dropdown */}
          <FilterDropdown
            label="Platform"
            value={platform}
            options={[
              { value: 'ALL', label: 'All Platforms' },
              { value: 'iOS', label: 'Apple iOS' },
              { value: 'Android', label: 'Google Android' },
              { value: 'Web', label: 'Web Browser' },
            ]}
            icon={<Smartphone className="w-3.5 h-3.5" />}
            onChange={(v: string) => { setPlatform(v as Platform); handleRefresh(); }}
          />

          {/* Date Range Dropdown */}
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
            onChange={(v: string) => { setDateRange(v as DateRange); handleRefresh(); }}
          />

          <button className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${dateRange}-${platform}`}
          initial={{ opacity: isRefreshing ? 0.5 : 1 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {data.kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <KpiCard {...kpi} isMobile={isMobile} />
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <ChartCard title="Completion Rate Trend" subtitle="Percentage of users finishing the flow" className="lg:col-span-8">
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                <LineChart data={data.trend} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: '1px solid var(--color-border)', fontSize: 12, boxShadow: 'var(--shadow-card)', fontWeight: 800, padding: '10px 14px' }}
                    itemStyle={{ color: '#000' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#4f8ef7" strokeWidth={4} dot={{ r: 5, fill: '#4f8ef7', strokeWidth: 0 }} activeDot={{ r: 7, strokeWidth: 4, stroke: 'white' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="User Motivation" subtitle="Top selected goal" className="lg:col-span-4">
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
                <BarChart data={data.topAnswers} layout="vertical" margin={{ top: 5, right: 20, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} opacity={0.5} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: 'var(--color-text-primary)', fontWeight: 700 }} width={85} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    contentStyle={{ borderRadius: 16, border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 800 }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {data.topAnswers.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Funnel Section */}
          <ChartCard title="Conversion Funnel" subtitle="Visualizing user drop-off at each stage">
            <div className="grid grid-cols-4 md:grid-cols-7 gap-1.5 md:gap-4 py-6">
              {data.funnel.map((step, i) => {
                const prev = data.funnel[i - 1];
                const dropoff = prev ? Math.round(((prev.value - step.value) / prev.value) * 100) : 0;
                const pct = Math.round((step.value / data.funnel[0].value) * 100);
                return (
                  <div key={step.name} className="flex flex-col items-center gap-3 group">
                    <div className="text-[11px] font-black text-[var(--color-text-primary)]">{pct}%</div>
                    <div className="w-full relative flex items-center justify-center">
                      <motion.div
                        layoutId={`funnel-${step.name}`}
                        className="w-full rounded-2xl shadow-sm transition-all group-hover:scale-[1.02] group-hover:opacity-100"
                        style={{ height: `${Math.max(pct * 2.5, 30)}px`, backgroundColor: step.fill, opacity: 0.8 }}
                      />
                      {dropoff > 0 && (
                        <div className="absolute -right-2 top-0 md:group-hover:-translate-y-2 transition-transform">
                          <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">-{dropoff}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[9px] text-center font-black text-[var(--color-text-muted)] uppercase tracking-tighter leading-tight w-full truncate px-0.5">
                      {step.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </motion.div>
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
        <div className="flex items-center gap-2 opacity-60">
          {icon}
          <span className="uppercase tracking-widest text-[10px] sm:inline hidden">{label}:</span>
        </div>
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

function KpiCard({ label, value, change, icon, color }: any) {
  return (
    <div className="bg-[var(--color-surface)] rounded-[24px] border border-[var(--color-border)] p-4 md:p-6 shadow-[var(--shadow-card)] active:scale-[0.98] transition-all group overflow-hidden relative">
      <div className="flex items-start justify-between relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: color + '12', color }}>
          {icon}
        </div>
        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          <ArrowUpRight className="w-3 h-3" />
          <span className="text-[10px] font-black">{change}</span>
        </div>
      </div>
      <div className="mt-5 relative z-10">
        <p className="text-3xl font-black text-[var(--color-text-primary)] leading-none mb-1.5 tracking-tighter">{value}</p>
        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">{label}</p>
      </div>
      {/* Decorative gradient blob */}
      <div
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 pointer-events-none"
        style={{ background: color }}
      />
    </div>
  );
}

function ChartCard({ title, subtitle, children, className }: any) {
  return (
    <div className={cn("bg-[var(--color-surface)] rounded-[32px] border border-[var(--color-border)] p-5 md:p-8 shadow-[var(--shadow-card)]", className)}>
      <div className="mb-8">
        <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">{title}</h3>
        <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
