import type { FlowNode, FlowEdge, FlowNodeData, NodeType } from './node.types.ts';

export interface FlowStore {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  publishVersion: number;
  isPublished: boolean;
  flowName: string;
  past: Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>;
  future: Array<{ nodes: FlowNode[]; edges: FlowEdge[] }>;

  isLoading: boolean;
  loadFlow: () => Promise<void>;

  addNode: (type: NodeType, position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<FlowNodeData>) => void;
  deleteNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  updateEdgeData: (id: string, data: Partial<FlowEdge['data']> & { label?: string; sourceHandle?: string | null }) => Promise<void>;
  updateNodePositions: (updates: Array<{ id: string; position: { x: number; y: number } }>) => void;

  addEdge: (edge: Omit<FlowEdge, 'id'>) => void;
  deleteEdge: (id: string) => void;

  undo: () => void;
  redo: () => void;

  publish: () => void;
  setFlowNodes: (nodes: FlowNode[]) => void;
  setFlowEdges: (edges: FlowEdge[]) => void;
}
