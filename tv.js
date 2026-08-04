function tvFetchRuntime(){
  var url=document.body.getAttribute('data-url');
  var msg=document.getElementById('tvMsg');
  var done=false;
  function setMsg(t){if(msg)msg.textContent=t;}
  function direct(){if(done)return;done=true;setMsg('Открываю напрямую…');location.replace(url);}
  var timer=setTimeout(function(){direct();},10000);
  function isCh(t){t=t.slice(0,30000).toLowerCase();return t.indexOf('__cf_chl')!==-1||t.indexOf('just a moment')!==-1||t.indexOf('выполнение проверки')!==-1;}
  function apply(html){
    if(done)return;
    try{
      var origin=new URL(url).origin;
      var head='<base href="'+origin+'/"><style>html{background:#000}</style>';
      var tail='<scr'+'ipt>addEventListener("load",function(){try{var w=document.body.scrollWidth||1280;var k=window.innerWidth/w;if(k>1.05)document.documentElement.style.zoom=k.toFixed(2);}catch(e){}});</scr'+'ipt>';
      tail+='<scr'+'ipt>'+NAVSRC+'</scr'+'ipt>';
      var hm=html.match(/<head[^>]*>/i);
      if(hm){var i1=hm.index+hm[0].length;html=html.slice(0,i1)+head+html.slice(i1);}else{html=head+html;}
      var be=html.match(/<\/body>/i);
      if(be){html=html.slice(0,be.index)+tail+html.slice(be.index);}else{html+=tail;}
      done=true;clearTimeout(timer);
      document.open();document.write(html);document.close();
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
indexDirect=function(name,url){
  var navLit=JSON.stringify(spatialNavRuntime.toString());
  var src=tvFetchRuntime.toString();
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title></head><body data-url="'+url+'" style="margin:0;background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><div style="font-size:32px;margin-bottom:14px">Загрузка…</div><div id="tvMsg" style="color:#888;font-size:16px">'+name+'</div></div><scr'+'ipt>var NAVSRC='+navLit+';('+src+')();</scr'+'ipt></body></html>';
};