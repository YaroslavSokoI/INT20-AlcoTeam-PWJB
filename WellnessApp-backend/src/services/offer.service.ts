import pool from '../db/client.js';
import { evaluate } from './rule-engine.js';
import type { DbOffer, OfferResult } from '../types/index.js';

export async function resolveOffers(
  attributes: Record<string, unknown>,
  lang?: string,
): Promise<OfferResult> {
  const { rows: offers } = await pool.query<DbOffer>(
    "SELECT * FROM published_nodes_full WHERE type = 'offer' ORDER BY offer_priority DESC, created_at ASC",
  );

  const primary: DbOffer[] = [];

  for (const offer of offers) {
    if (evaluate(offer.offer_conditions, attributes)) {
      // Apply translations if lang specified
      if (lang && lang !== 'en' && offer.translations) {
        const t = (offer.translations as Record<string, Record<string, unknown>>)[lang];
        if (t) {
          if (t.title) (offer as any).title = t.title;
          if (t.description) (offer as any).description = t.description;
          if (t.cta_text) (offer as any).cta_text = t.cta_text;
          if (t.digital_plan) (offer as any).digital_plan = t.digital_plan;
          if (t.physical_kit) (offer as any).physical_kit = t.physical_kit;
          if (t.why_text) (offer as any).why_text = t.why_text;
        }
      }
      primary.push(offer);
    }
  }

  return { primary };
}
