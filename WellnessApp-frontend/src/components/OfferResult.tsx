import { motion } from 'framer-motion';
import { api } from '../api/client';
import type { OfferResult as OfferResultType, Offer } from '../types';

interface Props {
  result: OfferResultType;
  sessionId: string;
}

function OfferCard({ offer, index, onAccept }: { offer: Offer; index: number; onAccept: () => void }) {
  return (
    <motion.div
      className="bg-warm-50 rounded-2xl lg:rounded-3xl p-5 lg:p-7 border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
    >
      <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">{offer.title}</h2>
      {offer.description && (
        <p className="text-text-secondary text-sm lg:text-[15px] leading-relaxed mb-5">{offer.description}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-6">
        {offer.digital_plan && (
          <div className="bg-surface rounded-xl p-4 border border-border">
            <h3 className="text-sm font-semibold text-brand mb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Digital Plan
            </h3>
            <p className="text-xs text-text-secondary leading-snug">{offer.digital_plan}</p>
          </div>
        )}

        {offer.physical_kit && (
          <div className="bg-surface rounded-xl p-4 border border-border">
            <h3 className="text-sm font-semibold text-accent-dark mb-2.5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Physical Kit
            </h3>
            <p className="text-xs text-text-secondary leading-snug">{offer.physical_kit}</p>
          </div>
        )}
      </div>

      {offer.why_text && (
        <p className="text-sm text-text-secondary italic mb-4">{offer.why_text}</p>
      )}

      <button
        onClick={onAccept}
        className="w-full py-4 lg:py-[18px] bg-brand text-white rounded-full text-base lg:text-lg font-bold cursor-pointer hover:bg-brand-dark hover:shadow-md transition-all shadow-sm"
      >
        {offer.cta_text}
      </button>
    </motion.div>
  );
}

export function OfferResult({ result, sessionId }: Props) {
  const handleAccept = async () => {
    try {
      await api.acceptOffer(sessionId);
    } catch (err) {
      console.error('Failed to accept offer', err);
    }
  };
  return (
    <motion.div
      className="flex-1 bg-surface p-5 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="text-center mb-6 lg:mb-8">
        <p className="text-sm font-medium text-brand uppercase tracking-wider mb-2">Tailored for you</p>
        <h1 className="text-[26px] lg:text-[32px] font-extrabold text-text-primary leading-tight">
          Your Personalized Plan
        </h1>
      </div>

      <div className="flex flex-col gap-5 lg:gap-6">
        {result.primary.map((offer, index) => (
          <OfferCard key={offer.id} offer={offer} index={index} onAccept={handleAccept} />
        ))}

      </div>
    </motion.div>
  );
}
