export function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[300px]">
      <div className="w-9 h-9 border-[3px] border-warm-200 border-t-brand rounded-full animate-spin" />
    </div>
  );
}
