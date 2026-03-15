import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Save, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/cn';
import { useFlowStore, selectSelectedNode } from '@/store/flowStore';
import { NODE_TYPE_META } from '@/types';
import type { AnswerOption, FlowEdge, FlowNodeData, NodeType } from '@/types';
import { useIsMobile } from '@/hooks/useResponsive';
import { shortId } from '@/components/nodes/NodeCards';

export function InspectorPanel() {
  const selectedNode = useFlowStore(selectSelectedNode);
  const selectedEdgeId = useFlowStore(s => s.selectedEdgeId);
  const selectedEdge = useFlowStore(s => selectedEdgeId ? s.edges.find(e => e.id === selectedEdgeId) ?? null : null);
  const { setSelectedNodeId, setSelectedEdgeId } = useFlowStore();
  const isMobile = useIsMobile();

  const isOpen = !!(selectedNode || selectedEdge);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, isOpen]);

  const onClose = () => { setSelectedNodeId(null); setSelectedEdgeId(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[150]"
            />
          )}
          <motion.aside
            key={selectedNode?.id ?? selectedEdgeId ?? 'inspector'}
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
            {isMobile && <div className="w-12 h-1 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-1 shrink-0" />}

            {selectedNode && (
              <NodeInspector
                key={selectedNode.id}
                nodeId={selectedNode.id}
                initialData={selectedNode.data}
                onClose={onClose}
                isMobile={isMobile}
              />
            )}
            {selectedEdge && !selectedNode && (
              <EdgeInspector
                key={selectedEdge.id}
                edge={selectedEdge}
                onClose={onClose}
                isMobile={isMobile}
              />
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Node Inspector ────────────────────────────────────────────────────────

interface NodeInspectorProps {
  nodeId: string;
  initialData: FlowNodeData;
  onClose: () => void;
  isMobile?: boolean;
}

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'uk', label: 'UK' },
  { code: 'ru', label: 'RU' },
] as const;

