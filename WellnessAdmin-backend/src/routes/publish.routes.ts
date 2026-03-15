import { Router, Request, Response } from 'express';
import pool from '../db/client.js';

const router = Router();

// POST /api/admin/publish
// Atomically copies all draft tables → published_* tables
router.post('/', async (_req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Truncate all published tables (order matters: type-specific before base)
    await client.query(`
      TRUNCATE
        published_question_nodes,
        published_info_nodes,
        published_offer_nodes,
        published_conditional_nodes,
        published_nodes,
        published_edges
      CASCADE
    `);

    // Copy base nodes
    await client.query(`
      INSERT INTO published_nodes (id, type, pos_x, pos_y, is_start, created_at, updated_at)
      SELECT id, type, pos_x, pos_y, is_start, created_at, updated_at FROM nodes
    `);

    // Copy type-specific tables
    await client.query(`
      INSERT INTO published_question_nodes (node_id, title, question_type, options, attribute_key, translations)
      SELECT node_id, title, question_type, options, attribute_key, translations FROM question_nodes
    `);
    await client.query(`
      INSERT INTO published_info_nodes (node_id, title, content, translations)
      SELECT node_id, title, content, translations FROM info_nodes
    `);
    await client.query(`
      INSERT INTO published_offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority, translations)
      SELECT node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority, translations FROM offer_nodes
    `);
    await client.query(`
      INSERT INTO published_conditional_nodes (node_id, title, translations)
      SELECT node_id, title, translations FROM conditional_nodes
    `);
    // Copy edges
    await client.query(`INSERT INTO published_edges SELECT * FROM edges`);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Publish failed', detail: String(err) });
  } finally {
    client.release();
  }
});

export default router;
