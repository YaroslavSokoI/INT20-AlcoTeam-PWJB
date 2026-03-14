import { useState, useCallback } from 'react';
import { api } from '../api/client';
import type { QuizNode, OfferResult } from '../types';

type QuizStage = 'loading' | 'welcome' | 'quiz' | 'result' | 'error';

export function useQuiz() {
  const [stage, setStage] = useState<QuizStage>('loading');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentNode, setCurrentNode] = useState<QuizNode | null>(null);
  const [offerResult, setOfferResult] = useState<OfferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [hasHistory, setHasHistory] = useState(false);

  const startQuiz = useCallback(async () => {
    try {
      setStage('loading');
      const { sessionId: sid, currentNode: node, totalNodes } = await api.createSession();
      setSessionId(sid);
      setCurrentNode(node);
      setTotalSteps(totalNodes);
      setStepCount(node.type === 'question' ? 1 : 0);
      setHasHistory(false);
      setStage('welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz');
      setStage('error');
    }
  }, []);

  const beginQuiz = useCallback(() => {
    setStage('quiz');
  }, []);

  const goToWelcome = useCallback(() => {
    setStage('welcome');
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
        const result = await api.getOffer(sessionId);
        setOfferResult(result);
        setStage('result');
      } else if (response.nextNode) {
        if (currentNode.type === 'question') {
          setStepCount(prev => prev + 1);
        }
        setCurrentNode(response.nextNode);
        setHasHistory(true);
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
      if (currentNode?.type === 'question') {
        setStepCount(prev => Math.max(0, prev - 1));
      }
      setCurrentNode(prevNode);
    } catch (err) {
      if (err instanceof Error && err.message.includes('beginning')) {
        setHasHistory(false);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to go back');
      setStage('error');
    }
  }, [sessionId, stepCount]);

  return { stage, currentNode, offerResult, error, hasHistory, stepCount, totalSteps, startQuiz, beginQuiz, goToWelcome, submitAnswer, goBack };
}
