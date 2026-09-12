window.PS_SAVE = (() => {
  const KEY = 'pocket-shop-save-v5';
  const LEGACY_V4 = 'pocket-shop-save-v4';
  const LEGACY_V3 = 'pocket-shop-save-v3';
  const LEGACY_V2 = 'pocket-shop-save-v2';
  const LEGACY_V1 = 'pocket-shop-m0-save-v1';

  const clampInt=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||0)));

  function normalizeUpgrades(up={}){
    const defs=window.PS_DATA.upgrades;
    return {
      rack:clampInt(up.rack,0,defs.rack.maxLevel),
      profit:clampInt(up.profit,0,defs.profit.maxLevel),
      patience:clampInt(up.patience,0,defs.patience.maxLevel)
    };
  }

  function maxStockFromUpgrades(upgrades){
    return window.PS_DATA.baseMaxStock + normalizeUpgrades(upgrades).rack * window.PS_DATA.upgrades.rack.effectPerLevel;
  }

  function normalizeInventory(inv={},upgrades={}){
    const max=maxStockFromUpgrades(upgrades);
    const out={};
    for(const id of Object.keys(window.PS_DATA.items)) out[id]=clampInt(inv[id],0,max);
    return out;
  }

  function unlockedForDay(day){
    return Object.values(window.PS_DATA.items).filter(i=>i.unlockDay<=day).map(i=>i.id);
  }

  function normalizeBoost(boost){
    if(!boost || !Number.isFinite(+boost.day) || !Number.isFinite(+boost.multiplier)) return null;
    return {day:Math.max(1,Math.floor(+boost.day)),multiplier:Math.max(1,+boost.multiplier)};
  }

  function save(state){
    try{
      const upgrades=normalizeUpgrades(state.upgrades);
      const safe = {
        version:5,
        day:Math.max(1,Math.floor(state.day)),
        coins:Math.max(0,Math.floor(state.coins)),
        inventory:normalizeInventory(state.inventory,upgrades),
        unlockedItems:[...new Set(state.unlockedItems || unlockedForDay(state.day))],
        upgrades,
        nextDayBoost:normalizeBoost(state.nextDayBoost),
        // Active customers/events/modal positions are intentionally not saved.
        // Reloading a running day safely returns to PREP for that same day.
        resumePhase:state.phase==='UPGRADE'?'UPGRADE':'PREP',
        tutorialComplete:!!state.tutorialComplete
      };
      localStorage.setItem(KEY, JSON.stringify(safe));
    }catch(_){/* Gameplay remains usable if storage is blocked. */}
  }

  function normalizeLoaded(parsed){
    if(!parsed)return null;
    const day=Math.max(1,Math.floor(parsed.day||1));
    const upgrades=normalizeUpgrades(parsed.upgrades||{});
    return {
      version:5,
      day,
      coins:Math.max(0,Math.floor(parsed.coins||0)),
      inventory:normalizeInventory(parsed.inventory,upgrades),
      unlockedItems:[...new Set(parsed.unlockedItems || unlockedForDay(day))],
      upgrades,
      nextDayBoost:normalizeBoost(parsed.nextDayBoost),
      resumePhase:parsed.resumePhase==='UPGRADE'?'UPGRADE':'PREP',
      tutorialComplete:!!parsed.tutorialComplete
    };
  }

  function migrateRaw(raw,expectedVersion,patch={}){
    if(!raw)return null;
    const old=JSON.parse(raw);
    if(old?.version!==expectedVersion)return null;
    const migrated=normalizeLoaded({...old,...patch,version:5});
    localStorage.setItem(KEY,JSON.stringify(migrated));
    return migrated;
  }

  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){const parsed=JSON.parse(raw);if(parsed?.version===5)return normalizeLoaded(parsed);}

      // M1-D -> M2. Event runtime state is intentionally not migrated/saved.
      const v4=migrateRaw(localStorage.getItem(LEGACY_V4),4);
      if(v4)return v4;

      const v3raw=localStorage.getItem(LEGACY_V3);
      if(v3raw){
        const old=JSON.parse(v3raw);
        if(old?.version===3){
          const migrated=normalizeLoaded({...old,version:5,tutorialComplete:(old.day||1)>1||old.resumePhase==='UPGRADE'});
          localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
        }
      }

      const v2raw=localStorage.getItem(LEGACY_V2);
      if(v2raw){
        const old=JSON.parse(v2raw);
        if(old?.version===2){
          const migrated=normalizeLoaded({...old,version:5,upgrades:{rack:0,profit:0,patience:0},nextDayBoost:null,resumePhase:'PREP',tutorialComplete:(old.day||1)>1});
          localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
        }
      }

      const v1raw=localStorage.getItem(LEGACY_V1);
      if(!v1raw)return null;
      const old=JSON.parse(v1raw);
      if(!old || old.version!==1)return null;
      const migrated=normalizeLoaded({
        day:old.day||1,coins:old.coins||0,inventory:old.inventory,
        unlockedItems:unlockedForDay(old.day||1),upgrades:{rack:0,profit:0,patience:0},tutorialComplete:(old.day||1)>1
      });
      localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
    }catch(_){return null;}
  }

  function reset(){
    try{for(const k of [KEY,LEGACY_V4,LEGACY_V3,LEGACY_V2,LEGACY_V1])localStorage.removeItem(k);}catch(_){ }
  }

  return {save,load,reset};
})();
