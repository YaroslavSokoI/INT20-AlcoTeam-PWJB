import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Save, ChevronRight, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/cn';
import { useFlowStore, selectSelectedNode } from '@/store/flowStore';
import { NODE_TYPE_META } from '@/types';
import type { AnswerOption, FlowNodeData, NodeType, TransitionRule } from '@/types';
import { useIsMobile } from '@/hooks/useResponsive';

export function InspectorPanel() {
  const selectedNode = useFlowStore(selectSelectedNode);
  const { setSelectedNodeId } = useFlowStore();
  const isMobile = useIsMobile();

  // Prevent scrolling App when inspector is open on mobile
  useEffect(() => {
    if (isMobile && selectedNode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, selectedNode]);

  return (
    <AnimatePresence>
      {selectedNode && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNodeId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[150]"
            />
          )}
          
          <motion.aside
            key="inspector"
            initial={isMobile ? { y: '100%' } : { x: 320, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { x: 320, opacity: 0 }}
            transition={isMobile 
              ? { type: 'spring', damping: 30, stiffness: 300 }
              : { type: 'spring', stiffness: 400, damping: 40 }
            }
            className={cn(
              "bg-[var(--color-surface)] flex flex-col overflow-hidden",
              isMobile 
                ? "fixed bottom-0 left-0 right-0 h-[85vh] z-[160] rounded-t-[32px] shadow-2xl"
                : "w-[320px] shrink-0 border-l border-[var(--color-border)]"
            )}
          >
            {isMobile && (
              <div className="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-1 shrink-0" />
            )}
            
            <InspectorContent
              key={selectedNode.id}
              nodeId={selectedNode.id}
              initialData={selectedNode.data}
              onClose={() => setSelectedNodeId(null)}
              isMobile={isMobile}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface InspectorContentProps {
  nodeId: string;
  initialData: FlowNodeData;
  onClose: () => void;
  isMobile?: boolean;
}

function InspectorContent({ nodeId, initialData, onClose, isMobile }: InspectorContentProps) {
  const [data, setData] = useState<FlowNodeData>({ ...initialData });
  const { updateNodeData, deleteNode, nodes } = useFlowStore();

  const update = (patch: Partial<FlowNodeData>) => setData(d => ({ ...d, ...patch }));

  const handleSave = useCallback(() => {
    updateNodeData(nodeId, data);
    if (isMobile) onClose();
  }, [nodeId, data, updateNodeData, isMobile, onClose]);

  const handleDelete = useCallback(() => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(nodeId);
      onClose();
    }
  }, [nodeId, deleteNode, onClose]);

  const addOption = () => {
    const opts = data.options ?? [];
    update({ options: [...opts, { id: uuidv4(), label: `Option ${opts.length + 1}`, value: `option_${opts.length + 1}` }] });
  };

  const updateOption = (id: string, label: string) => {
    update({ options: (data.options ?? []).map(o => o.id === id ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, '_') } : o) });
  };

  const removeOption = (id: string) => {
    update({ options: (data.options ?? []).filter(o => o.id !== id) });
  };

  const addRule = () => {
    const rules = data.transitions ?? [];
    update({ transitions: [...rules, { id: uuidv4(), answerValue: '', targetNodeId: '' }] });
  };

  const updateRule = (id: string, patch: Partial<TransitionRule>) => {
    update({ transitions: (data.transitions ?? []).map(r => r.id === id ? { ...r, ...patch } : r) });
  };

  const removeRule = (id: string) => {
    update({ transitions: (data.transitions ?? []).filter(r => r.id !== id) });
  };

  const meta = NODE_TYPE_META[data.nodeType];
  const otherNodes = nodes.filter(n => n.id !== nodeId);

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-4 pb-4 md:pt-3.5 md:pb-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div>
          <span className="text-[10px] md:text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Edit Node</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-xs font-bold font-mono tracking-tight">{nodeId}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 md:w-6 md:h-6 rounded-xl md:rounded-md hover:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors active:scale-90"
        >
          <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-4 space-y-6 md:space-y-5 pb-32 md:pb-5">
        <Section label="Node Type">
          <div className="flex gap-1.5 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
            {(['question', 'info', 'offer'] as NodeType[]).map(t => (
              <button
                key={t}
                onClick={() => update({ nodeType: t })}
                className={cn(
                  'flex-1 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all capitalize',
                  data.nodeType === t
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-black'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        {data.nodeType === 'question' && (
          <>
            <Section label="Question Text">
              <textarea
                value={data.questionText ?? ''}
                onChange={e => update({ questionText: e.target.value, label: e.target.value })}
                rows={isMobile ? 3 : 2}
                className="w-full text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 md:px-3 md:py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)] focus:border-[var(--color-text-primary)] resize-none transition-all"
                placeholder="Enter your question..."
              />
            </Section>

            <Section label="Answer Type">
              <div className="flex gap-2 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] overflow-x-auto">
                {(['single', 'multi', 'input'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ answerType: t })}
                    className={cn(
                      'flex-1 min-w-[60px] py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize',
                      data.answerType === t
                        ? 'bg-white text-black shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:text-black'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Section>

            {data.answerType !== 'input' && (
              <Section label="Answer Options">
                <div className="space-y-2">
                  {(data.options ?? []).map((opt, i) => (
                    <OptionRow
                      key={opt.id}
                      option={opt}
                      index={i}
                      onChange={label => updateOption(opt.id, label)}
                      onRemove={() => removeOption(opt.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={addOption}
                  className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[var(--color-border-2)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add option
                </button>
              </Section>
            )}
          </>
        )}

        {data.nodeType === 'info' && (
          <>
            <Section label="Page Title">
              <input
                value={data.label}
                onChange={e => update({ label: e.target.value })}
                className="w-full text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 md:px-3 md:py-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)]"
                placeholder="Title..."
              />
            </Section>
            <Section label="Content">
              <textarea
                value={data.content ?? ''}
                onChange={e => update({ content: e.target.value })}
                rows={isMobile ? 5 : 4}
                className="w-full text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 md:px-3 md:py-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)] resize-none"
                placeholder="Content..."
              />
            </Section>
          </>
        )}

        {data.nodeType === 'offer' && (
          <div className="space-y-4">
            <Section label="Offer Title">
              <input
                value={data.offerTitle ?? ''}
                onChange={e => update({ offerTitle: e.target.value, label: e.target.value })}
                className="w-full font-bold text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 focus:outline-none"
                placeholder="Offer headline..."
              />
            </Section>
            <Section label="Description">
              <textarea
                value={data.offerDescription ?? ''}
                onChange={e => update({ offerDescription: e.target.value })}
                rows={3}
                className="w-full text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 focus:outline-none"
                placeholder="Description..."
              />
            </Section>
            <Section label="CTA Button Text">
              <input
                value={data.ctaText ?? ''}
                onChange={e => update({ ctaText: e.target.value })}
                className="w-full font-bold text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 focus:outline-none"
                placeholder="Get My Plan"
              />
            </Section>
          </div>
        )}

        <Section label="Transition Rules">
          <div className="space-y-3">
            {(data.transitions ?? []).map(rule => (
              <RuleRow
                key={rule.id}
                rule={rule}
                options={data.options ?? []}
                nodes={otherNodes}
                onChange={patch => updateRule(rule.id, patch)}
                onRemove={() => removeRule(rule.id)}
              />
            ))}
          </div>
          <button
            onClick={addRule}
            className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[var(--color-border-2)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add rule
          </button>
        </Section>
      </div>

      <div className={cn(
        "flex items-center gap-3 px-6 pb-12 pt-4 md:px-4 md:py-3 md:pb-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] z-10",
        isMobile ? "fixed bottom-0 left-0 right-0" : ""
      )}>
        <button
          onClick={handleDelete}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors border border-red-100"
        >
          <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
          <span className="sm:inline">Delete</span>
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] md:flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-xs font-bold bg-[var(--color-text-primary)] text-white hover:bg-[#1a1614] active:scale-[0.98] transition-all shadow-lg md:shadow-none"
        >
          <Save className="w-4 h-4 md:w-3.5 md:h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] md:text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-2.5 px-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function OptionRow({ option, index, onChange, onRemove }: { option: AnswerOption; index: number; onChange: (label: string) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="text-[10px] font-bold text-[var(--color-text-muted)] w-4 text-center">{index + 1}</div>
      <input
        value={option.label}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-sm md:text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 md:px-3 md:py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-primary)] transition-all"
      />
      <button onClick={onRemove} className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors shrink-0">
        <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
      </button>
    </div>
  );
}

function RuleRow({ rule, options, nodes, onChange, onRemove }: { rule: TransitionRule; options: AnswerOption[]; nodes: Array<{ id: string; data: FlowNodeData }>; onChange: (patch: Partial<TransitionRule>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 md:p-3 space-y-3 md:space-y-2 relative group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Condition</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-500 active:scale-90"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--color-text-muted)] ml-1">IF ANSWER IS</label>
        <div className="relative">
          <select
            value={rule.answerValue}
            onChange={e => onChange({ answerValue: e.target.value })}
            className="w-full text-xs font-bold appearance-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none pr-10"
          >
            <option value="">— Any Answer —</option>
            {options.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--color-text-muted)] ml-1">GOTO NODE</label>
        <div className="relative">
          <select
            value={rule.targetNodeId}
            onChange={e => onChange({ targetNodeId: e.target.value })}
            className="w-full text-xs font-bold appearance-none rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-[var(--color-text-primary)] focus:outline-none pr-10"
          >
            <option value="">— End of Flow —</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.data.label} ({n.id})</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
