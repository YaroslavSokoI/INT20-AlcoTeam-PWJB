import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Tag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import { getCategoryMeta } from '@/types';
import type { Offer } from '@/types';
import { apiService } from '@/services/api';

interface NewOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (offer: Offer) => void;
}

export function NewOfferModal({ isOpen, onClose, onAdd }: NewOfferModalProps) {
  const isMobile = useIsMobile();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const created = await apiService.createOffer({
        title,
        attribute_key: slug,
        description,
        offer_priority: 0,
      });

      const meta = getCategoryMeta(slug);
      const newOffer: Offer = {
        id: created.id,
        title: created.title,
        description: created.description || '',
        slug: created.attribute_key || '',
        cta_text: created.cta_text || 'Start My Journey',
        digital_plan: created.digital_plan || '',
        physical_kit: created.physical_kit || '',
        why_text: created.why_text || '',
        offer_priority: created.offer_priority || 0,
        offer_conditions: created.offer_conditions || null,
        status: 'active',
        category: meta.value,
        color: meta.color,
      };

      onAdd(newOffer);
      setTitle('');
      setDescription('');
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1000]" />
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "fixed bg-[var(--color-surface)] z-[1001] flex flex-col overflow-hidden shadow-2xl",
              isMobile ? "bottom-0 left-0 right-0 h-[70vh] rounded-t-[32px]" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl"
            )}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">New Offer</h2>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-tight mt-0.5">Creates an offer node in the graph</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-bg)] transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Offer Title</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    autoFocus
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    placeholder="e.g. Weight Loss Starter"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all resize-none"
                  placeholder="Short description..."
                />
              </div>
            </form>

            <div className="p-6 border-t border-[var(--color-border)] bg-gray-50/50">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white text-sm font-black shadow-xl shadow-black/10 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                <Plus className="w-5 h-5" />
                {isSubmitting ? 'Creating...' : 'Create Offer'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
