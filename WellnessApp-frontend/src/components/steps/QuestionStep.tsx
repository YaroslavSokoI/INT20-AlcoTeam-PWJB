import { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { QuizNode } from '../../types';

import { useTranslation } from 'react-i18next';

interface Props {
  node: QuizNode;
  onAnswer: (answer: unknown) => void;
}

export function QuestionStep({ node, onAnswer }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | string[] | null>(null);
  const [textValue, setTextValue] = useState('');
  const [sliderValue, setSliderValue] = useState(50);

  const handleSubmit = () => {
    switch (node.question_type) {
      case 'single_choice':
        if (selected) onAnswer(selected);
        break;
      case 'multi_choice':
        if (Array.isArray(selected) && selected.length > 0) onAnswer(selected);
        break;
      case 'text_input':
        if (textValue.trim()) onAnswer(textValue.trim());
        break;
      case 'number_input':
        onAnswer(sliderValue);
        break;
    }
  };

  const handleSingleSelect = (value: string) => {
    setSelected(value);
  };

  const handleMultiSelect = (value: string) => {
    setSelected(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
    });
  };

  const renderIcon = (iconName?: string, isSelected?: boolean) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return (
      <Icon 
        className={`w-6 h-6 lg:w-7 lg:h-7 shrink-0 transition-colors ${isSelected ? 'text-brand' : 'text-brand/60'}`} 
        strokeWidth={1.5}
      />
    );
  };

  return (
    <motion.div
      className="flex-1 flex flex-col gap-5 pt-4 lg:pt-6"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="space-y-2">
        <h2 className="text-[22px] lg:text-[26px] font-bold leading-tight text-text-primary tracking-[-0.02em]">
          {node.title}
        </h2>
        {node.description && (
          <p className="text-[15px] lg:text-base text-text-secondary leading-relaxed">{node.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5 flex-1 mt-1">
        {node.question_type === 'single_choice' && node.options?.map(opt => (
          <button
            key={opt.value}
            className={`flex items-center gap-3.5 px-4 py-3.5 lg:px-5 lg:py-4 rounded-2xl text-[15px] lg:text-base font-medium cursor-pointer text-left w-full transition-all border
              ${selected === opt.value
                ? 'bg-warm-100 border-brand shadow-sm'
                : 'bg-surface border-border hover:bg-warm-50 hover:border-border-hover'
              }`}
            onClick={() => handleSingleSelect(opt.value)}
          >
            {renderIcon(opt.icon, selected === opt.value)}
            <span className="flex-1 text-text-primary">{opt.label}</span>
            <div className={`w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center transition-all
              ${selected === opt.value ? 'bg-[#D4895A] border-none' : 'border-[1.5px] border-[#D4895A]/50 bg-transparent'}`}>
              {selected === opt.value && (
                <LucideIcons.Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              )}
            </div>
          </button>
        ))}

        {node.question_type === 'single_choice' && (
          <button
            className="w-full py-3.5 lg:py-4 bg-brand text-white rounded-[24px] text-[15px] lg:text-base font-semibold cursor-pointer mt-auto hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed shadow-sm tracking-wide"
            onClick={handleSubmit}
            disabled={!selected}
          >
            {t('continue')}
          </button>
        )}

        {node.question_type === 'multi_choice' && (
          <>
            {node.options?.map(opt => {
              const isSelected = Array.isArray(selected) && selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  className={`flex items-center gap-3.5 px-4 py-3.5 lg:px-5 lg:py-4 rounded-2xl text-[15px] lg:text-base font-medium cursor-pointer text-left w-full transition-all border
                    ${isSelected
                      ? 'bg-warm-100 border-brand shadow-sm'
                      : 'bg-surface border-border hover:bg-warm-50 hover:border-border-hover'
                    }`}
                  onClick={() => handleMultiSelect(opt.value)}
                >
                  {renderIcon(opt.icon, isSelected)}
                  <span className="flex-1 text-text-primary">{opt.label}</span>
                  <div className={`w-[22px] h-[22px] rounded-[6px] shrink-0 flex items-center justify-center transition-all
                    ${isSelected ? 'bg-[#D4895A] border-none' : 'border-[1.5px] border-[#D4895A]/50 bg-transparent'}`}>
                    {isSelected && (
                      <LucideIcons.Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>
              );
            })}
            <button
              className="w-full py-3.5 lg:py-4 bg-brand text-white rounded-[24px] text-[15px] lg:text-base font-semibold cursor-pointer mt-auto hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed shadow-sm tracking-wide"
              onClick={handleSubmit}
              disabled={!Array.isArray(selected) || selected.length === 0}
            >
              {t('continue')}
            </button>
          </>
        )}

        {node.question_type === 'text_input' && (
          <div className="flex flex-col gap-4 mt-2">
            <input
              type="text"
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-5 py-4 bg-warm-50 border border-border rounded-2xl text-text-primary text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-text-muted"
            />
            <button
              className="w-full py-3.5 lg:py-4 bg-brand text-white rounded-[24px] text-[15px] lg:text-base font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-35 disabled:cursor-not-allowed shadow-sm tracking-wide"
              onClick={handleSubmit}
              disabled={!textValue.trim()}
            >
              {t('continue')}
            </button>
          </div>
        )}

        {node.question_type === 'number_input' && (
          <div className="flex flex-col items-center gap-5 mt-4">
            <span className="text-4xl font-bold text-brand">{sliderValue}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderValue}
              onChange={e => setSliderValue(Number(e.target.value))}
              className="w-full h-2 appearance-none bg-warm-200 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
            />
            <button
              className="w-full py-3.5 lg:py-4 bg-brand text-white rounded-[24px] text-[15px] lg:text-base font-semibold cursor-pointer hover:opacity-90 transition-opacity shadow-sm tracking-wide"
              onClick={handleSubmit}
            >
              {t('continue')}
            </button>
          </div>
        )}
      </div>

    </motion.div>
  );
}
