import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from '@/components/Topbar';
import { useFlowStore } from '@/store/flowStore';

export function App() {
  const loadFlow = useFlowStore(state => state.loadFlow);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  return (
    <div className="flex flex-col h-[100svh] w-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <Topbar />
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
