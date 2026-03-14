import type { QuizNode, Offer } from '../types';

export const mockNodes: QuizNode[] = [
  {
    id: 1,
    graph_id: 1,
    node_type: 'info',
    slug: null,
    title: 'Welcome to Your Wellness Journey',
    description: 'We\'ll ask you a few questions to create a personalized plan that fits your lifestyle, goals, and preferences.',
    image_url: null,
    answer_type: 'none',
    options: [],
    metadata: {},
  },
  {
    id: 2,
    graph_id: 1,
    node_type: 'question',
    slug: 'goal',
    title: 'What\'s your main goal?',
    description: 'Choose the one that matters most to you right now.',
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: 'lose_weight', label: 'Lose weight', icon: 'Flame' },
      { value: 'strength', label: 'Build strength', icon: 'Dumbbell' },
      { value: 'flexibility', label: 'Improve flexibility', icon: 'PersonStanding' },
      { value: 'stress', label: 'Reduce stress', icon: 'Brain' },
      { value: 'endurance', label: 'Boost endurance', icon: 'Activity' },
    ],
    metadata: {},
  },
  {
    id: 3,
    graph_id: 1,
    node_type: 'question',
    slug: 'context',
    title: 'Where do you prefer to work out?',
    description: null,
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: 'home', label: 'At home', icon: 'Home' },
      { value: 'gym', label: 'At the gym', icon: 'Dumbbell' },
      { value: 'outdoor', label: 'Outdoors', icon: 'TreePine' },
    ],
    metadata: {},
  },
  {
    id: 4,
    graph_id: 1,
    node_type: 'question',
    slug: 'level',
    title: 'What\'s your fitness level?',
    description: 'Be honest — there\'s no wrong answer.',
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: 'beginner', label: 'Beginner — just starting out', icon: 'Sprout' },
      { value: 'intermediate', label: 'Intermediate — I work out sometimes', icon: 'Zap' },
      { value: 'advanced', label: 'Advanced — I train regularly', icon: 'Trophy' },
    ],
    metadata: {},
  },
  {
    id: 5,
    graph_id: 1,
    node_type: 'question',
    slug: 'time',
    title: 'How much time can you dedicate per day?',
    description: null,
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: '10-15', label: '10–15 minutes', icon: 'Timer' },
      { value: '20-30', label: '20–30 minutes', icon: 'Clock' },
      { value: '45-60', label: '45–60 minutes', icon: 'Hourglass' },
    ],
    metadata: {},
  },
  {
    id: 6,
    graph_id: 1,
    node_type: 'question',
    slug: 'constraints',
    title: 'Do you have any injuries or limitations?',
    description: 'Select all that apply.',
    image_url: null,
    answer_type: 'multi_choice',
    options: [
      { value: 'knees', label: 'Knee problems', icon: 'Bone' },
      { value: 'back', label: 'Back issues', icon: 'Activity' },
      { value: 'shoulders', label: 'Shoulder pain', icon: 'Ban' },
      { value: 'none', label: 'No limitations', icon: 'CheckCircle' },
    ],
    metadata: {},
  },
  {
    id: 7,
    graph_id: 1,
    node_type: 'question',
    slug: 'stress_level',
    title: 'How would you rate your stress level?',
    description: 'This helps us tailor the mental wellness component.',
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: 'low', label: 'Low — I feel pretty calm', icon: 'Smile' },
      { value: 'moderate', label: 'Moderate — some days are tough', icon: 'Meh' },
      { value: 'high', label: 'High — I\'m quite stressed', icon: 'Frown' },
    ],
    metadata: {},
  },
  {
    id: 8,
    graph_id: 1,
    node_type: 'question',
    slug: 'motivation',
    title: 'What motivates you to start now?',
    description: null,
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: 'health', label: 'Improve my health', icon: 'Heart' },
      { value: 'appearance', label: 'Look better', icon: 'Sparkles' },
      { value: 'energy', label: 'Have more energy', icon: 'Zap' },
      { value: 'event', label: 'Preparing for an event', icon: 'Target' },
      { value: 'habit', label: 'Build a healthy habit', icon: 'RefreshCw' },
    ],
    metadata: {},
  },
  {
    id: 9,
    graph_id: 1,
    node_type: 'info',
    slug: null,
    title: 'Great, we\'re almost done!',
    description: 'Based on your answers, we\'re preparing a personalized wellness plan just for you. This includes a tailored digital program and a matching physical wellness kit.',
    image_url: null,
    answer_type: 'none',
    options: [],
    metadata: {},
  },
  {
    id: 10,
    graph_id: 1,
    node_type: 'question',
    slug: 'age',
    title: 'What\'s your age range?',
    description: null,
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: '18-24', label: '18–24' },
      { value: '25-34', label: '25–34' },
      { value: '35-44', label: '35–44' },
      { value: '45-54', label: '45–54' },
      { value: '55+', label: '55+' },
    ],
    metadata: {},
  },
  {
    id: 11,
    graph_id: 1,
    node_type: 'question',
    slug: 'gender',
    title: 'How do you identify?',
    description: 'This helps us fine-tune exercise recommendations.',
    image_url: null,
    answer_type: 'single_choice',
    options: [
      { value: 'male', label: 'Male', icon: 'User' },
      { value: 'female', label: 'Female', icon: 'UserRound' },
      { value: 'other', label: 'Other / Prefer not to say', icon: 'Users' },
    ],
    metadata: {},
  },
];

