window.PS_DATA = Object.freeze({
  version: 1,
  items: {
    bread: { id:'bread', name:'Bread', icon:'./assets/items/item-bread.png', buyPrice:6, sellPrice:10, demand:40 },
    snack: { id:'snack', name:'Snack', icon:'./assets/items/item-snack.png', buyPrice:7, sellPrice:12, demand:35 },
    milk: { id:'milk', name:'Milk', icon:'./assets/items/item-milk.png', buyPrice:9, sellPrice:15, demand:25 }
  },
  customers: [
    './assets/customers/customer-normal-01.png',
    './assets/customers/customer-normal-02.png',
    './assets/customers/customer-normal-03.png'
  ],
  day1: {
    day:1,
    duration:60,
    target:100,
    spawnMin:7,
    spawnMax:9,
    maxCustomers:2,
    startingCoins:80,
    startingStock:{ bread:4, snack:4, milk:3 },
    maxStock:6
  }
});
