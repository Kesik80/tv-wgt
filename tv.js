function tvFetchRuntime(){
  var url=document.body.getAttribute('data-url');
  function direct(){location.replace(url);}
  function isCh(t){t=t.slice(0,30000).toLowerCase();return t.indexOf('__cf_chl')!==-1||t.indexOf('just a moment')!==-1||t.indexOf('выполнение проверки')!==-1;}
  fetch(url,{credentials:'include',redirect:'follow'}).then(function(r){
    if(!r.ok)throw 0;
    return r.text();
  }).then(function(html){
    if(!html||html.length<200||isCh(html)){direct();return;}
    var origin=new URL(url).origin;
    var head='<base href="'+origin+'/"><style>html{background:#000}</style>';
    var tail='<scr'+'ipt>addEventListener("load",function(){try{var w=document.body.scrollWidth||1280;var k=window.innerWidth/w;if(k>1.05)document.documentElement.style.zoom=k.toFixed(2);}catch(e){}});</scr'+'ipt>';
    tail+='<scr'+'ipt>@@NAV@@</scr'+'ipt>';
    var hm=html.match(/<head[^>]*>/i);
    if(hm){var i1=hm.index+hm[0].length;html=html.slice(0,i1)+head+html.slice(i1);}else{html=head+html;}
    var be=html.match(/<\/body>/i);
    if(be){html=html.slice(0,be.index)+tail+html.slice(be.index);}else{html+=tail;}
    document.open();document.write(html);document.close();
  }).catch(function(){direct();});
}
indexDirect=function(name,url){
  var src=tvFetchRuntime.toString().replace('@@NAV@@',spatialNavRuntime.toString());
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title></head><body data-url="'+url+'" style="margin:0;background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><div style="font-size:32px;margin-bottom:14px">Загрузка…</div><div style="color:#888;font-size:16px">'+name+'</div></div><scr'+'ipt>('+src+')();</scr'+'ipt></body></html>';
};