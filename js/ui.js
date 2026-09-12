window.PS_UI = (() => {
  const D=window.PS_DATA;
  const $=s=>document.querySelector(s);
  const el={
    coins:$('#coins'),day:$('#dayLabel'),target:$('#targetLabel'),fill:$('#progressFill'),progress:$('#progressText'),
    bread:$('#rackBread'),snack:$('#rackSnack'),drinks:$('#rackDrinks'),grid:$('#customerGrid'),hint:$('#laneHint'),boost:$('#boostBadge'),
    restock:$('#restockBtn'),upgrade:$('#upgradeBtn'),open:$('#openShopBtn'),openText:$('#openShopText'),toast:$('#toast'),coinFx:$('#coinFx'),
    restockOverlay:$('#restockOverlay'),restockCards:$('#restockCards'),summaryOverlay:$('#summaryOverlay'),
    summaryResult:$('#summaryResult'),sumRevenue:$('#sumRevenue'),sumServed:$('#sumServed'),sumLost:$('#sumLost'),sumBest:$('#sumBest'),
    rewardSection:$('#rewardSection'),rewardChoices:$('#rewardChoices'),summaryContinue:$('#summaryContinueBtn'),
    upgradeOverlay:$('#upgradeOverlay'),upgradeChoices:$('#upgradeChoices'),upgradeTitle:$('#upgradeTitle'),upgradeEyebrow:$('#upgradeEyebrow'),upgradeIntro:$('#upgradeIntro'),upgradeNext:$('#upgradeNextDayBtn'),closeUpgrade:$('#closeUpgradeBtn'),
    unlockOverlay:$('#unlockOverlay'),unlockIcon:$('#unlockItemIcon'),unlockTitle:$('#unlockTitle'),unlockText:$('#unlockItemText'),
    game:$('#game'),progressRow:document.querySelector('.progress-row'),customerLane:document.querySelector('.customer-lane'),
    dayBanner:$('#dayBanner'),dayBannerEyebrow:$('#dayBannerEyebrow'),dayBannerTitle:$('#dayBannerTitle'),dayBannerTarget:$('#dayBannerTarget'),targetReached:$('#targetReached'),
    tutorialCoach:$('#tutorialCoach'),tutorialStepLabel:$('#tutorialStepLabel'),tutorialTitle:$('#tutorialTitle'),tutorialText:$('#tutorialText'),tutorialSkip:$('#tutorialSkipBtn'),
    eventBanner:$('#eventBanner'),eventBannerIcon:$('#eventBannerIcon'),eventBannerTitle:$('#eventBannerTitle'),eventBannerText:$('#eventBannerText'),
    eventBadge:$('#eventBadge'),eventBadgeIcon:$('#eventBadgeIcon'),eventBadgeName:$('#eventBadgeName'),eventBadgeTime:$('#eventBadgeTime'),
    settingsBtn:$('#settingsBtn'),settingsOverlay:$('#settingsOverlay'),musicToggle:$('#musicToggle'),sfxToggle:$('#sfxToggle'),
    cashier:document.querySelector('.cashier'),confetti:$('#confettiFx')
  };
  let lastCoins=null,lastRevenue=null,lastBonus=0,toastTimer=null,shownUnlockKey='',upgradeMode='view';
  let tutorialStep=0,tutorialFinishTimer=null,lastPhase=null,lastTargetDay=0,dayBannerTimer=null,targetTimer=null;
  let lastEventKey='',eventBannerTimer=null,settingsWasRunning=false;
  let lastInventory=null,lastSettingsKey='',lastSummaryDay=0,lastUnlockKey='',customerStates=new Map(),knownCustomers=new Set();

  function stockSprites(id,stock,maxStock){
    const ratio=maxStock?stock/maxStock:0;const count=stock<=0?0:ratio<=.34?2:ratio<=.67?4:6;
    return Array.from({length:count},()=>`<img class="stock-sprite" src="${D.items[id].icon}" alt="" />`).join('');
  }
  function drinkRow(id,stock,maxStock,unlocked){
    if(!unlocked)return '<div class="drink-row locked-row"></div>';
    const ratio=maxStock?stock/maxStock:0;const count=stock<=0?0:ratio<=.4?1:2;
    return `<div class="drink-row" data-drink="${id}">${Array.from({length:count},()=>`<img src="${D.items[id].icon}" alt="" />`).join('')}</div>`;
  }
  function renderDrinks(s){el.drinks.innerHTML=[drinkRow('milk',s.inventory.milk,s.maxStock,s.unlockedItems.includes('milk')),drinkRow('juice',s.inventory.juice,s.maxStock,s.unlockedItems.includes('juice')),drinkRow('coffee',s.inventory.coffee,s.maxStock,s.unlockedItems.includes('coffee'))].join('');}
  function patienceColor(p,max){const r=p/max;return r>.58?'#65cf9d':r>.26?'#f0b849':'#f45f78';}
  function showToast(text){clearTimeout(toastTimer);el.toast.textContent=text;el.toast.classList.add('show');toastTimer=setTimeout(()=>el.toast.classList.remove('show'),1350);}
  function coinPop(diff){if(diff<=0)return;el.coinFx.textContent=`+${diff} 🪙`;el.coinFx.classList.remove('pop');void el.coinFx.offsetWidth;el.coinFx.classList.add('pop');}

  function pulse(node,cls){if(!node)return;node.classList.remove(cls);void node.offsetWidth;node.classList.add(cls);setTimeout(()=>node.classList.remove(cls),520);}
  function rackForItem(id){if(id==='bread')return el.bread.closest('.rack-wrap');if(id==='snack')return el.snack.closest('.rack-wrap');return el.drinks.closest('.rack-wrap');}
  function confettiBurst(){
    if(!el.confetti)return;el.confetti.replaceChildren();
    const symbols=['✦','●','◆','♥','✧'];
    for(let i=0;i<18;i++){const p=document.createElement('i');p.textContent=symbols[i%symbols.length];p.style.setProperty('--x',`${(Math.random()*180-90).toFixed(1)}px`);p.style.setProperty('--r',`${(Math.random()*240-120).toFixed(0)}deg`);p.style.setProperty('--d',`${(Math.random()*.28).toFixed(2)}s`);el.confetti.appendChild(p);}
    el.confetti.classList.remove('burst');void el.confetti.offsetWidth;el.confetti.classList.add('burst');setTimeout(()=>{el.confetti.classList.remove('burst');el.confetti.replaceChildren();},1200);
  }
  function syncAudioSettings(s){const key=`${!!s.settings?.music}:${!!s.settings?.sfx}`;if(key===lastSettingsKey)return;lastSettingsKey=key;window.PS_AUDIO?.setSettings(s.settings||{});for(const [btn,on] of [[el.musicToggle,s.settings?.music!==false],[el.sfxToggle,s.settings?.sfx!==false]]){if(btn){btn.setAttribute('aria-checked',String(on));btn.classList.toggle('on',on);}}}
  function openSettings(){const s=window.PS_GAME.getState();settingsWasRunning=s.phase==='RUNNING'&&!s.paused;if(settingsWasRunning)window.PS_GAME.setPaused(true);el.settingsOverlay.hidden=false;setTimeout(()=>$('#closeSettingsBtn')?.focus(),0);}
  function closeSettings(){el.settingsOverlay.hidden=true;if(settingsWasRunning){settingsWasRunning=false;window.PS_GAME.setPaused(false);}el.settingsBtn?.focus();}

  function renderRestock(s){
    const items=s.unlockedItems.map(id=>D.items[id]).filter(Boolean);
    el.restockCards.innerHTML=items.map(item=>{const room=s.maxStock-s.inventory[item.id],qty=Math.min(2,room),cost=qty*item.buyPrice,dis=qty<=0||s.coins<cost;return `<article class="restock-card"><img src="${item.icon}" alt="${item.name}"><h3>${item.name}</h3><div class="restock-meta">🪙 ${cost}<br>Stock ${s.inventory[item.id]} / ${s.maxStock}</div><button class="buy-btn" type="button" data-buy="${item.id}" ${dis?'disabled':''}>${qty?`Buy +${qty}`:'Full'}</button></article>`;}).join('');
    if(tutorialStep===1){const first=el.restockCards.querySelector('.buy-btn:not(:disabled)');if(first)first.classList.add('tutorial-buy-focus');}
  }
  function openRestock(){const s=window.PS_GAME.getState();if(!['PREP','RUNNING'].includes(s.phase))return;window.PS_GAME.setPaused(true);renderRestock(window.PS_GAME.getState());el.restockOverlay.hidden=false;if(tutorialStep===1)el.game.classList.add('tutorial-restock-open');setTimeout(()=>$('#closeRestockBtn')?.focus(),0);}
  function closeRestock(){el.restockOverlay.hidden=true;el.game.classList.remove('tutorial-restock-open');window.PS_GAME.setPaused(false);el.restock.focus();}

  function customerMarkup(c){
    const item=D.items[c.item],type=D.customerTypes[c.type]||D.customerTypes.normal;
    const quantity=(c.quantity||1)>1?`<span class="request-qty">×${c.quantity}</span>`:'',badge=type.badge?`<span class="customer-type-badge ${c.type}" title="${type.name} customer">${type.badge}</span>`:'',cue=c.type==='impatient'?'<span class="impatient-cue" aria-hidden="true">〰</span>':'',basket=c.type==='bulk'?'<span class="bulk-cue" aria-hidden="true">👜</span>':'';
    return `<article class="customer customer-${c.type} state-${c.state.toLowerCase()}" data-customer-id="${c.id}" aria-label="${type.name} customer requesting ${c.quantity||1} ${item.name}">${badge}${cue}${basket}<div class="request-bubble"><img src="${item.icon}" alt="${item.name}">${quantity}</div><span class="customer-reaction" aria-hidden="true"></span><img class="customer-img" src="${D.customerAvatars[c.avatar]}" alt="${type.name} customer"><div class="patience" aria-label="Patience"><i></i></div></article>`;
  }

  function syncCustomerNode(node,c){
    const item=D.items[c.item],type=D.customerTypes[c.type]||D.customerTypes.normal;
    node.className=`customer customer-${c.type} state-${c.state.toLowerCase()}`;
    node.setAttribute('aria-label',`${type.name} customer requesting ${c.quantity||1} ${item.name}`);
    const img=node.querySelector('.request-bubble img');if(img&&img.getAttribute('src')!==item.icon){img.src=item.icon;img.alt=item.name;}
    const qty=node.querySelector('.request-qty');if(qty)qty.textContent=`×${c.quantity||1}`;
    const bar=node.querySelector('.patience i');if(bar){bar.style.width=`${Math.max(0,c.patience/c.maxPatience*100)}%`;bar.style.background=patienceColor(c.patience,c.maxPatience);}
    const reaction=node.querySelector('.customer-reaction');if(reaction)reaction.textContent=c.state==='BUYING'?'♥':c.state==='FAILED'?'…':'';
    const prev=customerStates.get(c.id);
    if(prev!==c.state){
      if(c.state==='BUYING'){window.PS_AUDIO?.sfx('sale');el.cashier?.classList.remove('cashier-happy');void el.cashier?.offsetWidth;el.cashier?.classList.add('cashier-happy');}
      if(c.state==='FAILED')window.PS_AUDIO?.sfx('fail');
      customerStates.set(c.id,c.state);
    }
  }

  function renderCustomers(s){
    const max=window.PS_GAME.getDayConfig(s.day).maxCustomers;el.grid.classList.toggle('cols-3',max>=3);
    const activeIds=new Set(s.customers.map(c=>String(c.id)));
    for(const node of [...el.grid.querySelectorAll('[data-customer-id]')]){
      if(!activeIds.has(node.dataset.customerId)){node.remove();customerStates.delete(Number(node.dataset.customerId));knownCustomers.delete(Number(node.dataset.customerId));}
    }
    for(const c of s.customers){
      let node=el.grid.querySelector(`[data-customer-id="${c.id}"]`);
      if(!node){const wrap=document.createElement('div');wrap.innerHTML=customerMarkup(c);node=wrap.firstElementChild;el.grid.appendChild(node);if(!knownCustomers.has(c.id)){knownCustomers.add(c.id);window.PS_AUDIO?.sfx('arrive');}}
      syncCustomerNode(node,c);
    }
    if(!s.customers.length){el.hint.hidden=false;const cfg=window.PS_GAME.getDayConfig(s.day);const types=Object.keys(cfg.customerTypes||{}).filter(k=>(cfg.customerTypes[k]||0)>0).map(k=>D.customerTypes[k]?.name).filter(Boolean).join(' • ');el.hint.textContent=s.phase==='RUNNING'?'Customers are on the way…':`Day ${s.day} • ${cfg.label||''}${cfg.label?' • ':''}${types||'Normal'}`;return;}
    el.hint.hidden=true;
  }

  function rewardCards(s){
    const a=window.PS_GAME.rewardAvailability();
    return [
      `<button type="button" class="reward-card cash" data-reward="cash"><span>🪙</span><strong>+${a.cashAmount} Coins</strong><small>A little extra for tomorrow!</small></button>`,
      `<button type="button" class="reward-card stock" data-reward="stock" ${a.freeStock?'':'disabled'}><span>📦</span><strong>Free Stock</strong><small>${a.freeStock?'Up to 2 random items get +2.':'All unlocked stock is full.'}</small></button>`,
      `<button type="button" class="reward-card boost" data-reward="boost"><span>☀️</span><strong>Next-Day Boost</strong><small>+10% sell price tomorrow.</small></button>`
    ].join('');
  }

  function renderSummary(s){
    if(lastSummaryDay!==s.day){lastSummaryDay=s.day;window.PS_AUDIO?.sfx('dayComplete');}
    const success=s.revenue>=s.target,bonus=s.bonusCoinsEarned>0?` • +${s.bonusCoinsEarned} patience bonus`:'';
    el.summaryResult.textContent=success?`🎯 Target reached!${bonus}`:`🎯 Target not reached • +30 consolation coins${bonus}`;
    el.sumRevenue.textContent=s.revenue;el.sumServed.textContent=s.served;el.sumLost.textContent=s.lost;
    const best=Object.keys(s.sold).sort((a,b)=>s.sold[b]-s.sold[a])[0];el.sumBest.textContent=s.sold[best]?`${D.items[best].name} ×${s.sold[best]}`:'—';
    el.rewardSection.hidden=!success;el.summaryContinue.hidden=success;if(success)el.rewardChoices.innerHTML=rewardCards(s);el.summaryOverlay.hidden=false;
  }

  function upgradeCard(def,s,mode){
    const level=s.upgrades[def.id]||0,maxed=level>=def.maxLevel;
    const dots=Array.from({length:def.maxLevel},(_,i)=>`<i class="${i<level?'on':''}"></i>`).join('');
    const btn=mode==='choose'&&!maxed?`<button type="button" class="choose-upgrade" data-upgrade="${def.id}">Choose</button>`:mode==='choose'&&maxed?'<span class="maxed-label">MAX</span>':'';
    return `<article class="upgrade-choice ${maxed?'is-max':''}"><div class="upgrade-icon">${def.icon}</div><h3>${def.name}</h3><p>${def.shortEffect}</p><div class="upgrade-level"><strong>Lv. ${level}</strong><span>${dots}</span></div>${btn}</article>`;
  }

  function renderUpgrades(s,mode='view'){
    upgradeMode=mode;const defs=Object.values(D.upgrades);
    el.upgradeChoices.innerHTML=defs.map(def=>upgradeCard(def,s,mode)).join('');
    el.closeUpgrade.hidden=mode==='choose';el.upgradeNext.hidden=true;
    if(mode==='choose'){
      el.upgradeEyebrow.textContent='DAY COMPLETE';el.upgradeTitle.textContent='Choose an Upgrade';el.upgradeIntro.textContent='Pick one permanent upgrade before the next day.';
      const available=window.PS_GAME.availableUpgrades();
      if(!available.length){el.upgradeIntro.textContent='All core upgrades are maxed. Your shop is ready!';const r=window.PS_GAME.skipUpgradeIfMaxed();if(r.ok){el.upgradeNext.hidden=false;el.upgradeNext.textContent=`Start Day ${r.newDay} →`;}}
    }else{
      el.upgradeEyebrow.textContent='SHOP GROWTH';el.upgradeTitle.textContent='Upgrade Shop';el.upgradeIntro.textContent='Permanent upgrades are chosen after each completed day.';
    }
  }

  function openUpgradeView(){const s=window.PS_GAME.getState();if(s.phase!=='PREP')return;renderUpgrades(s,'view');el.upgradeOverlay.hidden=false;setTimeout(()=>el.closeUpgrade.focus(),0);}
  function openUpgradeChoice(){renderUpgrades(window.PS_GAME.getState(),'choose');el.upgradeOverlay.hidden=false;}
  function closeUpgradeView(){if(upgradeMode!=='view')return;el.upgradeOverlay.hidden=true;el.upgrade.focus();}

  function renderUnlock(s){
    if(!s.pendingUnlocks?.length||!el.upgradeOverlay.hidden)return;
    const id=s.pendingUnlocks[0],item=D.items[id];if(!item)return;const key=`${s.day}:${id}`;if(shownUnlockKey===key&&!el.unlockOverlay.hidden)return;shownUnlockKey=key;
    el.unlockIcon.src=item.icon;el.unlockIcon.alt=item.name;el.unlockTitle.textContent=item.name;el.unlockText.textContent=`${item.name} is now available in Restock.`;el.unlockOverlay.hidden=false;if(lastUnlockKey!==key){lastUnlockKey=key;window.PS_AUDIO?.sfx('unlock');}
  }

  function showDayBanner(s){
    const cfg=window.PS_GAME.getDayConfig(s.day);clearTimeout(dayBannerTimer);el.dayBannerEyebrow.textContent=`DAY ${s.day}`;el.dayBannerTitle.textContent=cfg.label||'SHOP OPEN';el.dayBannerTarget.textContent=`Target ${s.target}`;el.dayBanner.hidden=false;el.dayBanner.classList.remove('show');void el.dayBanner.offsetWidth;el.dayBanner.classList.add('show');dayBannerTimer=setTimeout(()=>{el.dayBanner.classList.remove('show');el.dayBanner.hidden=true;},2100);
  }

  function showTargetReached(){
    window.PS_AUDIO?.sfx('target');confettiBurst();
    clearTimeout(targetTimer);el.targetReached.hidden=false;el.targetReached.classList.remove('show');void el.targetReached.offsetWidth;el.targetReached.classList.add('show');targetTimer=setTimeout(()=>{el.targetReached.classList.remove('show');el.targetReached.hidden=true;},2200);
  }


  function eventThemeClass(id){
    return ['snackRush','hotDay','busyHour','morningRush'].includes(id)?`event-${id}`:'';
  }

  function showEventBanner(active,day,eventCount){
    const def=window.PS_GAME.getEventDef(active.id);if(!def)return;
    clearTimeout(eventBannerTimer);window.PS_AUDIO?.sfx('event');
    el.eventBanner.className=`event-banner ${eventThemeClass(active.id)}`;
    el.eventBannerIcon.textContent=def.icon||'✨';el.eventBannerTitle.textContent=def.name;el.eventBannerText.textContent=def.banner||'Special event!';
    el.eventBanner.hidden=false;el.eventBanner.classList.remove('show');void el.eventBanner.offsetWidth;el.eventBanner.classList.add('show');
    lastEventKey=`${day}:${active.id}:${eventCount||1}`;
    eventBannerTimer=setTimeout(()=>{el.eventBanner.classList.remove('show');el.eventBanner.hidden=true;},1750);
  }

  function renderEvent(s){
    const active=s.activeEvent;
    if(!active){el.eventBadge.hidden=true;return;}
    const def=window.PS_GAME.getEventDef(active.id);if(!def){el.eventBadge.hidden=true;return;}
    const key=`${s.day}:${active.id}:${s.eventCount||1}`;
    if(key!==lastEventKey)showEventBanner(active,s.day,s.eventCount);
    el.eventBadge.className=`event-badge ${eventThemeClass(active.id)}`;
    el.eventBadgeIcon.textContent=def.icon||'✨';el.eventBadgeName.textContent=def.name;el.eventBadgeTime.textContent=`${Math.max(0,Math.ceil(active.remaining))}s`;el.eventBadge.hidden=false;
  }

  function clearTutorialFocus(){
    for(const node of [el.restock,el.open,el.customerLane,el.progressRow])node?.classList.remove('tutorial-focus','tutorial-focus-lane','tutorial-focus-progress');
    for(const node of document.querySelectorAll('.tutorial-buy-focus'))node.classList.remove('tutorial-buy-focus');
    el.game.classList.remove('tutorial-active','tutorial-step-1','tutorial-step-2','tutorial-step-3','tutorial-step-4','tutorial-restock-open');
  }

  function setTutorialStep(step){
    clearTimeout(tutorialFinishTimer);tutorialStep=step;clearTutorialFocus();
    const s=window.PS_GAME.getState();
    if(!step){
      el.tutorialCoach.hidden=true;
      el.restock.disabled=!['PREP','RUNNING'].includes(s.phase);el.upgrade.disabled=s.phase!=='PREP';el.open.disabled=s.phase!=='PREP';
      return;
    }
    el.game.classList.add('tutorial-active',`tutorial-step-${step}`);el.tutorialCoach.hidden=false;el.tutorialStepLabel.textContent=`${step} / 4`;
    el.upgrade.disabled=true;
    if(step===1){el.restock.disabled=false;el.open.disabled=true;el.tutorialTitle.textContent='Stock your shelves.';el.tutorialText.textContent='Tap Restock, then buy any item.';el.restock.classList.add('tutorial-focus');}
    if(step===2){el.restock.disabled=true;el.open.disabled=false;el.tutorialTitle.textContent='Open your shop.';el.tutorialText.textContent='Tap Open Shop to start serving.';el.open.classList.add('tutorial-focus');}
    if(step===3){el.restock.disabled=true;el.open.disabled=true;el.tutorialTitle.textContent='Customers want this.';el.tutorialText.textContent='The bubble shows the item they want.';el.customerLane.classList.add('tutorial-focus-lane');}
    if(step===4){el.restock.disabled=true;el.open.disabled=true;el.tutorialTitle.textContent='Earn coins and reach the target.';el.tutorialText.textContent='Every sale fills the daily progress bar.';el.progressRow.classList.add('tutorial-focus-progress');tutorialFinishTimer=setTimeout(()=>{if(tutorialStep!==4)return;window.PS_GAME.completeTutorial();setTutorialStep(0);showToast('Tutorial complete! ✨');},2400);}
  }

  function maybeStartTutorial(s){
    if(!s.tutorialComplete&&s.day===1&&s.phase==='PREP'&&tutorialStep===0)setTutorialStep(1);
    if((s.tutorialComplete||s.day!==1)&&tutorialStep!==0)setTutorialStep(0);
  }

  function render(s){
    maybeStartTutorial(s);syncAudioSettings(s);
    el.coins.textContent=Math.floor(s.coins);el.day.textContent=`Day ${s.day}`;el.target.textContent=s.target;
    const pct=Math.min(100,(s.revenue/s.target)*100);el.fill.style.width=`${pct}%`;el.progress.textContent=`${s.revenue} / ${s.target}`;
    el.bread.innerHTML=stockSprites('bread',s.inventory.bread,s.maxStock);el.snack.innerHTML=stockSprites('snack',s.inventory.snack,s.maxStock);renderDrinks(s);renderCustomers(s);renderEvent(s);
    if(lastInventory){for(const id of Object.keys(s.inventory)){const diff=s.inventory[id]-(lastInventory[id]??s.inventory[id]);if(diff>0)pulse(rackForItem(id),'rack-restock');else if(diff<0)pulse(rackForItem(id),'rack-sale');}}lastInventory={...s.inventory};
    el.restock.disabled=!['PREP','RUNNING'].includes(s.phase);el.upgrade.disabled=s.phase!=='PREP';el.open.disabled=s.phase!=='PREP';
    if(!s.tutorialComplete&&s.day===1&&tutorialStep){
      el.upgrade.disabled=true;
      if(tutorialStep===1){el.open.disabled=true;}
      if(tutorialStep===2){el.restock.disabled=true;}
      if(tutorialStep>=3){el.restock.disabled=true;el.open.disabled=true;}
    }
    el.openText.textContent=s.phase==='PREP'?'Open Shop':s.phase==='RUNNING'?`${Math.ceil(s.timeRemaining)}s`:'Closed';
    const boosted=s.nextDayBoost&&s.nextDayBoost.day===s.day;el.boost.hidden=!boosted;

    if(s.phase==='RUNNING'&&lastPhase!=='RUNNING')showDayBanner(s);
    if(lastRevenue!==null&&lastRevenue<s.target&&s.revenue>=s.target&&lastTargetDay!==s.day){lastTargetDay=s.day;showTargetReached();}
    if(lastCoins!==null&&s.coins>lastCoins&&s.phase==='RUNNING')coinPop(s.coins-lastCoins);lastCoins=s.coins;
    if(lastRevenue!==null&&s.revenue>lastRevenue){
      const sold=s.revenue-lastRevenue,bonus=s.bonusCoinsEarned-lastBonus;showToast(bonus>0?`Sold! +${sold} coin • ⚡ +${bonus}`:`Sold! +${sold} coin`);
      if(tutorialStep===3)setTutorialStep(4);
    }
    lastRevenue=s.revenue;lastBonus=s.bonusCoinsEarned||0;lastPhase=s.phase;

    if(s.phase==='SUMMARY'&&el.summaryOverlay.hidden)renderSummary(s);
    if(s.phase==='UPGRADE'&&el.upgradeOverlay.hidden){el.summaryOverlay.hidden=true;openUpgradeChoice();}
    if(!el.restockOverlay.hidden)renderRestock(s);if(!el.upgradeOverlay.hidden)renderUpgrades(s,upgradeMode);
    renderUnlock(s);
  }

  function bind(){
    el.restock.addEventListener('click',openRestock);$('#closeRestockBtn').addEventListener('click',closeRestock);el.restockOverlay.addEventListener('click',e=>{if(e.target===el.restockOverlay)closeRestock();});
    el.restockCards.addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b)return;const r=window.PS_GAME.restock(b.dataset.buy);if(r.ok){window.PS_AUDIO?.sfx('restock');showToast(`${r.item.name} +${r.qty}`);if(tutorialStep===1){closeRestock();setTutorialStep(2);}}});
    el.upgrade.addEventListener('click',openUpgradeView);el.closeUpgrade.addEventListener('click',closeUpgradeView);el.upgradeOverlay.addEventListener('click',e=>{if(e.target===el.upgradeOverlay&&upgradeMode==='view')closeUpgradeView();});
    el.open.addEventListener('click',()=>{if(window.PS_GAME.openShop()){window.PS_AUDIO?.sfx('tap');const s=window.PS_GAME.getState();showToast(`Day ${s.day} — Shop Open!`);if(tutorialStep===2)setTutorialStep(3);}});
    el.rewardChoices.addEventListener('click',e=>{const b=e.target.closest('[data-reward]');if(!b||b.disabled)return;const r=window.PS_GAME.claimReward(b.dataset.reward);if(r.ok){window.PS_AUDIO?.sfx('reward');el.summaryOverlay.hidden=true;showToast(`Reward: ${r.detail}`);openUpgradeChoice();}});
    el.summaryContinue.addEventListener('click',()=>{if(window.PS_GAME.continueAfterFailure()){el.summaryOverlay.hidden=true;openUpgradeChoice();}});
    el.upgradeChoices.addEventListener('click',e=>{const b=e.target.closest('[data-upgrade]');if(!b)return;const r=window.PS_GAME.chooseUpgrade(b.dataset.upgrade);if(!r.ok)return;window.PS_AUDIO?.sfx('upgrade');showToast(`${r.name} → Lv. ${r.level}`);renderUpgrades(window.PS_GAME.getState(),'choose');el.upgradeIntro.textContent=`${r.name} upgraded permanently. Day ${r.newDay} is ready.`;el.upgradeNext.hidden=false;el.upgradeNext.textContent=`Start Day ${r.newDay} →`;for(const x of el.upgradeChoices.querySelectorAll('.choose-upgrade'))x.remove();});
    el.upgradeNext.addEventListener('click',()=>{el.upgradeOverlay.hidden=true;upgradeMode='view';const s=window.PS_GAME.getState(),cfg=window.PS_GAME.getDayConfig(s.day);showToast(`Day ${s.day} — ${cfg.label||'Ready'}!`);renderUnlock(s);el.restock.focus();});
    $('#unlockOkBtn').addEventListener('click',()=>{el.unlockOverlay.hidden=true;window.PS_GAME.clearPendingUnlocks();el.restock.focus();});
    el.settingsBtn.addEventListener('click',openSettings);$('#closeSettingsBtn').addEventListener('click',closeSettings);el.settingsOverlay.addEventListener('click',e=>{if(e.target===el.settingsOverlay)closeSettings();});
    el.musicToggle.addEventListener('click',()=>{const s=window.PS_GAME.getState();window.PS_GAME.setSetting('music',!(s.settings?.music!==false));});
    el.sfxToggle.addEventListener('click',()=>{const s=window.PS_GAME.getState();window.PS_GAME.setSetting('sfx',!(s.settings?.sfx!==false));});
    for(const b of document.querySelectorAll('button'))b.addEventListener('pointerdown',()=>{window.PS_AUDIO?.userGesture();window.PS_AUDIO?.sfx('tap');},{passive:true});
    el.tutorialSkip.addEventListener('click',()=>{window.PS_GAME.completeTutorial();setTutorialStep(0);showToast('Tutorial skipped.');});
  }


  return {bind,render,showToast};
})();
