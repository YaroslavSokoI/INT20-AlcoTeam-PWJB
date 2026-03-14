export function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-dvh">
      <div className="w-10 h-10 border-3 border-dark-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}
