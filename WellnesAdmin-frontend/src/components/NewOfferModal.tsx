import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Tag, DollarSign, Briefcase, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import { OFFER_CATEGORIES, OFFER_STATUSES } from '@/types';
import type { Offer, OfferCategory, OfferStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface NewOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (offer: Offer) => void;
}

export function NewOfferModal({ isOpen, onClose, onAdd }: NewOfferModalProps) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<Partial<Offer>>({
    title: '',
    category: 'WEIGHT_LOSS',
    status: 'draft',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || isSubmitting) return;

    const categoryMeta = OFFER_CATEGORIES.find(c => c.value === formData.category);
    setIsSubmitting(true);

    try {
      // Import apiService locally or at top level. For simple copy/paste without importing at top level:
      const { apiService } = await import('@/services/api');

      const created = await apiService.createOffer({
        name: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: '', // Fallback
        priority: 0,
        is_addon: false,
      });

      const newOffer: Offer = {
        id: created.id,
        title: created.name,
        category: formData.category as OfferCategory,
        status: formData.status as OfferStatus,
        conversion: '0%',
        users: '0',
        color: categoryMeta?.color || 'orange',
      };

      onAdd(newOffer);
      setFormData({ title: '', category: 'WEIGHT_LOSS', status: 'draft' });
      onClose();
    } catch (error) {
      console.error('Failed to create offer:', error);
      alert('Failed to create offer. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1000]"
          />

          {/* Modal / Drawer */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "fixed bg-[var(--color-surface)] z-[1001] flex flex-col overflow-hidden shadow-2xl",
              isMobile
                ? "bottom-0 left-0 right-0 h-[80vh] rounded-t-[32px]"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">New Offer</h2>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-tight mt-0.5">Define your next promotion</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-bg)] transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Offer Title</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    autoFocus
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="e.g. 30-Day Summer Shred"
                  />
                </div>
              </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as OfferStatus })}
                    className="w-full bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat transition-all"
                  >
                    {OFFER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {OFFER_CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c.value })}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-2xl border text-left transition-all",
                        formData.category === c.value
                          ? "bg-black text-white border-black shadow-lg shadow-black/10"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-black/20"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full", formData.category === c.value ? "bg-white" : "", c.color === 'orange' ? "bg-orange-400" : c.color === 'emerald' ? "bg-emerald-400" : c.color === 'purple' ? "bg-purple-400" : "bg-blue-400")} />
                      <span className="text-xs font-bold">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--color-border)] bg-gray-50/50">
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white text-sm font-black shadow-xl shadow-black/10 active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Offer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
