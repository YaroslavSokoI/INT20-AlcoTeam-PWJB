import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  GitGraph, Tag, BarChart2, Eye, Upload, Save, 
  CheckCircle2, Activity, Menu, X, MoreVertical 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useFlowStore } from '@/store/flowStore';
import { PreviewModal } from '@/components/PreviewModal';
import { useIsMobile } from '@/hooks/useResponsive';

export function Topbar() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const isMobile = useIsMobile();
  const { publishVersion, isPublished, publish } = useFlowStore();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <header className="flex items-center h-14 md:h-12 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 z-[100] relative">
        <div className="flex items-center gap-2 mr-4 md:mr-6">
          <div className="w-8 h-8 md:w-7 md:h-7 rounded-lg bg-[var(--color-text-primary)] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-1.5">
            <span className="font-semibold text-sm leading-tight">BetterMe</span>
            {!isMobile && <span className="text-[10px] md:text-xs text-[var(--color-text-muted)] font-medium">Admin</span>}
          </div>
        </div>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav className="flex items-center gap-1 flex-1">
            <TopbarTab to="/" icon={<GitGraph className="w-3.5 h-3.5" />} label="Graph Editor" end />
            <TopbarTab to="/offers" icon={<Tag className="w-3.5 h-3.5" />} label="Offers" />
            <TopbarTab to="/analytics" icon={<BarChart2 className="w-3.5 h-3.5" />} label="Analytics" />
          </nav>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {!isMobile ? (
            <>
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 mr-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                  {isPublished ? `v${publishVersion}` : 'Draft'}
                </span>
              </div>
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" /><span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={publish}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-text-primary)] text-xs font-medium text-white hover:bg-[#1a1614] transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /><span className="hidden sm:inline">Publish</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors">
                <Save className="w-3.5 h-3.5" /><span className="hidden sm:inline">Save</span>
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
                <ActionButton icon={<Upload className="w-4 h-4" />} label="Publish" onClick={() => { publish(); setShowActionsMenu(false); }} primary />
                <ActionButton icon={<Save className="w-4 h-4" />} label="Save" onClick={() => setShowActionsMenu(false)} />
                <div className="h-px bg-[var(--color-border)] my-1 mx-2" />
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Version</span>
                  <span className="text-[10px] font-bold text-emerald-600">v{publishVersion}</span>
                </div>
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

function TopbarTab({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          isActive
            ? 'bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]'
        )
      }
    >
      {icon}{label}
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
