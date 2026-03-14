import { useState, useCallback } from 'react';
import { api } from '../api/client';
import type { QuizSession, QuizResult } from '../types';

type QuizStage = 'loading' | 'quiz' | 'result' | 'error';

export function useQuiz() {
  const [stage, setStage] = useState<QuizStage>('loading');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = useCallback(async (graphId?: number) => {
    try {
      setStage('loading');
      const sess = await api.startQuiz(graphId);
      setSession(sess);
      setStage('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      setStage('error');
    }
  }, []);

  const submitAnswer = useCallback(async (answer: unknown) => {
    if (!session) return;
    try {
      setStage('loading');
      const updated = await api.submitAnswer(session.id, answer);
      if (updated.status === 'completed') {
        const res = await api.getResult(session.id);
        setResult(res);
        setStage('result');
      } else {
        setSession(updated);
        setStage('quiz');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setStage('error');
    }
  }, [session]);

  const goBack = useCallback(async () => {
    if (!session) return;
    try {
      setStage('loading');
      const updated = await api.goBack(session.id);
      setSession(updated);
      setStage('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go back');
      setStage('error');
    }
  }, [session]);

  return { stage, session, result, error, startQuiz, submitAnswer, goBack };
}
