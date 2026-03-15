import { Router, Request, Response } from 'express';
import pool from '../db/client.js';

const router = Router();

// GET /api/admin/analytics/stats
// Returns completion rate, total users, and per-day session stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || '30D';

    // Calculate date filter
    let dateFilter = '';
    if (range === '7D') dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    else if (range === '30D') dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    else if (range === '90D') dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
    // 'ALL' = no filter

    // Total sessions, completion rate & avg completion time
    const { rows: [totals] } = await pool.query(`
      SELECT
        COUNT(*)::int AS total_sessions,
        COUNT(*) FILTER (WHERE completed = TRUE)::int AS completed_sessions,
        ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60.0)
          FILTER (WHERE completed = TRUE AND completed_at IS NOT NULL))::int AS avg_completion_min
      FROM sessions
      WHERE 1=1 ${dateFilter}
    `);

    const completionRate = totals.total_sessions > 0
      ? Math.round((totals.completed_sessions / totals.total_sessions) * 100)
      : 0;

    // Top goal answers (most popular attribute value for 'goal')
    const { rows: topGoals } = await pool.query<{ label: string; count: number }>(`
      SELECT value::text AS label, COUNT(*)::int AS count
      FROM answers
      WHERE attribute_key = 'goal'
        ${dateFilter.replace(/created_at/g, 'answers.created_at')}
      GROUP BY value
      ORDER BY count DESC
      LIMIT 5
    `);

    // Weekly completion trend (last 8 weeks)
    const { rows: weeklyTrend } = await pool.query<{ week: string; total: number; completed: number }>(`
      SELECT
        TO_CHAR(date_trunc('week', created_at), 'IYYY-"W"IW') AS week,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE completed = TRUE)::int AS completed
      FROM sessions
      WHERE created_at >= NOW() - INTERVAL '8 weeks'
      GROUP BY week
      ORDER BY week
    `);

    // Drop-off: count sessions stuck at each node
    const { rows: dropoffs } = await pool.query<{ node_title: string; attribute_key: string | null; node_type: string; stuck_count: number }>(`
      SELECT n.title AS node_title, n.attribute_key, n.type AS node_type, COUNT(*)::int AS stuck_count
      FROM sessions s
      JOIN nodes_full n ON n.id = s.current_node_id
      WHERE s.completed = FALSE AND s.current_node_id IS NOT NULL
        ${dateFilter.replace(/created_at/g, 's.created_at')}
      GROUP BY n.title, n.attribute_key, n.type
      ORDER BY stuck_count DESC
    `);

    // Device types
    const { rows: devices } = await pool.query<{ label: string; count: number }>(`
      SELECT COALESCE(device_type, 'unknown') AS label, COUNT(*)::int AS count
      FROM sessions
      WHERE 1=1 ${dateFilter}
      GROUP BY label
      ORDER BY count DESC
    `);

    // Sources (in_app browser)
    const { rows: sources } = await pool.query<{ label: string; count: number }>(`
      SELECT COALESCE(in_app, 'direct') AS label, COUNT(*)::int AS count
      FROM sessions
      WHERE 1=1 ${dateFilter}
      GROUP BY label
      ORDER BY count DESC
    `);

    // Languages (normalize xx-YY to xx)
    const { rows: languages } = await pool.query<{ label: string; count: number }>(`
      SELECT LOWER(SPLIT_PART(COALESCE(language, 'unknown'), '-', 1)) AS label, COUNT(*)::int AS count
      FROM sessions
      WHERE 1=1 ${dateFilter}
      GROUP BY label
      ORDER BY count DESC
      LIMIT 10
    `);

    // Age range distribution (from answers)
    const { rows: ageRange } = await pool.query<{ label: string; count: number }>(`
      SELECT value::text AS label, COUNT(*)::int AS count
      FROM answers
      WHERE attribute_key = 'age'
        ${dateFilter.replace(/created_at/g, 'answers.created_at')}
      GROUP BY value
      ORDER BY count DESC
    `);

    res.json({
      totalSessions: totals.total_sessions,
      completedSessions: totals.completed_sessions,
      completionRate,
      avgCompletionMin: totals.avg_completion_min ?? null,
      topGoals: topGoals.map(r => ({
        label: r.label.replace(/"/g, ''),
        count: r.count,
      })),
      weeklyTrend: weeklyTrend.map(r => ({
        week: r.week,
        rate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
      })),
      dropoffs: dropoffs.map((d, i) => ({
        step: i + 1,
        title: d.node_title,
        attributeKey: d.attribute_key,
        type: d.node_type,
        count: d.stuck_count,
      })),
      devices: devices.map(r => ({ label: r.label, count: r.count })),
      sources: sources.map(r => ({ label: r.label, count: r.count })),
      languages: languages.map(r => ({ label: r.label, count: r.count })),
      ageRange: ageRange.map(r => ({ label: r.label.replace(/"/g, ''), count: r.count })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', detail: String(err) });
  }
});

router.get('/offer-stats', async (_req: Request, res: Response) => {
  try {
    const { rows: [counts] } = await pool.query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE completed = TRUE)::int AS completed_users,
        COUNT(*) FILTER (WHERE offer_accepted = TRUE)::int AS accepted_plans
      FROM sessions
    `);
    res.json({
      totalUsers: counts.total_users,
      completedUsers: counts.completed_users,
      acceptedPlans: counts.accepted_plans,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offer stats', detail: String(err) });
  }
});

export default router;
