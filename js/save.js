window.PS_SAVE = (() => {
  const KEY = 'pocket-shop-save-v2';
  const LEGACY_KEY = 'pocket-shop-m0-save-v1';

  function normalizeInventory(inv={}){
    const out={};
    for(const id of Object.keys(window.PS_DATA.items)) out[id]=Math.max(0,Number.isFinite(+inv[id])?Math.floor(+inv[id]):0);
    return out;
  }

  function unlockedForDay(day){
    return Object.values(window.PS_DATA.items).filter(i=>i.unlockDay<=day).map(i=>i.id);
  }

  function save(state){
    try{
      const safe = {
        version:2,
        day:Math.max(1,Math.floor(state.day)),
        coins:Math.max(0,Math.floor(state.coins)),
        inventory:normalizeInventory(state.inventory),
        unlockedItems:[...new Set(state.unlockedItems || unlockedForDay(state.day))]
      };
      localStorage.setItem(KEY, JSON.stringify(safe));
    }catch(_){/* Gameplay remains usable if storage is blocked. */}
  }

  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){
        const parsed=JSON.parse(raw);
        if(parsed?.version===2){
          parsed.inventory=normalizeInventory(parsed.inventory);
          parsed.unlockedItems=[...new Set(parsed.unlockedItems || unlockedForDay(parsed.day||1))];
          return parsed;
        }
      }

      // Safe M0 -> M1-A migration. Keeps the player's day, coins and stock.
      const legacyRaw=localStorage.getItem(LEGACY_KEY);
      if(!legacyRaw) return null;
      const legacy=JSON.parse(legacyRaw);
      if(!legacy || legacy.version!==1) return null;
      const migrated={
        version:2,
        day:Math.max(1,Math.floor(legacy.day||1)),
        coins:Math.max(0,Math.floor(legacy.coins||0)),
        inventory:normalizeInventory(legacy.inventory),
        unlockedItems:unlockedForDay(legacy.day||1)
      };
      localStorage.setItem(KEY,JSON.stringify(migrated));
      return migrated;
    }catch(_){return null;}
  }

  function reset(){
    try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY);}catch(_){}
  }

  return {save,load,reset};
})();
