import request from 'supertest';
import express from 'express';
import router from './user.routes.js';

// ── Mock db pool ──────────────────────────────────────────────────────────────
jest.mock('../db/client.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

// ── Mock services ─────────────────────────────────────────────────────────────
jest.mock('../services/rule-engine.js', () => ({
  resolveNextEdge: jest.fn(),
}));
jest.mock('../services/offer.service.js', () => ({
  resolveOffers: jest.fn(),
}));

import pool from '../db/client.js';
import { resolveNextEdge } from '../services/rule-engine.js';
import { resolveOffers } from '../services/offer.service.js';

const mockQuery = pool.query as jest.Mock;
const mockResolveNextEdge = resolveNextEdge as jest.Mock;
const mockResolveOffers = resolveOffers as jest.Mock;

// ── Test app setup ────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/user', router);

// ── Fixtures ──────────────────────────────────────────────────────────────────
const START_NODE = {
  id: 'node-1',
  type: 'question',
  title: 'What is your goal?',
  is_start: true,
  pos_x: 0,
  pos_y: 0,
  created_at: '',
  updated_at: '',
};

const SESSION = {
  id: 'sess-1',
  current_node_id: 'node-1',
  attributes: {},
  completed: false,
  created_at: '',
  completed_at: null,
};

const NEXT_NODE = {
  id: 'node-2',
  type: 'question',
  title: 'Where do you work out?',
  is_start: false,
  pos_x: 0,
  pos_y: 100,
  created_at: '',
  updated_at: '',
};

const EDGE = {
  id: 'edge-1',
  source_node_id: 'node-1',
  target_node_id: 'node-2',
  conditions: null,
  priority: 0,
  created_at: '',
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ── POST /api/user/sessions ───────────────────────────────────────────────────
describe('POST /api/user/sessions', () => {
  test('201 — creates session and returns start node', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [START_NODE] })   // find start node
      .mockResolvedValueOnce({ rows: [START_NODE] })   // all nodes (for totalNodes count)
      .mockResolvedValueOnce({ rows: [] })              // all edges (for totalNodes count)
      .mockResolvedValueOnce({ rows: [SESSION] });      // insert session

    const res = await request(app).post('/api/user/sessions');

    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBe('sess-1');
    expect(res.body.currentNode.id).toBe('node-1');
    expect(res.body.totalNodes).toBeDefined();
  });

  test('500 — no start node configured', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/user/sessions');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('No start node configured');
  });

  test('500 — db error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).post('/api/user/sessions');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to create session');
  });
});

// ── GET /api/user/sessions/:id ────────────────────────────────────────────────
describe('GET /api/user/sessions/:id', () => {
  test('200 — returns session and current node', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [SESSION] })       // fetch session
      .mockResolvedValueOnce({ rows: [START_NODE] });   // fetch current node

    const res = await request(app).get('/api/user/sessions/sess-1');

    expect(res.status).toBe(200);
    expect(res.body.session.id).toBe('sess-1');
    expect(res.body.currentNode.id).toBe('node-1');
  });

  test('200 — completed session has null currentNode', async () => {
    const completedSession = { ...SESSION, completed: true, current_node_id: null };
    mockQuery.mockResolvedValueOnce({ rows: [completedSession] });

    const res = await request(app).get('/api/user/sessions/sess-1');

    expect(res.status).toBe(200);
    expect(res.body.currentNode).toBeNull();
  });

  test('404 — session not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/user/sessions/unknown');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Session not found');
  });

  test('500 — db error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/api/user/sessions/sess-1');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to fetch session');
  });
});

