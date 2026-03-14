import { useCallback } from 'react';
import { Plus, HelpCircle, Info, Tag, CheckSquare, GitBranch, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFlowStore } from '@/store/flowStore';
import { NODE_TYPE_META } from '@/types';
import type { NodeType, FlowNode } from '@/types';

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  question:    <HelpCircle className="w-4 h-4" />,
  info:        <Info className="w-4 h-4" />,
  offer:       <Tag className="w-4 h-4" />,
  result:      <CheckSquare className="w-4 h-4" />,
  conditional: <GitBranch className="w-4 h-4" />,
  delay:       <Clock className="w-4 h-4" />,
};

export function Sidebar() {
  const { nodes, addNode, setSelectedNodeId, selectedNodeId } = useFlowStore();

  const handleDragStart = useCallback((e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const nodeTypes: NodeType[] = ['question', 'info', 'offer', 'result', 'conditional', 'delay'];

  return (
    <aside className="w-[220px] bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col overflow-hidden shrink-0">
      <div className="p-3 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">Add Node</p>
        <div className="flex flex-col gap-1">
          {nodeTypes.map(type => {
            const meta = NODE_TYPE_META[type];
            return (
              <div
                key={type}
                draggable
                onDragStart={e => handleDragStart(e, type)}
                onDoubleClick={() => addNode(type)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[var(--color-bg)] transition-colors group"
                title={`Drag or double-click to add ${meta.label}`}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: meta.bgColor, color: meta.color }}
                >
                  {NODE_ICONS[type]}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-[var(--color-text-primary)] leading-tight">{meta.label}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] leading-tight truncate">{meta.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 px-1">
          Nodes ({nodes.length})
        </p>
        <div className="flex flex-col gap-0.5">
          {nodes.map(node => (
            <NodeListItem
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={() => setSelectedNodeId(node.id)}
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
    if (node.data.nodeType === 'question') return `${node.data.options?.length ?? 0} options · ${node.data.answerType}`;
    if (node.data.nodeType === 'info') return 'info page';
    if (node.data.nodeType === 'offer') return 'offer';
    if (node.data.nodeType === 'result') return 'result page';
    if (node.data.nodeType === 'conditional') return 'branch logic';
    return `${node.data.delaySeconds ?? 0}s delay`;
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-colors',
        isSelected ? 'bg-[var(--color-bg)] border border-[var(--color-border)]' : 'hover:bg-[var(--color-bg)]'
      )}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: meta.bgColor, color: meta.color }}
      >
        <span style={{ transform: 'scale(0.75)', display: 'flex' }}>{NODE_ICONS[node.data.nodeType]}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-[var(--color-text-primary)] leading-tight truncate">{node.data.label}</span>
        <span className="text-[10px] text-[var(--color-text-muted)] leading-tight">{getSubtext()}</span>
      </div>
    </button>
  );
}
