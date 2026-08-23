/* Le jeu doit rester jouable sans connexion.
   La bibliothèque 3D est récupérée sur internet au TOUT PREMIER lancement,
   puis conservée définitivement : ensuite, plus besoin de réseau. */
const CACHE="operation-chaos-v56";
const TROIS_D="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
const FICHIERS=["./","index.html","app.html","jeu.html","manifest.json",
  "icon-48.png","icon-72.png","icon-96.png",
  "icon-144.png","icon-192.png","icon-512.png"];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(FICHIERS).catch(()=>{});
    // la bibliothèque 3D : on l'attrape dès l'installation
    try{ await c.add(TROIS_D); }
    catch(err){
      try{ const r=await fetch(TROIS_D,{mode:"no-cors"}); await c.put(TROIS_D,r); }catch(e2){}
    }
  })());
});

self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(l=>Promise.all(l.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch",e=>{
  e.respondWith((async()=>{
    const enCache=await caches.match(e.request);
    if(enCache) return enCache;
    try{
      const reponse=await fetch(e.request);
      // on garde au passage tout ce qui peut resservir hors connexion
      if(e.request.method==="GET"){
        const c=await caches.open(CACHE);
        c.put(e.request, reponse.clone()).catch(()=>{});
      }
      return reponse;
    }catch(err){
      const repli=await caches.match("index.html");
      if(repli) return repli;
      throw err;
    }
  })());
});
