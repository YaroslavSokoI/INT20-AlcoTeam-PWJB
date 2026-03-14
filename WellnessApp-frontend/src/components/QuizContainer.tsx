import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuiz } from '../hooks/useQuiz';
import { QuestionStep } from './steps/QuestionStep';
import { InfoStep } from './steps/InfoStep';
import { OfferResult } from './OfferResult';
import { ProgressBar } from './ProgressBar';
import { Header } from './Header';
import { LoadingSpinner } from './LoadingSpinner';

export function QuizContainer() {
  const { stage, session, result, error, startQuiz, submitAnswer, goBack } = useQuiz();

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  if (stage === 'loading') {
    return <LoadingSpinner />;
  }

  if (stage === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center bg-white">
        <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center text-3xl">
          :(
        </div>
        <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
        <p className="text-text-secondary text-sm max-w-xs">{error}</p>
        <button
          onClick={() => startQuiz()}
          className="px-8 py-3 bg-brand text-white rounded-full text-sm font-semibold cursor-pointer hover:bg-brand-dark transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (stage === 'result' && result) {
    return <OfferResult result={result} />;
  }

  if (!session?.current_node) return null;

  const { current_node } = session;
  const canGoBack = session.history.length > 0;

  return (
    <div className="flex-1 flex flex-col">
      <Header canGoBack={canGoBack} onBack={canGoBack ? goBack : undefined} />
      <div className="px-5 pt-2 lg:px-8 lg:pt-4">
        <ProgressBar currentStep={session.current_step} totalSteps={session.total_steps} />
      </div>
      <div className="flex-1 flex flex-col px-5 pb-6 lg:px-8 lg:pb-8">
        <AnimatePresence mode="wait">
          {current_node.node_type === 'question' ? (
            <QuestionStep
              key={current_node.id}
              node={current_node}
              onAnswer={submitAnswer}
            />
          ) : current_node.node_type === 'info' ? (
            <InfoStep
              key={current_node.id}
              node={current_node}
              onContinue={() => submitAnswer(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
