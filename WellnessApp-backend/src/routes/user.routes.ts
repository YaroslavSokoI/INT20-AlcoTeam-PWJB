import { Router, Request, Response } from 'express';
import UAParser from 'ua-parser-js';
import pool from '../db/client.js';
import { resolveNextEdge } from '../services/rule-engine.js';
import { resolveOffers } from '../services/offer.service.js';
import type { DbNode, DbEdge, Session, SubmitAnswerBody } from '../types/index.js';

const router = Router();

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

    const { rows: countRows } = await pool.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM published_nodes_full WHERE type = 'question'",
    );
    const totalNodes = parseInt(countRows[0].count, 10);

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

    res.status(201).json({ sessionId: session.id, currentNode: resolvedNode, totalNodes });
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

    res.json({ session, currentNode });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session', detail: String(err) });
  }
});

// ---- POST /api/user/sessions/:id/answer -----------------
// Submit an answer for the current node; returns the next node or signals completion.
router.post('/sessions/:id/answer', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
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

    res.json({ completed: false, nextNode });
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

    res.json({ currentNode: previousNode });
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

    const result = await resolveOffers(session.attributes);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve offer', detail: String(err) });
  }
});

export default router;
