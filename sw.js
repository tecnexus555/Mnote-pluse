const V = 'mnote-v2', SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'];
const SKIP = /firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/(v1|identitytoolkit)|generativelanguage|archive\.org|accounts\.google|apis\.google|firebaseinstallations/;
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || SKIP.test(r.url)) return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || /cdn\.tailwindcss\.com|fonts\.(googleapis|gstatic)\.com|gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(u.host + u.pathname);
  if (!ok) return;
  if (r.mode === 'navigate') {   // network first, fall back to cached page when offline
    e.respondWith(fetch(r).then(res => { caches.open(V).then(c => c.put('./index.html', res.clone())); return res; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) caches.open(V).then(c => c.put(r, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
