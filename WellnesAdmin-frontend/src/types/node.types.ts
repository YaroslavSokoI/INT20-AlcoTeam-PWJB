// Node types
export type NodeType = 'question' | 'info' | 'offer' | 'conditional';
export type AnswerType = 'single' | 'multi' | 'input';

export interface AnswerOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface TransitionRule {
  id: string;
  answerValue: string;
  targetNodeId: string;
}

export interface FlowNodeData {
  label: string;
  nodeType: NodeType;
  questionText?: string;
  answerType?: AnswerType;
  options?: AnswerOption[];
  transitions?: TransitionRule[];
  content?: string;
  offerTitle?: string;
  offerDescription?: string;
  ctaText?: string;
  badge?: string;
  [key: string]: unknown;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: FlowNodeData;
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  animated?: boolean;
  type?: string;
  data?: { label?: string; condition?: string; priority?: string };
}

export interface NodeTypeMeta {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const NODE_TYPE_META: Record<NodeType, NodeTypeMeta> = {
  question: { type: 'question', label: 'Question', description: 'Single / Multi / Input', color: '#4f8ef7', bgColor: '#eff6ff', textColor: '#1d4ed8' },
  info:     { type: 'info',     label: 'Info Page', description: 'Motivational block',    color: '#2cb67d', bgColor: '#f0fdf4', textColor: '#166534' },
  offer:    { type: 'offer',    label: 'Offer',      description: 'Final proposal',        color: '#f5924a', bgColor: '#fff7ed', textColor: '#c2410c' },
  conditional: { type: 'conditional', label: 'Conditional', description: 'Branch logic',  color: '#ef4444', bgColor: '#fef2f2', textColor: '#b91c1c' },
};
