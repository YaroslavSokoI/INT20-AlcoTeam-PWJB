import { Outlet } from 'react-router-dom';
import { Topbar } from '@/components/Topbar';

export function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--color-bg)]">
      <Topbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
