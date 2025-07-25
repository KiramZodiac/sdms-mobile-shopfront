
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop.tsx';
import { Analytics } from "@vercel/analytics/next"

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
  <ScrollToTop/>
  <ErrorBoundary>
    <App />
    <Analytics />
  </ErrorBoundary>
  </BrowserRouter>
);
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.error('Service Worker error:', err));
  });
}
// This code is for registering a service worker to enable offline capabilities and caching for the app.
// It checks if service workers are supported in the browser, and if so, registers the service worker
// when the window loads. The service worker file is expected to be located at '/service-worker.js'.
// If the registration is successful, it logs a success message; otherwise, it logs an error message.
// This is useful for Progressive Web Apps (PWAs) to enhance performance and provide offline functionality.
// The service worker can cache assets and API responses, allowing the app to work offline or with
// poor network conditions. It can also handle background sync and push notifications, improving user experience.
// Make sure to create the service worker file and implement the caching logic as needed for your app