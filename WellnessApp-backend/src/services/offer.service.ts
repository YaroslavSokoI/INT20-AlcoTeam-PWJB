import pool from '../db/client.js';
import { evaluate } from './rule-engine.js';
import type { DbOffer, OfferResult } from '../types/index.js';

/**
 * Resolves the personalized offer(s) for a completed session.
 *
 * Primary offers: evaluated in priority order; all matching are returned.
 * Addon offer: is_addon=true, first match (e.g. Stress Reset when stress_level=high).
 */
export async function resolveOffers(
  attributes: Record<string, unknown>,
): Promise<OfferResult> {
  const { rows: offers } = await pool.query<DbOffer>(
    'SELECT * FROM offers ORDER BY priority DESC, created_at ASC',
  );

  const primary: DbOffer[] = [];
  let addon: DbOffer | null = null;

  for (const offer of offers) {
    const matches = evaluate(offer.conditions, attributes);
    if (!matches) continue;

    if (offer.is_addon) {
      if (addon === null) addon = offer; // first matching addon wins
    } else {
      primary.push(offer);
    }
  }

  return { primary, addon };
}
