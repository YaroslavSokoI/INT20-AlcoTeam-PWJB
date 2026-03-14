import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Save, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/cn';
import { useFlowStore, selectSelectedNode } from '@/store/flowStore';
import { NODE_TYPE_META } from '@/types';
import type { AnswerOption, FlowNodeData, NodeType, TransitionRule } from '@/types';

export function InspectorPanel() {
  const selectedNode = useFlowStore(selectSelectedNode);
  const { setSelectedNodeId } = useFlowStore();

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.aside
          key="inspector"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="w-[300px] shrink-0 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col overflow-hidden"
        >
          <InspectorContent
            key={selectedNode.id}
            nodeId={selectedNode.id}
            initialData={selectedNode.data}
            onClose={() => setSelectedNodeId(null)}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

interface InspectorContentProps {
  nodeId: string;
  initialData: FlowNodeData;
  onClose: () => void;
}

function InspectorContent({ nodeId, initialData, onClose }: InspectorContentProps) {
  const [data, setData] = useState<FlowNodeData>({ ...initialData });
  const { updateNodeData, deleteNode, nodes } = useFlowStore();

  const update = (patch: Partial<FlowNodeData>) => setData(d => ({ ...d, ...patch }));

  const handleSave = useCallback(() => {
    updateNodeData(nodeId, data);
  }, [nodeId, data, updateNodeData]);

  const handleDelete = useCallback(() => {
    deleteNode(nodeId);
  }, [nodeId, deleteNode]);

  const addOption = () => {
    const opts = data.options ?? [];
    update({ options: [...opts, { id: uuidv4(), label: 'New option', value: `option_${opts.length + 1}` }] });
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
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Node</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>{nodeId}</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md hover:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <Section label="Node Type">
          <div className="flex gap-1">
            {(['question', 'info', 'offer'] as NodeType[]).map(t => (
              <button
                key={t}
                onClick={() => update({ nodeType: t })}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize border',
                  data.nodeType === t
                    ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                )}
              >
                {NODE_TYPE_META[t].label}
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
                rows={2}
                className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-text-muted)] resize-none transition-colors"
                placeholder="Enter your question..."
              />
            </Section>

            <Section label="Answer Type">
              <div className="flex gap-1">
                {(['single', 'multi', 'input'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ answerType: t })}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize',
                      data.answerType === t
                        ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-white'
                        : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Section>

            {data.answerType !== 'input' && (
              <Section label="Answer Options">
                <div className="space-y-1.5">
                  {(data.options ?? []).map(opt => (
                    <OptionRow
                      key={opt.id}
                      option={opt}
                      onChange={label => updateOption(opt.id, label)}
                      onRemove={() => removeOption(opt.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={addOption}
                  className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-border-2)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add option
                </button>
              </Section>
            )}
          </>
        )}

        {data.nodeType === 'info' && (
          <>
            <Section label="Title">
              <input
                value={data.label}
                onChange={e => update({ label: e.target.value })}
                className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
                placeholder="Page title..."
              />
            </Section>
            <Section label="Content">
              <textarea
                value={data.content ?? ''}
                onChange={e => update({ content: e.target.value })}
                rows={4}
                className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-muted)] resize-none transition-colors"
                placeholder="Motivational content..."
              />
            </Section>
          </>
        )}

        {data.nodeType === 'offer' && (
          <>
            <Section label="Offer Title">
              <input
                value={data.offerTitle ?? ''}
                onChange={e => update({ offerTitle: e.target.value, label: e.target.value })}
                className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
                placeholder="Offer title..."
              />
            </Section>
            <Section label="Description">
              <textarea
                value={data.offerDescription ?? ''}
                onChange={e => update({ offerDescription: e.target.value })}
                rows={3}
                className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-muted)] resize-none transition-colors"
                placeholder="Description..."
              />
            </Section>
            <Section label="CTA Button">
              <input
                value={data.ctaText ?? ''}
                onChange={e => update({ ctaText: e.target.value })}
                className="w-full text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border(--color-text-muted)] transition-colors"
                placeholder="Button text..."
              />
            </Section>
          </>
        )}

        <Section label="Transition Rules">
          <div className="space-y-2">
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
            className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:border-[var(--color-border-2)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add rule
          </button>
        </Section>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--color-border)]">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors border border-red-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-text-primary)] text-white hover:bg-[#1a1614] transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function OptionRow({ option, onChange, onRemove }: { option: AnswerOption; onChange: (label: string) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        value={option.label}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-text-muted)] transition-colors"
      />
      <button onClick={onRemove} className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:bg-red-50 transition-colors shrink-0">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function RuleRow({ rule, options, nodes, onChange, onRemove }: { rule: TransitionRule; options: AnswerOption[]; nodes: Array<{ id: string; data: FlowNodeData }>; onChange: (patch: Partial<TransitionRule>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">if =</span>
        <button onClick={onRemove} className="text-red-400 hover:text-red-500"><X className="w-3 h-3" /></button>
      </div>
      <select
        value={rule.answerValue}
        onChange={e => onChange({ answerValue: e.target.value })}
        className="w-full text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text-primary)] focus:outline-none"
      >
        <option value="">— any —</option>
        {options.map(o => <option key={o.id} value={o.value}>{o.label}</option>)}
      </select>
      <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
        <ChevronRight className="w-3 h-3" />
        <span>go to</span>
      </div>
      <select
        value={rule.targetNodeId}
        onChange={e => onChange({ targetNodeId: e.target.value })}
        className="w-full text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[var(--color-text-primary)] focus:outline-none"
      >
        <option value="">— select node —</option>
        {nodes.map(n => <option key={n.id} value={n.id}>{n.data.label} ({n.id})</option>)}
      </select>
    </div>
  );
}
