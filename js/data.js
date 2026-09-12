window.PS_DATA = Object.freeze({
  version: 8,
  baseMaxStock: 6,
  maxStock: 6,
  items: {
    bread:  { id:'bread',  name:'Bread',  icon:'./assets/items/item-bread.webp',  buyPrice:6,  sellPrice:10, unlockDay:1 },
    snack:  { id:'snack',  name:'Snack',  icon:'./assets/items/item-snack.webp',  buyPrice:7,  sellPrice:12, unlockDay:1 },
    milk:   { id:'milk',   name:'Milk',   icon:'./assets/items/item-milk.webp',   buyPrice:9,  sellPrice:15, unlockDay:1 },
    juice:  { id:'juice',  name:'Juice',  icon:'./assets/items/item-juice.webp',  buyPrice:10, sellPrice:17, unlockDay:3 },
    coffee: { id:'coffee', name:'Coffee', icon:'./assets/items/item-coffee.webp', buyPrice:12, sellPrice:21, unlockDay:5 }
  },

  customerAvatars: [
    './assets/customers/customer-normal-01.webp',
    './assets/customers/customer-normal-02.webp',
    './assets/customers/customer-normal-03.webp'
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
      // Master spec says Bulk is more patient but gives no exact baseline.
      // M2 keeps the prior provisional 14-second value for consistency.
      patience:14, quantity:2, badge:'👜', cue:'Bulk', bonusThreshold:null, bonusCoins:0
    }
  },

  upgrades: {
    rack: {
      id:'rack', name:'Rack+', icon:'🗄️', maxLevel:3,
      shortEffect:'+2 max stock', effectPerLevel:2
    },
    profit: {
      id:'profit', name:'Profit+', icon:'🪙', maxLevel:5,
      shortEffect:'+8% sell price', effectPerLevel:.08
    },
    patience: {
      id:'patience', name:'Patience+', icon:'⏱️', maxLevel:5,
      shortEffect:'+1.5 sec patience', effectPerLevel:1.5
    }
  },

  rewards: {
    // Source defines +60..+120 across progression but not exact daily values.
    // M2 keeps the existing Day 1–5 ramp because it is already stable in saves.
    cashByDay: {1:60,2:75,3:90,4:105,5:120},
    freeStockPerItem:2,
    freeStockItemCount:2,
    nextDaySellMultiplier:1.10
  },

  events: {
    snackRush: {
      id:'snackRush', name:'Snack Rush', icon:'🍪', duration:15,
      banner:'More snack orders!',
      demandMultipliers:{ snack:2 },
      sellMultipliers:{ snack:1.2 },
      spawnDelayMultiplier:1
    },
    hotDay: {
      id:'hotDay', name:'Hot Day', icon:'☀️', duration:20,
      banner:'More cold drink orders!',
      demandMultipliers:{ juice:1.8, milk:1.4 },
      sellMultipliers:{},
      spawnDelayMultiplier:1
    },
    busyHour: {
      id:'busyHour', name:'Busy Hour', icon:'🕒', duration:15,
      banner:'More customers!',
      demandMultipliers:{},
      sellMultipliers:{},
      spawnDelayMultiplier:.7
    },
    morningRush: {
      id:'morningRush', name:'Morning Rush', icon:'🥐', duration:20,
      banner:'Coffee rush!',
      demandMultipliers:{ coffee:2 },
      sellMultipliers:{ coffee:1.2 },
      // Day 5 source says spawn +40%; equivalent delay ~= 1/1.4.
      spawnDelayMultiplier:1/1.4
    }
  },

  startingCoins: 80,
  startingStock: { bread:4, snack:4, milk:3, juice:0, coffee:0 },
  days: {
    1: {
      day:1, label:'LEARN', duration:60, target:100, spawnMin:7, spawnMax:9, maxCustomers:2,
      demand:{ bread:40, snack:35, milk:25 },
      customerTypes:{ normal:100 }
    },
    2: {
      day:2, label:'MANAGE', duration:70, target:160, spawnMin:6, spawnMax:8, maxCustomers:2,
      demand:{ bread:30, snack:35, milk:35 },
      customerTypes:{ normal:85, impatient:15 }
    },
    3: {
      day:3, label:'FIRST RUSH', duration:80, target:240, spawnMin:5, spawnMax:7, maxCustomers:3,
      unlock:['juice'], demand:{ bread:20, snack:25, milk:30, juice:25 },
      customerTypes:{ normal:70, impatient:20, bulk:10 },
      event:'snackRush',
      // The source does not define exact event start time. Production pacing rule:
      // regular events trigger after the first quarter of the day.
      eventStartFraction:.25
    },
    4: {
      day:4, label:'STRATEGY', duration:90, target:340, spawnMin:4.5, spawnMax:6.5, maxCustomers:3,
      // The master source does not define a Day 4 demand table. M2 keeps the
      // Day 3 baseline, then the selected event provides the variation.
      demandFrom:3,
      customerTypes:{ normal:60, impatient:25, bulk:15 },
      normalPatience:11,
      impatientPatience:7,
      eventPool:['hotDay','busyHour','snackRush'],
      eventStartFraction:.25
    },
    5: {
      day:5, label:'FIRST MILESTONE', duration:100, target:470, spawnMin:4, spawnMax:6, maxCustomers:3,
      unlock:['coffee'], demand:{ bread:15, snack:20, milk:25, juice:25, coffee:15 },
      customerTypes:{ normal:55, impatient:25, bulk:20 },
      event:'morningRush',
      // Morning Rush is deliberately an opening event; the source calls it the
      // Day 5 special event but does not specify a separate trigger timestamp.
      eventStartFraction:0
    }
  }
});
