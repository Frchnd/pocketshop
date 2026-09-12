window.PS_RELEASE = (() => {
  const BUILD='M4';
  let registration=null,deferredInstall=null,reloadForUpdate=false,resetArmed=false,resetTimer=null;
  const $=s=>document.querySelector(s);
  const el={
    loading:$('#startupLoading'),installRow:$('#installRow'),installBtn:$('#installAppBtn'),
    checkBtn:$('#checkUpdateBtn'),updateText:$('#updateStatusText'),resetBtn:$('#resetProgressBtn'),
    banner:$('#releaseBanner'),updateNow:$('#updateNowBtn'),updateLater:$('#updateLaterBtn'),
    connection:$('#connectionBadge')
  };

  function standalone(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;}
  function setUpdateText(text){if(el.updateText)el.updateText.textContent=text;}
  function showUpdate(){if(el.banner)el.banner.hidden=false;setUpdateText('Update downloaded — refresh when ready');}
  function hideUpdate(){if(el.banner)el.banner.hidden=true;}
  function syncConnection(){if(!el.connection)return;const offline=navigator.onLine===false;el.connection.hidden=!offline;if(offline)window.PS_UI?.showToast?.('Offline mode • progress stays local');}
  function syncInstall(){if(!el.installRow)return;el.installRow.hidden=standalone()||!deferredInstall;}

  function watchRegistration(reg){
    registration=reg;if(reg.waiting)showUpdate();
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;if(!worker)return;
      setUpdateText('Checking new build…');
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed'){
          if(navigator.serviceWorker.controller)showUpdate();
          else setUpdateText(`${BUILD} installed • offline ready`);
        }
      });
    });
  }

  async function registerServiceWorker(){
    if(!('serviceWorker' in navigator)){setUpdateText('Service worker unsupported in this browser');return null;}
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});watchRegistration(reg);
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadForUpdate)location.reload();});
      setTimeout(()=>reg.update().catch(()=>{}),1200);
      return reg;
    }catch(_){setUpdateText('Offline setup failed • online play still works');return null;}
  }

  async function promptInstall(){
    if(!deferredInstall)return;
    const prompt=deferredInstall;deferredInstall=null;syncInstall();
    try{await prompt.prompt();await prompt.userChoice;}catch(_){ }
  }
  async function checkUpdate(){
    if(!registration){setUpdateText('Offline service not ready yet');return;}
    setUpdateText('Checking for updates…');
    try{await registration.update();setTimeout(()=>{if(registration.waiting)showUpdate();else setUpdateText(`${BUILD} • up to date`);},450);}
    catch(_){setUpdateText(navigator.onLine===false?'Offline • update check unavailable':'Could not check update');}
  }
  function applyUpdate(){
    if(!registration?.waiting)return;
    reloadForUpdate=true;registration.waiting.postMessage({type:'SKIP_WAITING'});
  }
  function armReset(){
    if(!resetArmed){resetArmed=true;el.resetBtn.textContent='Tap again';el.resetBtn.classList.add('armed');window.PS_UI?.showToast?.('Tap Reset again to erase progress');clearTimeout(resetTimer);resetTimer=setTimeout(()=>{resetArmed=false;el.resetBtn.textContent='Reset';el.resetBtn.classList.remove('armed');},4000);return;}
    clearTimeout(resetTimer);window.PS_SAVE?.reset();location.reload();
  }
  function finishStartup(){
    const st=window.PS_SAVE?.getStatus?.();
    if(el.loading){el.loading.classList.add('done');setTimeout(()=>{el.loading.hidden=true;},280);}
    if(st?.recoveredFromCorruption)setTimeout(()=>window.PS_UI?.showToast?.('Save recovery used • shop restored safely'),350);
    else if(st?.storageAvailable===false)setTimeout(()=>window.PS_UI?.showToast?.('Local save unavailable in this browser'),350);
  }

  function bind(){
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;syncInstall();});
    window.addEventListener('appinstalled',()=>{deferredInstall=null;syncInstall();window.PS_UI?.showToast?.('Pocket Shop installed! ✨');});
    window.addEventListener('online',syncConnection);window.addEventListener('offline',syncConnection);syncConnection();syncInstall();
    el.installBtn?.addEventListener('click',promptInstall);el.checkBtn?.addEventListener('click',checkUpdate);el.updateNow?.addEventListener('click',applyUpdate);el.updateLater?.addEventListener('click',hideUpdate);el.resetBtn?.addEventListener('click',armReset);
    registerServiceWorker();
  }
  return {bind,finishStartup,checkUpdate,getBuild:()=>BUILD};
})();
