window.PS_DATA = Object.freeze({
  version: 3,
  maxStock: 6,
  items: {
    bread:  { id:'bread',  name:'Bread',  icon:'./assets/items/item-bread.png',  buyPrice:6,  sellPrice:10, unlockDay:1 },
    snack:  { id:'snack',  name:'Snack',  icon:'./assets/items/item-snack.png',  buyPrice:7,  sellPrice:12, unlockDay:1 },
    milk:   { id:'milk',   name:'Milk',   icon:'./assets/items/item-milk.png',   buyPrice:9,  sellPrice:15, unlockDay:1 },
    juice:  { id:'juice',  name:'Juice',  icon:'./assets/items/item-juice.png',  buyPrice:10, sellPrice:17, unlockDay:3 },
    coffee: { id:'coffee', name:'Coffee', icon:'./assets/items/item-coffee.png', buyPrice:12, sellPrice:21, unlockDay:5 }
  },

  // M1-B uses the existing locked customer art and gives each type a stable
  // avatar + visual cue. Dedicated animation frames can replace these later
  // without changing gameplay logic.
  customerAvatars: [
    './assets/customers/customer-normal-01.png',
    './assets/customers/customer-normal-02.png',
    './assets/customers/customer-normal-03.png'
  ],
  customerTypes: {
    normal: {
      id:'normal', name:'Normal', avatar:0, patience:12, quantity:1,
      badge:'', cue:'', bonusThreshold:null, bonusCoins:0
    },
    impatient: {
      id:'impatient', name:'Impatient', avatar:1, patience:8, quantity:1,
      badge:'⚡', cue:'Hurry!', bonusThreshold:.5, bonusCoins:2
    },
    bulk: {
      id:'bulk', name:'Bulk', avatar:2,
      // The master spec says Bulk is "more patient" but gives no exact value.
      // 14 seconds is provisional M1-B tuning and is isolated here for balancing.
      patience:14, quantity:2, badge:'👜', cue:'Bulk', bonusThreshold:null, bonusCoins:0
    }
  },

  startingCoins: 80,
  startingStock: { bread:4, snack:4, milk:3, juice:0, coffee:0 },
  days: {
    1: {
      day:1, duration:60, target:100, spawnMin:7, spawnMax:9, maxCustomers:2,
      demand:{ bread:40, snack:35, milk:25 },
      customerTypes:{ normal:100 }
    },
    2: {
      day:2, duration:70, target:160, spawnMin:6, spawnMax:8, maxCustomers:2,
      demand:{ bread:30, snack:35, milk:35 },
      customerTypes:{ normal:85, impatient:15 }
    },
    3: {
      day:3, duration:80, target:240, spawnMin:5, spawnMax:7, maxCustomers:3,
      unlock:['juice'], demand:{ bread:20, snack:25, milk:30, juice:25 },
      customerTypes:{ normal:70, impatient:20, bulk:10 }
    },
    4: {
      day:4, duration:90, target:340, spawnMin:4.5, spawnMax:6.5, maxCustomers:3,
      // The master specification does not define a Day 4 demand table.
      // M1-B intentionally inherits Day 3 demand weights until balancing.
      demandFrom:3,
      customerTypes:{ normal:60, impatient:25, bulk:15 },
      normalPatience:11,
      impatientPatience:7
    },
    5: {
      day:5, duration:100, target:470, spawnMin:4, spawnMax:6, maxCustomers:3,
      unlock:['coffee'], demand:{ bread:15, snack:20, milk:25, juice:25, coffee:15 },
      customerTypes:{ normal:55, impatient:25, bulk:20 }
    }
  }
});
