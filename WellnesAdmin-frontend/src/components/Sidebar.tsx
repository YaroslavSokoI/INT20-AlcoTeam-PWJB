import { useCallback } from 'react';
import { Plus, HelpCircle, Info, Tag, CheckSquare, GitBranch, Clock, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFlowStore } from '@/store/flowStore';
import { NODE_TYPE_META } from '@/types';
import type { NodeType, FlowNode } from '@/types';
import { useIsMobile } from '@/hooks/useResponsive';

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  question:    <HelpCircle className="w-4 h-4" />,
  info:        <Info className="w-4 h-4" />,
  offer:       <Tag className="w-4 h-4" />,
  result:      <CheckSquare className="w-4 h-4" />,
  conditional: <GitBranch className="w-4 h-4" />,
  delay:       <Clock className="w-4 h-4" />,
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { nodes, addNode, setSelectedNodeId, selectedNodeId } = useFlowStore();
  const isMobile = useIsMobile();

  const handleDragStart = useCallback((e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const nodeTypes: NodeType[] = ['question', 'info', 'offer', 'result', 'conditional', 'delay'];

  return (
    <aside className={cn(
      "w-[220px] md:w-[240px] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col overflow-hidden shrink-0 h-full",
      isMobile && "w-full border-r-0"
    )}>
      <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-1">Add Node</p>
        {isMobile && onClose && (
          <button 
            onClick={onClose}
            className="p-1 px-2 flex items-center gap-1 rounded-lg text-[var(--color-text-secondary)] text-[10px] font-bold bg-[var(--color-bg)]"
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        )}
      </div>
      
      <div className="p-3 border-b border-[var(--color-border)]">
        <div className="grid grid-cols-1 gap-1">
          {nodeTypes.map(type => {
            const meta = NODE_TYPE_META[type];
            return (
              <div
                key={type}
                draggable={!isMobile}
                onDragStart={e => handleDragStart(e, type)}
                onClick={() => {
                  if (isMobile) {
                    addNode(type);
                    onClose?.();
                  }
                }}
                onDoubleClick={() => {
                  if (!isMobile) addNode(type);
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[var(--color-bg)] transition-colors group active:scale-[0.98]"
                title={isMobile ? `Tap to add ${meta.label}` : `Drag or double-click to add ${meta.label}`}
              >
                <div
                  className="w-8 h-8 md:w-7 md:h-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm"
                  style={{ backgroundColor: meta.bgColor, color: meta.color }}
                >
                  {NODE_ICONS[type]}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[var(--color-text-primary)] leading-tight">{meta.label}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] leading-tight truncate">{meta.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 bg-[var(--color-surface-2)]/50">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-3 px-1">
          Nodes ({nodes.length})
        </p>
        <div className="flex flex-col gap-1">
          {nodes.map(node => (
            <NodeListItem
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={() => {
                setSelectedNodeId(node.id);
                if (isMobile) onClose?.();
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function NodeListItem({ node, isSelected, onSelect }: { node: FlowNode; isSelected: boolean; onSelect: () => void }) {
  const meta = NODE_TYPE_META[node.data.nodeType];

  const getSubtext = () => {
    if (node.data.nodeType === 'question') return `${node.data.options?.length ?? 0} options`;
    if (node.data.nodeType === 'info') return 'info page';
    if (node.data.nodeType === 'offer') return 'offer';
    if (node.data.nodeType === 'result') return 'result';
    if (node.data.nodeType === 'conditional') return 'branch';
    return `${node.data.delaySeconds ?? 0}s delay`;
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all active:scale-[0.98]',
        isSelected 
          ? 'bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm translate-x-0.5' 
          : 'hover:bg-[var(--color-bg)]/50 border border-transparent'
      )}
    >
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
        style={{ backgroundColor: meta.bgColor, color: meta.color }}
      >
        <span style={{ transform: 'scale(0.8)', display: 'flex' }}>{NODE_ICONS[node.data.nodeType]}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-[var(--color-text-primary)] leading-tight truncate">{node.data.label}</span>
        <span className="text-[10px] text-[var(--color-text-muted)] font-medium leading-tight">{getSubtext()}</span>
      </div>
    </button>
  );
}
