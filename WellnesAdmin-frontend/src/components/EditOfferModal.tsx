import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import type { Offer } from '@/types';
import { apiService, type BackendOffer } from '@/services/api';

interface EditOfferModalProps {
  offer: Offer;
  onClose: () => void;
  onSaved: (updated: BackendOffer) => void;
}

export function EditOfferModal({ offer, onClose, onSaved }: EditOfferModalProps) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    title: offer.title,
    description: offer.description,
    attribute_key: offer.slug,
    digital_plan: offer.digital_plan,
    physical_kit: offer.physical_kit,
    why_text: offer.why_text,
    cta_text: offer.cta_text,
    offer_priority: offer.offer_priority,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await apiService.updateOffer(offer.id, form);
      onSaved(updated);
    } catch (err) {
      console.error('Failed to update offer', err);
      alert('Failed to update offer.');
    } finally {
      setIsSaving(false);
    }
  };

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1000]" />
      <motion.div
        initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
        className={cn(
          "fixed bg-[var(--color-surface)] z-[1001] flex flex-col overflow-hidden shadow-2xl",
          isMobile ? "bottom-0 left-0 right-0 h-[85vh] rounded-t-[32px]" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-3xl max-h-[85vh]"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">Edit Offer</h2>
            <p className="text-xs font-bold text-[var(--color-text-muted)] mt-0.5 truncate max-w-[250px]">{offer.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-bg)] transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Field label="Title">
            <input value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} placeholder="Offer title" />
          </Field>

          <Field label="Slug (attribute key)">
            <input value={form.attribute_key} onChange={e => update('attribute_key', e.target.value)} className={inputClass} placeholder="e.g. weight-loss-starter" />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} className={cn(inputClass, 'resize-none')} placeholder="Short description..." />
          </Field>

          <Field label="Digital Plan">
            <input value={form.digital_plan} onChange={e => update('digital_plan', e.target.value)} className={inputClass} placeholder="e.g. 4-week home workout program" />
          </Field>

          <Field label="Physical Wellness Kit">
            <input value={form.physical_kit} onChange={e => update('physical_kit', e.target.value)} className={inputClass} placeholder="e.g. Resistance bands, shaker bottle" />
          </Field>

          <Field label="Why Text">
            <textarea value={form.why_text} onChange={e => update('why_text', e.target.value)} rows={2} className={cn(inputClass, 'resize-none')} placeholder="Why this offer is right for you..." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="CTA Text">
              <input value={form.cta_text} onChange={e => update('cta_text', e.target.value)} className={inputClass} placeholder="Start My Journey" />
            </Field>
            <Field label="Priority">
              <input type="number" value={form.offer_priority} onChange={e => update('offer_priority', parseInt(e.target.value) || 0)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-gray-50/50 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving || !form.title}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white text-sm font-black shadow-xl shadow-black/10 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

const inputClass = "w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">{label}</label>
      {children}
    </div>
  );
}
