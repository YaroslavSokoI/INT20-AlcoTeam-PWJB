import { evaluate, resolveNextEdge } from './rule-engine.js';
import type { Condition, DbEdge } from '../types/index.js';

describe('evaluate', () => {
  test('null condition is always true', () => {
    expect(evaluate(null, {})).toBe(true);
    expect(evaluate(null, { goal: 'strength' })).toBe(true);
  });

  describe('simple conditions', () => {
    test('eq — match', () => {
      const c: Condition = { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' };
      expect(evaluate(c, { goal: 'weight_loss' })).toBe(true);
    });

    test('eq — no match', () => {
      const c: Condition = { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' };
      expect(evaluate(c, { goal: 'strength' })).toBe(false);
    });

    test('neq', () => {
      const c: Condition = { type: 'simple', attribute: 'goal', op: 'neq', value: 'weight_loss' };
      expect(evaluate(c, { goal: 'strength' })).toBe(true);
      expect(evaluate(c, { goal: 'weight_loss' })).toBe(false);
    });

    test('in — value present in array', () => {
      const c: Condition = { type: 'simple', attribute: 'injuries', op: 'in', value: ['knee', 'back'] };
      expect(evaluate(c, { injuries: 'knee' })).toBe(true);
      expect(evaluate(c, { injuries: 'back' })).toBe(true);
      expect(evaluate(c, { injuries: 'none' })).toBe(false);
    });

    test('nin — value not in array', () => {
      const c: Condition = { type: 'simple', attribute: 'injuries', op: 'nin', value: ['knee', 'back'] };
      expect(evaluate(c, { injuries: 'none' })).toBe(true);
      expect(evaluate(c, { injuries: 'knee' })).toBe(false);
    });

    test('contains', () => {
      const c: Condition = { type: 'simple', attribute: 'note', op: 'contains', value: 'pain' };
      expect(evaluate(c, { note: 'lower back pain' })).toBe(true);
      expect(evaluate(c, { note: 'feeling great' })).toBe(false);
    });

    test('gt / lt / gte / lte', () => {
      const gt: Condition = { type: 'simple', attribute: 'age', op: 'gt', value: 30 };
      expect(evaluate(gt, { age: 35 })).toBe(true);
      expect(evaluate(gt, { age: 25 })).toBe(false);

      const lte: Condition = { type: 'simple', attribute: 'age', op: 'lte', value: 30 };
      expect(evaluate(lte, { age: 30 })).toBe(true);
      expect(evaluate(lte, { age: 31 })).toBe(false);
    });

    test('missing attribute returns false for non-null conditions', () => {
      const c: Condition = { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' };
      expect(evaluate(c, {})).toBe(false);
    });
  });

  describe('compound conditions', () => {
    const goalStrength: Condition = { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' };
    const contextGym: Condition = { type: 'simple', attribute: 'context', op: 'eq', value: 'gym' };

    test('AND — both pass', () => {
      const c: Condition = { type: 'compound', operator: 'AND', conditions: [goalStrength, contextGym] };
      expect(evaluate(c, { goal: 'strength', context: 'gym' })).toBe(true);
    });

    test('AND — one fails', () => {
      const c: Condition = { type: 'compound', operator: 'AND', conditions: [goalStrength, contextGym] };
      expect(evaluate(c, { goal: 'strength', context: 'home' })).toBe(false);
    });

    test('OR — one passes', () => {
      const c: Condition = { type: 'compound', operator: 'OR', conditions: [goalStrength, contextGym] };
      expect(evaluate(c, { goal: 'strength', context: 'home' })).toBe(true);
    });

    test('OR — none pass', () => {
      const c: Condition = { type: 'compound', operator: 'OR', conditions: [goalStrength, contextGym] };
      expect(evaluate(c, { goal: 'flexibility', context: 'home' })).toBe(false);
    });

    test('nested AND inside OR', () => {
      const nested: Condition = {
        type: 'compound',
        operator: 'OR',
        conditions: [
          { type: 'compound', operator: 'AND', conditions: [goalStrength, contextGym] },
          { type: 'simple', attribute: 'goal', op: 'eq', value: 'flexibility' },
        ],
      };
      expect(evaluate(nested, { goal: 'strength', context: 'gym' })).toBe(true);
      expect(evaluate(nested, { goal: 'flexibility', context: 'home' })).toBe(true);
      expect(evaluate(nested, { goal: 'endurance', context: 'home' })).toBe(false);
    });
  });
});

describe('resolveNextEdge', () => {
  const makeEdge = (id: string, priority: number, conditions: Condition | null): DbEdge => ({
    id,
    source_node_id: 'src',
    target_node_id: `target-${id}`,
    conditions,
    priority,
    created_at: '',
  });

  test('returns null when no edges match', () => {
    const edges = [
      makeEdge('e1', 5, { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' }),
    ];
    expect(resolveNextEdge(edges, { goal: 'flexibility' })).toBeNull();
  });

  test('null condition edge matches always (default fallback)', () => {
    const edges = [makeEdge('e1', 0, null)];
    expect(resolveNextEdge(edges, {})).toEqual(edges[0]);
  });

  test('higher priority edge wins over lower priority', () => {
    const edges = [
      makeEdge('low', 0, null),
      makeEdge('high', 10, { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' }),
    ];
    const result = resolveNextEdge(edges, { goal: 'strength' });
    expect(result?.id).toBe('high');
  });

  test('specific condition wins over null at same inputs, lower priority falls through to null', () => {
    const edges = [
      makeEdge('specific', 10, { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' }),
      makeEdge('default', 0, null),
    ];
    // No match for specific → falls to default
    const result = resolveNextEdge(edges, { goal: 'flexibility' });
    expect(result?.id).toBe('default');
  });
});
