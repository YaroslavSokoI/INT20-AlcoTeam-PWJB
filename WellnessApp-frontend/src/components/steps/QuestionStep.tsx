import { useState } from 'react';
import { motion } from 'framer-motion';
import type { QuizNode } from '../../types';

interface Props {
  node: QuizNode;
  onAnswer: (answer: unknown) => void;
  onBack?: () => void;
}

export function QuestionStep({ node, onAnswer, onBack }: Props) {
  const [selected, setSelected] = useState<string | string[] | null>(null);
  const [textValue, setTextValue] = useState('');
  const [sliderValue, setSliderValue] = useState(50);

  const handleSubmit = () => {
    switch (node.answer_type) {
      case 'single_choice':
        if (selected) onAnswer(selected);
        break;
      case 'multi_choice':
        if (Array.isArray(selected) && selected.length > 0) onAnswer(selected);
        break;
      case 'text_input':
        if (textValue.trim()) onAnswer(textValue.trim());
        break;
      case 'slider':
        onAnswer(sliderValue);
        break;
    }
  };

  const handleSingleSelect = (value: string) => {
    setSelected(value);
    onAnswer(value);
  };

  const handleMultiSelect = (value: string) => {
    setSelected(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    });
  };

  return (
    <motion.div
      className="flex-1 flex flex-col gap-5 pb-6"
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

      <h2 className="text-2xl font-bold leading-tight tracking-tight">{node.title}</h2>
      {node.description && <p className="text-base text-dark-text leading-relaxed">{node.description}</p>}

      <div className="flex flex-col gap-3 flex-1">
        {node.answer_type === 'single_choice' && node.options.map(opt => (
          <button
            key={opt.value}
            className={`flex items-center gap-3.5 px-5 py-4 rounded-xl text-base font-medium cursor-pointer text-left w-full transition-all border-2
              ${selected === opt.value
                ? 'bg-primary/15 border-primary'
                : 'bg-dark-card border-dark-border hover:bg-dark-card-hover hover:border-primary-light'
              }`}
            onClick={() => handleSingleSelect(opt.value)}
          >
            {opt.icon && <span className="text-2xl shrink-0">{opt.icon}</span>}
            {opt.image_url && <img src={opt.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
            <span className="flex-1">{opt.label}</span>
          </button>
        ))}

        {node.answer_type === 'multi_choice' && (
          <>
            {node.options.map(opt => (
              <button
                key={opt.value}
                className={`flex items-center gap-3.5 px-5 py-4 rounded-xl text-base font-medium cursor-pointer text-left w-full transition-all border-2
                  ${Array.isArray(selected) && selected.includes(opt.value)
                    ? 'bg-primary/15 border-primary'
                    : 'bg-dark-card border-dark-border hover:bg-dark-card-hover hover:border-primary-light'
                  }`}
                onClick={() => handleMultiSelect(opt.value)}
              >
                {opt.icon && <span className="text-2xl shrink-0">{opt.icon}</span>}
                <span className="flex-1">{opt.label}</span>
              </button>
            ))}
            <button
              className="w-full py-4 bg-primary text-white rounded-xl text-base font-semibold cursor-pointer mt-auto hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!Array.isArray(selected) || selected.length === 0}
            >
              Continue
            </button>
          </>
        )}

        {node.answer_type === 'text_input' && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              placeholder={(node.metadata?.placeholder as string) || 'Type your answer...'}
              className="w-full px-5 py-4 bg-dark-card border-2 border-dark-border rounded-xl text-white text-base outline-none focus:border-primary transition-colors placeholder:text-dark-text"
            />
            <button
              className="w-full py-4 bg-primary text-white rounded-xl text-base font-semibold cursor-pointer hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!textValue.trim()}
            >
              Continue
            </button>
          </div>
        )}

        {node.answer_type === 'slider' && (
          <div className="flex flex-col items-center gap-4">
            <input
              type="range"
              min={(node.metadata?.min as number) || 0}
              max={(node.metadata?.max as number) || 100}
              value={sliderValue}
              onChange={e => setSliderValue(Number(e.target.value))}
              className="w-full h-1.5 appearance-none bg-dark-border rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="text-3xl font-bold text-primary-light">{sliderValue}</span>
            <button
              className="w-full py-4 bg-primary text-white rounded-xl text-base font-semibold cursor-pointer hover:bg-primary-dark transition-colors"
              onClick={handleSubmit}
            >
              Continue
            </button>
          </div>
        )}
      </div>

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
