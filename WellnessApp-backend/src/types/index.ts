export type NodeType = 'question' | 'info';
export type QuestionType = 'single_choice' | 'multi_choice' | 'text_input' | 'number_input';

export interface NodeOption {
  value: string;
  label: string;
  icon?: string;
}

export interface DbNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  question_type?: QuestionType;
  options?: NodeOption[];
  attribute_key?: string;
  pos_x: number;
  pos_y: number;
  is_start: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  label?: string;
  conditions: Condition | null;
  priority: number;
  created_at: string;
}

export interface DbOffer {
  id: string;
  name: string;
  slug: string;
  description?: string;
  digital_plan?: string;
  physical_kit?: string;
  why_text?: string;
  cta_text: string;
  conditions: Condition | null;
  priority: number;
  is_addon: boolean;
  created_at: string;
}

export interface SimpleCondition {
  type: 'simple';
  attribute: string;
  op: 'eq' | 'neq' | 'in' | 'nin' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: unknown;
}

export interface CompoundCondition {
  type: 'compound';
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

export type Condition = SimpleCondition | CompoundCondition;

export interface Session {
  id: string;
  current_node_id: string | null;
  attributes: Record<string, unknown>;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface SubmitAnswerBody {
  node_id: string;
  attribute_key?: string;
  value: unknown;
}

export interface OfferResult {
  primary: DbOffer[];
  addon: DbOffer | null;
}
