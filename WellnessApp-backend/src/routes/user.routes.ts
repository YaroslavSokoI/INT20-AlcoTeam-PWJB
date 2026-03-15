import { Router, Request, Response } from 'express';
import UAParser from 'ua-parser-js';
import pool from '../db/client.js';
import { resolveNextEdge } from '../services/rule-engine.js';
import { resolveOffers } from '../services/offer.service.js';
import type { DbNode, DbEdge, Session, SubmitAnswerBody } from '../types/index.js';

const router = Router();

// Apply translations to a node based on language
function applyLang<T extends { translations?: Record<string, Record<string, unknown>>; title?: string; description?: string; options?: any[]; cta_text?: string; digital_plan?: string; physical_kit?: string; why_text?: string }>(node: T | null, lang?: string): T | null {
  if (!node || !lang || lang === 'en') return node;
  const t = node.translations?.[lang];
  if (!t) return node;
  const result = { ...node };
  if (t.title) (result as any).title = t.title;
  if (t.description) (result as any).description = t.description;
  if (t.cta_text) (result as any).cta_text = t.cta_text;
  if (t.digital_plan) (result as any).digital_plan = t.digital_plan;
  if (t.physical_kit) (result as any).physical_kit = t.physical_kit;
  if (t.why_text) (result as any).why_text = t.why_text;
  if (Array.isArray(t.options) && Array.isArray(result.options)) {
    result.options = result.options.map((opt: any, i: number) => {
      const tOpt = (t.options as any[])[i];
      return tOpt?.label ? { ...opt, label: tOpt.label } : opt;
    });
  }
  return result;
}

