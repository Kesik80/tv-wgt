function spatialNavRuntime(){
  var SEL='a,button,input:not([type=hidden]),select,textarea,iframe,video,audio,[role=button],[tabindex]:not([tabindex="-1"]),[onclick],.item,.card,.poster';
  var cur=null;
  var st=document.createElement('style');
  st.textContent='.tv-focus{outline:3px solid #00ff88!important;outline-offset:4px!important;box-shadow:0 0 24px rgba(0,255,136,.45)!important}';
  (document.head||document.documentElement).appendChild(st);
  function cand(){var out=[],els=document.querySelectorAll(SEL);
    for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();if(r.width>4&&r.height>4&&!els[i].disabled)out.push(els[i]);}
    return out;}
  function cen(el){var r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
  function focusEl(el){if(cur)cur.classList.remove('tv-focus');cur=el;cur.classList.add('tv-focus');try{el.focus({preventScroll:true});}catch(e){}}
  function move(d){var list=cand();
    if(!cur||!document.contains(cur)){if(list.length)focusEl(list[0]);return;}
    var c=cen(cur),best=null,bestSc=-1;
    for(var i=0;i<list.length;i++){var el=list[i];if(el===cur)continue;
      var p=cen(el),dx=p.x-c.x,dy=p.y-c.y,sc=-1;
      if(d==='right'&&dx>10)sc=dx-Math.abs(dy)*2.5;
      else if(d==='left'&&dx<-10)sc=-dx-Math.abs(dy)*2.5;
      else if(d==='down'&&dy>10)sc=dy-Math.abs(dx)*2.5;
      else if(d==='up'&&dy<-10)sc=-dy-Math.abs(dx)*2.5;
      if(sc>bestSc){bestSc=sc;best=el;}}
    if(best){focusEl(best);try{best.scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}}}
  document.addEventListener('keydown',function(e){
    var map={37:'left',38:'up',39:'right',40:'down'};
    if(map[e.keyCode]){e.preventDefault();e.stopPropagation();move(map[e.keyCode]);}
    else if(e.keyCode===13){if(cur){e.preventDefault();cur.click();}}
    else if(e.keyCode===10009){if(history.length>1){e.preventDefault();history.back();}}
  },true);
  setTimeout(function(){var l=cand();if(l.length)focusEl(l[0]);},300);
}

function appJsRuntime(){
  var body=document.body;
  var mode=body.getAttribute('data-mode');
  var speed=parseInt(body.getAttribute('data-speed')||'24',10);
  var W=parseInt(body.getAttribute('data-w')||'1920',10);
  var H=parseInt(body.getAttribute('data-h')||'1080',10);
  var scaleMode=body.getAttribute('data-scale')||'fit';
  var vp=document.getElementById('tvViewport');
  function fit(){var sx=window.innerWidth/W,sy=window.innerHeight/H;
    var s=scaleMode==='fill'?Math.max(sx,sy):(scaleMode==='100'?1:Math.min(sx,sy));
    if(vp){vp.style.transform='scale('+s+')';
      if(scaleMode==='fit'){vp.style.left=Math.round((window.innerWidth-W*s)/2)+'px';vp.style.top=Math.round((window.innerHeight-H*s)/2)+'px';}
      else{vp.style.left='0px';vp.style.top='0px';}}}
  window.addEventListener('resize',fit);fit();
  var frame=document.getElementById('siteFrame');
  if(frame){frame.setAttribute('tabindex','-1');
    if(mode==='native'||mode==='proxy'){
      frame.addEventListener('load',function(){frame.focus();try{frame.contentWindow.focus();}catch(e){}});
      setTimeout(function(){frame.focus();},200);}}  var cursor=document.getElementById('tvCursor');
  if(cursor&&mode==='cursor'){cursor.style.display='block';
    var cx0=window.innerWidth/2,cy0=window.innerHeight/2;
    cursor.setAttribute('data-x',cx0);cursor.setAttribute('data-y',cy0);
    cursor.style.transform='translate('+cx0+'px,'+cy0+'px)';}
  window.addEventListener('keydown',function(e){
    if(e.keyCode===10009){e.preventDefault();try{tizen.application.getCurrentApplication().exit();}catch(err){}return;}
    if(mode==='cursor'&&cursor){
      var cx=parseFloat(cursor.getAttribute('data-x'))||window.innerWidth/2;
      var cy=parseFloat(cursor.getAttribute('data-y'))||window.innerHeight/2;
      var moved=false;
      if(e.keyCode===37){cx-=speed;moved=true;}
      else if(e.keyCode===38){cy-=speed;moved=true;}
      else if(e.keyCode===39){cx+=speed;moved=true;}
      else if(e.keyCode===40){cy+=speed;moved=true;}
      else if(e.keyCode===13){e.preventDefault();
        var t=document.elementFromPoint(cx,cy);
        if(t){t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:cx,clientY:cy}));}
        return;}
      if(moved){e.preventDefault();
        cx=Math.max(0,Math.min(window.innerWidth-4,cx));
        cy=Math.max(0,Math.min(window.innerHeight-4,cy));
        cursor.setAttribute('data-x',cx);cursor.setAttribute('data-y',cy);
        cursor.style.transform='translate('+cx+'px,'+cy+'px)';}}
  });
  try{var keys=['ColorF0Red','ColorF1Green','ColorF2Yellow','ColorF3Blue','MediaPlay','MediaPause','MediaStop','MediaFastForward','MediaRewind'];
    keys.forEach(function(k){try{tizen.tvinputdevice.registerKey(k);}catch(e){}});}catch(err){}
  window.focus();
}

