import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Check } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import type { FlowNode, AnswerOption, TransitionRule } from '@/types';

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
  const { nodes } = useFlowStore();
  const startNodeId = nodes[0]?.id ?? '';

  const [state, setState] = useState<PreviewState>({
    currentNodeId: startNodeId,
    history: [],
    answers: {},
    completed: false,
  });

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
    const transitions: TransitionRule[] = currentNode.data.transitions ?? [];
    const rule = transitions.find(r => r.answerValue === option.value) 
      ?? transitions.find(r => r.answerValue === '');
    
    if (rule?.targetNodeId) {
      navigateTo(rule.targetNodeId, option.value);
    } else {
      setState(s => ({ ...s, completed: true }));
    }
  }, [currentNode, navigateTo]);

  const handleContinue = useCallback(() => {
    if (!currentNode) return;
    const transitions: TransitionRule[] = currentNode.data.transitions ?? [];
    const rule = transitions[0];
    if (rule?.targetNodeId) {
      navigateTo(rule.targetNodeId);
    } else {
      setState(s => ({ ...s, completed: true }));
    }
  }, [currentNode, navigateTo]);

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
          className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(47,42,39,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            className="w-full max-w-sm mx-4 bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-border)]">
              <button onClick={state.history.length > 0 ? goBack : handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 mx-3">
                <div className="h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[var(--color-text-primary)]" animate={{ width: `${progress}%` }} />
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <AnimatePresence mode="wait">
                {state.completed ? (
                  <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Flow Completed!</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">The user has reached the end.</p>
                    <div className="flex gap-2">
                      <button onClick={restart} className="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-bg)]">Restart</button>
                      <button onClick={handleClose} className="flex-1 py-3 rounded-xl bg-[var(--color-text-primary)] text-white text-sm font-medium">Close</button>
                    </div>
                  </motion.div>
                ) : currentNode ? (
                  <motion.div key={currentNode.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <NodePreview node={currentNode} onAnswer={handleAnswer} onContinue={handleContinue} />
                  </motion.div>
                ) : null}
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
      <div>
        <p className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 leading-snug">{data.questionText}</p>
        <div className="space-y-2.5">
          {(data.options ?? []).map(opt => (
            <button key={opt.id} onClick={() => onAnswer(opt)} className="w-full px-4 py-3.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-left hover:bg-[var(--color-bg)] transition-all">
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (data.nodeType === 'info') {
    return (
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{data.label}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 whitespace-pre-line">{data.content}</p>
        <button onClick={onContinue} className="w-full py-3.5 rounded-xl bg-[var(--color-text-primary)] text-white text-sm font-semibold">Continue</button>
      </div>
    );
  }
  if (data.nodeType === 'offer') {
    return (
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{data.offerTitle}</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{data.offerDescription}</p>
        <button onClick={onContinue} className="w-full py-3.5 rounded-xl bg-[var(--color-node-offer)] text-white text-sm font-semibold">{data.ctaText ?? 'Get Started'}</button>
      </div>
    );
  }
  return null;
}
