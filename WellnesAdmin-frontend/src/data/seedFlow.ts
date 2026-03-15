import type { FlowNode, FlowEdge } from '@/types';

export const SEED_NODES: FlowNode[] = [
  {
    id: 'q1',
    type: 'question',
    position: { x: 60, y: 200 },
    data: {
      label: 'What is your main goal?',
      nodeType: 'question',
      questionText: 'What is your main goal?',
      answerType: 'single',
      options: [
        { id: 'o1', label: 'Lose weight',   value: 'lose_weight' },
        { id: 'o2', label: 'Build strength', value: 'build_strength' },
        { id: 'o3', label: 'Endurance',      value: 'endurance' },
        { id: 'o4', label: 'Flexibility',    value: 'flexibility' },
        { id: 'o5', label: 'Reduce stress',  value: 'reduce_stress' },
      ],
      transitions: [
        { id: 't1', answerValue: 'lose_weight',    targetNodeId: 'q3' },
        { id: 't2', answerValue: 'build_strength', targetNodeId: 'q2' },
        { id: 't3', answerValue: 'flexibility',    targetNodeId: 'q5' },
      ],
    },
  },
  {
    id: 'q2',
    type: 'question',
    position: { x: 420, y: 60 },
    data: {
      label: 'Your gender',
      nodeType: 'question',
      questionText: 'What is your gender?',
      answerType: 'single',
      options: [
        { id: 'o6', label: 'Male',            value: 'male' },
        { id: 'o7', label: 'Female',          value: 'female' },
        { id: 'o8', label: 'Prefer not to say', value: 'prefer_not' },
      ],
      transitions: [{ id: 't4', answerValue: '', targetNodeId: 'i1' }],
    },
  },
  {
    id: 'q3',
    type: 'question',
    position: { x: 420, y: 260 },
    data: {
      label: 'Where do you work out?',
      nodeType: 'question',
      questionText: 'Where do you prefer to work out?',
      answerType: 'single',
      options: [
        { id: 'o9',  label: 'At home',   value: 'home' },
        { id: 'o10', label: 'At the gym', value: 'gym' },
        { id: 'o11', label: 'Outdoors',  value: 'outdoors' },
      ],
      transitions: [{ id: 't5', answerValue: '', targetNodeId: 'q4' }],
    },
  },
  {
    id: 'q4',
    type: 'question',
    position: { x: 420, y: 460 },
    data: {
      label: 'Any limitations?',
      nodeType: 'question',
      questionText: 'Any physical limitations?',
      answerType: 'multi',
      options: [
        { id: 'o12', label: 'None',           value: 'none' },
        { id: 'o13', label: 'Sensitive back',  value: 'back' },
        { id: 'o14', label: 'Sensitive knees', value: 'knees' },
      ],
      transitions: [{ id: 't6', answerValue: '', targetNodeId: 'i1' }],
    },
  },
  {
    id: 'q6',
    type: 'question',
    position: { x: 780, y: 120 },
    data: {
      label: 'What would you like us to call you?',
      nodeType: 'question',
      questionText: 'What would you like us to call you?',
      answerType: 'input',
      attributeKey: 'name',
      options: [],
      transitions: [{ id: 't9', answerValue: '', targetNodeId: 'i1' }],
    },
  },
  {
    id: 'i1',
    type: 'info',
    position: { x: 1100, y: 120 },
    data: {
      label: 'Your 4-week progress',
      nodeType: 'info',
      content: 'Your progress in 4 weeks\n\nMotivational page before the final offer',
      transitions: [{ id: 't7', answerValue: '', targetNodeId: 'o1' }],
    },
  },
  {
    id: 'q5',
    type: 'question',
    position: { x: 780, y: 360 },
    data: {
      label: 'Stress Interceptor',
      nodeType: 'question',
      questionText: 'What is your stress level?',
      answerType: 'single',
      badge: 'STRESS INTERCEPTOR',
      options: [
        { id: 'o15', label: 'Low',    value: 'low' },
        { id: 'o16', label: 'Medium', value: 'medium' },
        { id: 'o17', label: 'High',   value: 'high' },
      ],
      transitions: [{ id: 't8', answerValue: '', targetNodeId: 'o1' }],
    },
  },
  {
    id: 'o1',
    type: 'offer',
    position: { x: 1460, y: 120 },
    data: {
      label: 'Weight Loss Starter',
      nodeType: 'offer',
      offerTitle: 'Weight Loss Starter',
      offerDescription: 'Your personalized 4-week weight loss plan, designed by experts.',
      ctaText: 'Get My Plan',
    },
  },
  {
    id: 'o2',
    type: 'offer',
    position: { x: 1460, y: 340 },
    data: {
      label: 'Lean Strength Builder',
      nodeType: 'offer',
      offerTitle: 'Lean Strength Builder',
      offerDescription: 'Build lean muscle with our progressive overload system.',
      ctaText: 'Start Building',
    },
  },
];

export const SEED_EDGES: FlowEdge[] = [
  { id: 'e1', source: 'q1', target: 'q2', sourceHandle: 'build_strength', data: { label: 'Build strength' } },
  { id: 'e2', source: 'q1', target: 'q3', sourceHandle: 'lose_weight',    data: { label: 'Lose weight' } },
  { id: 'e3', source: 'q1', target: 'q5', sourceHandle: 'flexibility',    data: { label: 'Flexibility' } },
  { id: 'e4', source: 'q2', target: 'q6', data: { label: '' } },
  { id: 'e5', source: 'q3', target: 'q4', data: { label: '' } },
  { id: 'e6', source: 'q4', target: 'q6', data: { label: '' } },
  { id: 'e8', source: 'q5', target: 'q6', data: { label: '' } },
  { id: 'e9', source: 'q6', target: 'i1', data: { label: '' } },
  { id: 'e7', source: 'i1', target: 'o1', data: { label: '' } },
];
