var NL = String.fromCharCode(10);
function $(id){ return document.getElementById(id); }
function showStatus(msg,type){ var el=$('status'); el.textContent=msg; el.className='status '+type; }

var VIDEO=['youtube.com','youtu.be','rutube.ru','vimeo.com','twitch.tv'];
var CINEMA=['kinopoisk','ivi.ru','okko','rezka','hdrezka','kinogo','filmix','lostfilm','megapeer','kinokrad','seasonvar'];
var NEWS=['ria.ru','lenta.ru','rbc.ru','tass.ru','vedomosti.ru','kommersant.ru','meduza','bbc.com','cnn.com'];

function detectSiteType(u){
  var h=u.hostname.toLowerCase();
  function has(l){ for(var i=0;i<l.length;i++){ if(h.indexOf(l[i])!==-1) return true; } return false; }
  if(has(VIDEO)) return 'video';
  if(has(CINEMA)) return 'cinema';
  if(has(NEWS)) return 'news';
  return 'general';
}
function updateBadge(){
  var v=$('siteUrl').value.trim(), b=$('siteTypeBadge');
  if(!v){ b.innerHTML=''; return; }
  try{
    var t=detectSiteType(new URL(v));
    var labels={video:'Видео-платформа',cinema:'Кино-сайт',news:'Новости',general:'Общий сайт'};
    b.innerHTML='<span class="site-type-badge '+t+'">'+labels[t]+'</span>';
  }catch(e){ b.innerHTML=''; }
}
$('siteUrl').addEventListener('input',updateBadge);

var colors=['#3ddc97','#4f8cff','#ff6b6b','#ffb020','#a066ff','#ff4fa0','#20c9c9','#f2f2f2'];
var selectedColor=colors[0];
colors.forEach(function(c,i){
  var sw=document.createElement('div');
  sw.className='swatch'+(i===0?' active':'');
  sw.style.background=c;
  sw.addEventListener('click',function(){
    var all=document.querySelectorAll('.swatch');
    for(var k=0;k<all.length;k++) all[k].classList.remove('active');
    sw.classList.add('active'); selectedColor=c; drawIcon();
  });
  $('colorRow').appendChild(sw);
});

