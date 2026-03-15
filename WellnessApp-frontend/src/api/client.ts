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
  totalNodes: number;
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

function detectInApp(ua: string): string | null {
  if (ua.includes('Instagram')) return 'instagram';
  if (ua.includes('FBAN') || ua.includes('FBAV')) return 'facebook';
  if (ua.includes('TikTok') || ua.includes('BytedanceWebview')) return 'tiktok';
  if (ua.includes('Snapchat')) return 'snapchat';
  if (ua.includes('Twitter') || ua.includes('TwitterAndroid')) return 'twitter';
  if (ua.includes('LinkedInApp')) return 'linkedin';
  if (ua.includes('Telegram')) return 'telegram';
  return null;
}

function collectMetadata() {
  const ua = navigator.userAgent;
  const params = new URLSearchParams(window.location.search);

  return {
    language: navigator.language || null,
    referrer: document.referrer || null,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    in_app: detectInApp(ua),
    user_agent: ua,
  };
}

function getLang(): string {
  return localStorage.getItem('quiz-lang') || 'en';
}

export const api = {
  getSession(sessionId: string): Promise<{ session: any; currentNode: QuizNode | null }> {
    return request(`/user/sessions/${sessionId}?lang=${getLang()}`);
  },

  createSession(): Promise<StartSessionResponse> {
    return request(`/user/sessions?lang=${getLang()}`, {
      method: 'POST',
      body: JSON.stringify({ metadata: collectMetadata() }),
    });
  },

  submitAnswer(sessionId: string, body: SubmitAnswerBody): Promise<AnswerResponse> {
    return request(`/user/sessions/${sessionId}/answer?lang=${getLang()}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  goBack(sessionId: string): Promise<BackResponse> {
    return request(`/user/sessions/${sessionId}/back?lang=${getLang()}`, {
      method: 'POST',
    });
  },

  getOffer(sessionId: string): Promise<OfferResult> {
    return request(`/user/sessions/${sessionId}/offer?lang=${getLang()}`);
  },

  acceptOffer(sessionId: string): Promise<{ success: boolean }> {
    return request(`/user/sessions/${sessionId}/accept-offer`, {
      method: 'POST',
    });
  },
};
