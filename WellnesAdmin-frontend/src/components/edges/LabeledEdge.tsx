import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export const LabeledEdge = memo(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12 });
  const label = (data as { label?: string } | undefined)?.label;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: selected ? 'var(--color-node-question)' : 'var(--color-border-2)', strokeWidth: selected ? 2.5 : 1.5, transition: 'stroke .15s' }} />
      {label && (
        <EdgeLabelRenderer>
          <div style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }} className="nodrag nopan">
            <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[9px] font-medium text-[var(--color-text-muted)] whitespace-nowrap shadow-sm">
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
LabeledEdge.displayName = 'LabeledEdge';
