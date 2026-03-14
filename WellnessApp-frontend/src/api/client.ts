import type { QuizSession, QuizResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  startQuiz(graphId?: number): Promise<QuizSession> {
    return request('/quiz/start', {
      method: 'POST',
      body: JSON.stringify({ graph_id: graphId }),
    });
  },

  getCurrentNode(sessionId: string): Promise<QuizSession> {
    return request(`/quiz/${sessionId}/current`);
  },

  submitAnswer(sessionId: string, answer: unknown): Promise<QuizSession> {
    return request(`/quiz/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  },

  goBack(sessionId: string): Promise<QuizSession> {
    return request(`/quiz/${sessionId}/back`, {
      method: 'POST',
    });
  },

  getResult(sessionId: string): Promise<QuizResult> {
    return request(`/quiz/${sessionId}/result`);
  },
};
