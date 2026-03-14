import { useState, useCallback } from 'react';
import { api } from '../api/client';
import type { QuizNode, OfferResult } from '../types';

type QuizStage = 'loading' | 'quiz' | 'result' | 'error';

export function useQuiz() {
  const [stage, setStage] = useState<QuizStage>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<QuizNode | null>(null);
  const [offerResult, setOfferResult] = useState<OfferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);

  const startQuiz = useCallback(async () => {
    try {
      setStage('loading');
      const { sessionId: sid, currentNode: node } = await api.createSession();
      setSessionId(sid);
      setCurrentNode(node);
      setStepCount(0);
      setCanGoBack(false);
      setStage('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      setStage('error');
    }
  }, []);

  const submitAnswer = useCallback(async (answer: unknown) => {
    if (!sessionId || !currentNode) return;

    try {
      const response = await api.submitAnswer(sessionId, {
        node_id: currentNode.id,
        attribute_key: currentNode.attribute_key,
        value: answer,
      });

      if (response.completed) {
        // Quiz done — fetch offer
        const result = await api.getOffer(sessionId);
        setOfferResult(result);
        setStage('result');
      } else if (response.nextNode) {
        setCurrentNode(response.nextNode);
        setStepCount(prev => prev + 1);
        setCanGoBack(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setStage('error');
    }
  }, [sessionId, currentNode]);

  const goBack = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { currentNode: prevNode } = await api.goBack(sessionId);
      setCurrentNode(prevNode);
      setStepCount(prev => Math.max(0, prev - 1));
      if (stepCount <= 1) setCanGoBack(false);
    } catch (err) {
      // If we're at the beginning, backend returns 400 — just ignore
      if (err instanceof Error && err.message.includes('beginning')) {
        setCanGoBack(false);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to go back');
      setStage('error');
    }
  }, [sessionId, stepCount]);

  return { stage, currentNode, offerResult, error, canGoBack, stepCount, startQuiz, submitAnswer, goBack };
}
