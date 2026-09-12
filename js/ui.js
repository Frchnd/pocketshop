window.PS_UI = (() => {
  const D=window.PS_DATA;
  const $=s=>document.querySelector(s);
  const el={
    coins:$('#coins'),day:$('#dayLabel'),target:$('#targetLabel'),fill:$('#progressFill'),progress:$('#progressText'),
    bread:$('#rackBread'),snack:$('#rackSnack'),drinks:$('#rackDrinks'),grid:$('#customerGrid'),hint:$('#laneHint'),
    restock:$('#restockBtn'),open:$('#openShopBtn'),openText:$('#openShopText'),toast:$('#toast'),coinFx:$('#coinFx'),
    restockOverlay:$('#restockOverlay'),restockCards:$('#restockCards'),summaryOverlay:$('#summaryOverlay'),
    summaryResult:$('#summaryResult'),sumRevenue:$('#sumRevenue'),sumServed:$('#sumServed'),sumLost:$('#sumLost'),sumBest:$('#sumBest'),
    unlockOverlay:$('#unlockOverlay'),unlockIcon:$('#unlockItemIcon'),unlockTitle:$('#unlockTitle'),unlockText:$('#unlockItemText')
  };
  let lastCoins=null,lastRevenue=null,toastTimer=null,shownUnlockKey='';

  function stockSprites(id,stock){
    const count=stock<=0?0:stock<=2?2:stock<=4?4:6;
    return Array.from({length:count},()=>`<img class="stock-sprite" src="${D.items[id].icon}" alt="" />`).join('');
  }

  function drinkRow(id,stock,unlocked){
    if(!unlocked)return '<div class="drink-row locked-row"></div>';
    const count=stock<=0?0:stock<=2?1:2;
    return `<div class="drink-row" data-drink="${id}">${Array.from({length:count},()=>`<img src="${D.items[id].icon}" alt="" />`).join('')}</div>`;
  }

  function renderDrinks(s){
    el.drinks.innerHTML=[
      drinkRow('milk',s.inventory.milk,s.unlockedItems.includes('milk')),
      drinkRow('juice',s.inventory.juice,s.unlockedItems.includes('juice')),
      drinkRow('coffee',s.inventory.coffee,s.unlockedItems.includes('coffee'))
    ].join('');
  }

  function patienceColor(p,max){const r=p/max;return r>.58?'#65cf9d':r>.26?'#f0b849':'#f45f78'}
  function showToast(text){clearTimeout(toastTimer);el.toast.textContent=text;el.toast.classList.add('show');toastTimer=setTimeout(()=>el.toast.classList.remove('show'),1150)}
  function coinPop(diff){if(diff<=0)return;el.coinFx.textContent=`+${diff} 🪙`;el.coinFx.classList.remove('pop');void el.coinFx.offsetWidth;el.coinFx.classList.add('pop')}

  function renderRestock(s){
    const items=s.unlockedItems.map(id=>D.items[id]).filter(Boolean);
    el.restockCards.innerHTML=items.map(item=>{
      const room=s.maxStock-s.inventory[item.id];const qty=Math.min(2,room);const cost=qty*item.buyPrice;const dis=qty<=0||s.coins<cost;
      return `<article class="restock-card"><img src="${item.icon}" alt="${item.name}"><h3>${item.name}</h3><div class="restock-meta">🪙 ${cost}<br>Stock ${s.inventory[item.id]} / ${s.maxStock}</div><button class="buy-btn" type="button" data-buy="${item.id}" ${dis?'disabled':''}>${qty?`Buy +${qty}`:'Full'}</button></article>`;
    }).join('');
  }

  function openRestock(){
    const s=window.PS_GAME.getState();if(!['PREP','RUNNING'].includes(s.phase))return;
    window.PS_GAME.setPaused(true);renderRestock(window.PS_GAME.getState());el.restockOverlay.hidden=false;setTimeout(()=>$('#closeRestockBtn')?.focus(),0);
  }
  function closeRestock(){el.restockOverlay.hidden=true;window.PS_GAME.setPaused(false);el.restock.focus()}

  function renderCustomers(s){
    const max=window.PS_GAME.getDayConfig(s.day).maxCustomers;
    el.grid.classList.toggle('cols-3',max>=3);
    if(!s.customers.length){
      el.grid.innerHTML='';el.hint.hidden=false;
      el.hint.textContent=s.phase==='RUNNING'?'Customers are on the way…':`Day ${s.day} • Restock, then open the shop.`;
      return;
    }
    el.hint.hidden=true;
    el.grid.innerHTML=s.customers.map(c=>`<article class="customer" aria-label="Customer requesting ${D.items[c.item].name}"><div class="request-bubble"><img src="${D.items[c.item].icon}" alt="${D.items[c.item].name}"></div><img class="customer-img" src="${D.customers[c.avatar]}" alt="Customer"><div class="patience"><i style="width:${Math.max(0,c.patience/c.maxPatience*100)}%;background:${patienceColor(c.patience,c.maxPatience)}"></i></div></article>`).join('');
  }

  function renderSummary(s){
    const success=s.revenue>=s.target;
    el.summaryResult.textContent=success?'🎯 Target reached!':'🎯 Target not reached • +30 consolation coins';
    el.sumRevenue.textContent=s.revenue;el.sumServed.textContent=s.served;el.sumLost.textContent=s.lost;
    const best=Object.keys(s.sold).sort((a,b)=>s.sold[b]-s.sold[a])[0];
    el.sumBest.textContent=s.sold[best]?`${D.items[best].name} ×${s.sold[best]}`:'—';
    el.summaryOverlay.hidden=false;
  }

  function renderUnlock(s){
    if(!s.pendingUnlocks?.length)return;
    const id=s.pendingUnlocks[0];const item=D.items[id];if(!item)return;
    const key=`${s.day}:${id}`;if(shownUnlockKey===key && !el.unlockOverlay.hidden)return;
    shownUnlockKey=key;
    el.unlockIcon.src=item.icon;el.unlockIcon.alt=item.name;el.unlockTitle.textContent=item.name;
    el.unlockText.textContent=`${item.name} is now available in Restock.`;
    el.unlockOverlay.hidden=false;
  }

  function render(s){
    el.coins.textContent=Math.floor(s.coins);el.day.textContent=`Day ${s.day}`;el.target.textContent=s.target;
    const pct=Math.min(100,(s.revenue/s.target)*100);el.fill.style.width=`${pct}%`;el.progress.textContent=`${s.revenue} / ${s.target}`;
    el.bread.innerHTML=stockSprites('bread',s.inventory.bread);el.snack.innerHTML=stockSprites('snack',s.inventory.snack);renderDrinks(s);
    renderCustomers(s);
    el.restock.disabled=!['PREP','RUNNING'].includes(s.phase);el.open.disabled=s.phase!=='PREP';
    el.openText.textContent=s.phase==='PREP'?'Open Shop':s.phase==='RUNNING'?`${Math.ceil(s.timeRemaining)}s`:'Closed';
    if(lastCoins!==null&&s.coins>lastCoins&&s.phase==='RUNNING')coinPop(s.coins-lastCoins);lastCoins=s.coins;
    if(lastRevenue!==null&&s.revenue>lastRevenue)showToast(`Sold! +${s.revenue-lastRevenue} coin`);lastRevenue=s.revenue;
    if(s.phase==='SUMMARY'&&el.summaryOverlay.hidden)renderSummary(s);
    if(!el.restockOverlay.hidden)renderRestock(s);
    renderUnlock(s);
  }

  function bind(){
    el.restock.addEventListener('click',openRestock);
    $('#closeRestockBtn').addEventListener('click',closeRestock);
    el.restockOverlay.addEventListener('click',e=>{if(e.target===el.restockOverlay)closeRestock()});
    el.restockCards.addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b)return;const r=window.PS_GAME.restock(b.dataset.buy);if(r.ok)showToast(`${r.item.name} +${r.qty}`)});
    el.open.addEventListener('click',()=>{if(window.PS_GAME.openShop())showToast(`Day ${window.PS_GAME.getState().day} — Shop Open!`)});
    $('#nextDayBtn').addEventListener('click',()=>{
      el.summaryOverlay.hidden=true;
      if(window.PS_GAME.nextDay()){
        const s=window.PS_GAME.getState();
        showToast(s.day>5?'Day 5 tuning continues temporarily':`Welcome to Day ${s.day}!`);
      }
    });
    $('#unlockOkBtn').addEventListener('click',()=>{el.unlockOverlay.hidden=true;window.PS_GAME.clearPendingUnlocks();el.restock.focus()});
  }

  return {bind,render,showToast};
})();
