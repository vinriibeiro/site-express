// Cache simples para o protótipo abrir como app instalado (PWA)
const C='mfos-v1', A=['./','index.html','app.css','app.js','data.js','../assets/logo-branco.png','../assets/icone.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))));
