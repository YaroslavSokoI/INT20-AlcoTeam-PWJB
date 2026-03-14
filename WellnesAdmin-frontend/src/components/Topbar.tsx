import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GitGraph, Tag, BarChart2, Eye, Upload, Save, CheckCircle2, Activity } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFlowStore } from '@/store/flowStore';
import { PreviewModal } from '@/components/PreviewModal';

export function Topbar() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { publishVersion, isPublished, publish } = useFlowStore();

  return (
    <>
      <header className="flex items-center h-12 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 z-50">
        <div className="flex items-center gap-2 mr-6">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-text-primary)] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-[var(--color-text-primary)]">BetterMe</span>
          <span className="text-xs text-[var(--color-text-muted)] font-medium">Admin</span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          <TopbarTab to="/" icon={<GitGraph className="w-3.5 h-3.5" />} label="Graph Editor" end />
          <TopbarTab to="/offers" icon={<Tag className="w-3.5 h-3.5" />} label="Offers" />
          <TopbarTab to="/analytics" icon={<BarChart2 className="w-3.5 h-3.5" />} label="Analytics" />
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              {isPublished ? `Published v${publishVersion}` : 'Unpublished'}
            </span>
          </div>
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />Preview
          </button>
          <button
            onClick={publish}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-text-primary)] text-xs font-medium text-white hover:bg-[#1a1614] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />Publish
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors">
            <Save className="w-3.5 h-3.5" />Save
          </button>
        </div>
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
