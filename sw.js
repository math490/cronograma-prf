/* Cache de arquivos estáticos e de bibliotecas públicas para uso repetido.
   O progresso NÃO está no cache; está no arquivo SQLite salvo no IndexedDB. */
const VERSION='prf-study-2026-v1';
const STATIC=['./','./index.html','./assets/app.js','./assets/db.js','./assets/style.css','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./data/cronograma.json','./data/disciplinas.json','./data/template.sqlite','./manifest.webmanifest'];
const OPTIONAL=[
 'https://cdn.jsdelivr.net/npm/vue@3.5.18/dist/vue.global.prod.js',
 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.js',
 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm',
 'https://cdn.jsdelivr.net/npm/daisyui@5/daisyui.css',
 'https://cdn.jsdelivr.net/npm/daisyui@5/themes.css',
 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
   const cache=await caches.open(VERSION);
   await cache.addAll(STATIC);
   await Promise.allSettled(OPTIONAL.map(async url=>{
     try {const response=await fetch(url,{mode:'no-cors'});if(response)await cache.put(url,response);}catch(e){}
   }));
   await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim();})());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.hostname==='dummyjson.com')return; // nunca salvar resposta motivacional na cache geral
 if(url.protocol!=='https:' && url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
   const cache=await caches.open(VERSION);
   const cached=await cache.match(request);
   if(cached) {
     // URLs versionadas do site são atualizadas com nova versão do service worker.
     return cached;
   }
   try {const response=await fetch(request);if(response&&response.ok&&url.origin===self.location.origin)cache.put(request,response.clone());return response;}
   catch(err){return cached||Response.error();}
 })());
});
