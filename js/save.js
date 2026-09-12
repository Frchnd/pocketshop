window.PS_SAVE = (() => {
  const KEY = 'pocket-shop-m0-save-v1';
  function save(state){
    try{
      const safe = {
        version:1,
        day:state.day,
        coins:Math.max(0,Math.floor(state.coins)),
        inventory:{...state.inventory}
      };
      localStorage.setItem(KEY, JSON.stringify(safe));
    }catch(_){/* gameplay remains usable if storage is blocked */}
  }
  function load(){
    try{
      const raw=localStorage.getItem(KEY); if(!raw) return null;
      const parsed=JSON.parse(raw);
      if(!parsed || parsed.version!==1) return null;
      return parsed;
    }catch(_){return null;}
  }
  function reset(){ try{ localStorage.removeItem(KEY); }catch(_){} }
  return {save,load,reset};
})();