var OPEN_SCRIPT='<scr'+'ipt>';
var CLOSE_SCRIPT='</scr'+'ipt>';

function isChallenge(html){
  var t=html.slice(0,30000).toLowerCase();
  return t.indexOf('__cf_chl')!==-1||t.indexOf('just a moment')!==-1||
    t.indexOf('выполнение проверки')!==-1||t.indexOf('checking your browser')!==-1||
    t.indexOf('attention required')!==-1||t.indexOf('verify you are not a bot')!==-1;
}

function injectSpatialNav(html,baseUrl){
  var baseTag='<base href="'+baseUrl+'" target="_self">';
  var navJs=OPEN_SCRIPT+'('+spatialNavRuntime.toString()+')();'+CLOSE_SCRIPT;
  var hm=html.match(/<head[^>]*>/i);
  if(hm){var i1=hm.index+hm[0].length;html=html.slice(0,i1)+baseTag+html.slice(i1);}
  else{html=baseTag+html;}
  var be=html.match(/<\/body>/i);
  if(be){html=html.slice(0,be.index)+navJs+html.slice(be.index);}
  else{html=html+navJs;}
  return html;}

function indexNative(name,url,w,h,sc){
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}#tvViewport{width:'+w+'px;height:'+h+'px;transform-origin:0 0;position:absolute;top:0;left:0;overflow:hidden}#siteFrame{border:0;width:100%;height:100%;display:block}</style></head><body data-mode="native" data-w="'+w+'" data-h="'+h+'" data-scale="'+sc+'"><div id="tvViewport"><iframe id="siteFrame" src="'+url+'" allow="autoplay; fullscreen" allowfullscreen></iframe></div>'+OPEN_SCRIPT+' src="app.js"'+CLOSE_SCRIPT+'</body></html>';
}
function indexCursor(name,url,w,h,sc,sp){
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}#tvViewport{width:'+w+'px;height:'+h+'px;transform-origin:0 0;position:absolute;top:0;left:0;overflow:hidden}#siteFrame{border:0;width:100%;height:100%;display:block}#tvCursor{position:fixed;width:32px;height:32px;pointer-events:none;z-index:99999;display:none}</style></head><body data-mode="cursor" data-w="'+w+'" data-h="'+h+'" data-scale="'+sc+'" data-speed="'+sp+'"><div id="tvViewport"><iframe id="siteFrame" src="'+url+'" allow="autoplay; fullscreen" allowfullscreen></iframe></div><div id="tvCursor"><svg width="32" height="32" viewBox="0 0 32 32"><path d="M8 8L24 16L16 24L8 8Z" fill="#00ff88" stroke="#000" stroke-width="2"/></svg></div>'+OPEN_SCRIPT+' src="app.js"'+CLOSE_SCRIPT+'</body></html>';
}
function indexProxy(name,w,h,sc){
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title><style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}#tvViewport{width:'+w+'px;height:'+h+'px;transform-origin:0 0;position:absolute;top:0;left:0;overflow:hidden}#siteFrame{border:0;width:100%;height:100%;display:block}</style></head><body data-mode="proxy" data-w="'+w+'" data-h="'+h+'" data-scale="'+sc+'"><div id="tvViewport"><iframe id="siteFrame" src="page.html" allow="autoplay; fullscreen" allowfullscreen></iframe></div>'+OPEN_SCRIPT+' src="app.js"'+CLOSE_SCRIPT+'</body></html>';
}
function indexDirect(name,url){
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+name+'</title></head><body style="margin:0;background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><div style="font-size:32px;margin-bottom:14px">Загрузка…</div><div style="color:#888;font-size:16px">'+name+'</div></div>'+OPEN_SCRIPT+'setTimeout(function(){location.replace("'+url+'");},300);'+CLOSE_SCRIPT+'</body></html>';
}
function configXml(appIdName,prefix,safeName){
  var tizenAppId=prefix+'.'+appIdName;
  return ['<?xml version="1.0" encoding="UTF-8"?>',
  '<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets" id="http://yourdomain.com/'+appIdName+'" version="1.0.0" viewmodes="maximized">',
  '<tizen:application id="'+tizenAppId+'" package="'+prefix+'" required_version="6.0"/>',
  '<content src="index.html"/>',
  '<feature name="http://tizen.org/feature/screen.size.normal.1080.1920"/>',
  '<feature name="http://tizen.org/feature/screen.size.normal"/>',
  '<icon src="icon.png"/>',
  '<name>'+safeName+'</name>',
  '<tizen:profile name="tv"/>',
  '<access origin="*" subdomains="true"/>',
  '<tizen:allow-navigation>*</tizen:allow-navigation>',
  '<tizen:privilege name="http://tizen.org/privilege/internet"/>',
  '<tizen:privilege name="http://tizen.org/privilege/tv.inputdevice"/>',
  '<tizen:privilege name="http://tizen.org/privilege/application.launch"/>',
  "<tizen:content-security-policy>default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; frame-src *; connect-src *; media-src *</tizen:content-security-policy>",
  '<tizen:setting screen-orientation="landscape" context-menu="disable" background-support="disable" encryption="disable" install-location="auto" hwkey-support="true"/>',
  '</widget>'].join(NL);
}

