import { motion } from 'framer-motion';
import type { QuizNode } from '../../types';
import { useTranslation } from 'react-i18next';

interface Props {
  node: QuizNode;
  onContinue: () => void;
}

export function InfoStep({ node, onContinue }: Props) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="flex-1 flex flex-col gap-5 pt-4 lg:pt-6 items-center text-center"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {node.image_url && (
        <div className="w-full rounded-2xl overflow-hidden aspect-video bg-warm-100">
          <img src={node.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-3 max-w-md">
        <h2 className="text-[24px] lg:text-[28px] font-bold leading-tight text-text-primary">{node.title}</h2>
        {node.description && (
          <p className="text-[16px] lg:text-[17px] text-text-secondary leading-relaxed">{node.description}</p>
        )}
      </div>

      <button
        className="w-full py-3.5 lg:py-4 bg-brand text-white rounded-full text-[15px] lg:text-base font-semibold cursor-pointer mt-auto hover:bg-brand-dark transition-colors shadow-sm"
        onClick={onContinue}
      >
        {t('continue')}
      </button>

    </motion.div>
  );
}
