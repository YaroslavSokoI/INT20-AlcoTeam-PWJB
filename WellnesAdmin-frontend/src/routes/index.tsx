import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { GraphEditorPage } from '@/pages/GraphEditorPage';
import { OffersPage } from '@/pages/OffersPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true,       element: <GraphEditorPage /> },
      { path: 'offers',    element: <OffersPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
    ],
  },
]);
