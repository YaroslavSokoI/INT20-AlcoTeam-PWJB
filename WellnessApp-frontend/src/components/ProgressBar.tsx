interface Props {
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  return (
    <div className="w-full h-1 bg-dark-border rounded-sm overflow-hidden mb-6 shrink-0">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent rounded-sm transition-[width] duration-400 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
