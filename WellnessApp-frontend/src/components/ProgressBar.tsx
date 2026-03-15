interface Props {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: Props) {
  // We'll create an array of "segments"
  const segments = Array.from({ length: totalSteps }, (_, i) => i);

  return (
    <div className="w-full flex items-center justify-between gap-1.5 mb-4 lg:mb-6 shrink-0">
      {segments.map((index) => {
        const isActive = index < currentStep;
        return (
          <div
            key={index}
            className={`flex-1 h-1 lg:h-1.5 rounded-full transition-colors duration-500 ease-out ${
              isActive ? 'bg-brand' : 'bg-warm-100'
            }`}
          />
        );
      })}
    </div>
  );
}
