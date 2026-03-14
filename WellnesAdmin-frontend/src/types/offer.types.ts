export type OfferCategory = 'WEIGHT_LOSS' | 'STRENGTH' | 'WELLNESS' | 'YOGA';
export type OfferStatus = 'active' | 'paused' | 'draft';

export interface Offer {
  id: string;
  title: string;
  description: string;
  slug: string;
  cta_text: string;
  digital_plan: string;
  physical_kit: string;
  why_text: string;
  offer_priority: number;
  offer_conditions: any;
  status: OfferStatus;
  category: OfferCategory;
  color: 'orange' | 'emerald' | 'purple' | 'blue';
}

export const OFFER_CATEGORIES: { value: OfferCategory; label: string; color: Offer['color'] }[] = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss', color: 'orange' },
  { value: 'STRENGTH', label: 'Strength', color: 'emerald' },
  { value: 'WELLNESS', label: 'Wellness', color: 'purple' },
  { value: 'YOGA', label: 'Yoga', color: 'blue' },
];

export const OFFER_STATUSES: { value: OfferStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'draft', label: 'Draft' },
];

export function getCategoryMeta(slug: string): { value: OfferCategory; label: string; color: Offer['color'] } {
  // Try to guess category from slug/title
  const s = (slug || '').toLowerCase();
  if (s.includes('weight') || s.includes('fat') || s.includes('slim')) return OFFER_CATEGORIES[0];
  if (s.includes('strength') || s.includes('lean') || s.includes('gym') || s.includes('muscle')) return OFFER_CATEGORIES[1];
  if (s.includes('yoga') || s.includes('mobility') || s.includes('flex')) return OFFER_CATEGORIES[3];
  return OFFER_CATEGORIES[2]; // default WELLNESS
}