function NodeInspector({ nodeId, initialData, onClose, isMobile }: NodeInspectorProps) {
  const [data, setData] = useState<FlowNodeData>({ ...initialData });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lang, setLang] = useState<string>('en');
  const { updateNodeData, deleteNode } = useFlowStore();

  const update = (patch: Partial<FlowNodeData>) => setData(d => ({ ...d, ...patch }));

  const translations = (data.translations ?? {}) as Record<string, Record<string, unknown>>;
  const setTranslation = (field: string, value: string) => {
    const langData = { ...(translations[lang] || {}), [field]: value };
    update({ translations: { ...translations, [lang]: langData } });
  };
  const getTranslation = (field: string): string => {
    return ((translations[lang] || {}) as Record<string, string>)[field] ?? '';
  };
  const getTranslatedOptions = (): { value: string; label: string }[] => {
    return ((translations[lang] || {}) as any).options ?? [];
  };
  const setTranslatedOptionLabel = (index: number, label: string) => {
    const opts = [...getTranslatedOptions()];
    const enOpts = data.options ?? [];
    // Ensure array is right size
    while (opts.length < enOpts.length) opts.push({ value: enOpts[opts.length]?.value ?? '', label: '' });
    opts[index] = { ...opts[index], label };
    setTranslation('options', opts as any);
  };

  const handleSave = useCallback(() => {
    updateNodeData(nodeId, data);
    if (isMobile) onClose();
  }, [nodeId, data, updateNodeData, isMobile, onClose]);

  const handleDelete = useCallback(() => setConfirmOpen(true), []);
  const handleDeleteConfirm = useCallback(() => { setConfirmOpen(false); deleteNode(nodeId); onClose(); }, [nodeId, deleteNode, onClose]);

  const addOption = () => {
    const opts = data.options ?? [];
    update({ options: [...opts, { id: uuidv4(), label: `Option ${opts.length + 1}`, value: `option_${opts.length + 1}` }] });
  };
  const updateOption = (id: string, patch: { label?: string; icon?: string }) => {
    update({ options: (data.options ?? []).map(o => {
      if (o.id !== id) return o;
      const updated = { ...o, ...patch };
      if (patch.label !== undefined) updated.value = patch.label.toLowerCase().replace(/\s+/g, '_');
      return updated;
    })});
  };
  const removeOption = (id: string) =>
    update({ options: (data.options ?? []).filter(o => o.id !== id) });

  const meta = NODE_TYPE_META[data.nodeType];
  const isTranslating = lang !== 'en';

  return (
    <>
      <InspectorHeader label="Edit Node" badge={`#${shortId(nodeId)}`} color={meta.color} onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-6 md:p-4 space-y-5 pb-32 md:pb-5">
        {/* Language Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all',
                lang === l.code ? 'bg-white text-black shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-black'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Node Type — only on EN */}
        {!isTranslating && (
          <Section label="Node Type">
            <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
              {(['question', 'info', 'offer', 'conditional'] as NodeType[]).map(t => (
                <button
                  key={t}
                  onClick={() => update({ nodeType: t })}
                  className={cn(
                    'py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize',
                    data.nodeType === t ? 'bg-white text-black shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-black'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Question */}
        {data.nodeType === 'question' && (
          <>
            <Section label="Question Text">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {data.questionText}</p>
                  <textarea
                    value={getTranslation('title')}
                    onChange={e => setTranslation('title', e.target.value)}
                    rows={isMobile ? 3 : 2}
                    className={inputCls + ' resize-none'}
                    placeholder={`Translation (${lang.toUpperCase()})...`}
                  />
                </>
              ) : (
                <textarea
                  value={data.questionText ?? ''}
                  onChange={e => update({ questionText: e.target.value, label: e.target.value })}
                  rows={isMobile ? 3 : 2}
                  className={inputCls + ' resize-none'}
                  placeholder="Enter your question..."
                />
              )}
            </Section>
            {!isTranslating && (
              <>
                <Section label="Attribute Key">
                  <input value={(data.attribute_key as string) ?? ''} onChange={e => update({ attribute_key: e.target.value })} className={inputCls} placeholder="e.g. goal" />
                </Section>
                <Section label="Answer Type">
                  <div className="flex gap-2 p-1 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                    {(['single', 'multi', 'input'] as const).map(t => (
                      <button key={t} onClick={() => update({ answerType: t })}
                        className={cn('flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize',
                          data.answerType === t ? 'bg-white text-black shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-black')}
                      >{t}</button>
                    ))}
                  </div>
                </Section>
              </>
            )}
            {data.answerType !== 'input' && (
              <Section label={isTranslating ? 'Option Translations' : 'Answer Options'}>
                {isTranslating ? (
                  <div className="space-y-2">
                    {(data.options ?? []).map((opt, i) => (
                      <div key={opt.id} className="space-y-1">
                        <p className="text-[9px] text-[var(--color-text-muted)] ml-1 italic">EN: {opt.label}</p>
                        <input
                          value={getTranslatedOptions()[i]?.label ?? ''}
                          onChange={e => setTranslatedOptionLabel(i, e.target.value)}
                          className={inputCls}
                          placeholder={`Translation (${lang.toUpperCase()})...`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {(data.options ?? []).map((opt, i) => (
                        <OptionRow key={opt.id} option={opt} index={i} onChange={patch => updateOption(opt.id, patch)} onRemove={() => removeOption(opt.id)} />
                      ))}
                    </div>
                    <button onClick={addOption} className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[var(--color-border-2)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" /> Add option
                    </button>
                  </>
                )}
              </Section>
            )}
          </>
        )}

        {/* Info */}
        {data.nodeType === 'info' && (
          <>
            <Section label="Title">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {data.label}</p>
                  <input value={getTranslation('title')} onChange={e => setTranslation('title', e.target.value)} className={inputCls} placeholder={`Translation (${lang.toUpperCase()})...`} />
                </>
              ) : (
                <input value={data.label} onChange={e => update({ label: e.target.value })} className={inputCls} placeholder="Title..." />
              )}
            </Section>
            <Section label="Content">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {(data.content ?? '').slice(0, 60)}...</p>
                  <textarea value={getTranslation('description')} onChange={e => setTranslation('description', e.target.value)} rows={isMobile ? 5 : 4} className={inputCls + ' resize-none'} placeholder={`Translation (${lang.toUpperCase()})...`} />
                </>
              ) : (
                <textarea value={data.content ?? ''} onChange={e => update({ content: e.target.value })} rows={isMobile ? 5 : 4} className={inputCls + ' resize-none'} placeholder="Content..." />
              )}
            </Section>
          </>
        )}

        {/* Offer */}
        {data.nodeType === 'offer' && (
          <>
            <Section label="Offer Title">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {data.offerTitle}</p>
                  <input value={getTranslation('title')} onChange={e => setTranslation('title', e.target.value)} className={inputCls} placeholder={`Translation (${lang.toUpperCase()})...`} />
                </>
              ) : (
                <input value={data.offerTitle ?? ''} onChange={e => update({ offerTitle: e.target.value, label: e.target.value })} className={inputCls} placeholder="Offer headline..." />
              )}
            </Section>
            {!isTranslating && (
              <Section label="Attribute Key (slug)">
                <input value={(data.attribute_key as string) ?? ''} onChange={e => update({ attribute_key: e.target.value })} className={inputCls} placeholder="e.g. weight-loss-starter" />
              </Section>
            )}
            <Section label="Description">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {(data.offerDescription ?? '').slice(0, 60)}...</p>
                  <textarea value={getTranslation('description')} onChange={e => setTranslation('description', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder={`Translation (${lang.toUpperCase()})...`} />
                </>
              ) : (
                <textarea value={data.offerDescription ?? ''} onChange={e => update({ offerDescription: e.target.value })} rows={3} className={inputCls + ' resize-none'} placeholder="Description..." />
              )}
            </Section>
            <Section label="CTA Button">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {data.ctaText}</p>
                  <input value={getTranslation('cta_text')} onChange={e => setTranslation('cta_text', e.target.value)} className={inputCls} placeholder={`Translation (${lang.toUpperCase()})...`} />
                </>
              ) : (
                <input value={data.ctaText ?? ''} onChange={e => update({ ctaText: e.target.value })} className={inputCls} placeholder="Get My Plan" />
              )}
            </Section>
          </>
        )}

        {/* Conditional */}
        {data.nodeType === 'conditional' && (
          <>
            <Section label="Label">
              {isTranslating ? (
                <>
                  <p className="text-[9px] text-[var(--color-text-muted)] mb-1 italic">EN: {data.label}</p>
                  <input value={getTranslation('title')} onChange={e => setTranslation('title', e.target.value)} className={inputCls} placeholder={`Translation (${lang.toUpperCase()})...`} />
                </>
              ) : (
                <input value={data.label} onChange={e => update({ label: e.target.value })} className={inputCls} placeholder="e.g. goal = weight_loss?" />
              )}
            </Section>
          </>
        )}

      </div>

      <InspectorFooter onDelete={handleDelete} onSave={handleSave} isMobile={isMobile} />
      <DeleteConfirmDialog
        open={confirmOpen}
        title="Delete node?"
        description={`"${data.label}" and all its connected edges will be removed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

// ─── Edge Inspector ────────────────────────────────────────────────────────

interface EdgeInspectorProps {
  edge: FlowEdge;
  onClose: () => void;
  isMobile?: boolean;
}

function EdgeInspector({ edge, onClose, isMobile }: EdgeInspectorProps) {
  const { updateEdgeData, deleteEdge, setSelectedEdgeId } = useFlowStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [label, setLabel] = useState(edge.data?.label ?? '');
  const [priority, setPriority] = useState(edge.data?.priority ?? '0');
  const [sourceHandle, setSourceHandle] = useState<string>(edge.sourceHandle ?? '');
  const [conditionJson, setConditionJson] = useState(
    edge.data?.condition ? JSON.stringify(JSON.parse(edge.data.condition || '{}'), null, 2) : ''
  );
  const [jsonError, setJsonError] = useState('');

  const handleSave = useCallback(async () => {
    let condition = '';
    if (conditionJson.trim()) {
      try {
        JSON.parse(conditionJson);
        condition = conditionJson.trim();
        setJsonError('');
      } catch {
        setJsonError('Invalid JSON');
        return;
      }
    }
    await updateEdgeData(edge.id, {
      label,
      priority,
      condition,
      sourceHandle: sourceHandle || null,
    } as any);
    if (isMobile) onClose();
  }, [edge.id, label, priority, conditionJson, sourceHandle, updateEdgeData, isMobile, onClose]);

  const handleDelete = useCallback(() => setConfirmOpen(true), []);
  const handleDeleteConfirm = useCallback(() => { setConfirmOpen(false); deleteEdge(edge.id); setSelectedEdgeId(null); onClose(); }, [edge.id, deleteEdge, setSelectedEdgeId, onClose]);

  return (
    <>
      <InspectorHeader label="Edit Edge" badge={`#${shortId(edge.id)}`} color="#8e44ad" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-6 md:p-4 space-y-5 pb-32 md:pb-5">
        <Section label="Label">
          <input value={label} onChange={e => setLabel(e.target.value)} className={inputCls} placeholder="Edge label..." />
        </Section>

        <Section label="Priority">
          <input type="number" value={priority} onChange={e => setPriority(e.target.value)} className={inputCls} placeholder="0" />
        </Section>

        <Section label="Source Handle">
          <select value={sourceHandle} onChange={e => setSourceHandle(e.target.value)} className={inputCls}>
            <option value="">— default —</option>
            <option value="source">source</option>
            <option value="true">true (top)</option>
            <option value="false">false (bottom)</option>
          </select>
        </Section>

        <Section label="Condition (JSON)">
          <p className="text-[10px] text-[var(--color-text-muted)] mb-2">Leave empty for unconditional (always matches). Use simple condition:</p>
          <div className="space-y-2 mb-3 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
            <p className="text-[9px] font-mono text-[var(--color-text-muted)]">{'{"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"}'}</p>
          </div>
          <textarea
            value={conditionJson}
            onChange={e => { setConditionJson(e.target.value); setJsonError(''); }}
            rows={6}
            className={cn(inputCls, 'font-mono text-[11px] resize-none', jsonError && 'border-red-400')}
            placeholder='{"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"}'
          />
          {jsonError && <p className="text-[10px] text-red-500 mt-1">{jsonError}</p>}
        </Section>

        <div className="text-[9px] text-[var(--color-text-muted)] space-y-1 font-mono bg-[var(--color-bg)] rounded-xl p-3 border border-[var(--color-border)]">
          <p className="font-bold text-[var(--color-text-secondary)] text-[10px] mb-1">Ops: eq · neq · in · nin · gt · lt · gte · lte</p>
          <p>compound: {`{"type":"compound","operator":"AND","conditions":[...]}`}</p>
        </div>
      </div>

      <InspectorFooter onDelete={handleDelete} onSave={handleSave} isMobile={isMobile} />
      <DeleteConfirmDialog
        open={confirmOpen}
        title="Delete edge?"
        description={label ? `Edge "${label}" will be removed.` : 'This connection will be removed.'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

// ─── Shared ────────────────────────────────────────────────────────────────

const inputCls = 'w-full text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-text-primary)] focus:border-[var(--color-text-primary)] transition-all';

function InspectorHeader({ label, badge, color, onClose }: { label: string; badge: string; color: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 pt-4 pb-4 md:pt-3.5 md:pb-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{label}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold font-mono tracking-tight">{badge}</span>
        </div>
      </div>
      <button onClick={onClose} className="w-6 h-6 rounded-md hover:bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function InspectorFooter({ onDelete, onSave, isMobile }: { onDelete: () => void; onSave: () => void; isMobile?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-6 pb-12 pt-4 md:px-4 md:py-3 md:pb-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] z-10",
      isMobile ? "fixed bottom-0 left-0 right-0" : ""
    )}>
      <button onClick={onDelete} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 border border-red-100 transition-colors">
        <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
      </button>
      <button onClick={onSave} className="flex-[2] md:flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-xs font-bold bg-[var(--color-text-primary)] text-white hover:bg-[#1a1614] active:scale-[0.98] transition-all shadow-lg md:shadow-none">
        <Save className="w-3.5 h-3.5" /><span>Save</span>
      </button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)] mb-2.5 px-1">{label}</label>
      {children}
    </div>
  );
}