export const mockOffers: Offer[] = [
  {
    id: 1,
    slug: 'weight_loss_starter',
    name: 'Weight Loss Starter (Home)',
    description: '4-week home weight loss plan with 20–30 min daily sessions designed to burn fat and build healthy habits.',
    image_url: null,
    plan_details: {
      duration: '4 weeks',
      format: 'Home',
      session_length: '20–30 min',
      description: 'Structured home workout plan focused on fat burning with progressive intensity.',
    },
    kit_details: {
      name: 'Home Fat-Burn Kit',
      items: ['Resistance bands', 'Jump rope', 'Shaker bottle', 'Electrolytes', 'Healthy snack pack'],
    },
  },
  {
    id: 6,
    slug: 'stress_reset',
    name: 'Stress Reset Program',
    description: 'Mental reset with guided breathing, meditation, and micro-habits to help you feel calmer and more focused.',
    image_url: null,
    plan_details: {
      duration: '3 weeks',
      format: 'Anywhere',
      session_length: '5–15 min',
      description: 'Guided breathing exercises, meditations, and anti-stress routines.',
    },
    kit_details: {
      name: 'Calm-Now Kit',
      items: ['Eye mask', 'Aroma roll-on', 'Tea sticks', 'Stress ball', 'Quick reset card'],
    },
  },
];

// Simple mock rule engine
export function resolveOffer(answers: Record<string, unknown>): Offer[] {
  const goal = answers.goal as string;
  const context = answers.context as string;
  const time = answers.time as string;
  const constraints = answers.constraints as string[];
  const stressLevel = answers.stress_level as string;

  const result: Offer[] = [];

  const hasJointIssues = constraints && (constraints.includes('knees') || constraints.includes('back'));

  if (goal === 'lose_weight' && context === 'home' && time === '10-15') {
    result.push(findOffer('quick_fit_micro')!);
  } else if (goal === 'lose_weight' && context === 'home') {
    result.push(findOffer('weight_loss_starter')!);
  } else if (goal === 'strength' && context === 'gym' && hasJointIssues) {
    result.push(findOffer('low_impact_fat_burn')!);
  } else if (goal === 'strength' && context === 'gym') {
    result.push(findOffer('lean_strength_builder')!);
  } else if (goal === 'endurance' && context === 'outdoor') {
    result.push(findOffer('run_first_5k')!);
  } else if (goal === 'flexibility') {
    result.push(findOffer('yoga_mobility')!);
  } else if (goal === 'stress') {
    result.push(findOffer('stress_reset')!);
  } else if (hasJointIssues) {
    result.push(findOffer('low_impact_fat_burn')!);
  } else if (time === '10-15') {
    result.push(findOffer('quick_fit_micro')!);
  } else {
    result.push(findOffer('weight_loss_starter')!);
  }

  // Stress interceptor: add Stress Reset if stress is high
  if (stressLevel === 'high' && !result.some(o => o.slug === 'stress_reset')) {
    result.push(findOffer('stress_reset')!);
  }

  return result;
}

