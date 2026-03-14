export type OfferCategory = 'WEIGHT_LOSS' | 'STRENGTH' | 'WELLNESS' | 'YOGA';
export type OfferStatus = 'active' | 'paused' | 'draft';

export interface Offer {
  id: string;
  title: string;
  category: OfferCategory;
  price: string;
  conversion: string;
  users: string;
  status: OfferStatus;
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