const POPULAR_ICONS = [
  'Heart', 'Dumbbell', 'Apple', 'Moon', 'Sun', 'Flame', 'Target', 'Trophy',
  'Brain', 'Smile', 'Frown', 'Clock', 'Zap', 'TrendingUp', 'Activity',
  'Footprints', 'Salad', 'Bike', 'PersonStanding', 'Bed', 'Coffee', 'Droplets',
  'Eye', 'Hand', 'Leaf', 'Mountain', 'Music', 'Star', 'ThumbsUp', 'Timer',
  'Weight', 'Wind', 'Utensils', 'Pill', 'Sparkles', 'CircleCheck', 'CircleX',
];

function IconPicker({ value, onChange }: { value?: string; onChange: (icon: string | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allIconNames = Object.keys(LucideIcons).filter(
    k => k[0] === k[0].toUpperCase() && k !== 'default' && k !== 'createLucideIcon' && typeof (LucideIcons as any)[k] === 'object'
  );

  const filtered = search
    ? allIconNames.filter(n => n.toLowerCase().includes(search.toLowerCase())).slice(0, 40)
    : POPULAR_ICONS;

  const CurrentIcon = value ? (LucideIcons as any)[value] : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg border transition-all shrink-0",
          value ? "border-[var(--color-text-primary)] bg-[var(--color-bg)]" : "border-dashed border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg)]"
        )}
        title={value || 'Pick icon'}
      >
        {CurrentIcon ? <CurrentIcon className="w-4 h-4 text-[var(--color-text-primary)]" /> : <Plus className="w-3 h-3 text-[var(--color-text-muted)]" />}
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl p-2 w-[240px]">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-text-muted)]" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="w-full text-[10px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-6 pr-2 py-1.5 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-7 gap-1 max-h-[160px] overflow-y-auto">
            {value && (
              <button
                onClick={() => { onChange(undefined); setOpen(false); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400"
                title="Remove icon"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {filtered.map(name => {
              const Icon = (LucideIcons as any)[name];
              if (!Icon) return null;
              return (
                <button
                  key={name}
                  onClick={() => { onChange(name); setOpen(false); setSearch(''); }}
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                    value === name ? "bg-black text-white" : "hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
                  )}
                  title={name}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({ option, index, onChange, onRemove }: { option: AnswerOption; index: number; onChange: (patch: { label?: string; icon?: string }) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 group">
      <div className="text-[10px] font-bold text-[var(--color-text-muted)] w-4 text-center">{index + 1}</div>
      <IconPicker value={option.icon} onChange={icon => onChange({ icon })} />
      <input value={option.label} onChange={e => onChange({ label: e.target.value })} className="flex-1 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 focus:outline-none focus:border-[var(--color-text-primary)] transition-all" />
      <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400 hover:bg-red-50 transition-colors shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