var canvas=$('iconCanvas'), ctx=canvas.getContext('2d');
function shade(hex,p){
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  r=Math.min(255,Math.max(0,r+r*p/100)); g=Math.min(255,Math.max(0,g+g*p/100)); b=Math.min(255,Math.max(0,b+b*p/100));
  return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';
}
function drawIcon(){
  var name=$('appName').value.trim();
  var letter=name?name.charAt(0).toUpperCase():'A';  var s=canvas.width;
  ctx.clearRect(0,0,s,s);
  var g=ctx.createLinearGradient(0,0,s,s);
  g.addColorStop(0,selectedColor); g.addColorStop(1,shade(selectedColor,-25));
  ctx.fillStyle=g; ctx.beginPath();
  ctx.moveTo(s*0.22,0); ctx.arcTo(s,0,s,s,s*0.22); ctx.arcTo(s,s,0,s,s*0.22);
  ctx.arcTo(0,s,0,0,s*0.22); ctx.arcTo(0,0,s,0,s*0.22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle='#0b0f14'; ctx.font='700 '+(s*0.5)+'px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(letter,s/2,s/2+s*0.04);
}
$('appName').addEventListener('input',drawIcon);
drawIcon();

var customIconUrl=null;
$('customIconFile').addEventListener('change',function(){
  var f=this.files&&this.files[0];
  if(customIconUrl){ URL.revokeObjectURL(customIconUrl); customIconUrl=null; }
  if(f){
    customIconUrl=URL.createObjectURL(f);
    $('customIconPreview').src=customIconUrl;
    $('customIconPreview').style.display='block';
    canvas.style.display='none';
    $('previewLabel').textContent='Превью твоей иконки';
    $('previewSublabel').textContent='Будет использована в архиве';
  }else{
    $('customIconPreview').style.display='none';
    canvas.style.display='block';
    $('previewLabel').textContent='Превью запасной иконки';
  }
});

function updateModeUI(){
  var m=$('navMode').value;
  $('proxyField').classList.toggle('hidden',m==='native'||m==='cursor');
  $('cursorField').classList.toggle('hidden',m!=='cursor');
  $('modeDescAuto').classList.toggle('hidden',m!=='auto');
  $('modeDescNative').classList.toggle('hidden',m!=='native');
  $('modeDescCursor').classList.toggle('hidden',m!=='cursor');
  $('modeDescProxy').classList.toggle('hidden',m!=='proxy');
}
$('navMode').addEventListener('change',updateModeUI);
updateModeUI();

$('testProxyBtn').addEventListener('click',function(){
  var base=$('proxyUrl').value.trim();
  if(!base){ showStatus('Укажи URL прокси.','err'); return; }
  showStatus('Проверяю прокси...','info');
  fetch(base+encodeURIComponent('https://example.com'),{mode:'cors'}).then(function(r){    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.text();
  }).then(function(t){
    if(t.toLowerCase().indexOf('example')!==-1) showStatus('Прокси работает!','ok');
    else showStatus('Прокси ответил, но содержимое не похоже на сайт.','warn');
  }).catch(function(e){ showStatus('Прокси не работает: '+(e.message||e),'err'); });
});

function randomId(len){
  var up='ABCDEFGHIJKLMNOPQRSTUVWXYZ', all=up+'abcdefghijklmnopqrstuvwxyz0123456789';
  var out=up.charAt(Math.floor(Math.random()*up.length));
  for(var i=1;i<len;i++) out+=all.charAt(Math.floor(Math.random()*all.length));
  return out;
}
function translit(s){
  var m={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
  return s.toLowerCase().split('').map(function(ch){ return m[ch]!==undefined?m[ch]:ch; }).join('');
}
function appIdFrom(name){
  var c=translit(name).replace(/[^a-zA-Z0-9]/g,'');
  if(!c) return 'App';
  if(/^[0-9]/.test(c)) c='App'+c;
  return c;
}
function escXml(s){
  return s.replace(/[<>&'"]/g,function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]; });
}

function imageToPng(blob){
  return new Promise(function(resolve){
    var url=URL.createObjectURL(blob);
    var img=new Image();
    img.onload=function(){
      try{
        var c=document.createElement('canvas'); c.width=256; c.height=256;
        var x=c.getContext('2d');
        var sc=Math.max(256/img.width,256/img.height);
        var dw=img.width*sc, dh=img.height*sc;
        x.drawImage(img,(256-dw)/2,(256-dh)/2,dw,dh);
        c.toBlob(function(b){ URL.revokeObjectURL(url); resolve(b||null); },'image/png');
      }catch(e){ URL.revokeObjectURL(url); resolve(null); }
    };
    img.onerror=function(){ URL.revokeObjectURL(url); resolve(null); };
    img.src=url;
  });
}

function fetchSiteIcon(targetUrl,manualUrl,proxyBase){
  var cands=manualUrl?[manualUrl]:[
    'https://www.google.com/s2/favicons?sz=128&domain_url='+encodeURIComponent(targetUrl.origin),    'https://icons.duckduckgo.com/ip3/'+targetUrl.hostname+'.ico',
    proxyBase+encodeURIComponent(targetUrl.origin+'/favicon.ico'),
    targetUrl.origin+'/favicon.ico'
  ];
  return new Promise(function(resolve){
    var i=0;
    function tryNext(){
      if(i>=cands.length){ resolve(null); return; }
      var u=cands[i++];
      fetch(u,{mode:'cors'})
        .then(function(r){ if(!r.ok) throw 0; return r.blob(); })
        .then(function(b){ if(!b||b.size<50) throw 0; return imageToPng(b); })
        .then(function(p){ if(!p) throw 0; resolve(p); })
        .catch(function(){ tryNext(); });
    }
    tryNext();
  });
}

function prepareIcon(targetUrl,proxyBase){
  var customFile=$('customIconFile').files&&$('customIconFile').files[0];
  var wantSite=$('useSiteIcon').checked;
  var manual=$('iconUrlOverride').value.trim();
  function generated(){
    return new Promise(function(res){
      canvas.toBlob(function(b){ res({blob:b,src:'generated'}); },'image/png');
    });
  }
  if(customFile){
    return imageToPng(customFile).then(function(b){
      if(b) return {blob:b,src:'custom'};
      if(wantSite||manual) return fetchSiteIcon(targetUrl,manual||null,proxyBase).then(function(f){ return f?{blob:f,src:'site'}:generated(); });
      return generated();
    });
  }
  if(wantSite||manual){
    return fetchSiteIcon(targetUrl,manual||null,proxyBase).then(function(f){ return f?{blob:f,src:'site'}:generated(); });
  }
  return generated();
}