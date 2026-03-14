import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FlowStore, FlowNode, FlowEdge, FlowNodeData, NodeType } from '@/types';
import { SEED_NODES, SEED_EDGES } from '@/data/seedFlow';

type HistoryState = { nodes: FlowNode[]; edges: FlowEdge[] };

const DEFAULT_POSITIONS: Record<NodeType, { x: number; y: number }> = {
  question:    { x: 200, y: 300 },
  info:        { x: 400, y: 300 },
  offer:       { x: 600, y: 300 },
  result:      { x: 600, y: 500 },
  conditional: { x: 400, y: 500 },
  delay:       { x: 200, y: 500 },
};

type StoreExtended = FlowStore & {
  _snapshot: () => HistoryState;
  _pushHistory: () => void;
};

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: SEED_NODES,
  edges: SEED_EDGES,
  selectedNodeId: null,
  publishVersion: 3,
  isPublished: true,
  flowName: 'Wellness Onboarding v3',
  past: [],
  future: [],

  _snapshot(): HistoryState {
    return {
      nodes: get().nodes.map(n => ({ ...n, data: { ...n.data } })),
      edges: [...get().edges],
    };
  },

  _pushHistory() {
    const snap = (get() as StoreExtended)._snapshot();
    set(s => ({ past: [...s.past.slice(-50), snap], future: [] }));
  },

  addNode(type, position) {
    (get() as StoreExtended)._pushHistory();
    const id = type[0] + Date.now().toString(36);
    const pos = position ?? {
      x: DEFAULT_POSITIONS[type].x + Math.random() * 60,
      y: DEFAULT_POSITIONS[type].y + Math.random() * 60,
    };
    const newNode: FlowNode = {
      id,
      type,
      position: pos,
      data: {
        label: type === 'question' ? 'New Question' : type === 'info' ? 'Info Page' : type === 'offer' ? 'Offer' : type === 'result' ? 'Result' : type === 'conditional' ? 'Condition' : 'Delay',
        nodeType: type,
        questionText: type === 'question' ? 'Enter your question...' : undefined,
        answerType:   type === 'question' ? 'single' : undefined,
        options:      type === 'question' ? [{ id: uuidv4(), label: 'Option 1', value: 'option_1' }] : undefined,
        transitions:  [],
        content:      type === 'info' ? 'Enter content here...' : undefined,
        offerTitle:   type === 'offer' ? 'Special Offer' : undefined,
        offerDescription: type === 'offer' ? 'Limited time offer...' : undefined,
        ctaText:      type === 'offer' ? 'Get Started' : undefined,
        delaySeconds: type === 'delay' ? 5 : undefined,
      },
    };
    set(s => ({ nodes: [...s.nodes, newNode] }));
  },

  updateNodeData(id, data) {
    (get() as StoreExtended)._pushHistory();
    set(s => ({
      nodes: s.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
    }));
  },

  deleteNode(id) {
    (get() as StoreExtended)._pushHistory();
    set(s => ({
      nodes: s.nodes.filter(n => n.id !== id),
      edges: s.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  setSelectedNodeId(id) { set({ selectedNodeId: id }); },

  updateNodePositions(updates) {
    set(s => ({
      nodes: s.nodes.map(n => {
        const u = updates.find(u => u.id === n.id);
        return u ? { ...n, position: u.position } : n;
      }),
    }));
  },

  addEdge(edge) {
    (get() as StoreExtended)._pushHistory();
    const exists = get().edges.some(e => e.source === edge.source && e.target === edge.target && e.sourceHandle === edge.sourceHandle);
    if (exists) return;
    set(s => ({ edges: [...s.edges, { ...edge, id: 'e' + Date.now().toString(36) }] }));
  },

  deleteEdge(id) {
    (get() as StoreExtended)._pushHistory();
    set(s => ({ edges: s.edges.filter(e => e.id !== id) }));
  },

  undo() {
    const { past, nodes, edges } = get();
    if (!past.length) return;
    const prev = past[past.length - 1];
    set({ nodes: prev.nodes, edges: prev.edges, past: past.slice(0, -1), future: [{ nodes, edges }, ...get().future.slice(0, 49)] });
  },

  redo() {
    const { future, nodes, edges } = get();
    if (!future.length) return;
    const next = future[0];
    set({ nodes: next.nodes, edges: next.edges, past: [...get().past.slice(-50), { nodes, edges }], future: future.slice(1) });
  },

  publish() { set(s => ({ isPublished: true, publishVersion: s.publishVersion + 1 })); },
  setFlowNodes(nodes) { set({ nodes }); },
  setFlowEdges(edges) { set({ edges }); },
}));

export const selectSelectedNode = (store: FlowStore) =>
  store.selectedNodeId ? store.nodes.find(n => n.id === store.selectedNodeId) ?? null : null;
