import pool from '../db/client.js';
import type {
  DbNode, DbEdge,
  CreateNodeBody, CreateEdgeBody,
} from '../types/index.js';

// ---- NODES ------------------------------------------------

export async function getAllNodes(): Promise<DbNode[]> {
  const { rows } = await pool.query<DbNode>(
    'SELECT * FROM nodes_full ORDER BY created_at ASC',
  );
  return rows;
}

export async function getNodeById(id: string): Promise<DbNode | null> {
  const { rows } = await pool.query<DbNode>('SELECT * FROM nodes_full WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function createNode(data: CreateNodeBody): Promise<DbNode> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert base node
    const { rows } = await client.query<{ id: string; created_at: string; updated_at: string }>(
      `INSERT INTO nodes (type, pos_x, pos_y, is_start)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at, updated_at`,
      [data.type, data.pos_x ?? 0, data.pos_y ?? 0, data.is_start ?? false],
    );
    const nodeId = rows[0].id;

    // Insert type-specific row
    switch (data.type) {
      case 'question':
        await client.query(
          `INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            nodeId,
            data.title ?? '',
            data.question_type ?? null,
            data.options ? JSON.stringify(data.options) : null,
            data.attribute_key ?? null,
          ],
        );
        break;
      case 'info':
        await client.query(
          `INSERT INTO info_nodes (node_id, title, content) VALUES ($1, $2, $3)`,
          [nodeId, data.title ?? '', data.description ?? null],
        );
        break;
      case 'offer':
        await client.query(
          `INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            nodeId,
            data.title ?? '',
            data.description ?? null,
            data.cta_text ?? 'Start My Journey',
            data.attribute_key ?? null,
            data.digital_plan ?? null,
            data.physical_kit ?? null,
            data.why_text ?? null,
            data.offer_conditions != null ? JSON.stringify(data.offer_conditions) : null,
            data.offer_priority ?? 0,
          ],
        );
        break;
      case 'conditional':
        await client.query(
          `INSERT INTO conditional_nodes (node_id, title) VALUES ($1, $2)`,
          [nodeId, data.title ?? ''],
        );
        break;
      case 'delay':
        await client.query(
          `INSERT INTO delay_nodes (node_id, title, delay_seconds) VALUES ($1, $2, $3)`,
          [nodeId, data.title ?? '', data.delay_seconds ?? 0],
        );
        break;
    }

    await client.query('COMMIT');
    const node = await getNodeById(nodeId);
    return node!;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateNode(id: string, data: Partial<CreateNodeBody>): Promise<DbNode | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update base node if positional/type fields changed
    const baseFields: string[] = [];
    const baseValues: unknown[] = [];
    let idx = 1;

    if ('pos_x' in data) { baseFields.push(`pos_x = $${idx++}`); baseValues.push(data.pos_x); }
    if ('pos_y' in data) { baseFields.push(`pos_y = $${idx++}`); baseValues.push(data.pos_y); }
    if ('is_start' in data) { baseFields.push(`is_start = $${idx++}`); baseValues.push(data.is_start); }

    if (baseFields.length > 0) {
      baseFields.push(`updated_at = NOW()`);
      baseValues.push(id);
      await client.query(
        `UPDATE nodes SET ${baseFields.join(', ')} WHERE id = $${idx}`,
        baseValues,
      );
    }

    // Get current node type to update the right type-specific table
    const { rows: nodeRows } = await client.query<{ type: string }>(
      'SELECT type FROM nodes WHERE id = $1', [id],
    );
    if (!nodeRows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    const nodeType = nodeRows[0].type;

    switch (nodeType) {
      case 'question': {
        const qFields: string[] = [];
        const qValues: unknown[] = [];
        let qi = 1;
        if ('title' in data) { qFields.push(`title = $${qi++}`); qValues.push(data.title); }
        if ('question_type' in data) { qFields.push(`question_type = $${qi++}`); qValues.push(data.question_type ?? null); }
        if ('options' in data) { qFields.push(`options = $${qi++}`); qValues.push(data.options ? JSON.stringify(data.options) : null); }
        if ('attribute_key' in data) { qFields.push(`attribute_key = $${qi++}`); qValues.push(data.attribute_key ?? null); }
        if (qFields.length > 0) {
          qValues.push(id);
          await client.query(
            `UPDATE question_nodes SET ${qFields.join(', ')} WHERE node_id = $${qi}`,
            qValues,
          );
        }
        break;
      }
      case 'info': {
        const iFields: string[] = [];
        const iValues: unknown[] = [];
        let ii = 1;
        if ('title' in data) { iFields.push(`title = $${ii++}`); iValues.push(data.title); }
        if ('description' in data) { iFields.push(`content = $${ii++}`); iValues.push(data.description ?? null); }
        if (iFields.length > 0) {
          iValues.push(id);
          await client.query(
            `UPDATE info_nodes SET ${iFields.join(', ')} WHERE node_id = $${ii}`,
            iValues,
          );
        }
        break;
      }
      case 'offer': {
        const oFields: string[] = [];
        const oValues: unknown[] = [];
        let oi = 1;
        if ('title' in data) { oFields.push(`title = $${oi++}`); oValues.push(data.title); }
        if ('description' in data) { oFields.push(`description = $${oi++}`); oValues.push(data.description ?? null); }
        if ('cta_text' in data) { oFields.push(`cta_text = $${oi++}`); oValues.push(data.cta_text ?? null); }
        if ('attribute_key' in data) { oFields.push(`slug = $${oi++}`); oValues.push(data.attribute_key ?? null); }
        if ('digital_plan' in data) { oFields.push(`digital_plan = $${oi++}`); oValues.push(data.digital_plan ?? null); }
        if ('physical_kit' in data) { oFields.push(`physical_kit = $${oi++}`); oValues.push(data.physical_kit ?? null); }
        if ('why_text' in data) { oFields.push(`why_text = $${oi++}`); oValues.push(data.why_text ?? null); }
        if ('offer_conditions' in data) {
          oFields.push(`conditions = $${oi++}`);
          oValues.push(data.offer_conditions != null ? JSON.stringify(data.offer_conditions) : null);
        }
        if ('offer_priority' in data) { oFields.push(`priority = $${oi++}`); oValues.push(data.offer_priority ?? 0); }
        if (oFields.length > 0) {
          oValues.push(id);
          await client.query(
            `UPDATE offer_nodes SET ${oFields.join(', ')} WHERE node_id = $${oi}`,
            oValues,
          );
        }
        break;
      }
      case 'conditional': {
        if ('title' in data) {
          await client.query(
            `UPDATE conditional_nodes SET title = $1 WHERE node_id = $2`,
            [data.title, id],
          );
        }
        break;
      }
      case 'delay': {
        const dFields: string[] = [];
        const dValues: unknown[] = [];
        let di = 1;
        if ('title' in data) { dFields.push(`title = $${di++}`); dValues.push(data.title); }
        if ('delay_seconds' in data) { dFields.push(`delay_seconds = $${di++}`); dValues.push(data.delay_seconds ?? 0); }
        if (dFields.length > 0) {
          dValues.push(id);
          await client.query(
            `UPDATE delay_nodes SET ${dFields.join(', ')} WHERE node_id = $${di}`,
            dValues,
          );
        }
        break;
      }
    }

    await client.query('COMMIT');
    return getNodeById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteNode(id: string): Promise<boolean> {
  // CASCADE on type-specific tables handles cleanup
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
    `INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      data.source_node_id,
      data.target_node_id,
      data.label ?? null,
      data.conditions != null ? JSON.stringify(data.conditions) : null,
      data.priority ?? 0,
      data.source_handle ?? null,
      data.target_handle ?? null,
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
  if ('source_handle' in data) { fields.push(`source_handle = $${idx++}`); values.push(data.source_handle ?? null); }
  if ('target_handle' in data) { fields.push(`target_handle = $${idx++}`); values.push(data.target_handle ?? null); }

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

// ---- OFFERS (proxied to offer_nodes via nodes_full) -------

export async function getAllOffers(): Promise<DbNode[]> {
  const { rows } = await pool.query<DbNode>(
    "SELECT * FROM nodes_full WHERE type = 'offer' ORDER BY offer_priority DESC, created_at ASC",
  );
  return rows;
}

export async function getOfferById(id: string): Promise<DbNode | null> {
  const { rows } = await pool.query<DbNode>(
    "SELECT * FROM nodes_full WHERE id = $1 AND type = 'offer'", [id],
  );
  return rows[0] ?? null;
}

export async function createOffer(data: Partial<CreateNodeBody>): Promise<DbNode> {
  return createNode({ ...data, type: 'offer', title: data.title ?? '' });
}

export async function updateOffer(id: string, data: Partial<CreateNodeBody>): Promise<DbNode | null> {
  return updateNode(id, data);
}

export async function deleteOffer(id: string): Promise<boolean> {
  return deleteNode(id);
}

// ---- GRAPH (combined) -------------------------------------

export async function getFullGraph() {
  const [nodes, edges] = await Promise.all([getAllNodes(), getAllEdges()]);
  return { nodes, edges };
}
