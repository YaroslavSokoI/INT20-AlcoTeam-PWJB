import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { GraphEditorPage } from '@/pages/GraphEditorPage';
import { OffersPage } from '@/pages/OffersPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
          { index: true, element: <GraphEditorPage /> },
          { path: 'offers', element: <OffersPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
        ],
      },
    ]
  }
], { basename: '/admin' });
