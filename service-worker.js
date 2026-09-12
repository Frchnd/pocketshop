const CACHE='pocket-shop-m4-v8';
const CORE=[
  './','./index.html','./manifest.webmanifest','./css/style.css',
  './js/data.js','./js/save.js','./js/game.js','./js/audio.js','./js/ui.js','./js/release.js','./js/app.js',
  './icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-192.png','./icons/icon-maskable-512.png',
  './assets/shop/shop-background.webp','./assets/shop/awning.webp','./assets/shop/shop-sign.webp','./assets/shop/counter.webp','./assets/shop/register.webp','./assets/shop/shop-cat.webp',
  './assets/racks/rack-bakery.webp','./assets/racks/rack-snacks.webp','./assets/racks/rack-drinks.webp',
  './assets/items/item-bread.webp','./assets/items/item-snack.webp','./assets/items/item-milk.webp','./assets/items/item-juice.webp','./assets/items/item-coffee.webp',
  './assets/customers/cashier.webp','./assets/customers/customer-normal-01.webp','./assets/customers/customer-normal-02.webp','./assets/customers/customer-normal-03.webp',
  './assets/icons/icon-coin.webp','./assets/icons/icon-calendar.webp','./assets/icons/icon-target.webp','./assets/icons/icon-gift.webp','./assets/icons/icon-sun.webp','./assets/icons/icon-plus.webp'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('pocket-shop-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

async function navigationResponse(request){
  try{
    const response=await fetch(request);
    if(response&&response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{});}
    return response;
  }catch(_){
    return (await caches.match(request)) || (await caches.match('./')) || (await caches.match('./index.html')) || new Response('Pocket Shop is offline and its core cache is unavailable.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}

async function staticResponse(request){
  const hit=await caches.match(request);if(hit)return hit;
  try{
    const response=await fetch(request);
    if(response&&response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{});}
    return response;
  }catch(_){return new Response('',{status:504,statusText:'Offline'});}
}

self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){event.respondWith(navigationResponse(request));return;}
  event.respondWith(staticResponse(request));
});
