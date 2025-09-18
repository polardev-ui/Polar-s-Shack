// /proxy-sw.js
importScripts('https://render-proxy-6x2v.onrender.com/scram/scramjet.all.js');

try {
  const { ScramjetServiceWorker } = $scramjetLoadWorker();
  const scramjet = new ScramjetServiceWorker({
    bare: 'https://render-proxy-6x2v.onrender.com/bare/',
    prefix: 'https://render-proxy-6x2v.onrender.com/scram/'
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith((async () => {
      await scramjet.loadConfig();
      if (scramjet.route(event)) return scramjet.fetch(event);
      return fetch(event.request);
    })());
  });
} catch (e) {
  // SW fallback: do nothing special
}
