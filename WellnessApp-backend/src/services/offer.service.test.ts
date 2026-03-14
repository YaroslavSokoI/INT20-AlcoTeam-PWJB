import { resolveOffers } from './offer.service.js';
import type { DbOffer } from '../types/index.js';

jest.mock('../db/client.js', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from '../db/client.js';
const mockQuery = pool.query as jest.Mock;

beforeEach(() => jest.clearAllMocks());

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeOffer(overrides: Partial<DbOffer>): DbOffer {
  return {
    id: 'offer-default',
    name: 'Test Offer',
    slug: 'test-offer',
    cta_text: 'Start',
    conditions: null,
    priority: 0,
    is_addon: false,
    created_at: '',
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('resolveOffers', () => {
  test('returns matching primary offer for given attributes', async () => {
    const offer = makeOffer({
      id: 'o1',
      slug: 'weight-loss-starter',
      conditions: { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' },
    });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const result = await resolveOffers({ goal: 'weight_loss' });

    expect(result.primary).toHaveLength(1);
    expect(result.primary[0].slug).toBe('weight-loss-starter');
    expect(result.addon).toBeNull();
  });

  test('excludes offer when condition does not match', async () => {
    const offer = makeOffer({
      conditions: { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' },
    });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const result = await resolveOffers({ goal: 'weight_loss' });

    expect(result.primary).toHaveLength(0);
    expect(result.addon).toBeNull();
  });

  test('null condition offer always matches (catch-all)', async () => {
    const offer = makeOffer({ conditions: null });
    mockQuery.mockResolvedValueOnce({ rows: [offer] });

    const result = await resolveOffers({ goal: 'anything' });

    expect(result.primary).toHaveLength(1);
  });

  test('returns multiple matching primary offers', async () => {
    const offers = [
      makeOffer({ id: 'o1', slug: 'offer-a', conditions: null }),
      makeOffer({ id: 'o2', slug: 'offer-b', conditions: null }),
    ];
    mockQuery.mockResolvedValueOnce({ rows: offers });

    const result = await resolveOffers({});

    expect(result.primary).toHaveLength(2);
  });

  test('separates addon from primary offers', async () => {
    const primary = makeOffer({ id: 'p1', slug: 'primary', conditions: null, is_addon: false });
    const addon = makeOffer({
      id: 'a1',
      slug: 'stress-reset-addon',
      is_addon: true,
      conditions: { type: 'simple', attribute: 'stress_level', op: 'eq', value: 'high' },
    });
    mockQuery.mockResolvedValueOnce({ rows: [primary, addon] });

    const result = await resolveOffers({ stress_level: 'high' });

    expect(result.primary).toHaveLength(1);
    expect(result.primary[0].slug).toBe('primary');
    expect(result.addon?.slug).toBe('stress-reset-addon');
  });

  test('addon not returned when its condition does not match', async () => {
    const addon = makeOffer({
      is_addon: true,
      conditions: { type: 'simple', attribute: 'stress_level', op: 'eq', value: 'high' },
    });
    mockQuery.mockResolvedValueOnce({ rows: [addon] });

    const result = await resolveOffers({ stress_level: 'low' });

    expect(result.addon).toBeNull();
    expect(result.primary).toHaveLength(0);
  });

  test('only first matching addon is returned', async () => {
    const addon1 = makeOffer({ id: 'a1', slug: 'addon-first', is_addon: true, conditions: null, priority: 10 });
    const addon2 = makeOffer({ id: 'a2', slug: 'addon-second', is_addon: true, conditions: null, priority: 5 });
    mockQuery.mockResolvedValueOnce({ rows: [addon1, addon2] });

    const result = await resolveOffers({});

    expect(result.addon?.slug).toBe('addon-first');
  });

  test('compound AND condition matched correctly', async () => {
    const offer = makeOffer({
      slug: 'lean-strength',
      conditions: {
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
    expect(result.addon).toBeNull();
  });
});
