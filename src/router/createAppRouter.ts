import { createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './routes';

export function createAppRouter() {
  return createBrowserRouter(appRoutes);
}
