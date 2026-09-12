const CACHE='pocket-shop-m1c-v4';
const CORE=[
  './','./index.html','./manifest.webmanifest','./css/style.css',
  './js/data.js','./js/save.js','./js/game.js','./js/ui.js','./js/app.js',
  './icons/icon-192.png','./icons/icon-512.png',
  './assets/shop/shop-background.png','./assets/shop/awning.png','./assets/shop/shop-sign.png','./assets/shop/counter.png','./assets/shop/register.png','./assets/shop/shop-cat.png',
  './assets/racks/rack-bakery.png','./assets/racks/rack-snacks.png','./assets/racks/rack-drinks.png',
  './assets/items/item-bread.png','./assets/items/item-snack.png','./assets/items/item-milk.png','./assets/items/item-juice.png','./assets/items/item-coffee.png',
  './assets/customers/cashier.png','./assets/customers/customer-normal-01.png','./assets/customers/customer-normal-02.png','./assets/customers/customer-normal-03.png',
  './assets/icons/icon-coin.png','./assets/icons/icon-calendar.png','./assets/icons/icon-target.png','./assets/icons/icon-gift.png','./assets/icons/icon-sun.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match('./index.html'))));
});
