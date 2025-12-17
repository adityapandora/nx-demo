import BraceletEditor from './BraceletEditor';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/:siteId',
    element: <BraceletEditor />,
  },
]);
