window.PS_GAME = (() => {
  const D=window.PS_DATA;
  let state;
  let listener=()=>{};

  const cloneStock = obj => ({bread:obj.bread|0,snack:obj.snack|0,milk:obj.milk|0});
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  function newState(){
    const saved=window.PS_SAVE.load();
    return {
      phase:'PREP', day:saved?.day || 1, coins:saved?.coins ?? D.day1.startingCoins,
      target:D.day1.target, duration:D.day1.duration, timeRemaining:D.day1.duration,
      revenue:0, inventory:saved?.inventory ? cloneStock(saved.inventory) : cloneStock(D.day1.startingStock),
      maxStock:D.day1.maxStock, customers:[], served:0,lost:0,
      sold:{bread:0,snack:0,milk:0}, spawnIn:1.2, paused:false, nextCustomerId:1,
      transactionLock:false
    };
  }

  function emit(){ listener(typeof structuredClone==='function' ? structuredClone(state) : JSON.parse(JSON.stringify(state))); }
  function onChange(fn){ listener=typeof fn==='function'?fn:()=>{}; emit(); }
  function random(min,max){return min+Math.random()*(max-min)}
  function weightedItem(){
    const ids=Object.keys(D.items); let total=0;
    const weights={};
    for(const id of ids){
      const base=D.items[id].demand;
      const adjusted=state.inventory[id]===0?base*.65:base;
      weights[id]=adjusted; total+=adjusted;
    }
    let r=Math.random()*total;
    for(const id of ids){r-=weights[id];if(r<=0)return id;}
    return ids[0];
  }

  function restock(id){
    if(state.transactionLock || !['PREP','RUNNING'].includes(state.phase)) return {ok:false};
    const item=D.items[id]; if(!item) return {ok:false};
    const room=state.maxStock-state.inventory[id]; const qty=Math.min(2,room);
    const cost=item.buyPrice*qty;
    if(qty<=0 || state.coins<cost) return {ok:false};
    state.transactionLock=true;
    state.coins-=cost; state.inventory[id]+=qty;
    state.coins=Math.max(0,state.coins); state.inventory[id]=clamp(state.inventory[id],0,state.maxStock);
    window.PS_SAVE.save(state); state.transactionLock=false; emit();
    return {ok:true,qty,cost,item};
  }

  function openShop(){
    if(state.phase!=='PREP')return false;
    state.phase='RUNNING';state.timeRemaining=D.day1.duration;state.spawnIn=1.0;state.customers=[];emit();return true;
  }

  function setPaused(v){state.paused=!!v;emit();}

  function spawnCustomer(){
    if(state.customers.length>=D.day1.maxCustomers)return;
    state.customers.push({
      id:state.nextCustomerId++, item:weightedItem(), patience:12,maxPatience:12,
      age:0, state:'WAITING', avatar:Math.floor(Math.random()*D.customers.length), processed:false
    });
    state.spawnIn=random(D.day1.spawnMin,D.day1.spawnMax);
  }

  function processSale(c){
    if(c.processed || c.state!=='WAITING')return;
    if(state.inventory[c.item]<=0)return;
    const item=D.items[c.item];
    c.processed=true;c.state='BUYING';
    state.inventory[c.item]=Math.max(0,state.inventory[c.item]-1);
    state.coins+=item.sellPrice;state.revenue+=item.sellPrice;state.served++;state.sold[c.item]++;
    emit();
    setTimeout(()=>{c.state='LEAVING';emit();setTimeout(()=>{state.customers=state.customers.filter(x=>x.id!==c.id);emit();},220);},260);
  }

  function failCustomer(c){
    if(c.processed)return;c.processed=true;c.state='FAILED';state.lost++;emit();
    setTimeout(()=>{state.customers=state.customers.filter(x=>x.id!==c.id);emit();},360);
  }

  function tick(dt){
    if(state.phase!=='RUNNING' || state.paused)return;
    dt=clamp(dt,0,.25);
    state.timeRemaining=Math.max(0,state.timeRemaining-dt);
    state.spawnIn-=dt;
    if(state.spawnIn<=0){spawnCustomer(); if(state.customers.length>=D.day1.maxCustomers) state.spawnIn=.6;}
    for(const c of [...state.customers]){
      if(c.state!=='WAITING')continue;
      c.age+=dt;c.patience=Math.max(0,c.patience-dt);
      if(c.age>=.8 && state.inventory[c.item]>0) processSale(c);
      else if(c.patience<=0) failCustomer(c);
    }
    if(state.timeRemaining<=0) endDay(); else emit();
  }

  function endDay(){
    if(state.phase!=='RUNNING')return;
    state.phase='SUMMARY';state.customers=[];
    if(state.revenue<state.target) state.coins+=30;
    window.PS_SAVE.save(state);emit();
  }

  function nextDay(){
    const coins=state.coins;const inventory=cloneStock(state.inventory);const day=state.day+1;
    state=newState();state.day=day;state.coins=coins;state.inventory=inventory;
    window.PS_SAVE.save(state);emit();
  }

  function getState(){return state;}
  state=newState();
  return {onChange,getState,restock,openShop,setPaused,tick,nextDay};
})();
