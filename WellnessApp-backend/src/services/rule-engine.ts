import type { Condition, SimpleCondition, CompoundCondition, DbEdge } from '../types/index.js';

export function evaluate(
  condition: Condition | null,
  attrs: Record<string, unknown>,
): boolean {
  if (condition === null || condition === undefined) return true;
  if (condition.type === 'compound') return evaluateCompound(condition, attrs);
  return evaluateSimple(condition, attrs);
}

function evaluateSimple(cond: SimpleCondition, attrs: Record<string, unknown>): boolean {
  const actual = attrs[cond.attribute];
  const expected = cond.value;

  switch (cond.op) {
    case 'eq':      return actual === expected;
    case 'neq':     return actual !== expected;
    case 'in':      return Array.isArray(expected) && expected.includes(actual);
    case 'nin':     return Array.isArray(expected) && !expected.includes(actual);
    case 'contains':
      return typeof actual === 'string' && typeof expected === 'string'
        ? actual.toLowerCase().includes(expected.toLowerCase())
        : false;
    case 'gt':  return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case 'lt':  return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case 'gte': return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    case 'lte': return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    default:    return false;
  }
}

function evaluateCompound(cond: CompoundCondition, attrs: Record<string, unknown>): boolean {
  return cond.operator === 'AND'
    ? cond.conditions.every((c) => evaluate(c, attrs))
    : cond.conditions.some((c) => evaluate(c, attrs));
}

export function resolveNextEdge(
  edges: DbEdge[],
  attrs: Record<string, unknown>,
): DbEdge | null {
  const sorted = [...edges].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.conditions === null && b.conditions !== null) return 1;
    if (a.conditions !== null && b.conditions === null) return -1;
    return 0;
  });

  for (const edge of sorted) {
    if (evaluate(edge.conditions, attrs)) return edge;
  }
  return null;
}
