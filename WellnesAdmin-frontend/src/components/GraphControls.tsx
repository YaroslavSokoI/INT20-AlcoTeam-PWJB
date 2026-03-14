import { useCallback } from 'react';
import { useReactFlow, Panel } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, LayoutDashboard } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { getAutoLayout } from '@/lib/layout';

export function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { nodes, edges, setFlowNodes, publishVersion } = useFlowStore();

  const handleAutoLayout = useCallback(() => {
    const laid = getAutoLayout(nodes, edges);
    setFlowNodes(laid);
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [nodes, edges, setFlowNodes, fitView]);

  return (
    <Panel position="bottom-left">
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">{nodes.length}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">nodes</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-border)]" />
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">{edges.length}</span>
          <span className="text-[10px] text-[var(--color-text-muted)]">edges</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-border)]" />
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">v{publishVersion}</span>
        </div>
      </div>
      <div className="flex flex-col bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {[
          { icon: <ZoomIn className="w-4 h-4" />, title: 'Zoom in',   action: () => zoomIn({ duration: 200 }) },
          { icon: <ZoomOut className="w-4 h-4" />, title: 'Zoom out',  action: () => zoomOut({ duration: 200 }) },
          { icon: <Maximize2 className="w-4 h-4" />, title: 'Fit view', action: () => fitView({ padding: 0.15, duration: 300 }) },
          { icon: <LayoutDashboard className="w-4 h-4" />, title: 'Auto layout', action: handleAutoLayout },
        ].map(b => (
          <button key={b.title} onClick={b.action} title={b.title}
            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors border-b border-[var(--color-border)] last:border-b-0"
          >{b.icon}</button>
        ))}
      </div>
    </Panel>
  );
}
