import pool from '../db/client.js';
import { evaluate } from './rule-engine.js';
import type { DbOffer, OfferResult } from '../types/index.js';

export async function resolveOffers(
  attributes: Record<string, unknown>,
): Promise<OfferResult> {
  const { rows: offers } = await pool.query<DbOffer>(
    "SELECT * FROM published_nodes_full WHERE type = 'offer' ORDER BY offer_priority DESC, created_at ASC",
  );

  const primary: DbOffer[] = [];

  for (const offer of offers) {
    if (evaluate(offer.offer_conditions, attributes)) {
      primary.push(offer);
    }
  }

  return { primary };
}
