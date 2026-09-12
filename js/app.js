(() => {
  window.PS_UI.bind();
  window.PS_GAME.onChange(window.PS_UI.render);

  let last=performance.now();
  function frame(now){
    const dt=Math.min(.25,(now-last)/1000);last=now;
    window.PS_GAME.tick(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
  }
})();
