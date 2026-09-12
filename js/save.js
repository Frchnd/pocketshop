window.PS_SAVE = (() => {
  const KEY = 'pocket-shop-save-v6';
  const LEGACY_V5 = 'pocket-shop-save-v5';
  const LEGACY_V4 = 'pocket-shop-save-v4';
  const LEGACY_V3 = 'pocket-shop-save-v3';
  const LEGACY_V2 = 'pocket-shop-save-v2';
  const LEGACY_V1 = 'pocket-shop-m0-save-v1';

  const clampInt=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||0)));
  const DEFAULT_SETTINGS=Object.freeze({music:true,sfx:true});

  function normalizeUpgrades(up={}){
    const defs=window.PS_DATA.upgrades;
    return {
      rack:clampInt(up.rack,0,defs.rack.maxLevel),
      profit:clampInt(up.profit,0,defs.profit.maxLevel),
      patience:clampInt(up.patience,0,defs.patience.maxLevel)
    };
  }

  function normalizeSettings(settings={}){
    return {
      music:settings.music===undefined?DEFAULT_SETTINGS.music:!!settings.music,
      sfx:settings.sfx===undefined?DEFAULT_SETTINGS.sfx:!!settings.sfx
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

  function safeShape(source={}){
    const day=Math.max(1,Math.floor(source.day||1));
    const upgrades=normalizeUpgrades(source.upgrades||{});
    return {
      version:6,
      day,
      coins:Math.max(0,Math.floor(source.coins||0)),
      inventory:normalizeInventory(source.inventory,upgrades),
      unlockedItems:[...new Set(source.unlockedItems || unlockedForDay(day))],
      upgrades,
      nextDayBoost:normalizeBoost(source.nextDayBoost),
      // Active customers/events/animations/modals are deliberately not persisted.
      // A reload during RUNNING returns safely to PREP on the same day.
      resumePhase:source.resumePhase==='UPGRADE'||source.phase==='UPGRADE'?'UPGRADE':'PREP',
      tutorialComplete:!!source.tutorialComplete,
      settings:normalizeSettings(source.settings)
    };
  }

  function save(state){
    try{localStorage.setItem(KEY,JSON.stringify(safeShape(state)));}
    catch(_){/* Storage can be unavailable; gameplay continues in memory. */}
  }

  function migrateKey(key,expectedVersion,patch={}){
    const raw=localStorage.getItem(key);if(!raw)return null;
    const old=JSON.parse(raw);if(old?.version!==expectedVersion)return null;
    const migrated=safeShape({...old,...patch});
    localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
  }

  function load(){
    try{
      const current=localStorage.getItem(KEY);
      if(current){const parsed=JSON.parse(current);if(parsed?.version===6)return safeShape(parsed);}

      // M2 -> M3: preserve gameplay progress and add persistent audio settings.
      const v5=migrateKey(LEGACY_V5,5,{settings:DEFAULT_SETTINGS});
      if(v5)return v5;
      const v4=migrateKey(LEGACY_V4,4,{settings:DEFAULT_SETTINGS});
      if(v4)return v4;

      const v3raw=localStorage.getItem(LEGACY_V3);
      if(v3raw){
        const old=JSON.parse(v3raw);
        if(old?.version===3){
          const migrated=safeShape({...old,settings:DEFAULT_SETTINGS,tutorialComplete:(old.day||1)>1||old.resumePhase==='UPGRADE'});
          localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
        }
      }

      const v2raw=localStorage.getItem(LEGACY_V2);
      if(v2raw){
        const old=JSON.parse(v2raw);
        if(old?.version===2){
          const migrated=safeShape({...old,settings:DEFAULT_SETTINGS,upgrades:{rack:0,profit:0,patience:0},nextDayBoost:null,resumePhase:'PREP',tutorialComplete:(old.day||1)>1});
          localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
        }
      }

      const v1raw=localStorage.getItem(LEGACY_V1);if(!v1raw)return null;
      const old=JSON.parse(v1raw);if(!old||old.version!==1)return null;
      const migrated=safeShape({
        day:old.day||1,coins:old.coins||0,inventory:old.inventory,
        unlockedItems:unlockedForDay(old.day||1),upgrades:{rack:0,profit:0,patience:0},
        tutorialComplete:(old.day||1)>1,settings:DEFAULT_SETTINGS
      });
      localStorage.setItem(KEY,JSON.stringify(migrated));return migrated;
    }catch(_){return null;}
  }

  function reset(){
    try{for(const k of [KEY,LEGACY_V5,LEGACY_V4,LEGACY_V3,LEGACY_V2,LEGACY_V1])localStorage.removeItem(k);}catch(_){ }
  }

  return {save,load,reset,normalizeSettings};
})();
