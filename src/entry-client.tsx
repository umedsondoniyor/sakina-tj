import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import AppProviders from './AppProviders';
import { createAppRouter } from './router/createAppRouter';
import { initGA4 } from './lib/analytics';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found');
}

const router = createAppRouter();
initGA4(import.meta.env.VITE_GA4_MEASUREMENT_ID);

hydrateRoot(
  container,
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
