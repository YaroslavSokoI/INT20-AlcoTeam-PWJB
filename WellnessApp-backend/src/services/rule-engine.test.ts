import { evaluate, resolveNextEdge } from './rule-engine.js';
import type { Condition, DbEdge } from '../types/index.js';

describe('evaluate', () => {
  test('null condition is always true', () => {
    expect(evaluate(null, {})).toBe(true);
  });

  test('eq match / no-match', () => {
    const c: Condition = { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' };
    expect(evaluate(c, { goal: 'weight_loss' })).toBe(true);
    expect(evaluate(c, { goal: 'strength' })).toBe(false);
  });

  test('in — value in array', () => {
    const c: Condition = { type: 'simple', attribute: 'injuries', op: 'in', value: ['knee', 'back'] };
    expect(evaluate(c, { injuries: 'knee' })).toBe(true);
    expect(evaluate(c, { injuries: 'none' })).toBe(false);
  });

  test('AND compound', () => {
    const c: Condition = {
      type: 'compound', operator: 'AND',
      conditions: [
        { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' },
        { type: 'simple', attribute: 'context', op: 'eq', value: 'gym' },
      ],
    };
    expect(evaluate(c, { goal: 'strength', context: 'gym' })).toBe(true);
    expect(evaluate(c, { goal: 'strength', context: 'home' })).toBe(false);
  });

  test('OR compound', () => {
    const c: Condition = {
      type: 'compound', operator: 'OR',
      conditions: [
        { type: 'simple', attribute: 'goal', op: 'eq', value: 'stress_relief' },
        { type: 'simple', attribute: 'stress_level', op: 'eq', value: 'high' },
      ],
    };
    expect(evaluate(c, { goal: 'weight_loss', stress_level: 'high' })).toBe(true);
    expect(evaluate(c, { goal: 'flexibility', stress_level: 'low' })).toBe(false);
  });
});

describe('resolveNextEdge', () => {
  const makeEdge = (id: string, priority: number, conditions: Condition | null): DbEdge => ({
    id, source_node_id: 'src', target_node_id: `target-${id}`,
    conditions, priority, created_at: '',
  });

  test('null condition = default always matches', () => {
    const edges = [makeEdge('e1', 0, null)];
    expect(resolveNextEdge(edges, {})).toEqual(edges[0]);
  });

  test('higher priority wins', () => {
    const edges = [
      makeEdge('low', 0, null),
      makeEdge('high', 10, { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' }),
    ];
    expect(resolveNextEdge(edges, { goal: 'strength' })?.id).toBe('high');
  });

  test('falls through to default when no specific match', () => {
    const edges = [
      makeEdge('specific', 10, { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' }),
      makeEdge('default', 0, null),
    ];
    expect(resolveNextEdge(edges, { goal: 'flexibility' })?.id).toBe('default');
  });

  test('returns null when nothing matches', () => {
    const edges = [
      makeEdge('e1', 5, { type: 'simple', attribute: 'goal', op: 'eq', value: 'strength' }),
    ];
    expect(resolveNextEdge(edges, { goal: 'flexibility' })).toBeNull();
  });
});
