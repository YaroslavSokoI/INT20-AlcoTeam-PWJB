import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check, Smartphone, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useFlowStore } from '@/store/flowStore';
import type { FlowNode, AnswerOption } from '@/types';
import { useIsMobile } from '@/hooks/useResponsive';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
}

interface PreviewState {
  currentNodeId: string;
  history: string[];
  answers: Record<string, string>;
  completed: boolean;
}

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const { nodes, edges } = useFlowStore();
  const isMobile = useIsMobile();
  const startNodeId = nodes[0]?.id ?? '';

  const [state, setState] = useState<PreviewState>({
    currentNodeId: startNodeId,
    history: [],
    answers: {},
    completed: false,
  });

  // Reset if start node changes while open
  useEffect(() => {
    if (open && !state.currentNodeId && startNodeId) {
      setState(s => ({ ...s, currentNodeId: startNodeId }));
    }
  }, [open, startNodeId, state.currentNodeId]);

  const currentNode = nodes.find(n => n.id === state.currentNodeId);

  const navigateTo = useCallback((targetId: string, answerValue?: string) => {
    if (!targetId) {
      setState(s => ({ ...s, completed: true }));
      return;
    }
    const exists = nodes.find(n => n.id === targetId);
    if (!exists) {
      setState(s => ({ ...s, completed: true }));
      return;
    }
    setState(s => ({
      ...s,
      currentNodeId: targetId,
      history: [...s.history, s.currentNodeId],
      answers: answerValue ? { ...s.answers, [s.currentNodeId]: answerValue } : s.answers,
    }));
  }, [nodes]);

  const handleAnswer = useCallback((option: AnswerOption) => {
    if (!currentNode) return;
    
    // Find edge from this node that matches the selected option's value
    const targetEdge = edges.find(e => 
      e.source === currentNode.id && 
      (e.sourceHandle === option.value || e.sourceHandle === 'source')
    );
    
    if (targetEdge?.target) {
      navigateTo(targetEdge.target, option.value);
    } else {
      setState(s => ({ ...s, completed: true }));
    }
  }, [currentNode, edges, navigateTo]);

  const handleContinue = useCallback(() => {
    if (!currentNode) return;
    
    // Find any outgoing edge
    const targetEdge = edges.find(e => e.source === currentNode.id);
    
    if (targetEdge?.target) {
      navigateTo(targetEdge.target);
    } else {
      setState(s => ({ ...s, completed: true }));
    }
  }, [currentNode, edges, navigateTo]);

  const goBack = useCallback(() => {
    setState(s => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return { ...s, currentNodeId: prev, history: s.history.slice(0, -1), completed: false };
    });
  }, []);

  const restart = useCallback(() => {
    setState({ currentNodeId: startNodeId, history: [], answers: {}, completed: false });
  }, [startNodeId]);

  const handleClose = () => {
    onClose();
    setTimeout(restart, 300);
  };

  const totalSteps = nodes.filter(n => n.data.nodeType === 'question' || n.data.nodeType === 'info').length;
  const currentStep = state.history.length + 1;
  const progress = Math.min((currentStep / Math.max(totalSteps, 1)) * 100, 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: 'rgba(22,21,19,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "bg-[var(--color-bg)] shadow-2xl overflow-hidden flex flex-col",
              isMobile ? "w-full h-full" : "w-full max-w-[400px] h-[80vh] max-h-[700px] rounded-[32px] border border-black/10"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-md border-b border-[var(--color-border)] shrink-0 z-10">
              <button onClick={state.history.length > 0 ? goBack : handleClose} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--color-text-secondary)] active:bg-[var(--color-bg)] transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex-1 mx-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Step {currentStep}/{totalSteps}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-border)]/50 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-black shadow-sm" animate={{ width: `${progress}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} />
                </div>
              </div>

              <button onClick={handleClose} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--color-text-muted)] active:bg-[var(--color-bg)] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-7 py-8 md:px-8 bg-[var(--color-bg)]">
              <AnimatePresence mode="wait">
                {state.completed ? (
                  <motion.div key="completed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <div className="w-20 h-20 rounded-[32px] bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                      <Check className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-3 leading-tight">Flow Finished!</h2>
                    <p className="text-sm font-bold text-[var(--color-text-secondary)] opacity-80 mb-10 px-4">Thank you for completing the onboarding process.</p>
                    <div className="flex flex-col gap-3">
                      <button onClick={restart} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-black text-white text-sm font-black shadow-lg shadow-black/10 active:scale-[0.98] transition-all">
                        <RotateCcw className="w-4 h-4" /> Restart Simulation
                      </button>
                      <button onClick={handleClose} className="w-full py-4 rounded-2xl border border-[var(--color-border-2)] text-sm font-bold active:bg-[var(--color-bg)] transition-all">
                        Close Preview
                      </button>
                    </div>
                  </motion.div>
                ) : currentNode ? (
                  <motion.div key={currentNode.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                    <NodePreview node={currentNode} onAnswer={handleAnswer} onContinue={handleContinue} />
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                    <Smartphone className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold">Waiting for flow nodes...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NodePreview({ node, onAnswer, onContinue }: { node: FlowNode; onAnswer: (opt: AnswerOption) => void; onContinue: () => void }) {
  const { data } = node;
  
  if (data.nodeType === 'question') {
    return (
      <div className="flex flex-col h-full">
        {data.badge && (
          <span className="inline-block self-start px-2.5 py-1 rounded-lg bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest mb-4">
            {data.badge}
          </span>
        )}
        <h2 className="text-2xl md:text-xl font-black text-[var(--color-text-primary)] mb-8 leading-[1.2]">
          {data.questionText || data.label}
        </h2>
        <div className="space-y-3 flex flex-col">
          {(data.options ?? []).map(opt => (
            <button 
              key={opt.id} 
              onClick={() => onAnswer(opt)} 
              className="w-full group px-5 py-4.5 rounded-2xl bg-white border border-[var(--color-border)] text-sm font-bold text-left shadow-sm hover:border-[var(--color-text-primary)] active:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-between"
            >
              <span className="flex-1 pr-4">{opt.label}</span>
              <div className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] group-hover:border-black shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  if (data.nodeType === 'info') {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-3xl font-black text-[var(--color-text-primary)] mb-4 leading-tight">{data.label}</h2>
        <p className="text-base font-medium text-[var(--color-text-secondary)] leading-relaxed mb-10 whitespace-pre-line opacity-90">{data.content}</p>
        <div className="mt-auto">
          <button onClick={onContinue} className="w-full py-4.5 rounded-2xl bg-black text-white text-base font-black shadow-xl shadow-black/10 active:scale-[0.98] transition-all">
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  if (data.nodeType === 'offer') {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white rounded-[32px] p-8 border border-[var(--color-border)] shadow-xl mb-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-3 leading-tight">{data.offerTitle || data.label}</h2>
          <p className="text-sm font-bold text-[var(--color-text-secondary)] leading-relaxed opacity-80 mb-6">{data.offerDescription}</p>
        </div>
        <div className="mt-auto">
          <button onClick={onContinue} className="w-full py-5 rounded-2xl bg-black text-white text-base font-black shadow-2xl shadow-black/20 active:scale-[0.98] transition-all">
            {data.ctaText ?? 'Get My Plan'}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
      <Smartphone className="w-12 h-12 mb-4" />
      <p className="text-sm font-bold">This node type ({node.type}) is not previewable.</p>
      <button onClick={onContinue} className="mt-8 text-xs font-black uppercase tracking-widest underline">Skip Node</button>
    </div>
  );
}