const allOffers: Offer[] = [
  {
    id: 1, slug: 'weight_loss_starter', name: 'Weight Loss Starter (Home)',
    description: '4-week home weight loss plan with 20–30 min daily sessions.',
    image_url: null,
    plan_details: { duration: '4 weeks', format: 'Home', session_length: '20–30 min', description: 'Structured home workout plan focused on fat burning with progressive intensity.' },
    kit_details: { name: 'Home Fat-Burn Kit', items: ['Resistance bands', 'Jump rope', 'Shaker bottle', 'Electrolytes', 'Healthy snack pack'] },
  },
  {
    id: 2, slug: 'lean_strength_builder', name: 'Lean Strength Builder (Gym)',
    description: 'Gym-based strength program with progressive overload.',
    image_url: null,
    plan_details: { duration: '6 weeks', format: 'Gym', session_length: '45–60 min', description: 'Progressive strength training program with structured periodization.' },
    kit_details: { name: 'Gym Support Kit', items: ['Wrist wraps/straps', 'Mini loop band', 'Compact gym towel', 'Electrolytes', 'Protein snack'] },
  },
  {
    id: 3, slug: 'low_impact_fat_burn', name: 'Low-Impact Fat Burn',
    description: 'Joint-friendly fat burning — safe for knees and back.',
    image_url: null,
    plan_details: { duration: '4 weeks', format: 'Home / Gym', session_length: '25–35 min', description: 'Low-impact exercises designed to burn fat while protecting joints.' },
    kit_details: { name: 'Joint-Friendly Kit', items: ['Knee sleeve', 'Massage ball', 'Mini loop bands', 'Cooling patch', 'Recovery gel'] },
  },
  {
    id: 4, slug: 'run_first_5k', name: 'Run Your First 5K (Outdoor)',
    description: '8-week 5K running preparation program, 3x per week.',
    image_url: null,
    plan_details: { duration: '8 weeks', format: 'Outdoor', session_length: '20–40 min', frequency: '3x/week', description: 'Couch-to-5K progressive running program.' },
    kit_details: { name: 'Runner Starter Kit', items: ['Electrolytes', 'Reflective armband', 'Safety light', 'Blister kit', 'Running belt'] },
  },
  {
    id: 5, slug: 'yoga_mobility', name: 'Yoga & Mobility (Home)',
    description: 'Flexibility and posture improvement with daily yoga routines.',
    image_url: null,
    plan_details: { duration: '4 weeks', format: 'Home', session_length: '10–25 min', description: 'Daily yoga and mobility routines for flexibility, posture, and stress relief.' },
    kit_details: { name: 'Mobility Kit', items: ['Travel yoga mat', 'Yoga strap', 'Massage ball', 'Mini foam roller'] },
  },
  {
    id: 6, slug: 'stress_reset', name: 'Stress Reset Program',
    description: 'Mental reset with breathing, meditation, and micro-habits.',
    image_url: null,
    plan_details: { duration: '3 weeks', format: 'Anywhere', session_length: '5–15 min', description: 'Guided breathing exercises, meditations, and anti-stress routines.' },
    kit_details: { name: 'Calm-Now Kit', items: ['Eye mask', 'Aroma roll-on', 'Tea sticks', 'Stress ball', 'Quick reset card'] },
  },
  {
    id: 7, slug: 'quick_fit_micro', name: 'Quick Fit Micro-Workouts',
    description: 'Daily 10–15 min micro-workouts that fit any schedule.',
    image_url: null,
    plan_details: { duration: '4 weeks', format: 'Anywhere', session_length: '10–15 min', frequency: 'Daily', description: 'Short, efficient daily workouts that fit into any schedule.' },
    kit_details: { name: 'Micro-Workout Kit', items: ['Slider discs', 'Mini loop bands', 'Shaker bottle', 'Mini routine card'] },
  },
];

function findOffer(slug: string): Offer | undefined {
  return allOffers.find(o => o.slug === slug);
}
