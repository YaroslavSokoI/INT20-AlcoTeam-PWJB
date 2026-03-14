import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuiz } from '../hooks/useQuiz';
import { QuestionStep } from './steps/QuestionStep';
import { InfoStep } from './steps/InfoStep';
import { OfferResult } from './OfferResult';
import { ProgressBar } from './ProgressBar';
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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h2 className="text-2xl font-bold">Oops!</h2>
        <p className="text-dark-text">{error}</p>
        <button
          onClick={() => startQuiz()}
          className="px-8 py-3 bg-primary text-white rounded-xl text-base cursor-pointer hover:bg-primary-dark transition-colors"
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
    <div className="flex-1 flex flex-col p-4 pb-[env(safe-area-inset-bottom,16px)]">
      <ProgressBar progress={session.progress} />
      <AnimatePresence mode="wait">
        {current_node.node_type === 'question' ? (
          <QuestionStep
            key={current_node.id}
            node={current_node}
            onAnswer={submitAnswer}
            onBack={canGoBack ? goBack : undefined}
          />
        ) : current_node.node_type === 'info' ? (
          <InfoStep
            key={current_node.id}
            node={current_node}
            onContinue={() => submitAnswer(null)}
            onBack={canGoBack ? goBack : undefined}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
