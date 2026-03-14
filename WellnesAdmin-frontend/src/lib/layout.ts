import dagre from 'dagre';
import type { FlowNode, FlowEdge } from '@/types';

const NODE_WIDTH = 260;
const NODE_HEIGHT = 200;

export function getAutoLayout(
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction: 'LR' | 'TB' = 'LR'
): FlowNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100, marginx: 40, marginy: 40 });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: node.width ?? NODE_WIDTH, height: node.height ?? NODE_HEIGHT });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (node.width ?? NODE_WIDTH) / 2,
        y: nodeWithPosition.y - (node.height ?? NODE_HEIGHT) / 2,
      },
    };
  });
}
