import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center gap-4 p-8 pt-0 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >

      <div className="space-y-3 max-w-sm">
        <h1 className="text-[28px] lg:text-[34px] font-extrabold text-text-primary leading-tight tracking-[-0.02em]">
          {t('welcome_title', 'Your Wellness Journey Starts Here')}
        </h1>
        <p className="text-[16px] lg:text-[17px] text-text-secondary leading-relaxed">
          {t('welcome_description', "Answer a few quick questions and we'll create a personalized plan tailored to your goals, lifestyle, and preferences.")}
        </p>
      </div>

      <div className="flex flex-col gap-1 text-left w-full max-w-xs mt-2">
        {[
          { icon: '1', text: t('welcome_step1', 'Tell us about your goals') },
          { icon: '2', text: t('welcome_step2', 'Share your preferences') },
          { icon: '3', text: t('welcome_step3', 'Get your personalized plan') },
        ].map((item) => (
          <div key={item.icon} className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm font-bold shrink-0">
              {item.icon}
            </div>
            <span className="text-[15px] text-text-primary font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-xs">
        <button
          onClick={onStart}
          className="w-full py-4 lg:py-[18px] bg-brand text-white rounded-full text-base lg:text-lg font-bold cursor-pointer hover:bg-brand-dark hover:shadow-md transition-all shadow-sm"
        >
          {t('get_started', "Let's Get Started")}
        </button>
        <p className="text-[11px] lg:text-xs text-text-muted leading-snug text-center">
          {t('consent_notice', 'By pressing the button, you agree to the processing of your personal data')}
        </p>
      </div>
    </motion.div>
  );
}
