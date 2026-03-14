import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Props {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      </div>

      <div className="space-y-3 max-w-sm">
        <h1 className="text-[28px] lg:text-[34px] font-extrabold text-text-primary leading-tight tracking-[-0.02em]">
          {t('welcome_title', 'Your Wellness Journey Starts Here')}
        </h1>
        <p className="text-[16px] lg:text-[17px] text-text-secondary leading-relaxed">
          {t('welcome_description', "Answer a few quick questions and we'll create a personalized plan tailored to your goals, lifestyle, and preferences.")}
        </p>
      </div>

      <div className="flex flex-col gap-2 text-left w-full max-w-xs mt-2">
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
