function tvNavRuntime(){
  var SEL='a[href],button,input:not([type=hidden]),select,textarea,[role=button],[onclick]';
  var cur=null;
  var st=document.createElement('style');
  st.textContent='.tv-focus{outline:4px solid #00ff88!important;outline-offset:3px!important;box-shadow:0 0 24px rgba(0,255,136,.5)!important;border-radius:4px}';
  (document.head||document.documentElement).appendChild(st);
  function vis(el){var r=el.getBoundingClientRect();if(r.width<10||r.height<10)return false;if(el.disabled)return false;try{var s=getComputedStyle(el);if(s.visibility==='hidden'||s.display==='none')return false;}catch(e){}return true;}
  function cand(){
    var els=document.querySelectorAll(SEL),arr=[],i,j;
    for(i=0;i<els.length;i++){if(vis(els[i]))arr.push(els[i]);}
    var out=[];
    for(i=0;i<arr.length;i++){
      var skip=false;
      for(j=0;j<arr.length;j++){if(i!==j&&arr[i].contains(arr[j])){skip=true;break;}}
      if(!skip)out.push(arr[i]);
    }
    return out;
  }
  function cen(el){var r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
  function focusEl(el){if(cur)cur.classList.remove('tv-focus');cur=el;cur.classList.add('tv-focus');try{el.focus({preventScroll:true});}catch(e){try{el.focus();}catch(e2){}}}
  function move(d){
    var list=cand();
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
  document.addEventListener('keydown',function(e){
    var map={37:'left',38:'up',39:'right',40:'down'};
    if(map[e.keyCode]){e.preventDefault();e.stopPropagation();move(map[e.keyCode]);}
    else if(e.keyCode===13){if(cur){e.preventDefault();cur.click();}}
    else if(e.keyCode===10009){if(history.length>1){e.preventDefault();history.back();}}
  },true);
  setTimeout(function(){var l=cand();if(l.length)focusEl(l[0]);},300);
}
function tvFetchRuntime(){
  var url=document.body.getAttribute('data-url');
  var msg=document.getElementById('tvMsg');
  var done=false;
  function setMsg(t){if(msg)msg.textContent=t;}
  function direct(){if(done)return;done=true;location.replace(url);}  var timer=setTimeout(function(){direct();},10000);
  function isCh(t){t=t.slice(0,30000).toLowerCase();return t.indexOf('__cf_chl')!==-1||t.indexOf('just a moment')!==-1||t.indexOf('выполнение проверки')!==-1;}
  function badge(){
    try{var d=document.createElement('div');d.textContent='SMART FOCUS TV';d.style.cssText='position:fixed;right:10px;bottom:10px;z-index:999999;background:rgba(0,0,0,.6);color:#00ff88;font-size:12px;padding:4px 8px;border-radius:6px;font-family:sans-serif';document.documentElement.appendChild(d);}catch(e){}
  }
  function applyZoom(){
    try{
      var iw=window.innerWidth,best=0,els=document.body.getElementsByTagName('div'),i,w;
      for(i=0;i<els.length;i++){w=els[i].offsetWidth;if(w>best&&w<=iw*0.95&&w>=iw*0.35)best=w;}
      if(!best)best=iw;
      var k=iw/best;
      if(k>1.05)document.documentElement.style.zoom=k.toFixed(2);
    }catch(e){}
  }
  function apply(html){
    if(done)return;
    try{
      html=html.replace(/(src|href)=["']\/\//g,'$1="https://');
      var origin=new URL(url).origin;
      var head='<base href="'+origin+'/"><meta name="referrer" content="origin"><style>html{background:#000}</style>';
      var hm=html.match(/<head[^>]*>/i);
      if(hm){var i1=hm.index+hm[0].length;html=html.slice(0,i1)+head+html.slice(i1);}else{html=head+html;}
      done=true;clearTimeout(timer);
      document.open();document.write(html);document.close();
      try{var nav=(new Function('return '+NAVFN))();nav();}catch(e){}
      badge();
      window.addEventListener('load',function(){setTimeout(applyZoom,300);});
      setTimeout(applyZoom,2500);
    }catch(e){direct();}
  }
  try{
    if(typeof fetch==='function'){
      setMsg('Скачиваю сайт…');
      fetch(url,{credentials:'include',redirect:'follow'}).then(function(r){
        if(!r.ok)throw 0;return r.text();
      }).then(function(html){
        if(!html||html.length<200||isCh(html)){direct();return;}
        apply(html);
      }).catch(function(){direct();});
    }else if(typeof XMLHttpRequest!=='undefined'){
      setMsg('Скачиваю сайт (XHR)…');
      var x=new XMLHttpRequest();
      x.open('GET',url,true);
      x.onload=function(){try{if(x.status>=200&&x.status<400&&x.responseText&&!isCh(x.responseText)){apply(x.responseText);}else{direct();}}catch(e){direct();}};
      x.onerror=function(){direct();};
      x.send();
    }else{direct();}
  }catch(e){direct();}
}
indexDirect=function(name,url){  var navLit=JSON.stringify(tvNavRuntime.toString());
  var src=tvFetchRuntime.toString();
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title></head><body data-url="'+url+'" style="margin:0;background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><div style="font-size:32px;margin-bottom:14px">Загрузка…</div><div id="tvMsg" style="color:#888;font-size:16px">'+name+'</div></div><scr'+'ipt>var NAVFN='+navLit+';('+src+')();</scr'+'ipt></body></html>';
};