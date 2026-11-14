/* PRF Study SW v2: network-first. Uma nova publicação no GitHub não pode ficar
   bloqueada por cópias antigas de JS/HTML. Bancos locais ficam fora do Cache API. */
const VERSION = 'prf-study-shell-v2-20261114';
const STATIC = ['./','./index.html','./assets/app.js','./assets/db.js','./assets/config.js','./assets/style.css','./manifest.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(VERSION);
    await Promise.allSettled(STATIC.map(url=>cache.add(new Request(url,{cache:'reload'}))));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('prf-study-')&&k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(req,{cache:'no-cache'});
      if(fresh&&fresh.ok){const cache=await caches.open(VERSION);event.waitUntil(cache.put(req,fresh.clone()));}
      return fresh;
    } catch(e){
      const cached=await caches.match(req);
      if(cached)return cached;
      if(req.mode==='navigate')return (await caches.match('./index.html'))||Response.error();
      return Response.error();
    }
  })());
});
