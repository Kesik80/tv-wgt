function tvNavRuntime(){
  var SEL='a[href],button,input:not([type=hidden]),select,textarea,video,iframe,[role=button],[onclick]';
  var cur=null;
  var st=document.createElement('style');
  st.textContent='.tv-focus{outline:4px solid #00ff88!important;outline-offset:3px!important;box-shadow:0 0 24px rgba(0,255,136,.5)!important;border-radius:4px}';
  (document.head||document.documentElement).appendChild(st);
  function vis(el){var r=el.getBoundingClientRect();if(r.width<10||r.height<10)return false;if(el.disabled)return false;try{var s=getComputedStyle(el);if(s.visibility==='hidden'||s.display==='none'||parseFloat(s.opacity||'1')<0.3)return false;}catch(e){}return true;}
  function cand(root){
    var els=(root||document).querySelectorAll(SEL),arr=[],i,j;
    for(i=0;i<els.length;i++){if(vis(els[i]))arr.push(els[i]);}
    var out=[];
    for(i=0;i<arr.length;i++){
      var skip=false;
      for(j=0;j<arr.length;j++){if(i!==j&&arr[i].contains(arr[j])){skip=true;break;}}
      if(!skip)out.push(arr[i]);
    }
    return out;
  }
  function overlayOpen(){
    var els=document.querySelectorAll('div,section,form,aside');
    for(var i=els.length-1;i>=0;i--){
      var el=els[i];
      try{
        var s=getComputedStyle(el);
        if(s.position!=='fixed'||s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity||'1')<0.5)continue;
        var r=el.getBoundingClientRect();
        if(r.width<Math.min(400,window.innerWidth*0.3)||r.height<Math.min(300,window.innerHeight*0.3))continue;
        if(r.bottom<0||r.top>window.innerHeight||r.right<0||r.left>window.innerWidth)continue;
        if(el.querySelector('input,button,a,select,textarea'))return el;
      }catch(e){}
    }
    return null;
  }
  function cen(el){var r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
  function toast(t){
    try{var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:50px;transform:translateX(-50%);z-index:999999;background:rgba(0,0,0,.85);color:#fff;font-size:18px;padding:12px 22px;border-radius:12px;font-family:sans-serif';document.documentElement.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},4000);}catch(e){}
  }
  function focusEl(el){if(cur)cur.classList.remove('tv-focus');cur=el;cur.classList.add('tv-focus');window.__tvCurEl=el;try{el.focus({preventScroll:true});}catch(e){try{el.focus();}catch(e2){}}
    if(el.tagName==='VIDEO'&&!window.__tvHinted){window.__tvHinted=1;toast('Видео: Enter — пауза, ←/→ — перемотка, красная кнопка — весь экран');}}
  window.__tvFocus=focusEl;
  function vid(){
    var v=document.querySelector('video');
    if(v)return v;
    var fs=document.querySelectorAll('iframe');
    for(var i=0;i<fs.length;i++){
      try{var d=fs[i].contentDocument;if(d){var vv=d.querySelector('video');if(vv)return vv;}}catch(e){}
    }
    return null;
  }
  function toggleFs(v){    try{
      var fe=document.fullscreenElement||document.webkitFullscreenElement;
      if(fe){(document.exitFullscreen||document.webkitExitFullscreen).call(document);}
      else{(v.requestFullscreen||v.webkitRequestFullscreen).call(v);}
    }catch(e){}
  }
  function move(d){
    var ov=overlayOpen();
    if(ov&&(!cur||!ov.contains(cur))){var f=ov.querySelector('input,button,a[href],select,textarea');if(f){focusEl(f);}return;}
    var list=cand(ov&&cur&&ov.contains(cur)?ov:null);
    if(!list.length)return;
    if(!cur||!document.contains(cur)){focusEl(list[0]);return;}
    var c=cen(cur),best=null,bestSc=Infinity;
    for(var i=0;i<list.length;i++){
      var el=list[i];if(el===cur)continue;
      var p=cen(el),dx=p.x-c.x,dy=p.y-c.y,sc=Infinity;
      if(d==='right'&&dx>20)sc=dx+Math.abs(dy)*3;
      else if(d==='left'&&dx<-20)sc=-dx+Math.abs(dy)*3;
      else if(d==='down'&&dy>20)sc=dy+Math.abs(dx)*3;
      else if(d==='up'&&dy<-20)sc=-dy+Math.abs(dx)*3;
      if(sc<bestSc){bestSc=sc;best=el;}
    }
    if(best){focusEl(best);try{best.scrollIntoView({block:'center',inline:'center'});}catch(e){try{best.scrollIntoView();}catch(e2){}}}
  }
  function onKey(e){
    var v=vid();
    if(e.keyCode===415&&v){e.preventDefault();v.play();return;}
    if(e.keyCode===19&&v){e.preventDefault();v.pause();return;}
    if(e.keyCode===417&&v){e.preventDefault();v.currentTime+=10;return;}
    if(e.keyCode===416&&v){e.preventDefault();v.currentTime-=10;return;}
    if(e.keyCode===403&&v){e.preventDefault();toggleFs(v);return;}
    if(cur&&cur.tagName==='VIDEO'){
      if(e.keyCode===37){e.preventDefault();cur.currentTime-=10;return;}
      if(e.keyCode===39){e.preventDefault();cur.currentTime+=10;return;}
    }
    var map={37:'left',38:'up',39:'right',40:'down'};
    if(map[e.keyCode]){e.preventDefault();e.stopPropagation();move(map[e.keyCode]);return;}
    if(e.keyCode===13){
      if(!cur)return;
      if(cur.tagName==='INPUT'||cur.tagName==='TEXTAREA'||cur.tagName==='SELECT'){return;}
      if(cur.tagName==='VIDEO'){e.preventDefault();cur.paused?cur.play():cur.pause();return;}
      if(cur.tagName==='IFRAME'){e.preventDefault();try{var cd=cur.contentDocument;if(cd){var t=cd.querySelector('video,button,input,a[href]');if(t){t.focus();}}else{cur.focus();}}catch(err){cur.focus();}return;}
      var href=cur.getAttribute?cur.getAttribute('href'):null;
      if(cur.tagName==='A'&&href&&href.indexOf('#')!==0&&href.indexOf('javascript:')!==0&&href.indexOf('mailto:')!==0){
        e.preventDefault();e.stopPropagation();
        if(window.__tvGo)window.__tvGo(cur.href);else location.href=cur.href;
      }else{
        e.preventDefault();cur.click();
      }
      setTimeout(function(){if(window.__tvOverlay)window.__tvOverlay();},600);      return;
    }
    if(e.keyCode===10009){e.preventDefault();e.stopPropagation();if(window.__tvBack)window.__tvBack();}
  }
  if(window.__tvKey){document.removeEventListener('keydown',window.__tvKey,true);}
  window.__tvKey=onKey;
  document.addEventListener('keydown',onKey,true);
  setTimeout(function(){var l=cand();if(l.length)focusEl(l[0]);},300);
}
function tvFetchRuntime(){
  var startUrl=document.body.getAttribute('data-url');
  var msg=document.getElementById('tvMsg');
  var done=false;
  var stack=[];
  var exitArmed=0;
  function setMsg(t){if(msg)msg.textContent=t;}
  function direct(u){if(done)return;done=true;location.replace(u||startUrl);}
  var timer=setTimeout(function(){direct();},10000);
  function isCh(t){t=t.slice(0,30000).toLowerCase();return t.indexOf('__cf_chl')!==-1||t.indexOf('just a moment')!==-1||t.indexOf('выполнение проверки')!==-1;}
  function badge(){
    try{var d=document.createElement('div');d.textContent='SMART FOCUS TV';d.style.cssText='position:fixed;right:10px;bottom:10px;z-index:999999;background:rgba(0,0,0,.6);color:#00ff88;font-size:12px;padding:4px 8px;border-radius:6px;font-family:sans-serif';document.documentElement.appendChild(d);}catch(e){}
  }
  function toast(t){
    try{var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;bottom:50px;transform:translateX(-50%);z-index:999999;background:rgba(0,0,0,.85);color:#fff;font-size:18px;padding:12px 22px;border-radius:12px;font-family:sans-serif';document.documentElement.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},4000);}catch(e){}
  }
  function curOrigin(){try{return new URL(stack.length?stack[stack.length-1]:startUrl).origin;}catch(e){return startUrl;}}
  function applyZoom(){
    try{
      var iw=window.innerWidth,best=0,els=document.body.getElementsByTagName('div'),i,w;
      for(i=0;i<els.length;i++){w=els[i].offsetWidth;if(w>best&&w<=iw*0.95&&w>=iw*0.35)best=w;}
      if(!best)best=iw;
      var k=(iw/best)*0.97;
      if(k>1.05)document.documentElement.style.zoom=k.toFixed(2);
    }catch(e){}
  }
  function fixAssets(){
    try{
      var origin=curOrigin();
      var els=document.querySelectorAll('video,source,iframe,img,script,link');
      for(var i=0;i<els.length;i++){
        var el=els[i];
        var attr=(el.tagName==='LINK')?'href':'src';
        var s=el.getAttribute(attr);
        if(s&&s.indexOf('http')!==0&&s.indexOf('//')!==0&&s.indexOf('data:')!==0&&s.indexOf('blob:')!==0&&s.indexOf('#')!==0&&s.indexOf('about:')!==0){
          el.setAttribute(attr,origin+(s.charAt(0)==='/'?'':'/')+s);
          continue;
        }
        var p=el.src||'';
        if(p&&p.indexOf('http')!==0&&p.indexOf('data:')!==0&&p.indexOf('blob:')!==0){
          try{var uu=new URL(p);el.src=origin+uu.pathname+uu.search+uu.hash;}catch(e){}        }
      }
    }catch(e){}
  }
  function watchAssets(){
    fixAssets();
    if(typeof MutationObserver==='function'){
      try{
        var mo=new MutationObserver(function(){fixAssets();});
        mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','href','poster']});
      }catch(e){}
    }
    if(window.__tvAssetsInt)clearInterval(window.__tvAssetsInt);
    window.__tvAssetsInt=setInterval(fixAssets,1500);
  }
  function focusOverlay(){
    var ov=overlayOpenLite();
    if(ov&&!(window.__tvCurEl&&ov.contains(window.__tvCurEl))){
      var c=ov.querySelector('input,button,a[href],select,textarea');
      if(c&&window.__tvFocus)window.__tvFocus(c);
    }
  }
  function overlayOpenLite(){
    var els=document.querySelectorAll('div,section,form,aside');
    for(var i=els.length-1;i>=0;i--){
      var el=els[i];
      try{
        var s=getComputedStyle(el);
        if(s.position!=='fixed'||s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity||'1')<0.5)continue;
        var r=el.getBoundingClientRect();
        if(r.width<220||r.height<160)continue;
        if(r.bottom<0||r.top>window.innerHeight||r.right<0||r.left>window.innerWidth)continue;
        if(el.querySelector('input,button,a,select,textarea'))return el;
      }catch(e){}
    }
    return null;
  }
  window.__tvOverlay=focusOverlay;
  function apply(html,pageUrl){
    html=html.replace(/(src|href)=["']\/\//g,'$1="https://');
    var origin=new URL(pageUrl).origin;
    var head='<base href="'+origin+'/"><meta name="referrer" content="origin"><style>html{background:#000}</style>';
    var hm=html.match(/<head[^>]*>/i);
    if(hm){var i1=hm.index+hm[0].length;html=html.slice(0,i1)+head+html.slice(i1);}else{html=head+html;}
    document.open();document.write(html);document.close();
    try{var nav=(new Function('return '+NAVFN))();nav();}catch(e){}
    badge();watchAssets();
    try{
      if(typeof tizen!=='undefined'&&tizen.tvinputdevice){
        ['MediaPlay','MediaPause','MediaStop','MediaFastForward','MediaRewind','ColorF0Red'].forEach(function(k){try{tizen.tvinputdevice.registerKey(k);}catch(e){}});      }
    }catch(e){}
    setTimeout(applyZoom,300);setTimeout(applyZoom,2500);
    setTimeout(function(){var v=document.querySelector('video');if(v&&!window.__tvHinted){window.__tvHinted=1;toast('Плеер: Enter — пауза, ←/→ — перемотка, красная кнопка — весь экран');}},2000);
  }
  function fetchText(u,ok,er){
    if(typeof fetch==='function'){
      fetch(u,{credentials:'include',redirect:'follow'}).then(function(r){if(!r.ok)throw 0;return r.text();}).then(ok).catch(er);
    }else if(typeof XMLHttpRequest!=='undefined'){
      var x=new XMLHttpRequest();x.open('GET',u,true);
      x.onload=function(){if(x.status>=200&&x.status<400&&x.responseText)ok(x.responseText);else er();};
      x.onerror=function(){er();};x.send();
    }else{er();}
  }
  function load(u,push){
    if(push!==false)stack.push(u);
    setMsg('Скачиваю сайт…');
    fetchText(u,function(html){
      if(!html||html.length<200||isCh(html)){direct(u);return;}
      apply(html,u);
    },function(){direct(u);});
  }
  window.__tvGo=function(u){load(u,true);};
  window.__tvBack=function(){
    if(stack.length>1){stack.pop();load(stack[stack.length-1],false);}
    else{
      var now=Date.now();
      if(now-exitArmed<2500){try{tizen.application.getCurrentApplication().exit();}catch(e){}}
      else{exitArmed=now;toast('Для выхода нажмите ещё раз назад');}
    }
  };
  stack=[startUrl];
  try{
    setMsg('Скачиваю сайт…');
    fetchText(startUrl,function(html){
      if(!html||html.length<200||isCh(html)){direct();return;}
      done=true;clearTimeout(timer);
      apply(html,startUrl);
    },function(){direct();});
  }catch(e){direct();}
}
indexDirect=function(name,url){
  var navLit=JSON.stringify(tvNavRuntime.toString());
  var src=tvFetchRuntime.toString();
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title></head><body data-url="'+url+'" style="margin:0;background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><div style="font-size:32px;margin-bottom:14px">Загрузка…</div><div id="tvMsg" style="color:#888;font-size:16px">'+name+'</div></div><scr'+'ipt>var NAVFN='+navLit+';('+src+')();</scr'+'ipt></body></html>';
};