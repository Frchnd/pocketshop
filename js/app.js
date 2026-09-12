(() => {
  window.PS_UI.bind();
  window.PS_RELEASE?.bind();
  window.PS_GAME.onChange(window.PS_UI.render);
  window.PS_RELEASE?.finishStartup();

  // 100ms fixed gameplay step: stable enough for timers/patience, while CSS handles animation.
  const STEP=.1;let last=performance.now(),acc=0,raf=0;
  function frame(now){
    const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;acc=Math.min(.3,acc+dt);
    while(acc>=STEP){window.PS_GAME.tick(STEP);acc-=STEP;}
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  document.addEventListener('visibilitychange',()=>{last=performance.now();acc=0;});
  window.addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);window.PS_AUDIO?.dispose();},{once:true});
})();