// ── POST /api/user/sessions/:id/answer ───────────────────────────────────────
describe('POST /api/user/sessions/:id/answer', () => {
  const BODY = { node_id: 'node-1', attribute_key: 'goal', value: 'weight_loss' };

  test('200 — advances to next node', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [SESSION] })    // load session
      .mockResolvedValueOnce({ rows: [] })            // insert answer
      .mockResolvedValueOnce({ rows: [] })            // update attributes
      .mockResolvedValueOnce({ rows: [EDGE] })        // load edges
      .mockResolvedValueOnce({ rows: [NEXT_NODE] })   // load next node
      .mockResolvedValueOnce({ rows: [] });            // update current_node_id

    mockResolveNextEdge.mockReturnValue(EDGE);

    const res = await request(app)
      .post('/api/user/sessions/sess-1/answer')
      .send(BODY);

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
    expect(res.body.nextNode.id).toBe('node-2');
  });

  test('200 — completes session when no next edge', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [SESSION] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })   // edges (empty)
      .mockResolvedValueOnce({ rows: [] });  // mark completed

    mockResolveNextEdge.mockReturnValue(null);

    const res = await request(app)
      .post('/api/user/sessions/sess-1/answer')
      .send(BODY);

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.nextNode).toBeNull();
  });

  test('400 — missing node_id', async () => {
    const res = await request(app)
      .post('/api/user/sessions/sess-1/answer')
      .send({ value: 'weight_loss' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/node_id/);
  });

  test('400 — session already completed', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...SESSION, completed: true }] });

    const res = await request(app)
      .post('/api/user/sessions/sess-1/answer')
      .send(BODY);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Session is already completed');
  });

  test('404 — session not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/user/sessions/sess-1/answer')
      .send(BODY);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Session not found');
  });

  test('500 — db error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app)
      .post('/api/user/sessions/sess-1/answer')
      .send(BODY);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to process answer');
  });
});

// ── POST /api/user/sessions/:id/back ─────────────────────────────────────────
describe('POST /api/user/sessions/:id/back', () => {
  const ANSWER = {
    id: 'ans-1',
    session_id: 'sess-1',
    node_id: 'node-1',
    attribute_key: 'goal',
    value: 'weight_loss',
    created_at: new Date().toISOString()
  };

  test('200 — successfully goes back to the previous node', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [SESSION] }) // load session
      .mockResolvedValueOnce({ rows: [ANSWER] })  // get latest answer
      .mockResolvedValueOnce({ rows: [] })        // delete answer
      .mockResolvedValueOnce({ rows: [] })        // get remaining answers (empty)
      .mockResolvedValueOnce({ rows: [] })        // update session
      .mockResolvedValueOnce({ rows: [START_NODE] }); // load previous node

    const res = await request(app).post('/api/user/sessions/sess-1/back');

    expect(res.status).toBe(200);
    expect(res.body.currentNode.id).toBe('node-1');
  });

  test('400 — already at the beginning', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [SESSION] }) // load session
      .mockResolvedValueOnce({ rows: [] });       // no answers

    const res = await request(app).post('/api/user/sessions/sess-1/back');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Already at the beginning, cannot go back');
  });

  test('404 — session not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // session not found

    const res = await request(app).post('/api/user/sessions/unknown/back');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Session not found');
  });

  test('500 — db error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/user/sessions/sess-1/back');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to go back');
  });
});

// ── GET /api/user/sessions/:id/offer ─────────────────────────────────────────
describe('GET /api/user/sessions/:id/offer', () => {
  const COMPLETED_SESSION = { ...SESSION, completed: true, attributes: { goal: 'weight_loss' } };

  const OFFER_RESULT = {
    primary: [{ id: 'offer-1', name: 'Weight Loss Starter', slug: 'weight-loss-starter', is_addon: false }],
    addon: null,
  };

  test('200 — returns resolved offers', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [COMPLETED_SESSION] });
    mockResolveOffers.mockResolvedValueOnce(OFFER_RESULT);

    const res = await request(app).get('/api/user/sessions/sess-1/offer');

    expect(res.status).toBe(200);
    expect(res.body.primary).toHaveLength(1);
    expect(res.body.addon).toBeNull();
    expect(mockResolveOffers).toHaveBeenCalledWith(COMPLETED_SESSION.attributes, undefined);
  });

  test('400 — session not yet completed', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SESSION] }); // completed: false

    const res = await request(app).get('/api/user/sessions/sess-1/offer');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Session is not yet completed');
  });

  test('404 — session not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/user/sessions/sess-1/offer');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Session not found');
  });

  test('500 — db error', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB down'));

    const res = await request(app).get('/api/user/sessions/sess-1/offer');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to resolve offer');
  });
});
