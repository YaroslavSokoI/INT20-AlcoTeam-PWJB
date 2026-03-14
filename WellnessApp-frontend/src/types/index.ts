// Types matching backend schema

export type NodeType = 'question' | 'info' | 'offer' | 'result' | 'conditional' | 'delay';
export type QuestionType = 'single_choice' | 'multi_choice' | 'text_input' | 'number_input';

export interface NodeOption {
  value: string;
  label: string;
  icon?: string;
}

export interface QuizNode {
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

export interface Offer {
  id: string;
  title: string;
  attribute_key?: string;  // slug
  description?: string;
  digital_plan?: string;
  physical_kit?: string;
  why_text?: string;
  cta_text?: string;
  offer_priority?: number;
}

export interface OfferResult {
  primary: Offer[];
}
