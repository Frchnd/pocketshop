(() => {
  window.PS_UI.bind();
  window.PS_GAME.onChange(window.PS_UI.render);

  // Gameplay logic does not need a 60fps simulation. A 100ms fixed step keeps
  // patience/spawn logic stable while CSS handles smooth visual animation.
  const STEP=.1;
  let last=performance.now(),acc=0;
  function frame(now){
    const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;acc=Math.min(.3,acc+dt);
    while(acc>=STEP){window.PS_GAME.tick(STEP);acc-=STEP;}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener('visibilitychange',()=>{last=performance.now();acc=0;});
  window.addEventListener('pagehide',()=>window.PS_AUDIO?.dispose(),{once:true});

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }
})();
