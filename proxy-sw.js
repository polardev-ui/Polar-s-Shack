self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate',  () => self.clients.claim());

importScripts('https://render-proxy-6x2v.onrender.com/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();

const scramjet = new ScramjetServiceWorker({
  prefix: 'https://render-proxy-6x2v.onrender.com/scram/',
  bare:   'https://render-proxy-6x2v.onrender.com/bare/'
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    await scramjet.loadConfig();
    if (scramjet.route(event)) return scramjet.fetch(event);
    return fetch(event.request);
  })());
});
