import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const GraphEditorPage = lazy(() => import('@/pages/GraphEditorPage').then(m => ({ default: m.GraphEditorPage })));
const OffersPage      = lazy(() => import('@/pages/OffersPage').then(m => ({ default: m.OffersPage })));
const AnalyticsPage   = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AdminsPage      = lazy(() => import('@/pages/AdminsPage').then(m => ({ default: m.AdminsPage })));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-text-primary)] animate-spin" />
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <ProtectedRoute reverse />,
    children: [
      { index: true, element: <LoginPage /> }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true,        element: <Lazy><GraphEditorPage /></Lazy> },
          { path: 'offers',     element: <Lazy><OffersPage /></Lazy> },
          { path: 'analytics',  element: <Lazy><AnalyticsPage /></Lazy> },
          { path: 'admins',     element: <Lazy><AdminsPage /></Lazy> },
        ],
      },
    ]
  }
], { basename: '/admin' });
