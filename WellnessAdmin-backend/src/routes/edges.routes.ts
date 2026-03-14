import { Router, Request, Response } from 'express';
import * as graph from '../services/graph.service.js';
import type { CreateEdgeBody } from '../types/index.js';

const router = Router();

// GET /api/admin/edges
router.get('/', async (_req: Request, res: Response) => {
  try {
    const edges = await graph.getAllEdges();
    res.json(edges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch edges', detail: String(err) });
  }
});

// POST /api/admin/edges
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateEdgeBody;
    if (!body.source_node_id || !body.target_node_id) {
      return res.status(400).json({ error: 'source_node_id and target_node_id are required' });
    }
    const edge = await graph.createEdge(body);
    res.status(201).json(edge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create edge', detail: String(err) });
  }
});

// PUT /api/admin/edges/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const edge = await graph.updateEdge(req.params.id, req.body as Partial<CreateEdgeBody>);
    if (!edge) return res.status(404).json({ error: 'Edge not found' });
    res.json(edge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update edge', detail: String(err) });
  }
});

// DELETE /api/admin/edges/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await graph.deleteEdge(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Edge not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete edge', detail: String(err) });
  }
});

export default router;
