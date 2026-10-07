import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// In Dev kann ein Service Worker eines anderen Projekts auf demselben Port
// (z.B. localhost:5173) noch aktiv sein und Requests abfangen, bevor der
// echte Dev-Server antwortet. Entfernt alle Service Worker für diesen
// Origin, damit immer der aktuelle Code geladen wird.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
