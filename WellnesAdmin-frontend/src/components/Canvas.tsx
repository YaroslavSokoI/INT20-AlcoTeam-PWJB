import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow, Background, BackgroundVariant,
  useReactFlow, ConnectionLineType,
  type OnConnect, type OnNodesChange, type OnEdgesChange, type Node, type Edge,
  applyNodeChanges, applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { QuestionNode, InfoNode, OfferNode, ConditionalNode } from '@/components/nodes/NodeCards';
import { LabeledEdge } from '@/components/edges/LabeledEdge';
import { GraphControls } from '@/components/GraphControls';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useFlowStore } from '@/store/flowStore';
import { getAutoLayout } from '@/lib/layout';
import type { FlowNode, FlowEdge, NodeType } from '@/types';
import { useIsMobile } from '@/hooks/useResponsive';

const nodeTypes = { question: QuestionNode, info: InfoNode, offer: OfferNode, conditional: ConditionalNode };
const edgeTypes = { labeled: LabeledEdge };

type PendingDelete = { nodes: Node[]; edges: Edge[] } | null;

export function Canvas() {
  const { nodes, edges, isLoading, setSelectedNodeId, setSelectedEdgeId, addNode, addEdge, setFlowNodes, setFlowEdges, deleteNode, deleteEdge, undo, redo } = useFlowStore();
  const { screenToFlowPosition, fitView } = useReactFlow();
  const isMobile = useIsMobile();
  const autoLayoutDone = useRef(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);

  useEffect(() => {
    if (isLoading || nodes.length === 0 || autoLayoutDone.current) return;
    autoLayoutDone.current = true;
    const laid = getAutoLayout(nodes, edges);
    setFlowNodes(laid);
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 300);
  }, [isLoading, nodes.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
      if (((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey)) || (e.key === 'Z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-type') as NodeType;
    if (!type) return;
    addNode(type, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
  }, [screenToFlowPosition, addNode]);

  const onNodesChange: OnNodesChange = useCallback(changes => {
    const removals = changes.filter(c => c.type === 'remove');
    if (removals.length > 0) return; // handled by onBeforeDelete
    setFlowNodes(applyNodeChanges(changes, nodes as Node[]) as FlowNode[]);
  }, [nodes, setFlowNodes]);
  const onEdgesChange: OnEdgesChange = useCallback(changes => {
    const removals = changes.filter(c => c.type === 'remove');
    if (removals.length > 0) return; // handled by onBeforeDelete
    setFlowEdges(applyEdgeChanges(changes, edges as Edge[]) as FlowEdge[]);
  }, [edges, setFlowEdges]);
  const onConnect: OnConnect = useCallback(conn => addEdge({ source: conn.source ?? '', target: conn.target ?? '', sourceHandle: conn.sourceHandle, targetHandle: conn.targetHandle, type: 'labeled', data: { label: '' } }), [addEdge]);
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNodeId(node.id), [setSelectedNodeId]);
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => setSelectedEdgeId(edge.id), [setSelectedEdgeId]);
  const onPaneClick = useCallback(() => { setSelectedNodeId(null); setSelectedEdgeId(null); }, [setSelectedNodeId, setSelectedEdgeId]);

  // Intercept delete — show confirm dialog instead of deleting immediately
  const onBeforeDelete = useCallback(async ({ nodes: n, edges: e }: { nodes: Node[]; edges: Edge[] }) => {
    if (n.length === 0 && e.length === 0) return true;
    setPendingDelete({ nodes: n, edges: e });
    return false; // prevent ReactFlow from deleting
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;
    pendingDelete.nodes.forEach(n => deleteNode(n.id));
    pendingDelete.edges.forEach(e => deleteEdge(e.id));
    setPendingDelete(null);
  }, [pendingDelete, deleteNode, deleteEdge]);

  const deleteLabel = pendingDelete
    ? pendingDelete.nodes.length > 0
      ? pendingDelete.nodes.length === 1
        ? `Node "${(pendingDelete.nodes[0].data as any)?.label || pendingDelete.nodes[0].id}" and its edges will be removed.`
        : `${pendingDelete.nodes.length} nodes and their edges will be removed.`
      : pendingDelete.edges.length === 1
        ? 'This connection will be removed.'
        : `${pendingDelete.edges.length} connections will be removed.`
    : '';

  return (
    <div className="w-full h-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges.map(e => ({ ...e, type: e.type || 'labeled' })) as Edge[]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onBeforeDelete={onBeforeDelete}
        connectionLineType={ConnectionLineType.SmoothStep}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'labeled', data: { label: '' } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="var(--color-border)" gap={20} size={1} />
        <GraphControls />
      </ReactFlow>
      <DeleteConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete && pendingDelete.nodes.length > 0
            ? pendingDelete.nodes.length === 1 ? 'Delete node?' : `Delete ${pendingDelete.nodes.length} nodes?`
            : pendingDelete && pendingDelete.edges.length === 1 ? 'Delete edge?' : `Delete ${pendingDelete?.edges.length ?? 0} edges?`
        }
        description={deleteLabel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
