import pool from '../db/client.js';
import bcrypt from 'bcrypt';

export interface DbAdmin {
  id: string;
  login: string;
  password_hash: string;
  status: 'active' | 'suspended';
  created_at: Date;
  last_login?: Date;
}

const SALT_ROUNDS = 10;

export async function getAllAdmins(): Promise<Omit<DbAdmin, 'password_hash'>[]> {
  const { rows } = await pool.query(
    'SELECT id, login, status, created_at, last_login FROM admins ORDER BY created_at ASC'
  );
  return rows;
}

export async function getAdminById(id: string): Promise<Omit<DbAdmin, 'password_hash'> | null> {
  const { rows } = await pool.query(
    'SELECT id, login, status, created_at, last_login FROM admins WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function getAdminByLogin(login: string): Promise<DbAdmin | null> {
  const { rows } = await pool.query<DbAdmin>(
    'SELECT * FROM admins WHERE login = $1',
    [login]
  );
  return rows[0] ?? null;
}

export async function createAdmin(login: string, password: string): Promise<Omit<DbAdmin, 'password_hash'>> {
  const existing = await getAdminByLogin(login);
  if (existing) throw new Error('Login already taken');

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO admins (login, password_hash, status)
     VALUES ($1, $2, 'active')
     RETURNING id, login, status, created_at, last_login`,
    [login, hash]
  );
  return rows[0];
}

export async function updateAdmin(
  id: string,
  data: { login?: string; password?: string }
): Promise<Omit<DbAdmin, 'password_hash'> | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.login !== undefined) {
    fields.push(`login = $${idx++}`);
    values.push(data.login);
  }
  if (data.password !== undefined && data.password.length > 0) {
    const hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    fields.push(`password_hash = $${idx++}`);
    values.push(hash);
  }

  if (fields.length === 0) return getAdminById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE admins SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, login, status, created_at, last_login`,
    values
  );
  return rows[0] ?? null;
}

export async function toggleAdminStatus(id: string): Promise<Omit<DbAdmin, 'password_hash'> | null> {
  const { rows } = await pool.query(
    `UPDATE admins
     SET status = CASE WHEN status = 'active' THEN 'suspended' ELSE 'active' END
     WHERE id = $1
     RETURNING id, login, status, created_at, last_login`,
    [id]
  );
  return rows[0] ?? null;
}

export async function deleteAdmin(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM admins WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function verifyAdmin(login: string, password: string): Promise<Omit<DbAdmin, 'password_hash'> | null> {
  const admin = await getAdminByLogin(login);
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return null;
  // Update last_login
  await pool.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]);
  return { id: admin.id, login: admin.login, status: admin.status, created_at: admin.created_at };
}

export async function ensureDefaultAdmin(): Promise<void> {
  try {
    // Check if table exists, if not create it
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        login         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        last_login    TIMESTAMPTZ
      );
    `);

    const { rows } = await pool.query('SELECT count(*) FROM admins');
    const count = parseInt(rows[0].count, 10);
    
    if (count === 0) {
      console.log('No admins found. Creating default admin:admin account...');
      await createAdmin('admin', 'admin');
    }
  } catch (err) {
    console.error('Failed to ensure default admin:', err);
  }
}
