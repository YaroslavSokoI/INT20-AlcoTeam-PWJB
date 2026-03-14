import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ open, title, description, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200]"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[calc(100vw-2rem)] max-w-sm bg-[var(--color-surface)] rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--color-text-primary)]">{title}</h3>
                {description && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-black text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
