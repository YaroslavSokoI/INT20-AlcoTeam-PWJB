import type { QuizNode, OfferResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface StartSessionResponse {
  sessionId: string;
  currentNode: QuizNode;
}

export interface AnswerResponse {
  completed: boolean;
  nextNode: QuizNode | null;
}

export interface BackResponse {
  currentNode: QuizNode;
}

export interface SubmitAnswerBody {
  node_id: string;
  attribute_key?: string;
  value: unknown;
}

export const api = {
  createSession(): Promise<StartSessionResponse> {
    return request('/user/sessions', { method: 'POST' });
  },

  submitAnswer(sessionId: string, body: SubmitAnswerBody): Promise<AnswerResponse> {
    return request(`/user/sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  goBack(sessionId: string): Promise<BackResponse> {
    return request(`/user/sessions/${sessionId}/back`, {
      method: 'POST',
    });
  },

  getOffer(sessionId: string): Promise<OfferResult> {
    return request(`/user/sessions/${sessionId}/offer`);
  },
};
