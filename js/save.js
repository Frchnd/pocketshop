window.PS_SAVE = (() => {
  const KEY = 'pocket-shop-save-v7';
  const CORRUPT_BACKUP = 'pocket-shop-save-corrupt-backup';
  const LEGACY = [
    ['pocket-shop-save-v6',6],
    ['pocket-shop-save-v5',5],
    ['pocket-shop-save-v4',4],
    ['pocket-shop-save-v3',3],
    ['pocket-shop-save-v2',2],
    ['pocket-shop-m0-save-v1',1]
  ];
  const DEFAULT_SETTINGS=Object.freeze({music:true,sfx:true});
  const status={storageAvailable:true,recoveredFromCorruption:false,loadedFrom:'new'};
  const clampInt=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||0)));

  function storageWorks(){
    try{const k='__ps_storage_test__';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}
    catch(_){status.storageAvailable=false;return false;}
  }

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
    const max=maxStockFromUpgrades(upgrades),out={};
    for(const id of Object.keys(window.PS_DATA.items))out[id]=clampInt(inv[id],0,max);
    return out;
  }
  function unlockedForDay(day){
    return Object.values(window.PS_DATA.items).filter(i=>i.unlockDay<=day).map(i=>i.id);
  }
  function normalizeBoost(boost){
    if(!boost||!Number.isFinite(+boost.day)||!Number.isFinite(+boost.multiplier))return null;
    return {day:Math.max(1,Math.floor(+boost.day)),multiplier:Math.max(1,+boost.multiplier)};
  }
  function safeShape(source={}){
    const day=Math.max(1,Math.floor(source.day||1)),upgrades=normalizeUpgrades(source.upgrades||{});
    return {
      version:7,day,coins:Math.max(0,Math.floor(source.coins||0)),
      inventory:normalizeInventory(source.inventory,upgrades),
      unlockedItems:[...new Set(source.unlockedItems||unlockedForDay(day))],
      upgrades,nextDayBoost:normalizeBoost(source.nextDayBoost),
      // Runtime-only state is never persisted. Reload mid-day safely returns to PREP.
      resumePhase:source.resumePhase==='UPGRADE'||source.phase==='UPGRADE'?'UPGRADE':'PREP',
      tutorialComplete:!!source.tutorialComplete,
      settings:normalizeSettings(source.settings)
    };
  }

  function save(state){
    if(!status.storageAvailable&&!storageWorks())return false;
    try{localStorage.setItem(KEY,JSON.stringify(safeShape(state)));return true;}
    catch(_){status.storageAvailable=false;return false;}
  }

  function preserveCorrupt(raw){
    status.recoveredFromCorruption=true;
    try{localStorage.setItem(CORRUPT_BACKUP,String(raw).slice(0,200000));localStorage.removeItem(KEY);}catch(_){ }
  }

  function migrateLegacy(key,version){
    const raw=localStorage.getItem(key);if(!raw)return null;
    let old;try{old=JSON.parse(raw);}catch(_){return null;}
    if(!old||old.version!==version)return null;
    let patch={};
    if(version<=5)patch.settings=DEFAULT_SETTINGS;
    if(version===3)patch={...patch,tutorialComplete:(old.day||1)>1||old.resumePhase==='UPGRADE'};
    if(version===2)patch={...patch,upgrades:{rack:0,profit:0,patience:0},nextDayBoost:null,resumePhase:'PREP',tutorialComplete:(old.day||1)>1};
    if(version===1)patch={...patch,day:old.day||1,coins:old.coins||0,inventory:old.inventory,unlockedItems:unlockedForDay(old.day||1),upgrades:{rack:0,profit:0,patience:0},tutorialComplete:(old.day||1)>1,settings:DEFAULT_SETTINGS};
    const migrated=safeShape({...old,...patch});
    localStorage.setItem(KEY,JSON.stringify(migrated));status.loadedFrom=`v${version}`;return migrated;
  }

  function load(){
    if(!storageWorks())return null;
    try{
      const current=localStorage.getItem(KEY);
      if(current){
        try{const parsed=JSON.parse(current);if(parsed?.version===7){status.loadedFrom='v7';return safeShape(parsed);}preserveCorrupt(current);}
        catch(_){preserveCorrupt(current);}
      }
      for(const [key,version] of LEGACY){const migrated=migrateLegacy(key,version);if(migrated)return migrated;}
      return null;
    }catch(_){status.storageAvailable=false;return null;}
  }

  function reset(){
    try{for(const [k] of [[KEY],...LEGACY.map(([k])=>[k]),[CORRUPT_BACKUP]])localStorage.removeItem(k);}catch(_){ }
  }
  function getStatus(){return {...status};}
  return {save,load,reset,normalizeSettings,getStatus};
})();
