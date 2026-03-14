import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Users, CheckCircle, TrendingUp, Plus, Filter, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import { NewOfferModal } from '@/components/NewOfferModal';
import { OFFER_CATEGORIES } from '@/types';
import type { Offer, OfferCategory } from '@/types';
import { apiService } from '@/services/api';

export function OffersPage() {
  const isMobile = useIsMobile();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<OfferCategory | 'ALL'>('ALL');

  useEffect(() => {
    async function loadOffers() {
      try {
        setIsLoading(true);
        const backendOffers = await apiService.getOffers();
        const mapped: Offer[] = backendOffers.map(o => ({
          id: o.id,
          title: o.title,
          category: 'WELLNESS', // Fallback as BE doesn't have an explicit enum today
          conversion: Math.floor(Math.random() * 15 + 1) + '.' + Math.floor(Math.random() * 9) + '%', // Mock stats
          users: Math.floor(Math.random() * 2000 + 100).toLocaleString(), // Mock stats
          status: 'active',
          color: 'emerald',
        }));
        setOffers(mapped);
      } catch (err) {
        console.error('Failed to load offers', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || offer.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [offers, searchQuery, categoryFilter]);

  const activeOffersCount = offers.filter(o => o.status === 'active').length;
  const totalUsers = offers.reduce((acc, o) => acc + parseInt(o.users.replace(/,/g, '')), 0).toLocaleString();

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Offers</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Manage and track conversion for your onboarding offers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-black active:scale-95 transition-all shadow-lg active:shadow-md"
          >
            <Plus className="w-4 h-4" /> New Offer
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-8">
        <SummaryCard label="Active Offers" value={activeOffersCount.toString()} icon={<Tag className="w-4 h-4" />} color="bg-orange-50 text-orange-600" />
        <SummaryCard label="Total Reach" value={totalUsers} icon={<Users className="w-4 h-4" />} color="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Avg. Conv" value="9.2%" icon={<TrendingUp className="w-4 h-4" />} color="bg-blue-50 text-blue-600" className="hidden lg:flex" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search offers by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--color-bg)]"
            >
              <X className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <FilterTab active={categoryFilter === 'ALL'} onClick={() => setCategoryFilter('ALL')} label="All" />
          {OFFER_CATEGORIES.map(cat => (
            <FilterTab
              key={cat.value}
              active={categoryFilter === cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              label={cat.label}
            />
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center text-[var(--color-text-muted)]">Loading offers...</div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOffers.map((offer, i) => (
              <motion.div
                key={offer.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <OfferCard {...offer} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredOffers.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">No offers found</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your filters or search query</p>
            <button
              onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); }}
              className="mt-4 text-xs font-black uppercase tracking-widest text-black underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <NewOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={newOffer => setOffers([newOffer, ...offers])}
      />
    </div>
  );
}

function SummaryCard({ label, value, icon, color, className }: any) {
  return (
    <div className={cn("bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 md:p-5 shadow-sm flex items-center md:items-start md:flex-col gap-4 md:gap-3", className)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", color)}>
        {icon}
      </div>
      <div>
        <p className="text-xl md:text-2xl font-black text-[var(--color-text-primary)] leading-tight">{value}</p>
        <p className="text-[10px] md:text-xs text-[var(--color-text-muted)] font-black uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function FilterTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap border",
        active
          ? "bg-black text-white border-black shadow-md shadow-black/5"
          : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-black/20"
      )}
    >
      {label}
    </button>
  );
}

function OfferCard({ title, category, conversion, users, status, color }: Offer) {
  const colorMap: any = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all flex flex-col h-full active:scale-[0.99]">
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-2 border", colorMap[color])}>
            {category.replace('_', ' ')}
          </span>
          <h3 className="font-black text-[var(--color-text-primary)] leading-tight group-hover:text-black transition-colors truncate">{title}</h3>
        </div>
        <div className={cn("shrink-0 px-2 py-1 rounded-full text-[10px] font-black capitalize border shadow-sm",
          status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              'bg-slate-50 text-slate-700 border-slate-100'
        )}>
          {status}
        </div>
      </div>

      <div className="mb-5 p-3 bg-[var(--color-surface-2)]/50 rounded-xl border border-[var(--color-border)]/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[9px] text-[var(--color-text-muted)] font-black uppercase mb-0.5">Conversion Rate</p>
          <p className="text-sm font-black text-emerald-600">{conversion}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--color-border)]/50">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Users className="w-4 h-4" />
          <span className="text-xs font-black leading-none">{users} <span className="font-bold text-[9px] uppercase tracking-tighter ml-0.5 opacity-60">users</span></span>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-primary)] hover:underline active:opacity-60">Edit Details</button>
      </div>
    </div>
  );
}
