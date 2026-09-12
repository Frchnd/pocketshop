window.PS_GAME = (() => {
  const D=window.PS_DATA;
  let state;
  let listener=()=>{};

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const allItemIds=()=>Object.keys(D.items);
  const blankSold=()=>Object.fromEntries(allItemIds().map(id=>[id,0]));
  const random=(min,max)=>min+Math.random()*(max-min);

  function configForDay(day){
    // M1-A is authored through Day 5. Day 6+ temporarily reuses Day 5 tuning.
    return D.days[Math.min(Math.max(1,day),5)];
  }

  function demandForDay(day){
    const cfg=configForDay(day);
    if(cfg.demand) return cfg.demand;
    if(cfg.demandFrom) return D.days[cfg.demandFrom].demand;
    return D.days[1].demand;
  }

  function unlockedForDay(day){
    return Object.values(D.items).filter(item=>item.unlockDay<=day).map(item=>item.id);
  }

  function normalizeInventory(inv={}){
    const out={};
    for(const id of allItemIds()) out[id]=clamp(Number.isFinite(+inv[id])?Math.floor(+inv[id]):0,0,D.maxStock);
    return out;
  }

  function makeStateFromSave(){
    const saved=window.PS_SAVE.load();
    const day=saved?.day || 1;
    const cfg=configForDay(day);
    const unlocked=[...new Set([...(saved?.unlockedItems||[]),...unlockedForDay(day)])];
    const inventory=saved?.inventory ? normalizeInventory(saved.inventory) : normalizeInventory(D.startingStock);
    for(const id of unlocked) if(!(id in inventory)) inventory[id]=0;
    return {
      phase:'PREP', day, coins:saved?.coins ?? D.startingCoins,
      target:cfg.target, duration:cfg.duration, timeRemaining:cfg.duration,
      revenue:0, inventory, maxStock:D.maxStock, unlockedItems:unlocked,
      customers:[], served:0, lost:0, sold:blankSold(),
      spawnIn:1.2, paused:false, nextCustomerId:1, transactionLock:false,
      pendingUnlocks:[], tuningDay:cfg.day
    };
  }

  function emit(){
    const copy=typeof structuredClone==='function' ? structuredClone(state) : JSON.parse(JSON.stringify(state));
    listener(copy);
  }

  function onChange(fn){listener=typeof fn==='function'?fn:()=>{};emit();}

  function refreshDayConfig(){
    const cfg=configForDay(state.day);
    state.target=cfg.target;
    state.duration=cfg.duration;
    state.timeRemaining=cfg.duration;
    state.tuningDay=cfg.day;
  }

  function weightedItem(){
    const demand=demandForDay(state.day);
    const ids=state.unlockedItems.filter(id=>D.items[id] && (demand[id]||0)>0);
    let total=0;const weights={};
    for(const id of ids){
      const base=demand[id]||0;
      const adjusted=state.inventory[id]===0?base*.65:base;
      weights[id]=adjusted;total+=adjusted;
    }
    if(total<=0) return state.unlockedItems[0] || 'bread';
    let r=Math.random()*total;
    for(const id of ids){r-=weights[id];if(r<=0)return id;}
    return ids[0];
  }

  function restock(id){
    if(state.transactionLock || !['PREP','RUNNING'].includes(state.phase) || !state.unlockedItems.includes(id)) return {ok:false};
    const item=D.items[id];if(!item)return {ok:false};
    const room=state.maxStock-state.inventory[id];
    const qty=Math.min(2,room);
    const cost=item.buyPrice*qty;
    if(qty<=0 || state.coins<cost)return {ok:false};
    state.transactionLock=true;
    state.coins-=cost;state.inventory[id]+=qty;
    state.coins=Math.max(0,state.coins);state.inventory[id]=clamp(state.inventory[id],0,state.maxStock);
    window.PS_SAVE.save(state);
    state.transactionLock=false;emit();
    return {ok:true,qty,cost,item};
  }

  function openShop(){
    if(state.phase!=='PREP')return false;
    refreshDayConfig();
    state.phase='RUNNING';state.spawnIn=1;state.customers=[];
    state.revenue=0;state.served=0;state.lost=0;state.sold=blankSold();
    emit();return true;
  }

  function setPaused(v){state.paused=!!v;emit();}

  function spawnCustomer(){
    const cfg=configForDay(state.day);
    if(state.customers.length>=cfg.maxCustomers)return;
    state.customers.push({
      id:state.nextCustomerId++,item:weightedItem(),patience:12,maxPatience:12,
      age:0,state:'WAITING',avatar:Math.floor(Math.random()*D.customers.length),processed:false
    });
    state.spawnIn=random(cfg.spawnMin,cfg.spawnMax);
  }

  function processSale(c){
    if(c.processed || c.state!=='WAITING' || state.inventory[c.item]<=0)return;
    const item=D.items[c.item];
    c.processed=true;c.state='BUYING';
    state.inventory[c.item]=Math.max(0,state.inventory[c.item]-1);
    state.coins+=item.sellPrice;state.revenue+=item.sellPrice;state.served++;state.sold[c.item]++;
    emit();
    setTimeout(()=>{
      c.state='LEAVING';emit();
      setTimeout(()=>{state.customers=state.customers.filter(x=>x.id!==c.id);emit();},220);
    },260);
  }

  function failCustomer(c){
    if(c.processed)return;
    c.processed=true;c.state='FAILED';state.lost++;emit();
    setTimeout(()=>{state.customers=state.customers.filter(x=>x.id!==c.id);emit();},360);
  }

  function tick(dt){
    if(state.phase!=='RUNNING'||state.paused)return;
    const cfg=configForDay(state.day);
    dt=clamp(dt,0,.25);
    state.timeRemaining=Math.max(0,state.timeRemaining-dt);
    state.spawnIn-=dt;
    if(state.spawnIn<=0){
      spawnCustomer();
      if(state.customers.length>=cfg.maxCustomers) state.spawnIn=.6;
    }
    for(const c of [...state.customers]){
      if(c.state!=='WAITING')continue;
      c.age+=dt;c.patience=Math.max(0,c.patience-dt);
      if(c.age>=.8 && state.inventory[c.item]>0)processSale(c);
      else if(c.patience<=0)failCustomer(c);
    }
    if(state.timeRemaining<=0)endDay();else emit();
  }

  function endDay(){
    if(state.phase!=='RUNNING')return;
    state.phase='SUMMARY';state.customers=[];
    // Existing M0 consolation behavior is retained until the full reward milestone.
    if(state.revenue<state.target)state.coins+=30;
    window.PS_SAVE.save(state);emit();
  }

  function nextDay(){
    if(state.phase!=='SUMMARY')return false;
    const previousUnlocked=new Set(state.unlockedItems);
    state.day+=1;
    refreshDayConfig();
    const nowUnlocked=unlockedForDay(state.day);
    const newlyUnlocked=nowUnlocked.filter(id=>!previousUnlocked.has(id));
    for(const id of nowUnlocked){
      if(!state.unlockedItems.includes(id))state.unlockedItems.push(id);
      if(!(id in state.inventory))state.inventory[id]=0;
    }
    state.pendingUnlocks=newlyUnlocked;
    state.phase='PREP';state.revenue=0;state.customers=[];state.served=0;state.lost=0;state.sold=blankSold();state.spawnIn=1.2;state.paused=false;
    window.PS_SAVE.save(state);emit();return true;
  }

  function clearPendingUnlocks(){state.pendingUnlocks=[];emit();}
  function getState(){return state;}
  function getDayConfig(day=state.day){return configForDay(day);}

  state=makeStateFromSave();
  return {onChange,getState,getDayConfig,restock,openShop,setPaused,tick,nextDay,clearPendingUnlocks};
})();
