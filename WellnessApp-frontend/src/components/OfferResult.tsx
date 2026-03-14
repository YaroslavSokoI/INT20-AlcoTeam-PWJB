import { motion } from 'framer-motion';
import type { QuizResult } from '../types';

interface Props {
  result: QuizResult;
}

export function OfferResult({ result }: Props) {
  return (
    <motion.div
      className="p-6 pb-[env(safe-area-inset-bottom,24px)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-[28px] font-extrabold text-center mb-2 bg-gradient-to-br from-primary-light to-accent bg-clip-text text-transparent">
        Your Personalized Plan
      </h1>
      {result.summary && (
        <p className="text-center text-dark-text mb-6 text-base leading-relaxed">{result.summary}</p>
      )}

      <div className="flex flex-col gap-6">
        {result.offers.map(offer => (
          <div key={offer.id} className="bg-dark-card rounded-2xl p-6 border border-dark-border">
            {offer.image_url && (
              <img src={offer.image_url} alt={offer.name} className="w-full rounded-xl mb-4" />
            )}

            <h2 className="text-[22px] font-bold mb-2">{offer.name}</h2>
            <p className="text-dark-text text-[15px] leading-relaxed mb-5">{offer.description}</p>

            <div className="flex flex-col gap-5 mb-6">
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary-light">Digital Plan</h3>
                <p className="text-sm text-dark-text mb-2 leading-snug">{offer.plan_details.description}</p>
                <ul className="flex flex-col gap-1.5">
                  <li className="text-sm text-dark-text pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                    Duration: {offer.plan_details.duration}
                  </li>
                  <li className="text-sm text-dark-text pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                    Session: {offer.plan_details.session_length}
                  </li>
                  <li className="text-sm text-dark-text pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                    Format: {offer.plan_details.format}
                  </li>
                  {offer.plan_details.frequency && (
                    <li className="text-sm text-dark-text pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                      Frequency: {offer.plan_details.frequency}
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-2 text-primary-light">{offer.kit_details.name}</h3>
                <ul className="flex flex-col gap-1.5">
                  {offer.kit_details.items.map((item, i) => (
                    <li key={i} className="text-sm text-dark-text pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button className="w-full py-[18px] bg-gradient-to-br from-primary to-accent text-white rounded-xl text-lg font-bold cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(108,99,255,0.3)] transition-all">
              Get Started Now
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
