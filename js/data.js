window.PS_DATA = Object.freeze({
  version: 2,
  maxStock: 6,
  items: {
    bread:  { id:'bread',  name:'Bread',  icon:'./assets/items/item-bread.png',  buyPrice:6,  sellPrice:10, unlockDay:1 },
    snack:  { id:'snack',  name:'Snack',  icon:'./assets/items/item-snack.png',  buyPrice:7,  sellPrice:12, unlockDay:1 },
    milk:   { id:'milk',   name:'Milk',   icon:'./assets/items/item-milk.png',   buyPrice:9,  sellPrice:15, unlockDay:1 },
    juice:  { id:'juice',  name:'Juice',  icon:'./assets/items/item-juice.png',  buyPrice:10, sellPrice:17, unlockDay:3 },
    coffee: { id:'coffee', name:'Coffee', icon:'./assets/items/item-coffee.png', buyPrice:12, sellPrice:21, unlockDay:5 }
  },
  customers: [
    './assets/customers/customer-normal-01.png',
    './assets/customers/customer-normal-02.png',
    './assets/customers/customer-normal-03.png'
  ],
  startingCoins: 80,
  startingStock: { bread:4, snack:4, milk:3, juice:0, coffee:0 },
  days: {
    1: { day:1, duration:60,  target:100, spawnMin:7,   spawnMax:9,   maxCustomers:2, demand:{ bread:40, snack:35, milk:25 } },
    2: { day:2, duration:70,  target:160, spawnMin:6,   spawnMax:8,   maxCustomers:2, demand:{ bread:30, snack:35, milk:35 } },
    3: { day:3, duration:80,  target:240, spawnMin:5,   spawnMax:7,   maxCustomers:3, unlock:['juice'], demand:{ bread:20, snack:25, milk:30, juice:25 } },
    // The master specification does not define a Day 4 demand table.
    // M1-A intentionally inherits Day 3 demand weights until the balancing milestone.
    4: { day:4, duration:90,  target:340, spawnMin:4.5, spawnMax:6.5, maxCustomers:3, demandFrom:3 },
    5: { day:5, duration:100, target:470, spawnMin:4,   spawnMax:6,   maxCustomers:3, unlock:['coffee'], demand:{ bread:15, snack:20, milk:25, juice:25, coffee:15 } }
  }
});
