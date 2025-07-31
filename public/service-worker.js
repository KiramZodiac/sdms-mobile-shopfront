self.addEventListener('install', (event) => {
    // Service Worker installed - logs removed for production
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    // Service Worker activated - logs removed for production
  });
  
  self.addEventListener('fetch', (event) => {
    // Optional caching logic here
  });
  