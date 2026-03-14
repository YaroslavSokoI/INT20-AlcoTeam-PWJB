import { motion } from 'framer-motion';
import type { QuizNode } from '../../types';

interface Props {
  node: QuizNode;
  onContinue: () => void;
  onBack?: () => void;
}

export function InfoStep({ node, onContinue, onBack }: Props) {
  return (
    <motion.div
      className="flex-1 flex flex-col gap-5 pb-6 items-center text-center"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {node.image_url && (
        <div className="w-full rounded-2xl overflow-hidden aspect-video">
          <img src={node.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <h2 className="text-[28px] font-bold leading-tight">{node.title}</h2>
      {node.description && <p className="text-[17px] text-dark-text leading-relaxed">{node.description}</p>}

      <button
        className="w-full py-4 bg-primary text-white rounded-xl text-base font-semibold cursor-pointer mt-auto hover:bg-primary-dark transition-colors"
        onClick={onContinue}
      >
        Continue
      </button>

      {onBack && (
        <button
          className="bg-transparent border-none text-dark-text text-sm cursor-pointer py-3 text-center hover:text-white transition-colors"
          onClick={onBack}
        >
          &larr; Back
        </button>
      )}
    </motion.div>
  );
}
