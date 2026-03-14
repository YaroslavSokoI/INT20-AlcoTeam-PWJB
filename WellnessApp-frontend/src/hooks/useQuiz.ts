import { useState, useCallback } from 'react';
import { mockNodes, resolveOffer } from '../api/mockData';
import type { QuizNode, QuizSession, QuizResult } from '../types';

type QuizStage = 'loading' | 'quiz' | 'result' | 'error';

const USE_MOCK = true; // flip to false when backend is ready

export function useQuiz() {
  const [stage, setStage] = useState<QuizStage>('loading');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, _setError] = useState<string | null>(null);

  // Mock state
  const [nodeIndex, setNodeIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<number[]>([]);

  const buildSession = useCallback((index: number, ans: Record<string, unknown>, hist: number[]): QuizSession => {
    const node: QuizNode = mockNodes[index];
    return {
      id: 'mock-session',
      graph_id: 1,
      current_node: node,
      answers: ans,
      history: hist,
      status: 'in_progress',
      progress: Math.round(((index + 1) / mockNodes.length) * 100),
      current_step: index,
      total_steps: mockNodes.length,
    };
  }, []);

  const startQuiz = useCallback(async () => {
    if (USE_MOCK) {
      await delay(400);
      setNodeIndex(0);
      setAnswers({});
      setHistory([]);
      setSession(buildSession(0, {}, []));
      setStage('quiz');
      return;
    }
    // TODO: real API call
  }, [buildSession]);

  const submitAnswer = useCallback(async (answer: unknown) => {
    if (!USE_MOCK || !session) return;

    await delay(200);

    const currentNode = mockNodes[nodeIndex];
    const newAnswers = currentNode.slug
      ? { ...answers, [currentNode.slug]: answer }
      : answers;
    const newHistory = [...history, nodeIndex];
    const nextIndex = nodeIndex + 1;

    if (nextIndex >= mockNodes.length) {
      // Quiz complete — resolve offer
      const offers = resolveOffer(newAnswers);
      setResult({
        offers,
        answers: newAnswers,
        summary: buildSummary(newAnswers),
      });
      setStage('result');
    } else {
      setAnswers(newAnswers);
      setHistory(newHistory);
      setNodeIndex(nextIndex);
      setSession(buildSession(nextIndex, newAnswers, newHistory));
      setStage('quiz');
    }
  }, [session, nodeIndex, answers, history, buildSession]);

  const goBack = useCallback(async () => {
    if (!USE_MOCK || history.length === 0) return;

    await delay(150);

    const newHistory = [...history];
    const prevIndex = newHistory.pop()!;
    const prevNode = mockNodes[prevIndex];

    const newAnswers = { ...answers };
    if (prevNode.slug) delete newAnswers[prevNode.slug];

    setHistory(newHistory);
    setNodeIndex(prevIndex);
    setAnswers(newAnswers);
    setSession(buildSession(prevIndex, newAnswers, newHistory));
    setStage('quiz');
  }, [history, answers, buildSession]);

  return { stage, session, result, error, startQuiz, submitAnswer, goBack };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildSummary(answers: Record<string, unknown>): string {
  const parts: string[] = [];
  const goal = answers.goal as string;
  const context = answers.context as string;

  if (goal) {
    const goalMap: Record<string, string> = {
      lose_weight: 'weight loss',
      strength: 'building strength',
      flexibility: 'improving flexibility',
      stress: 'stress reduction',
      endurance: 'boosting endurance',
    };
    parts.push(`Based on your goal of ${goalMap[goal] || goal}`);
  }
  if (context) {
    const ctxMap: Record<string, string> = { home: 'at home', gym: 'at the gym', outdoor: 'outdoors' };
    parts.push(`training ${ctxMap[context] || context}`);
  }

  return parts.length > 0
    ? `${parts.join(', ')}, here's the plan we've crafted for you.`
    : 'Here\'s the plan we\'ve crafted based on your answers.';
}
