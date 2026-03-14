import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, Info, Tag, GitBranch, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NODE_TYPE_META } from '@/types';
import type { NodeType, FlowNodeData } from '@/types';

export function shortId(id: string): string {
  const last = id.split('-').pop() ?? id;
  const stripped = last.replace(/^0+/, '');
  return stripped || id.replace(/-/g, '').slice(0, 8);
}

interface NodeCardProps {
  id: string;
  data: FlowNodeData;
  selected?: boolean;
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  question:    <HelpCircle className="w-3 h-3" />,
  info:        <Info className="w-3 h-3" />,
  offer:       <Tag className="w-3 h-3" />,
  conditional: <GitBranch className="w-3 h-3" />,
  delay:       <Clock className="w-3 h-3" />,
};

function NodeBadge({ type }: { type: NodeType }) {
  const meta = NODE_TYPE_META[type];
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: meta.bgColor, color: meta.color }}
    >
      {NODE_ICONS[type]}{meta.label}
    </div>
  );
}

// ─── Question ─────────────────────────────────────────────────────────────

export const QuestionNode = memo(({ id, data, selected }: NodeCardProps) => (
  <div className={cn('bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] w-[240px]', selected && 'shadow-[var(--shadow-card-hover)]')}>
    <Handle type="target" position={Position.Left} id="target" className="!left-[-6px]" />
    <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]">
      <div className="flex items-center gap-1.5">
        <NodeBadge type="question" />
        {data.badge && <span className="text-[9px] font-semibold text-orange-500 uppercase tracking-wider">{data.badge}</span>}
      </div>
      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">#{shortId(id)}</span>
    </div>
    <div className="px-3 py-2.5">
      <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2 leading-snug">{data.questionText || data.label}</p>
      {data.options && (
        <div className="flex flex-col gap-1">
          {data.options.slice(0, 5).map(opt => (
            <div key={opt.id} className="flex items-center gap-1.5 group">
              <span className="text-[var(--color-text-muted)] text-[10px]">◆</span>
              <span className="text-[11px] text-[var(--color-text-secondary)] flex-1 truncate">{opt.label}</span>
              <Handle type="source" position={Position.Right} id={opt.value}
                style={{ position: 'relative', right: 'auto', top: 'auto', transform: 'none', display: 'inline-flex' }}
                className="!relative !right-auto !top-auto !transform-none w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
          {(data.options.length) > 5 && <span className="text-[10px] text-[var(--color-text-muted)]">+{data.options.length - 5} more</span>}
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Right} id="source" className="!right-[-6px]" />
  </div>
));
QuestionNode.displayName = 'QuestionNode';

// ─── Info ─────────────────────────────────────────────────────────────────

export const InfoNode = memo(({ id, data, selected }: NodeCardProps) => (
  <div className={cn('bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] w-[240px]', selected && 'shadow-[var(--shadow-card-hover)]')}>
    <Handle type="target" position={Position.Left} id="target" className="!left-[-6px]" />
    <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]">
      <NodeBadge type="info" />
      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">#{shortId(id)}</span>
    </div>
    <div className="px-3 py-2.5">
      <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">{data.label}</p>
      {data.content && <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-3">{data.content}</p>}
    </div>
    <Handle type="source" position={Position.Right} id="source" className="!right-[-6px]" />
  </div>
));
InfoNode.displayName = 'InfoNode';

// ─── Offer ────────────────────────────────────────────────────────────────

export const OfferNode = memo(({ id, data, selected }: NodeCardProps) => {
  const meta = NODE_TYPE_META['offer'];
  return (
    <div className={cn('bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] w-[240px]', selected && 'shadow-[var(--shadow-card-hover)]')}>
      <Handle type="target" position={Position.Left} id="target" className="!left-[-6px]" />
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]">
        <NodeBadge type="offer" />
        <span className="text-[10px] text-[var(--color-text-muted)] font-mono">#{shortId(id)}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">{data.offerTitle || data.label}</p>
        {data.offerDescription && <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">{data.offerDescription}</p>}
        {data.ctaText && (
          <div className="text-[10px] font-semibold px-2 py-1 rounded-md text-center" style={{ backgroundColor: meta.bgColor, color: meta.color }}>
            {data.ctaText}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="source" className="!right-[-6px]" />
    </div>
  );
});
OfferNode.displayName = 'OfferNode';

// ─── Conditional ──────────────────────────────────────────────────────────

export const ConditionalNode = memo(({ id, data, selected }: NodeCardProps) => (
  <div className={cn('bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] w-[220px]', selected && 'shadow-[var(--shadow-card-hover)]')}>
    <Handle type="target" position={Position.Left} id="target" className="!left-[-6px]" />
    <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]">
      <NodeBadge type="conditional" />
      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">#{shortId(id)}</span>
    </div>
    <div className="px-3 py-2.5">
      <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">{data.label}</p>
      <div className="text-[10px] text-[var(--color-text-muted)] font-mono bg-[var(--color-bg)] rounded px-2 py-1">
        {data.label}
      </div>
    </div>
    <Handle type="source" position={Position.Right} id="true"  style={{ top: '35%' }} className="!right-[-6px]" />
    <Handle type="source" position={Position.Right} id="false" style={{ top: '65%' }} className="!right-[-6px]" />
  </div>
));
ConditionalNode.displayName = 'ConditionalNode';

// ─── Delay ────────────────────────────────────────────────────────────────

export const DelayNode = memo(({ id, data, selected }: NodeCardProps) => (
  <div className={cn('bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] w-[200px]', selected && 'shadow-[var(--shadow-card-hover)]')}>
    <Handle type="target" position={Position.Left} id="target" className="!left-[-6px]" />
    <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]">
      <NodeBadge type="delay" />
      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">#{shortId(id)}</span>
    </div>
    <div className="px-3 py-2.5">
      <p className="text-xs font-semibold text-[var(--color-text-primary)]">{data.label}</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{data.delaySeconds ?? 0}s delay</p>
    </div>
    <Handle type="source" position={Position.Right} id="source" className="!right-[-6px]" />
  </div>
));
DelayNode.displayName = 'DelayNode';
