import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Users, CheckCircle, Plus, Search, X, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import { NewOfferModal } from '@/components/NewOfferModal';
import { EditOfferModal } from '@/components/EditOfferModal';
import { getCategoryMeta } from '@/types';
import type { Offer, OfferCategory } from '@/types';
import { apiService, type BackendOffer } from '@/services/api';

function mapBackendToOffer(o: BackendOffer): Offer {
  const meta = getCategoryMeta(o.attribute_key || o.title || '');
  return {
    id: o.id,
    title: o.title,
    description: o.description || '',
    slug: o.attribute_key || '',
    cta_text: o.cta_text || 'Start My Journey',
    digital_plan: o.digital_plan || '',
    physical_kit: o.physical_kit || '',
    why_text: o.why_text || '',
    offer_priority: o.offer_priority || 0,
    offer_conditions: o.offer_conditions || null,
    status: 'active',
    category: meta.value,
    color: meta.color,
  };
}

export function OffersPage() {
  const isMobile = useIsMobile();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<OfferCategory | 'ALL'>('ALL');
  const [userStats, setUserStats] = useState({ totalUsers: 0, completedUsers: 0, acceptedPlans: 0 });

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const [backendOffers, stats] = await Promise.all([
        apiService.getOffers(),
        apiService.getOfferStats().catch(() => ({ totalUsers: 0, completedUsers: 0, acceptedPlans: 0 })),
      ]);
      setOffers(backendOffers.map(mapBackendToOffer));
      setUserStats(stats);
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadOffers(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteOffer(id);
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Failed to delete offer', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOfferUpdated = (updated: BackendOffer) => {
    setOffers(prev => prev.map(o => o.id === updated.id ? mapBackendToOffer(updated) : o));
    setEditingOffer(null);
  };

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || offer.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [offers, searchQuery, categoryFilter]);

  const CATEGORIES: { value: OfferCategory | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'WEIGHT_LOSS', label: 'Weight Loss' },
    { value: 'STRENGTH', label: 'Strength' },
    { value: 'WELLNESS', label: 'Wellness' },
    { value: 'YOGA', label: 'Yoga' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)] p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Offers</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Manage your onboarding offers</p>
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
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[var(--color-bg)]">
              <X className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <FilterTab key={cat.value} active={categoryFilter === cat.value} onClick={() => setCategoryFilter(cat.value as any)} label={cat.label} />
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
                <OfferCard
                  offer={offer}
                  onEdit={() => setEditingOffer(offer)}
                  onDelete={() => setDeletingId(offer.id)}
                />
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
            <button onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); }} className="mt-4 text-xs font-black uppercase tracking-widest text-black underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <NewOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={newOffer => { setOffers([newOffer, ...offers]); }}
      />

      {editingOffer && (
        <EditOfferModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onSaved={handleOfferUpdated}
        />
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deletingId && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-[200]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeletingId(null)} />
            <motion.div
              className="fixed inset-x-4 top-[30%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[360px] bg-white rounded-3xl border border-[var(--color-border)] shadow-2xl z-[201] p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--color-text-primary)]">Delete Offer</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">This will also remove it from the graph</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-black text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deletingId)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-black hover:bg-red-600 active:scale-[0.98] transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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

function OfferCard({ offer, onEdit, onDelete }: { offer: Offer; onEdit: () => void; onDelete: () => void }) {
  const colorMap: any = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm group hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-2 border", colorMap[offer.color])}>
            {offer.category.replace('_', ' ')}
          </span>
          <h3 className="font-black text-[var(--color-text-primary)] leading-tight truncate">{offer.title}</h3>
        </div>
        {offer.slug && (
          <span className="shrink-0 px-2 py-1 rounded-full text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-bg)] border border-[var(--color-border)]">
            {offer.slug}
          </span>
        )}
      </div>

      {offer.description && (
        <p className="text-xs text-[var(--color-text-muted)] mb-3 line-clamp-2">{offer.description}</p>
      )}

      <div className="flex-1 space-y-1.5 mb-4">
        {offer.digital_plan && (
          <div className="text-[10px] font-bold text-[var(--color-text-muted)]">
            <span className="uppercase tracking-wider opacity-60">Plan:</span> <span className="text-[var(--color-text-secondary)]">{offer.digital_plan}</span>
          </div>
        )}
        {offer.physical_kit && (
          <div className="text-[10px] font-bold text-[var(--color-text-muted)]">
            <span className="uppercase tracking-wider opacity-60">Kit:</span> <span className="text-[var(--color-text-secondary)]">{offer.physical_kit}</span>
          </div>
        )}
        {offer.offer_priority > 0 && (
          <div className="text-[10px] font-bold text-[var(--color-text-muted)]">
            Priority: <span className="text-[var(--color-text-secondary)]">{offer.offer_priority}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/50">
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{offer.cta_text}</span>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 rounded-xl hover:bg-[var(--color-bg)] transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
