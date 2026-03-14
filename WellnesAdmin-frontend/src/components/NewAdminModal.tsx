import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Plus, Save } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/hooks/useResponsive';
import { useAdminsStore } from '@/store/adminsStore';
import type { Admin } from '@/types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** If provided, the modal acts as an Edit form for this admin. */
  editTarget?: Admin | null;
}

export function AdminModal({ isOpen, onClose, editTarget }: AdminModalProps) {
  const isMobile = useIsMobile();
  const { addAdmin, editAdmin } = useAdminsStore();
  const isEdit = !!editTarget;

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill when editing
  useEffect(() => {
    if (editTarget) {
      setLogin(editTarget.login);
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    } else {
      setLogin('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [editTarget, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!login.trim()) e.login = 'Username is required';
    else if (login.length < 3) e.login = 'Min. 3 characters';
    // Password is optional when editing (blank = keep current)
    if (!isEdit || password) {
      if (!password) e.password = 'Password is required';
      else if (password.length < 6) e.password = 'Min. 6 characters';
      if (password !== confirmPassword) e.confirm = 'Passwords do not match';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    if (isEdit && editTarget) {
      await editAdmin(editTarget.id, login, password);
    } else {
      await addAdmin(login, password);
    }
    setIsLoading(false);
    onClose();
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1000]"
          />

          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0, y: 20 }}
            className={cn(
              "fixed bg-[var(--color-surface)] z-[1001] flex flex-col overflow-hidden shadow-2xl",
              isMobile
                ? "bottom-0 left-0 right-0 rounded-t-[32px]"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl"
            )}
          >
            {isMobile && (
              <div className="flex justify-center pt-4 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-black text-[var(--color-text-primary)]">
                  {isEdit ? 'Edit Admin' : 'New Admin'}
                </h2>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-tight mt-0.5">
                  {isEdit ? `Editing @${editTarget?.login}` : 'Create an admin account'}
                </p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-[var(--color-bg)] transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <FieldGroup label="Username" error={errors.login}>
                <InputWrapper icon={<User className="w-4 h-4" />} hasError={!!errors.login}>
                  <input
                    autoFocus
                    value={login}
                    onChange={e => { setLogin(e.target.value); setErrors(p => ({ ...p, login: '' })); }}
                    className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                    placeholder="e.g. john_doe"
                  />
                </InputWrapper>
              </FieldGroup>

              <FieldGroup label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'} error={errors.password}>
                <InputWrapper icon={<Lock className="w-4 h-4" />} hasError={!!errors.password}>
                  <input
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                    placeholder="••••••••"
                  />
                </InputWrapper>
              </FieldGroup>

              <FieldGroup label="Confirm Password" error={errors.confirm}>
                <InputWrapper icon={<Lock className="w-4 h-4" />} hasError={!!errors.confirm}>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                    className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                    placeholder="••••••••"
                  />
                </InputWrapper>
              </FieldGroup>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white text-sm font-black shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 transition-all mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isEdit ? (
                  <><Save className="w-4 h-4" /> Save Changes</>
                ) : (
                  <><Plus className="w-4 h-4" /> Create Admin</>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] ml-1">{label}</label>
      {children}
      {error && <p className="text-[11px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
}

function InputWrapper({ icon, hasError, children }: { icon: React.ReactNode; hasError?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn(
      "flex items-center gap-3 bg-[var(--color-bg)] border rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-black/5",
      hasError ? "border-red-200 bg-red-50/20" : "border-[var(--color-border)]"
    )}>
      <span className="text-[var(--color-text-muted)] shrink-0">{icon}</span>
      {children}
    </div>
  );
}
