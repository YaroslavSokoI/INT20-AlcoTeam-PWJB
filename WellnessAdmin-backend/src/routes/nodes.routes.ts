import { Router, Request, Response } from 'express';
import * as graph from '../services/graph.service.js';
import type { CreateNodeBody } from '../types/index.js';

const router = Router();

// GET /api/admin/nodes
router.get('/', async (_req: Request, res: Response) => {
  try {
    const nodes = await graph.getAllNodes();
    res.json(nodes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nodes', detail: String(err) });
  }
});

// GET /api/admin/nodes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const node = await graph.getNodeById(req.params.id);
    if (!node) return res.status(404).json({ error: 'Node not found' });
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch node', detail: String(err) });
  }
});

// POST /api/admin/nodes
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateNodeBody;
    if (!body.type || !body.title) {
      return res.status(400).json({ error: 'type and title are required' });
    }
    const node = await graph.createNode(body);
    res.status(201).json(node);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create node', detail: String(err) });
  }
});

// PUT /api/admin/nodes/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const node = await graph.updateNode(req.params.id, req.body as Partial<CreateNodeBody>);
    if (!node) return res.status(404).json({ error: 'Node not found' });
    res.json(node);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update node', detail: String(err) });
  }
});

// DELETE /api/admin/nodes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await graph.deleteNode(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Node not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete node', detail: String(err) });
  }
});

export default router;
