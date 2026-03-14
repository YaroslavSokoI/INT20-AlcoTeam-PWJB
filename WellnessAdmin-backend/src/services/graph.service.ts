import pool from '../db/client.js';
import type {
  DbNode, DbEdge, DbOffer,
  CreateNodeBody, CreateEdgeBody, CreateOfferBody,
} from '../types/index.js';

// ---- NODES ------------------------------------------------

export async function getAllNodes(): Promise<DbNode[]> {
  const { rows } = await pool.query<DbNode>(
    'SELECT * FROM nodes ORDER BY created_at ASC',
  );
  return rows;
}

export async function getNodeById(id: string): Promise<DbNode | null> {
  const { rows } = await pool.query<DbNode>('SELECT * FROM nodes WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createNode(data: CreateNodeBody): Promise<DbNode> {
  const { rows } = await pool.query<DbNode>(
    `INSERT INTO nodes
      (type, title, description, question_type, options, attribute_key, pos_x, pos_y, is_start)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.type,
      data.title,
      data.description ?? null,
      data.question_type ?? null,
      data.options ? JSON.stringify(data.options) : null,
      data.attribute_key ?? null,
      data.pos_x ?? 0,
      data.pos_y ?? 0,
      data.is_start ?? false,
    ],
  );
  return rows[0];
}

export async function updateNode(id: string, data: Partial<CreateNodeBody>): Promise<DbNode | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed: (keyof CreateNodeBody)[] = [
    'type', 'title', 'description', 'question_type', 'options',
    'attribute_key', 'pos_x', 'pos_y', 'is_start',
  ];

  for (const key of allowed) {
    if (key in data) {
      const val = key === 'options' && data[key] != null
        ? JSON.stringify(data[key])
        : (data[key] as unknown);
      fields.push(`${key} = $${idx++}`);
      values.push(val);
    }
  }

  if (fields.length === 0) return getNodeById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query<DbNode>(
    `UPDATE nodes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteNode(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM nodes WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// ---- EDGES ------------------------------------------------

export async function getAllEdges(): Promise<DbEdge[]> {
  const { rows } = await pool.query<DbEdge>(
    'SELECT * FROM edges ORDER BY priority DESC, created_at ASC',
  );
  return rows;
}

export async function getEdgesBySource(sourceNodeId: string): Promise<DbEdge[]> {
  const { rows } = await pool.query<DbEdge>(
    'SELECT * FROM edges WHERE source_node_id = $1 ORDER BY priority DESC',
    [sourceNodeId],
  );
  return rows;
}

export async function createEdge(data: CreateEdgeBody): Promise<DbEdge> {
  const { rows } = await pool.query<DbEdge>(
    `INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [
      data.source_node_id,
      data.target_node_id,
      data.label ?? null,
      data.conditions != null ? JSON.stringify(data.conditions) : null,
      data.priority ?? 0,
    ],
  );
  return rows[0];
}

export async function updateEdge(id: string, data: Partial<CreateEdgeBody>): Promise<DbEdge | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if ('label' in data) { fields.push(`label = $${idx++}`); values.push(data.label ?? null); }
  if ('conditions' in data) {
    fields.push(`conditions = $${idx++}`);
    values.push(data.conditions != null ? JSON.stringify(data.conditions) : null);
  }
  if ('priority' in data) { fields.push(`priority = $${idx++}`); values.push(data.priority); }
  if ('source_node_id' in data) { fields.push(`source_node_id = $${idx++}`); values.push(data.source_node_id); }
  if ('target_node_id' in data) { fields.push(`target_node_id = $${idx++}`); values.push(data.target_node_id); }

  if (fields.length === 0) {
    const { rows } = await pool.query<DbEdge>('SELECT * FROM edges WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  values.push(id);
  const { rows } = await pool.query<DbEdge>(
    `UPDATE edges SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteEdge(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM edges WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// ---- OFFERS -----------------------------------------------

export async function getAllOffers(): Promise<DbOffer[]> {
  const { rows } = await pool.query<DbOffer>(
    'SELECT * FROM offers ORDER BY priority DESC, created_at ASC',
  );
  return rows;
}

export async function getOfferById(id: string): Promise<DbOffer | null> {
  const { rows } = await pool.query<DbOffer>('SELECT * FROM offers WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createOffer(data: CreateOfferBody): Promise<DbOffer> {
  const { rows } = await pool.query<DbOffer>(
    `INSERT INTO offers
      (name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      data.name,
      data.slug,
      data.description ?? null,
      data.digital_plan ?? null,
      data.physical_kit ?? null,
      data.why_text ?? null,
      data.cta_text ?? 'Start My Journey',
      data.conditions != null ? JSON.stringify(data.conditions) : null,
      data.priority ?? 0,
      data.is_addon ?? false,
    ],
  );
  return rows[0];
}

export async function updateOffer(id: string, data: Partial<CreateOfferBody>): Promise<DbOffer | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed: (keyof CreateOfferBody)[] = [
    'name', 'slug', 'description', 'digital_plan', 'physical_kit',
    'why_text', 'cta_text', 'priority', 'is_addon',
  ];
  for (const key of allowed) {
    if (key in data) { fields.push(`${key} = $${idx++}`); values.push(data[key] as unknown); }
  }
  if ('conditions' in data) {
    fields.push(`conditions = $${idx++}`);
    values.push(data.conditions != null ? JSON.stringify(data.conditions) : null);
  }

  if (fields.length === 0) return getOfferById(id);

  values.push(id);
  const { rows } = await pool.query<DbOffer>(
    `UPDATE offers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM offers WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

// ---- GRAPH (combined) -------------------------------------

export async function getFullGraph() {
  const [nodes, edges] = await Promise.all([getAllNodes(), getAllEdges()]);
  return { nodes, edges };
}
