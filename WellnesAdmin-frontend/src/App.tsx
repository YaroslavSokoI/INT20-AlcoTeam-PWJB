import { Outlet } from 'react-router-dom';
import { Topbar } from '@/components/Topbar';

export function App() {
  return (
    <div className="flex flex-col h-[100svh] w-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <Topbar />
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}
