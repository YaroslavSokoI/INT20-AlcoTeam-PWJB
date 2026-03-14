import { useCallback } from 'react';
import { useReactFlow, Panel } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, LayoutDashboard, Undo2, Redo2 } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { getAutoLayout } from '@/lib/layout';
import { useIsMobile } from '@/hooks/useResponsive';
import { cn } from '@/lib/cn';

export function GraphControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { nodes, edges, setFlowNodes } = useFlowStore();
  const isMobile = useIsMobile();

  const handleAutoLayout = useCallback(() => {
    const laid = getAutoLayout(nodes, edges);
    setFlowNodes(laid);
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [nodes, edges, setFlowNodes, fitView]);

  const statsBar = (
    <div className={cn(
      "flex items-center gap-2 px-2.5 py-1 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] shadow-sm",
      isMobile ? "mt-4 ml-0" : ""
    )}>
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-bold text-[var(--color-text-primary)]">{nodes.length}</span>
        <span className="text-[9px] text-[var(--color-text-muted)] font-medium">n</span>
      </div>
      <div className="w-px h-2.5 bg-[var(--color-border)]" />
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-bold text-[var(--color-text-primary)]">{edges.length}</span>
        <span className="text-[9px] text-[var(--color-text-muted)] font-medium">e</span>
      </div>
    </div>
  );

  const controlsBar = (
    <div className={cn(
      "flex items-center bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] shadow-sm overflow-hidden",
      isMobile ? "mb-4 ml-0" : ""
    )}>
      <UndoRedoButtons />
      <div className="w-px h-3.5 bg-[var(--color-border)]" />
      <ControlButton icon={<ZoomIn className="w-3.5 h-3.5" />} title="Zoom in" onClick={() => zoomIn({ duration: 200 })} />
      <div className="w-px h-3.5 bg-[var(--color-border)]" />
      <ControlButton icon={<ZoomOut className="w-3.5 h-3.5" />} title="Zoom out" onClick={() => zoomOut({ duration: 200 })} />
      <div className="w-px h-3.5 bg-[var(--color-border)]" />
      <ControlButton icon={<Maximize2 className="w-3.5 h-3.5" />} title="Fit view" onClick={() => fitView({ padding: 0.15, duration: 300 })} />
      <div className="w-px h-3.5 bg-[var(--color-border)]" />
      <ControlButton icon={<LayoutDashboard className="w-3.5 h-3.5" />} title="Auto layout" onClick={handleAutoLayout} />
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Panel position="top-left" className="m-1">{statsBar}</Panel>
        <Panel position="bottom-left" className="m-2">{controlsBar}</Panel>
      </>
    );
  }

  return (
    <Panel position="bottom-left">
      <div className="flex flex-col gap-2 items-start mb-4">
        {statsBar}
        {controlsBar}
      </div>
    </Panel>
  );
}

function UndoRedoButtons() {
  const { past, future, undo, redo } = useFlowStore();
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <>
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className={cn(
          "p-2 transition-colors",
          canUndo
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] active:bg-[var(--color-bg)] active:scale-90"
            : "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed"
        )}
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-3.5 bg-[var(--color-border)]" />
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className={cn(
          "p-2 transition-colors",
          canRedo
            ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] active:bg-[var(--color-bg)] active:scale-90"
            : "text-[var(--color-text-muted)] opacity-30 cursor-not-allowed"
        )}
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>
      <div className="w-px h-3.5 bg-[var(--color-border)]" />
    </>
  );
}

function ControlButton({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-2 md:p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] active:bg-[var(--color-bg)] transition-colors active:scale-90"
    >
      {icon}
    </button>
  );
}
