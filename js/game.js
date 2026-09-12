window.PS_GAME = (() => {
  const D=window.PS_DATA;
  let state;
  let listener=()=>{};

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const allItemIds=()=>Object.keys(D.items);
  const blankSold=()=>Object.fromEntries(allItemIds().map(id=>[id,0]));
  const random=(min,max)=>min+Math.random()*(max-min);
  const blankUpgrades=()=>({rack:0,profit:0,patience:0});

  function configForDay(day){
    // M1 is authored through Day 5. Day 6+ temporarily reuses Day 5 tuning.
    return D.days[Math.min(Math.max(1,day),5)];
  }

  function demandForDay(day){
    const cfg=configForDay(day);
    if(cfg.demand)return cfg.demand;
    if(cfg.demandFrom)return D.days[cfg.demandFrom].demand;
    return D.days[1].demand;
  }

  function unlockedForDay(day){
    return Object.values(D.items).filter(item=>item.unlockDay<=day).map(item=>item.id);
  }

  function normalizedUpgrades(up={}){
    return Object.fromEntries(Object.entries(D.upgrades).map(([id,def])=>[id,clamp(Math.floor(+up[id]||0),0,def.maxLevel)]));
  }

  function maxStockFor(upgrades){
    return D.baseMaxStock + (upgrades.rack||0)*D.upgrades.rack.effectPerLevel;
  }

  function normalizeInventory(inv={},maxStock=D.baseMaxStock){
    const out={};
    for(const id of allItemIds())out[id]=clamp(Number.isFinite(+inv[id])?Math.floor(+inv[id]):0,0,maxStock);
    return out;
  }

  function makeStateFromSave(){
    const saved=window.PS_SAVE.load();
    const day=saved?.day||1;
    const cfg=configForDay(day);
    const upgrades=normalizedUpgrades(saved?.upgrades||blankUpgrades());
    const maxStock=maxStockFor(upgrades);
    const unlocked=[...new Set([...(saved?.unlockedItems||[]),...unlockedForDay(day)])];
    const inventory=saved?.inventory?normalizeInventory(saved.inventory,maxStock):normalizeInventory(D.startingStock,maxStock);
    return {
      phase:saved?.resumePhase==='UPGRADE'?'UPGRADE':'PREP',
      day,coins:saved?.coins??D.startingCoins,
      target:cfg.target,duration:cfg.duration,timeRemaining:cfg.duration,
      revenue:0,inventory,maxStock,unlockedItems:unlocked,upgrades,
      nextDayBoost:saved?.nextDayBoost||null,
      customers:[],served:0,lost:0,sold:blankSold(),
      spawnIn:1.2,paused:false,nextCustomerId:1,transactionLock:false,
      pendingUnlocks:[],tuningDay:cfg.day,bonusCoinsEarned:0,
      servedByType:{normal:0,impatient:0,bulk:0},
      rewardClaimed:false,lastReward:null,lastUpgrade:null
    };
  }

  function emit(){
    const copy=typeof structuredClone==='function'?structuredClone(state):JSON.parse(JSON.stringify(state));
    listener(copy);
  }
  function onChange(fn){listener=typeof fn==='function'?fn:()=>{};emit();}

  function refreshDayConfig(){
    const cfg=configForDay(state.day);
    state.target=cfg.target;state.duration=cfg.duration;state.timeRemaining=cfg.duration;state.tuningDay=cfg.day;
  }

  function weightedChoice(weightMap,fallback){
    const entries=Object.entries(weightMap||{}).filter(([,w])=>Number(w)>0);
    const total=entries.reduce((sum,[,w])=>sum+Number(w),0);
    if(!entries.length||total<=0)return fallback;
    let r=Math.random()*total;
    for(const [id,w] of entries){r-=Number(w);if(r<=0)return id;}
    return entries[0][0];
  }

  function weightedItem(){
    const demand=demandForDay(state.day);
    const ids=state.unlockedItems.filter(id=>D.items[id]&&(demand[id]||0)>0);
    let total=0;const weights={};
    for(const id of ids){const base=demand[id]||0;const adjusted=state.inventory[id]===0?base*.65:base;weights[id]=adjusted;total+=adjusted;}
    if(total<=0)return state.unlockedItems[0]||'bread';
    let r=Math.random()*total;
    for(const id of ids){r-=weights[id];if(r<=0)return id;}
    return ids[0];
  }

  function chooseCustomerType(){
    const cfg=configForDay(state.day);
    const id=weightedChoice(cfg.customerTypes,'normal');
    return D.customerTypes[id]?id:'normal';
  }

  function patienceFor(typeId){
    const cfg=configForDay(state.day);
    let base;
    if(typeId==='normal'&&Number.isFinite(cfg.normalPatience))base=cfg.normalPatience;
    else if(typeId==='impatient'&&Number.isFinite(cfg.impatientPatience))base=cfg.impatientPatience;
    else base=D.customerTypes[typeId]?.patience??12;
    return base+(state.upgrades.patience||0)*D.upgrades.patience.effectPerLevel;
  }

  function effectiveSellPrice(itemId,day=state.day){
    const item=D.items[itemId];if(!item)return 0;
    const profitMultiplier=1+(state.upgrades.profit||0)*D.upgrades.profit.effectPerLevel;
    const boostMultiplier=state.nextDayBoost&&state.nextDayBoost.day===day?state.nextDayBoost.multiplier:1;
    return Math.round(item.sellPrice*profitMultiplier*boostMultiplier);
  }

  function restock(id){
    if(state.transactionLock||!['PREP','RUNNING'].includes(state.phase)||!state.unlockedItems.includes(id))return {ok:false};
    const item=D.items[id];if(!item)return {ok:false};
    const room=state.maxStock-state.inventory[id];const qty=Math.min(2,room);const cost=item.buyPrice*qty;
    if(qty<=0||state.coins<cost)return {ok:false};
    state.transactionLock=true;state.coins-=cost;state.inventory[id]+=qty;
    state.coins=Math.max(0,state.coins);state.inventory[id]=clamp(state.inventory[id],0,state.maxStock);
    window.PS_SAVE.save(state);state.transactionLock=false;emit();
    return {ok:true,qty,cost,item};
  }

  function openShop(){
    if(state.phase!=='PREP')return false;
    refreshDayConfig();state.phase='RUNNING';state.spawnIn=1;state.customers=[];
    state.revenue=0;state.served=0;state.lost=0;state.sold=blankSold();
    state.bonusCoinsEarned=0;state.servedByType={normal:0,impatient:0,bulk:0};
    state.rewardClaimed=false;state.lastReward=null;state.lastUpgrade=null;
    emit();return true;
  }

  function setPaused(v){state.paused=!!v;emit();}

  function spawnCustomer(){
    const cfg=configForDay(state.day);if(state.customers.length>=cfg.maxCustomers)return;
    const type=chooseCustomerType();const typeData=D.customerTypes[type]||D.customerTypes.normal;const patience=patienceFor(type);
    state.customers.push({
      id:state.nextCustomerId++,type,item:weightedItem(),quantity:typeData.quantity||1,
      patience,maxPatience:patience,age:0,state:'WAITING',avatar:typeData.avatar||0,processed:false,saleQuantity:0,bonusCoins:0
    });
    state.spawnIn=random(cfg.spawnMin,cfg.spawnMax);
  }

  function processSale(c){
    if(c.processed||c.state!=='WAITING'||state.inventory[c.item]<=0)return;
    const type=D.customerTypes[c.type]||D.customerTypes.normal;
    const requestedQty=Math.max(1,c.quantity||1);const saleQty=Math.min(requestedQty,state.inventory[c.item]);if(saleQty<=0)return;
    c.processed=true;c.state='BUYING';c.saleQuantity=saleQty;
    const unitPrice=effectiveSellPrice(c.item);const baseRevenue=unitPrice*saleQty;
    let bonus=0;if(type.bonusThreshold!==null&&c.patience/c.maxPatience>type.bonusThreshold)bonus=type.bonusCoins||0;c.bonusCoins=bonus;
    state.inventory[c.item]=Math.max(0,state.inventory[c.item]-saleQty);state.coins+=baseRevenue+bonus;state.revenue+=baseRevenue;
    state.bonusCoinsEarned+=bonus;state.served++;state.servedByType[c.type]=(state.servedByType[c.type]||0)+1;state.sold[c.item]+=saleQty;emit();
    setTimeout(()=>{c.state='LEAVING';emit();setTimeout(()=>{state.customers=state.customers.filter(x=>x.id!==c.id);emit();},220);},280);
  }

  function failCustomer(c){
    if(c.processed)return;c.processed=true;c.state='FAILED';state.lost++;emit();
    setTimeout(()=>{state.customers=state.customers.filter(x=>x.id!==c.id);emit();},360);
  }

  function tick(dt){
    if(state.phase!=='RUNNING'||state.paused)return;
    const cfg=configForDay(state.day);dt=clamp(dt,0,.25);state.timeRemaining=Math.max(0,state.timeRemaining-dt);state.spawnIn-=dt;
    if(state.spawnIn<=0){spawnCustomer();if(state.customers.length>=cfg.maxCustomers)state.spawnIn=.6;}
    for(const c of [...state.customers]){
      if(c.state!=='WAITING')continue;c.age+=dt;c.patience=Math.max(0,c.patience-dt);
      if(c.age>=.8&&state.inventory[c.item]>0)processSale(c);else if(c.patience<=0)failCustomer(c);
    }
    if(state.timeRemaining<=0)endDay();else emit();
  }

  function endDay(){
    if(state.phase!=='RUNNING')return;
    state.phase='SUMMARY';state.customers=[];
    if(state.revenue<state.target)state.coins+=30;
    // Summary itself is intentionally not persisted. If the app is killed here,
    // it safely returns to PREP from the previous autosave without duplicating a reward.
    emit();
  }

  function cashRewardAmount(day=state.day){
    if(day<=1)return D.rewards.cashByDay[1];
    if(day>=5)return D.rewards.cashByDay[5];
    return D.rewards.cashByDay[day]||D.rewards.cashByDay[1];
  }

  function rewardAvailability(){
    const nonFull=state.unlockedItems.filter(id=>state.inventory[id]<state.maxStock);
    return {
      cash:true,
      freeStock:nonFull.length>0,
      boost:true,
      cashAmount:cashRewardAmount(),
      freeStockCandidates:nonFull.length
    };
  }

  function chooseRandomDistinct(list,count){
    const copy=[...list];const chosen=[];
    while(copy.length&&chosen.length<count){const i=Math.floor(Math.random()*copy.length);chosen.push(copy.splice(i,1)[0]);}
    return chosen;
  }

  function claimReward(rewardId){
    if(state.phase!=='SUMMARY'||state.revenue<state.target||state.rewardClaimed)return {ok:false};
    const availability=rewardAvailability();let detail='';
    if(rewardId==='cash'){
      const amount=availability.cashAmount;state.coins+=amount;detail=`+${amount} coins`;state.lastReward={id:'cash',amount};
    }else if(rewardId==='stock'){
      if(!availability.freeStock)return {ok:false};
      const eligible=state.unlockedItems.filter(id=>state.inventory[id]<state.maxStock);
      const picked=chooseRandomDistinct(eligible,D.rewards.freeStockItemCount);const grants=[];
      for(const id of picked){const qty=Math.min(D.rewards.freeStockPerItem,state.maxStock-state.inventory[id]);if(qty>0){state.inventory[id]+=qty;grants.push({id,qty});}}
      detail=grants.map(g=>`${D.items[g.id].name} +${g.qty}`).join(', ');state.lastReward={id:'stock',grants};
    }else if(rewardId==='boost'){
      state.nextDayBoost={day:state.day+1,multiplier:D.rewards.nextDaySellMultiplier};detail='+10% sell price next day';state.lastReward={id:'boost',day:state.day+1,multiplier:D.rewards.nextDaySellMultiplier};
    }else return {ok:false};
    state.rewardClaimed=true;state.phase='UPGRADE';window.PS_SAVE.save(state);emit();
    return {ok:true,rewardId,detail};
  }

  function continueAfterFailure(){
    if(state.phase!=='SUMMARY'||state.revenue>=state.target)return false;
    state.phase='UPGRADE';window.PS_SAVE.save(state);emit();return true;
  }

  function availableUpgrades(){
    return Object.values(D.upgrades).filter(def=>(state.upgrades[def.id]||0)<def.maxLevel);
  }

  function advanceDay(){
    const previousUnlocked=new Set(state.unlockedItems);state.day+=1;refreshDayConfig();
    const nowUnlocked=unlockedForDay(state.day);const newlyUnlocked=nowUnlocked.filter(id=>!previousUnlocked.has(id));
    for(const id of nowUnlocked){if(!state.unlockedItems.includes(id))state.unlockedItems.push(id);if(!(id in state.inventory))state.inventory[id]=0;}
    state.pendingUnlocks=newlyUnlocked;
    if(state.nextDayBoost&&state.nextDayBoost.day<state.day)state.nextDayBoost=null;
    state.phase='PREP';state.revenue=0;state.customers=[];state.served=0;state.lost=0;state.sold=blankSold();state.spawnIn=1.2;state.paused=false;
    state.bonusCoinsEarned=0;state.servedByType={normal:0,impatient:0,bulk:0};state.rewardClaimed=false;
  }

  function chooseUpgrade(id){
    if(state.phase!=='UPGRADE')return {ok:false};
    const def=D.upgrades[id];if(!def)return {ok:false};
    const current=state.upgrades[id]||0;if(current>=def.maxLevel)return {ok:false};
    state.upgrades[id]=current+1;state.lastUpgrade={id,level:state.upgrades[id]};
    if(id==='rack')state.maxStock=maxStockFor(state.upgrades);
    const completedDay=state.day;advanceDay();window.PS_SAVE.save(state);emit();
    return {ok:true,id,name:def.name,level:state.upgrades[id],completedDay,newDay:state.day};
  }

  function skipUpgradeIfMaxed(){
    if(state.phase!=='UPGRADE'||availableUpgrades().length)return {ok:false};
    const completedDay=state.day;advanceDay();window.PS_SAVE.save(state);emit();return {ok:true,completedDay,newDay:state.day};
  }

  function clearPendingUnlocks(){state.pendingUnlocks=[];window.PS_SAVE.save(state);emit();}
  function getState(){return state;}
  function getDayConfig(day=state.day){return configForDay(day);}
  function getSellPrice(id){return effectiveSellPrice(id);}

  state=makeStateFromSave();
  return {
    onChange,getState,getDayConfig,getSellPrice,restock,openShop,setPaused,tick,
    rewardAvailability,claimReward,continueAfterFailure,availableUpgrades,chooseUpgrade,skipUpgradeIfMaxed,clearPendingUnlocks
  };
})();
