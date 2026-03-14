import { Router, Request, Response } from 'express';
import { getFullGraph, getAllOffers } from '../services/graph.service.js';

const router = Router();

/**
 * GET /api/content/graph
 * Read-only endpoint consumed by the client (user-facing) frontend.
 * Returns the full DAG config: nodes, edges, and offers.
 */
router.get('/graph', async (_req: Request, res: Response) => {
  try {
    const [graph, offers] = await Promise.all([getFullGraph(), getAllOffers()]);
    res.json({ ...graph, offers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content graph', detail: String(err) });
  }
});

export default router;
