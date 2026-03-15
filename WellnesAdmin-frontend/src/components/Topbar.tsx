import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  GitGraph, Tag, BarChart2, Eye, Upload,
  CheckCircle2, Menu, X, MoreVertical, Users2,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import logo from '@/assets/logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useFlowStore } from '@/store/flowStore';
import { useAuthStore } from '@/store/authStore';
import { PreviewModal } from '@/components/PreviewModal';
import { useIsMobile } from '@/hooks/useResponsive';
import { LogOut } from 'lucide-react';

type ToastState = { type: 'success' | 'error'; message: string } | null;

const NAV_TABS: { to: string; icon: React.ReactNode; label: string; end?: boolean }[] = [
  { to: '/', icon: <GitGraph className="w-3.5 h-3.5" />, label: 'Graph Editor', end: true },
  { to: '/offers', icon: <Tag className="w-3.5 h-3.5" />, label: 'Offers' },
  { to: '/analytics', icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Analytics' },
  { to: '/admins', icon: <Users2 className="w-3.5 h-3.5" />, label: 'Admins' },
];

export function Topbar() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const isMobile = useIsMobile();
  const { publishVersion, isPublished, publish } = useFlowStore();
  const { user, logout } = useAuthStore();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePublishConfirm = async () => {
    setConfirmOpen(false);
    setIsPublishing(true);
    try {
      await publish();
      showToast('success', 'Published successfully! Live quiz updated.');
    } catch {
      showToast('error', 'Publish failed. Check console for details.');
    } finally {
      setIsPublishing(false);
    }
  };

  const openConfirm = () => {
    setShowActionsMenu(false);
    setConfirmOpen(true);
  };

  return (
    <>
      <header className="flex items-center h-14 md:h-12 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 z-[100] relative">
        <div className="flex items-center gap-2 mr-4 md:mr-6">
          <img src={logo} alt="Wellness" className="h-9 w-auto md:h-11" />
        </div>

        {!isMobile && (
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV_TABS.map(tab => (
              <TopbarTab key={tab.to} to={tab.to} icon={tab.icon} label={tab.label} end={tab.end} />
            ))}
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {!isMobile ? (
            <>
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={openConfirm}
                disabled={isPublishing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-text-primary)] text-xs font-medium text-white hover:bg-[#1a1614] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isPublishing ? 'Publishing…' : 'Publish'}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-xs font-black text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPreviewOpen(true)}
                className="p-2 rounded-lg text-[var(--color-text-secondary)] active:bg-[var(--color-bg)]"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 rounded-lg text-[var(--color-text-secondary)] active:bg-[var(--color-bg)]"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="p-2 ml-1 rounded-lg text-[var(--color-text-primary)] active:bg-[var(--color-bg)]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Overflow Actions Menu */}
        <AnimatePresence>
          {showActionsMenu && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowActionsMenu(false)}
                className="fixed inset-0 bg-black/10 z-[110]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-14 right-4 w-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-[120] overflow-hidden py-1"
              >
                <ActionButton icon={<Upload className="w-4 h-4" />} label="Publish" onClick={openConfirm} primary />
                <ActionButton icon={<LogOut className="w-4 h-4" />} label="Logout" onClick={() => { logout(); setShowActionsMenu(false); }} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Nav Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && isMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute top-14 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] z-[90] overflow-hidden shadow-xl"
            >
              <div className="p-4 space-y-1">
                <MobileTab to="/" icon={<GitGraph className="w-5 h-5" />} label="Graph Editor" onClick={() => setMobileMenuOpen(false)} end />
                <MobileTab to="/offers" icon={<Tag className="w-5 h-5" />} label="Offers" onClick={() => setMobileMenuOpen(false)} />
                <MobileTab to="/analytics" icon={<BarChart2 className="w-5 h-5" />} label="Analytics" onClick={() => setMobileMenuOpen(false)} />
                <MobileTab to="/admins" icon={<Users2 className="w-5 h-5" />} label="Admins" onClick={() => setMobileMenuOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Publish Confirm Dialog ─────────────────────────── */}
      <AnimatePresence>
        {confirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200]"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[calc(100vw-2rem)] max-w-sm bg-[var(--color-surface)] rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--color-text-primary)]">Publish to production?</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                    This will overwrite the live quiz with the current draft. All active sessions will continue unaffected.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-black text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-black text-white text-xs font-black hover:bg-[#1a1614] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Publish Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ─────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className={cn(
              'fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold whitespace-nowrap',
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            )}
          >
            {toast.type === 'success'
              ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            }
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

function TopbarTab({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      end={end}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors z-0"
      style={{ color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
    >
      {isActive && (
        <motion.span
          layoutId="topbar-pill"
          className="absolute inset-0 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm"
          style={{ zIndex: -1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon}{label}
      </span>
    </NavLink>
  );
}

function MobileTab({ to, icon, label, end, onClick }: { to: string; icon: React.ReactNode; label: string; end?: boolean; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 p-4 rounded-xl text-sm font-semibold transition-colors',
          isActive
            ? 'bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
            : 'text-[var(--color-text-secondary)] active:bg-[var(--color-bg)]'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function ActionButton({ icon, label, onClick, primary }: { icon: React.ReactNode; label: string; onClick: () => void, primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-left transition-colors",
        primary ? "bg-black text-white" : "text-[var(--color-text-secondary)] active:bg-[var(--color-bg)]"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
