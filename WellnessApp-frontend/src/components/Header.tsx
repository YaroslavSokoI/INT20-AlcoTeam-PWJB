import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  onBack?: () => void;
  canGoBack: boolean;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ua', label: 'Українська' },
  { code: 'ru', label: 'Русский' }
] as const;

export function Header({ onBack, canGoBack }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[1];

  return (
    <header className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-5 shrink-0 bg-bg relative z-50">
      <div className="flex-1">
        {canGoBack && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-[15px] font-medium"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            {t('back')}
          </button>
        )}
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-warm-50 transition-colors text-sm font-medium text-text-primary cursor-pointer"
        >
          <span className="uppercase tracking-wide">{currentLang.code}</span>
          <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-[calc(100%+8px)] w-40 bg-white rounded-2xl shadow-xl border border-border overflow-hidden py-1.5"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    i18n.language === lang.code
                      ? 'bg-warm-50 text-brand'
                      : 'text-text-secondary hover:bg-warm-50 hover:text-text-primary'
                  }`}
                >
                  {lang.label}
                  {i18n.language === lang.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
