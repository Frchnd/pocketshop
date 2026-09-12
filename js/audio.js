window.PS_AUDIO = (() => {
  let ctx=null,master=null,musicBus=null,sfxBus=null,musicTimer=null,musicStep=0;
  let settings={music:true,sfx:true};
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  const NOTES=[261.63,329.63,392.00,329.63,293.66,349.23,440.00,349.23];

  function ensure(){
    if(!AudioCtx)return null;
    if(!ctx){
      ctx=new AudioCtx();
      master=ctx.createGain();musicBus=ctx.createGain();sfxBus=ctx.createGain();
      master.gain.value=.55;musicBus.gain.value=.14;sfxBus.gain.value=.34;
      musicBus.connect(master);sfxBus.connect(master);master.connect(ctx.destination);
    }
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
    return ctx;
  }

  function tone(freq,duration=.09,{type='sine',gain=.12,when=0,detune=0,bus='sfx'}={}){
    const c=ensure();if(!c)return;
    const target=bus==='music'?musicBus:sfxBus;
    const start=c.currentTime+Math.max(0,when),end=start+Math.max(.025,duration);
    const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);o.detune.setValueAtTime(detune,start);
    g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),start+.012);g.gain.exponentialRampToValueAtTime(.0001,end);
    o.connect(g);g.connect(target);o.start(start);o.stop(end+.02);
  }

  function noise(duration=.08,gain=.035){
    const c=ensure();if(!c||!settings.sfx)return;
    const n=Math.max(1,Math.floor(c.sampleRate*duration)),buffer=c.createBuffer(1,n,c.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*(1-i/n);
    const src=c.createBufferSource(),g=c.createGain();g.gain.value=gain;src.buffer=buffer;src.connect(g);g.connect(sfxBus);src.start();
  }

  function sfx(name){
    if(!settings.sfx)return;ensure();
    switch(name){
      case 'tap': tone(430,.045,{type:'sine',gain:.055}); break;
      case 'restock': tone(330,.07,{type:'triangle',gain:.09});tone(494,.09,{type:'triangle',gain:.075,when:.055}); break;
      case 'sale': tone(660,.06,{type:'sine',gain:.09});tone(880,.09,{type:'sine',gain:.08,when:.045}); break;
      case 'coin': tone(988,.055,{type:'sine',gain:.07});tone(1319,.07,{type:'sine',gain:.06,when:.035}); break;
      case 'arrive': tone(392,.07,{type:'triangle',gain:.055}); break;
      case 'fail': tone(247,.11,{type:'triangle',gain:.065});tone(196,.13,{type:'triangle',gain:.055,when:.07}); break;
      case 'target': tone(523,.09,{type:'sine',gain:.08});tone(659,.09,{type:'sine',gain:.075,when:.07});tone(784,.14,{type:'sine',gain:.07,when:.14}); break;
      case 'upgrade': tone(440,.07,{type:'triangle',gain:.075});tone(554,.08,{type:'triangle',gain:.07,when:.055});tone(659,.11,{type:'triangle',gain:.065,when:.11}); break;
      case 'dayComplete': tone(392,.08,{type:'sine',gain:.065});tone(523,.09,{type:'sine',gain:.065,when:.07});tone(659,.13,{type:'sine',gain:.06,when:.14}); break;
      case 'unlock': tone(659,.075,{type:'sine',gain:.07});tone(988,.13,{type:'sine',gain:.065,when:.07}); break;
      case 'event': noise(.05,.022);tone(330,.08,{type:'square',gain:.035});tone(494,.1,{type:'square',gain:.03,when:.07}); break;
      case 'reward': tone(587,.07,{type:'sine',gain:.07});tone(784,.11,{type:'sine',gain:.065,when:.06}); break;
    }
  }

  function musicPulse(){
    if(!settings.music||!ctx||ctx.state!=='running')return;
    const root=NOTES[musicStep%NOTES.length];musicStep++;
    tone(root,.48,{type:'sine',gain:.028,bus:'music'});
    tone(root*1.5,.32,{type:'triangle',gain:.012,when:.10,bus:'music'});
  }

  function startMusic(){
    if(!settings.music)return;ensure();
    if(musicTimer)return;musicPulse();musicTimer=setInterval(musicPulse,900);
  }
  function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;}}
  function setSettings(next={}){
    settings={music:next.music!==false,sfx:next.sfx!==false};
    if(settings.music)startMusic();else stopMusic();
  }
  function userGesture(){ensure();if(settings.music)startMusic();}
  function dispose(){stopMusic();if(ctx){ctx.close().catch(()=>{});ctx=null;master=musicBus=sfxBus=null;}}

  return {setSettings,userGesture,sfx,dispose};
})();
