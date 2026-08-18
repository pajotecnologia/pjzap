export function register() {
  // Service worker registration disabled to prevent stale asset caching
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    }).catch((error) => {
      console.error('Erro ao desregistrar service worker:', error);
    });

    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
  }
}
