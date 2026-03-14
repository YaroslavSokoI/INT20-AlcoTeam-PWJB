import { resolveOffers } from './offer.service.js';
import type { DbOffer } from '../types/index.js';

jest.mock('../db/client.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from '../db/client.js';
const mockQuery = pool.query as jest.Mock;

beforeEach(() => jest.clearAllMocks());

function makeOffer(overrides: Partial<DbOffer>): DbOffer {
  return {
    id: 'offer-default',
    title: 'Test Offer',
    cta_text: 'Start',
    offer_conditions: null,
    offer_priority: 0,
    created_at: '',
    ...overrides,
  };
}

describe('resolveOffers', () => {
  test('returns matching primary offer for given attributes', async () => {
    const offer = makeOffer({
      id: 'o1',
      attribute_key: 'weight-loss-starter',
      offer_conditions: { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' },
    });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const result = await resolveOffers({ goal: 'weight_loss' });

    expect(result.primary).toHaveLength(1);
    expect(result.primary[0].attribute_key).toBe('weight-loss-starter');
  });

  test('excludes offer when condition does not match', async () => {
    const offer = makeOffer({
      offer_conditions: { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' },
    });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const result = await resolveOffers({ goal: 'weight_loss' });

    expect(result.primary).toHaveLength(0);
  });

  test('null condition offer always matches (catch-all)', async () => {
    const offer = makeOffer({ offer_conditions: null });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const result = await resolveOffers({ goal: 'anything' });

    expect(result.primary).toHaveLength(1);
  });

  test('returns multiple matching primary offers', async () => {
    const offers = [
      makeOffer({ id: 'o1', offer_conditions: null }),
      makeOffer({ id: 'o2', offer_conditions: null }),
    ];
    mockQuery.mockResolvedValueOnce({ rows: offers });

    const result = await resolveOffers({});

    expect(result.primary).toHaveLength(2);
  });

  test('compound AND condition matched correctly', async () => {
    const offer = makeOffer({
      offer_conditions: {
        type: 'compound',
        operator: 'AND',
        conditions: [
          { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' },
          { type: 'simple', attribute: 'context', op: 'eq', value: 'gym' },
        ],
      },
    });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const match = await resolveOffers({ goal: 'strength', context: 'gym' });
    expect(match.primary).toHaveLength(1);

    mockQuery.mockResolvedValueOnce({ rows: [offer] });
    const noMatch = await resolveOffers({ goal: 'strength', context: 'home' });
    expect(noMatch.primary).toHaveLength(0);
  });

  test('empty offers list returns empty result', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await resolveOffers({ goal: 'weight_loss' });

    expect(result.primary).toHaveLength(0);
  });
});
