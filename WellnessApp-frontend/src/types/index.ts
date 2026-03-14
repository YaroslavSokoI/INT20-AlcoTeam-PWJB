// Node types matching backend schema
export type NodeType = 'question' | 'info' | 'start' | 'end';
export type AnswerType = 'single_choice' | 'multi_choice' | 'slider' | 'text_input' | 'none';

export interface NodeOption {
  value: string;
  label: string;
  image_url?: string;
  icon?: string;
}

export interface QuizNode {
  id: number;
  graph_id: number;
  node_type: NodeType;
  slug: string | null;
  title: string | null;
  description: string | null;
  image_url: string | null;
  answer_type: AnswerType;
  options: NodeOption[];
  metadata: Record<string, unknown>;
}

export interface Offer {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  plan_details: {
    duration: string;
    format: string;
    session_length: string;
    frequency?: string;
    description: string;
  };
  kit_details: {
    name: string;
    items: string[];
  };
}

export interface QuizSession {
  id: string;
  graph_id: number;
  current_node: QuizNode;
  answers: Record<string, unknown>;
  history: number[];
  status: 'in_progress' | 'completed';
  progress: number;
  current_step: number;
  total_steps: number;
}

export interface QuizResult {
  offers: Offer[];
  answers: Record<string, unknown>;
  summary: string;
}
