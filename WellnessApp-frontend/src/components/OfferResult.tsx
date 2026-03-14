import { motion } from 'framer-motion';
import type { QuizResult } from '../types';

interface Props {
  result: QuizResult;
}

export function OfferResult({ result }: Props) {
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
        {result.summary && (
          <p className="text-text-secondary mt-3 text-[15px] lg:text-base leading-relaxed max-w-md mx-auto">
            {result.summary}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:gap-6">
        {result.offers.map((offer, index) => (
          <motion.div
            key={offer.id}
            className="bg-warm-50 rounded-2xl lg:rounded-3xl p-5 lg:p-7 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
          >
            {offer.image_url && (
              <img src={offer.image_url} alt={offer.name} className="w-full rounded-xl lg:rounded-2xl mb-4 lg:mb-5" />
            )}

            <div className="inline-block px-3 py-1 bg-sage-100 text-sage-600 rounded-full text-xs font-semibold mb-3 uppercase tracking-wide">
              {offer.plan_details.format}
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">{offer.name}</h2>
            <p className="text-text-secondary text-sm lg:text-[15px] leading-relaxed mb-5">{offer.description}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-6">
              <div className="bg-surface rounded-xl p-4 border border-border">
                <h3 className="text-sm font-semibold text-brand mb-2.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Digital Plan
                </h3>
                <p className="text-xs text-text-secondary mb-2 leading-snug">{offer.plan_details.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-warm-100 text-text-secondary text-xs rounded-full">{offer.plan_details.duration}</span>
                  <span className="px-2.5 py-1 bg-warm-100 text-text-secondary text-xs rounded-full">{offer.plan_details.session_length}</span>
                  {offer.plan_details.frequency && (
                    <span className="px-2.5 py-1 bg-warm-100 text-text-secondary text-xs rounded-full">{offer.plan_details.frequency}</span>
                  )}
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border">
                <h3 className="text-sm font-semibold text-accent-dark mb-2.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {offer.kit_details.name}
                </h3>
                <ul className="flex flex-col gap-1">
                  {offer.kit_details.items.map((item, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button className="w-full py-4 lg:py-[18px] bg-brand text-white rounded-full text-base lg:text-lg font-bold cursor-pointer hover:bg-brand-dark hover:shadow-md transition-all shadow-sm">
              Get Started Now
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