$('genBtn').addEventListener('click',function(){
  try{ doBuild(); }catch(e){
    showStatus('Ошибка сборки: '+(e.message||e),'err');
    var b=$('genBtn'); b.disabled=false; b.textContent='Собрать .wgt';
  }
});

function doBuild(){
  var btn=$('genBtn');
  var urlInput=$('siteUrl').value.trim();
  var nameInput=$('appName').value.trim();
  var mode=$('navMode').value;
  var res=$('tvResolution').value.split('x');
  var W=parseInt(res[0],10),H=parseInt(res[1],10);
  var scaleMode=$('scaleMode').value;  var proxyBase=$('proxyUrl').value.trim();
  var speed=$('cursorSpeed').value;

  if(!urlInput){showStatus('Укажи адрес сайта.','err');return;}
  var targetUrl;
  try{targetUrl=new URL(urlInput);if(targetUrl.protocol!=='http:'&&targetUrl.protocol!=='https:')throw 0;}
  catch(e){showStatus('Некорректный адрес. Нужен полный URL, например https://example.com','err');return;}
  if(!nameInput){showStatus('Укажи название приложения.','err');return;}
  if(!proxyBase)proxyBase='https://tv-wgt.vercel.app/api/proxy?url=';

  var autoMsg='';
  if(mode==='auto'){
    var t=detectSiteType(targetUrl);
    mode=(t==='video'||t==='cinema')?'proxy':'native';
    autoMsg=' | авто: '+mode;
  }

  btn.disabled=true;btn.textContent='Собираю...';
  var appIdName=appIdFrom(nameInput);
var prefix=('TV'+appIdName.toUpperCase().replace(/[^A-Z0-9]/g,'')+'ABCDEFGH').slice(0,10);
  var safeName=escXml(nameInput);
  var zip=new JSZip();
  zip.file('config.xml',configXml(appIdName,prefix,safeName));
  zip.file('app.js','('+appJsRuntime.toString()+')();');

  function finalize(extra){
    prepareIcon(targetUrl,proxyBase).then(function(icon){
      zip.file('icon.png',icon.blob);
      var note=icon.src==='custom'?'твоя иконка':(icon.src==='site'?'иконка с сайта':'сгенерированная иконка');
      zip.generateAsync({type:'blob',mimeType:'application/octet-stream'}).then(function(zb){
        var a=document.createElement('a');
        a.href=URL.createObjectURL(zb);
        a.download=appIdName.toLowerCase()+'.wgt';
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        showStatus('Готово: '+appIdName.toLowerCase()+'.wgt ('+note+')'+autoMsg+(extra||''),'ok');
        btn.disabled=false;btn.textContent='Собрать .wgt';
      }).catch(function(e){
        showStatus('Ошибка архива: '+(e.message||e),'err');
        btn.disabled=false;btn.textContent='Собрать .wgt';
      });
    });
  }

  function useDirect(extra){
    zip.file('index.html',indexDirect(safeName,targetUrl.href));
    finalize(extra);
  }

  if(mode==='native'){
    zip.file('index.html',indexNative(safeName,escXml(targetUrl.href),W,H,scaleMode));    finalize('');
  }else if(mode==='cursor'){
    zip.file('index.html',indexCursor(safeName,escXml(targetUrl.href),W,H,scaleMode,speed));
    finalize('');
  }else{
    btn.textContent='Загружаю сайт через прокси...';
    fetch(proxyBase+encodeURIComponent(targetUrl.href),{mode:'cors'}).then(function(r){
      if(!r.ok)throw new Error('HTTP '+r.status);
      return r.text();
    }).then(function(html){
      if(!html||html.length<100)throw new Error('пустой ответ');
      if(isChallenge(html)){
        useDirect(' | сайт защищён от прокси → собран Direct (откроется в браузере TV)');
        return;
      }
      html=injectSpatialNav(html,targetUrl.origin+'/');
      zip.file('page.html',html);
      zip.file('index.html',indexProxy(safeName,W,H,scaleMode));
      finalize('');
    }).catch(function(e){
      useDirect(' | прокси недоступен → собран Direct (откроется в браузере TV)');
    });
  }
}