// ---- POST /api/user/sessions ----------------------------
// Create a new quiz session and return the first (start) node.
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    // Find the start node
    const { rows: startNodes } = await pool.query<DbNode>(
      'SELECT * FROM published_nodes_full WHERE is_start = TRUE LIMIT 1',
    );
    if (startNodes.length === 0) {
      return res.status(500).json({ error: 'No start node configured' });
    }
    const startNode = startNodes[0];
    let resolvedNode: DbNode | null = startNode;
    let resolvedNodeId = startNode.id;

    // Recursive resolution for starting nodes if they are non-interactive
    while (resolvedNode && resolvedNode.type === 'conditional') {
      const { rows: conditionalEdges } = await pool.query<DbEdge>(
        'SELECT * FROM published_edges WHERE source_node_id = $1 ORDER BY priority DESC',
        [resolvedNodeId],
      );

      // Note: for start nodes, we assume attributes are empty '{}'
      const solvedEdge = resolveNextEdge(conditionalEdges, {});
      if (!solvedEdge) {
        resolvedNode = null;
        break;
      }

      resolvedNodeId = solvedEdge.target_node_id;
      const { rows: nodes } = await pool.query<DbNode>(
        'SELECT * FROM published_nodes_full WHERE id = $1',
        [resolvedNodeId],
      );
      resolvedNode = nodes[0] ?? null;
    }

    if (!resolvedNode) {
      return res.status(500).json({ error: 'Failed to resolve an interactive start node' });
    }

    // Walk the graph from start and count question nodes, taking the longest branch at conditionals
    const { rows: allNodes } = await pool.query<DbNode>('SELECT * FROM published_nodes_full');
    const { rows: allEdges } = await pool.query<DbEdge>('SELECT * FROM published_edges');
    const nodeMap = new Map(allNodes.map(n => [n.id, n]));
    const edgeMap = new Map<string, DbEdge[]>();
    for (const e of allEdges) {
      const list = edgeMap.get(e.source_node_id) || [];
      list.push(e);
      edgeMap.set(e.source_node_id, list);
    }

    function countQuestions(nodeId: string, visited: Set<string>): number {
      if (visited.has(nodeId)) return 0;
      const n = nodeMap.get(nodeId);
      if (!n) return 0;
      visited.add(nodeId);
      const count = n.type === 'question' ? 1 : 0;
      const outEdges: DbEdge[] = edgeMap.get(nodeId) || [];
      if (outEdges.length === 0) return count;
      // For any node with multiple outgoing edges, take the longest branch
      let max = 0;
      for (const edge of outEdges) {
        max = Math.max(max, countQuestions(edge.target_node_id, new Set(visited)));
      }
      return count + max;
    }

    const totalNodes = countQuestions(resolvedNode.id, new Set()) + 1;

    // Parse user metadata
    const userAgent = req.headers['user-agent'] || '';
    const ua = new UAParser(userAgent);
    const meta = req.body?.metadata || {};

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || null;

    const osInfo = ua.getOS();
    const browserInfo = ua.getBrowser();
    const deviceInfo = ua.getDevice();

    const os = osInfo.name ? `${osInfo.name} ${osInfo.version || ''}`.trim() : null;
    const browser = browserInfo.name ? `${browserInfo.name} ${browserInfo.version || ''}`.trim() : null;
    const deviceType = deviceInfo.type || (meta.in_app ? 'mobile' : 'desktop');

    const { rows } = await pool.query<Session>(
      `INSERT INTO sessions (
        current_node_id, attributes,
        ip, os, browser, device_type, language, referrer,
        utm_source, utm_medium, utm_campaign, in_app
      ) VALUES ($1, '{}', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        resolvedNode.id,
        ip,
        os,
        browser,
        deviceType,
        meta.language || null,
        meta.referrer || req.headers['referer'] || null,
        meta.utm_source || null,
        meta.utm_medium || null,
        meta.utm_campaign || null,
        meta.in_app || null,
      ],
    );
    const session = rows[0];

    const lang = (req.query.lang as string) || undefined;
    res.status(201).json({ sessionId: session.id, currentNode: applyLang(resolvedNode, lang), totalNodes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session', detail: String(err) });
  }
});

// ---- GET /api/user/sessions/:id -------------------------
// Get current session state + current node.
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<Session>(
      'SELECT * FROM sessions WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const session = rows[0];
    let currentNode: DbNode | null = null;

    if (session.current_node_id) {
      const { rows: nodes } = await pool.query<DbNode>(
        'SELECT * FROM published_nodes_full WHERE id = $1',
        [session.current_node_id],
      );
      currentNode = nodes[0] ?? null;
    }

    const lang = (req.query.lang as string) || undefined;
    res.json({ session, currentNode: applyLang(currentNode, lang) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session', detail: String(err) });
  }
});

// ---- POST /api/user/sessions/:id/answer -----------------
// Submit an answer for the current node; returns the next node or signals completion.
router.post('/sessions/:id/answer', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const lang = (req.query.lang as string) || undefined;
    const body = req.body as SubmitAnswerBody;

    if (!body.node_id || body.value === undefined) {
      return res.status(400).json({ error: 'node_id and value are required' });
    }

    // Load session
    const { rows: sessionRows } = await pool.query<Session>(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId],
    );
    if (sessionRows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const session = sessionRows[0];
    if (session.completed) {
      return res.status(400).json({ error: 'Session is already completed' });
    }

    // Store the answer
    await pool.query(
      `INSERT INTO answers (session_id, node_id, attribute_key, value)
       VALUES ($1, $2, $3, $4)`,
      [
        sessionId,
        body.node_id,
        body.attribute_key ?? null,
        JSON.stringify(body.value),
      ],
    );

    // Merge attribute into session.attributes
    let updatedAttributes = { ...session.attributes };
    if (body.attribute_key) {
      updatedAttributes[body.attribute_key] = body.value;
      await pool.query(
        `UPDATE sessions SET attributes = attributes || $1::jsonb WHERE id = $2`,
        [JSON.stringify({ [body.attribute_key]: body.value }), sessionId],
      );
    }

    // Find outgoing edges from the answered node
    const { rows: edges } = await pool.query<DbEdge>(
      'SELECT * FROM published_edges WHERE source_node_id = $1 ORDER BY priority DESC',
      [body.node_id],
    );

    const nextEdge = resolveNextEdge(edges, updatedAttributes);

    if (!nextEdge) {
      // No next node → quiz complete
      await pool.query(
        `UPDATE sessions SET completed = TRUE, completed_at = NOW(), current_node_id = NULL WHERE id = $1`,
        [sessionId],
      );
      return res.json({ completed: true, nextNode: null });
    }

    let nextNodeId = nextEdge.target_node_id;
    let nextNode: DbNode | null = null;

    // Recursive resolution for non-interactive nodes (e.g., conditional)
    while (nextNodeId) {
      const { rows: nodes } = await pool.query<DbNode>(
        'SELECT * FROM published_nodes_full WHERE id = $1',
        [nextNodeId],
      );
      nextNode = nodes[0] ?? null;

      if (!nextNode || nextNode.type !== 'conditional') {
        break;
      }

      // If it's a conditional node, resolve its outgoing edges
      const { rows: conditionalEdges } = await pool.query<DbEdge>(
        'SELECT * FROM published_edges WHERE source_node_id = $1 ORDER BY priority DESC',
        [nextNodeId],
      );

      const resolvedEdge = resolveNextEdge(conditionalEdges, updatedAttributes);
      if (!resolvedEdge) {
        nextNode = null;
        nextNodeId = '';
        break;
      }
      nextNodeId = resolvedEdge.target_node_id;
    }

    if (!nextNode) {
      await pool.query(
        `UPDATE sessions SET completed = TRUE, completed_at = NOW(), current_node_id = NULL WHERE id = $1`,
        [sessionId],
      );
      return res.json({ completed: true, nextNode: null });
    }

    // Update session's current node to the final resolved interactive node
    await pool.query(
      'UPDATE sessions SET current_node_id = $1 WHERE id = $2',
      [nextNode.id, sessionId],
    );

    res.json({ completed: false, nextNode: applyLang(nextNode, lang) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process answer', detail: String(err) });
  }
});

// ---- POST /api/user/sessions/:id/back -------------------
// Go back to the previous node by deleting the last answer and recalculating attributes.
router.post('/sessions/:id/back', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;

    // Load session
    const { rows: sessionRows } = await pool.query<Session>(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId],
    );
    if (sessionRows.length === 0) return res.status(404).json({ error: 'Session not found' });

    // Find the latest answer
    const { rows: answerRows } = await pool.query(
      'SELECT * FROM answers WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1',
      [sessionId]
    );

    if (answerRows.length === 0) {
      return res.status(400).json({ error: 'Already at the beginning, cannot go back' });
    }

    const lastAnswer = answerRows[0];

    // Delete the latest answer
    await pool.query(
      'DELETE FROM answers WHERE id = $1',
      [lastAnswer.id]
    );

    // Recompute attributes from remaining answers
    const { rows: remainingAnswers } = await pool.query(
      'SELECT * FROM answers WHERE session_id = $1 ORDER BY created_at ASC',
      [sessionId]
    );

    let updatedAttributes: Record<string, any> = {};
    for (const ans of remainingAnswers) {
      if (ans.attribute_key) {
        updatedAttributes[ans.attribute_key] = ans.value;
      }
    }

    // Update session: revert to previous node and re-apply attributes
    await pool.query(
      `UPDATE sessions 
       SET current_node_id = $1, 
           attributes = $2::jsonb, 
           completed = FALSE, 
           completed_at = NULL 
       WHERE id = $3`,
      [lastAnswer.node_id, JSON.stringify(updatedAttributes), sessionId]
    );

    // Load the previous node to return
    const { rows: previousNodes } = await pool.query<DbNode>(
      'SELECT * FROM published_nodes_full WHERE id = $1',
      [lastAnswer.node_id]
    );
    const previousNode = previousNodes[0] ?? null;

    const lang = (req.query.lang as string) || undefined;
    res.json({ currentNode: applyLang(previousNode, lang) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to go back', detail: String(err) });
  }
});

// ---- GET /api/user/sessions/:id/offer -------------------
// Compute and return the personalized offer for a completed session.
router.get('/sessions/:id/offer', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<Session>(
      'SELECT * FROM sessions WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    const session = rows[0];
    if (!session.completed) {
      return res.status(400).json({ error: 'Session is not yet completed' });
    }

    const lang = (req.query.lang as string) || undefined;
    const result = await resolveOffers(session.attributes, lang);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve offer', detail: String(err) });
  }
});

// ---- POST /api/user/sessions/:id/accept-offer ------------
// Mark that the user accepted/clicked the offer CTA.
router.post('/sessions/:id/accept-offer', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<Session>(
      'SELECT * FROM sessions WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' });

    await pool.query(
      `UPDATE sessions SET offer_accepted = TRUE, offer_accepted_at = NOW() WHERE id = $1`,
      [req.params.id],
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept offer', detail: String(err) });
  }
});

export default router;
