import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { FlowStore, FlowNode, FlowEdge, FlowNodeData, NodeType } from '@/types';
import { apiService } from '@/services/api';
import { mapFrontendNodeToBackend, mapFrontendEdgeToBackend } from '@/services/transformers';

type HistoryState = { nodes: FlowNode[]; edges: FlowEdge[] };

const DEFAULT_POSITIONS: Record<NodeType, { x: number; y: number }> = {
  question: { x: 200, y: 300 },
  info: { x: 400, y: 300 },
  offer: { x: 600, y: 300 },
  conditional: { x: 400, y: 500 },
  delay: { x: 200, y: 500 },
};

type StoreExtended = FlowStore & {
  _snapshot: () => HistoryState;
  _pushHistory: () => void;
};

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  publishVersion: 1,
  isPublished: true,
  flowName: 'Wellness Onboarding v3',
  past: [],
  future: [],
  isLoading: false,

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

  async loadFlow() {
    set({ isLoading: true });
    try {
      const graph = await apiService.getGraph();
      set({ nodes: graph.nodes, edges: graph.edges, isLoading: false, past: [], future: [] });
    } catch (error) {
      console.error('Failed to load graph:', error);
      set({ isLoading: false });
    }
  },

  async addNode(type, position) {
    (get() as StoreExtended)._pushHistory();
    const pos = position ?? {
      x: DEFAULT_POSITIONS[type].x + Math.random() * 60,
      y: DEFAULT_POSITIONS[type].y + Math.random() * 60,
    };

    // Create optimistic local node
    const tempId = uuidv4();
    const newNode: FlowNode = {
      id: tempId,
      type,
      position: pos,
      data: {
        label: type === 'question' ? 'New Question' : type === 'info' ? 'Info Page' : 'Node',
        nodeType: type,
        questionText: type === 'question' ? 'Enter question...' : undefined,
        answerType: type === 'question' ? 'single' : undefined,
        options: type === 'question' ? [{ id: uuidv4(), label: 'Option 1', value: 'option_1' }] : undefined,
      },
    };

    // Preemptively add to UI to feel fast
    set(s => ({ nodes: [...s.nodes, newNode] }));

    try {
      const backendData = mapFrontendNodeToBackend(newNode);
      const created = await apiService.createNode(backendData);

      // Update UI node with real backend ID and data
      set(s => ({
        nodes: s.nodes.map(n => n.id === tempId ? { ...n, id: created.id } : n),
        // If it was selected immediately, keep it selected under the new ID
        selectedNodeId: s.selectedNodeId === tempId ? created.id : s.selectedNodeId
      }));
    } catch (error) {
      console.error('Error creating node', error);
      // Rollback
      set(s => ({ nodes: s.nodes.filter(n => n.id !== tempId) }));
    }
  },

  async updateNodeData(id, data) {
    (get() as StoreExtended)._pushHistory();
    set(s => ({
      nodes: s.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n),
    }));

    const node = get().nodes.find(n => n.id === id);
    if (node) {
      try {
        await apiService.updateNode(id, mapFrontendNodeToBackend(node));
      } catch (error) {
        console.error('Failed to sync node update', error);
      }

    }
  },

  async deleteNode(id) {
    (get() as StoreExtended)._pushHistory();
    // Optimistic delete
    set(s => ({
      nodes: s.nodes.filter(n => n.id !== id),
      edges: s.edges.filter(e => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));

    try {
      await apiService.deleteNode(id);
    } catch (e) {
      console.error('Failed to delete node', e);
      // To strictly revert, we'd fire an undo, but skipping for simplicity
    }
  },

  setSelectedNodeId(id) { set({ selectedNodeId: id, selectedEdgeId: null }); },
  setSelectedEdgeId(id) { set({ selectedEdgeId: id, selectedNodeId: null }); },

  async updateEdgeData(id, patch) {
    set(s => ({
      edges: s.edges.map(e => e.id === id ? {
        ...e,
        label: 'label' in patch ? (patch as any).label : e.label,
        sourceHandle: 'sourceHandle' in patch ? (patch as any).sourceHandle : e.sourceHandle,
        data: { ...e.data, ...patch },
      } : e),
    }));
    const edge = get().edges.find(e => e.id === id);
    if (edge) {
      try {
        const { mapFrontendEdgeToBackend } = await import('@/services/transformers');
        await apiService.updateEdge(id, mapFrontendEdgeToBackend(edge));
      } catch (err) {
        console.error('Failed to sync edge update', err);
      }
    }
  },

  updateNodePositions(updates) {
    set(s => ({
      nodes: s.nodes.map(n => {
        const u = updates.find(u => u.id === n.id);
        return u ? { ...n, position: u.position } : n;
      }),
    }));
    // We should sync position updates to the backend too
    updates.forEach(async (u) => {
      const node = get().nodes.find(n => n.id === u.id);
      if (node) {
        try {
          // Minimal backend payload for position update
          await apiService.updateNode(u.id, { pos_x: Math.round(u.position.x), pos_y: Math.round(u.position.y) });
        } catch (e) {
          console.error('Sync position error', e);
        }
      }
    });
  },

  async addEdge(edge) {
    (get() as StoreExtended)._pushHistory();
    const exists = get().edges.some(e => e.source === edge.source && e.target === edge.target && e.sourceHandle === edge.sourceHandle);
    if (exists) return;

    const tempId = 'e_' + uuidv4();
    const newEdge: FlowEdge = { ...edge, id: tempId };
    set(s => ({ edges: [...s.edges, newEdge] }));

    try {
      const created = await apiService.createEdge(mapFrontendEdgeToBackend(newEdge));
      set(s => ({
        edges: s.edges.map(e => e.id === tempId ? { ...e, id: created.id } : e)
      }));
    } catch (error) {
      console.error('Failed to create edge', error);
      set(s => ({ edges: s.edges.filter(e => e.id !== tempId) }));
    }
  },

  async deleteEdge(id) {
    (get() as StoreExtended)._pushHistory();
    set(s => ({ edges: s.edges.filter(e => e.id !== id) }));
    try {
      await apiService.deleteEdge(id);
    } catch (e) {
      console.error('Failed to delete edge', e);
    }
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

  async publish() {
    try {
      await apiService.publish();
      set(s => ({ isPublished: true, publishVersion: s.publishVersion + 1 }));
      alert('Changes are live!');
    } catch (err) {
      console.error('Publish failed', err);
      alert('Publish failed. Check console for details.');
    }
  },
  setFlowNodes(nodes) { set({ nodes }); },
  setFlowEdges(edges) { set({ edges }); },
}));

export const selectSelectedNode = (store: FlowStore) =>
  store.selectedNodeId ? store.nodes.find(n => n.id === store.selectedNodeId) ?? null : null;

