import { motion } from 'framer-motion';
import { Tag, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

const OFFERS = [
  { id: '1', title: 'Weight Loss Starter', category: 'WEIGHT_LOSS', price: '$29.99', conversion: '12.4%', users: '1,240', status: 'active', color: 'orange' },
  { id: '2', title: 'Lean Strength Builder', category: 'STRENGTH', price: '$39.99', conversion: '8.2%', users: '860', status: 'active', color: 'emerald' },
  { id: '3', title: 'Flexibility Plus', category: 'WELLNESS', price: '$19.99', conversion: '5.1%', users: '420', status: 'paused', color: 'purple' },
  { id: '4', title: '30-Day Shred', category: 'WEIGHT_LOSS', price: '$49.99', conversion: '15.8%', users: '2,910', status: 'active', color: 'orange' },
  { id: '5', title: 'Elite Performance', category: 'STRENGTH', price: '$99.99', conversion: '3.4%', users: '150', status: 'draft', color: 'blue' },
];

export function OffersPage() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Offers</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Manage and track conversion for your onboarding offers</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Active Offers" value="4" icon={<Tag className="w-4 h-4" />} color="bg-orange-50 text-orange-600" />
        <SummaryCard label="Total Conversions" value="2,847" icon={<TrendingUp className="w-4 h-4" />} color="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Avg. Conversion Rate" value="9.2%" icon={<CheckCircle className="w-4 h-4" />} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFERS.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <OfferCard {...offer} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-[var(--shadow-card)]">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", color)}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-0.5">{value}</p>
      <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

function OfferCard({ title, category, price, conversion, users, status, color }: any) {
  const colorMap: any = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-[var(--shadow-card)] group hover:shadow-[var(--shadow-card-hover)] transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 border", colorMap[color])}>
            {category}
          </span>
          <h3 className="font-bold text-[var(--color-text-primary)] leading-tight group-hover:text-black transition-colors">{title}</h3>
        </div>
        <div className={cn("px-2 py-1 rounded-full text-[10px] font-semibold capitalize", 
          status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
          status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
        )}>
          {status}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-5 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
        <div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase mb-0.5">Price</p>
          <p className="text-sm font-bold text-[var(--color-text-primary)]">{price}</p>
        </div>
        <div className="w-px h-6 bg-[var(--color-border)] opacity-50" />
        <div>
          <p className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase mb-0.5">Conv.</p>
          <p className="text-sm font-bold text-emerald-600">{conversion}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{users} <span className="font-normal">users</span></span>
        </div>
        <button className="text-xs font-bold text-[var(--color-text-primary)] hover:underline">Edit Details</button>
      </div>
    </div>
  );
}
