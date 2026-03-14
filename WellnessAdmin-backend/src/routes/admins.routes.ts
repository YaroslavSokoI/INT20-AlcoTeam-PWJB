import { Router, Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';

const router = Router();

// GET /api/admin/admins
router.get('/', async (_req: Request, res: Response) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins', detail: String(err) });
  }
});

// GET /api/admin/admins/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const admin = await adminService.getAdminById(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin', detail: String(err) });
  }
});

// POST /api/admin/admins
router.post('/', async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body as { login?: string; password?: string };
    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }
    const admin = await adminService.createAdmin(login, password);
    res.status(201).json(admin);
  } catch (err: any) {
    if (err.message === 'Login already taken') {
      return res.status(409).json({ error: 'Login already taken' });
    }
    res.status(500).json({ error: 'Failed to create admin', detail: String(err) });
  }
});

// PUT /api/admin/admins/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body as { login?: string; password?: string };
    const admin = await adminService.updateAdmin(req.params.id, { login, password });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin', detail: String(err) });
  }
});

// PATCH /api/admin/admins/:id/toggle-status
router.patch('/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const admin = await adminService.toggleAdminStatus(req.params.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status', detail: String(err) });
  }
});

// DELETE /api/admin/admins/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await adminService.deleteAdmin(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Admin not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin', detail: String(err) });
  }
});

// POST /api/admin/admins/login  (used by the auth store)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body as { login?: string; password?: string };
    if (!login || !password) {
      return res.status(400).json({ error: 'login and password are required' });
    }
    const admin = await adminService.verifyAdmin(login, password);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: String(err) });
  }
});

export default router;
