import { Router, Request, Response } from 'express';
import * as graph from '../services/graph.service.js';
import type { CreateOfferBody } from '../types/index.js';

const router = Router();

// GET /api/admin/offers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const offers = await graph.getAllOffers();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers', detail: String(err) });
  }
});

// GET /api/admin/offers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const offer = await graph.getOfferById(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offer', detail: String(err) });
  }
});

// POST /api/admin/offers
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as CreateOfferBody;
    if (!body.name || !body.slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }
    const offer = await graph.createOffer(body);
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer', detail: String(err) });
  }
});

// PUT /api/admin/offers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const offer = await graph.updateOffer(req.params.id, req.body as Partial<CreateOfferBody>);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update offer', detail: String(err) });
  }
});

// DELETE /api/admin/offers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await graph.deleteOffer(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Offer not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer', detail: String(err) });
  }
});

export default router;
