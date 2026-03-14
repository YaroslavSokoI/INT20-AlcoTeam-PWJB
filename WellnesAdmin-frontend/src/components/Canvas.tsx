import { useCallback, useEffect } from 'react';
import {
  ReactFlow, Background, BackgroundVariant, MiniMap,
  useReactFlow, ConnectionLineType,
  type OnConnect, type OnNodesChange, type OnEdgesChange, type Node, type Edge,
  applyNodeChanges, applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { QuestionNode, InfoNode, OfferNode, ResultNode, ConditionalNode, DelayNode } from '@/components/nodes/NodeCards';
import { LabeledEdge } from '@/components/edges/LabeledEdge';
import { GraphControls } from '@/components/GraphControls';
import { useFlowStore } from '@/store/flowStore';
import type { FlowNode, FlowEdge, NodeType } from '@/types';
import { useIsMobile } from '@/hooks/useResponsive';

const nodeTypes = { question: QuestionNode, info: InfoNode, offer: OfferNode, result: ResultNode, conditional: ConditionalNode, delay: DelayNode };
const edgeTypes = { labeled: LabeledEdge };

export function Canvas() {
  const { nodes, edges, setSelectedNodeId, addNode, addEdge, setFlowNodes, setFlowEdges, deleteNode, deleteEdge, undo, redo } = useFlowStore();
  const { screenToFlowPosition } = useReactFlow();
  const isMobile = useIsMobile();

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

  const onNodesChange: OnNodesChange = useCallback(changes => setFlowNodes(applyNodeChanges(changes, nodes as Node[]) as FlowNode[]), [nodes, setFlowNodes]);
  const onEdgesChange: OnEdgesChange = useCallback(changes => setFlowEdges(applyEdgeChanges(changes, edges as Edge[]) as FlowEdge[]), [edges, setFlowEdges]);
  const onConnect: OnConnect = useCallback(conn => addEdge({ source: conn.source ?? '', target: conn.target ?? '', sourceHandle: conn.sourceHandle, targetHandle: conn.targetHandle, type: 'labeled', data: { label: '' } }), [addEdge]);
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNodeId(node.id), [setSelectedNodeId]);
  const onPaneClick = useCallback(() => setSelectedNodeId(null), [setSelectedNodeId]);
  const onNodesDelete = useCallback((n: Node[]) => n.forEach(nd => deleteNode(nd.id)), [deleteNode]);
  const onEdgesDelete = useCallback((e: Edge[]) => e.forEach(ed => deleteEdge(ed.id)), [deleteEdge]);

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
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
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
        <MiniMap 
          position={isMobile ? "top-right" : "bottom-right"}
          nodeColor={n => ({ question: '#c7d7fa', info: '#a7e9cc', offer: '#fdd5b0', result: '#d8b4fe', conditional: '#fca5a5', delay: '#d8b4fe' }[n.type ?? ''] ?? '#e5e7eb')}
          nodeBorderRadius={8} 
          maskColor="rgba(246,244,242,0.8)" 
          style={{ 
            width: isMobile ? 80 : 140, 
            height: isMobile ? 55 : 90,
            marginTop: isMobile ? '3rem' : '0', // Tighter to topbar
            marginRight: isMobile ? '-4px' : '0' // Push closer to edge
          }} 
        />
        <GraphControls />
      </ReactFlow>
    </div>
  );
}
