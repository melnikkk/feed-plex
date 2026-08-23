import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { withProviders } from './app/providers';

const AppWithProviders = withProviders(() => null);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>,
);
