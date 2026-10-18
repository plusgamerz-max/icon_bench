/* library.js: save icons in the browser (localStorage) and browse them with a large preview. Needs app.js and ui.js. */
(function(){
var IB=window.IB,KEY='iconbench.library',cur=null,dark=false,q='',win=null,gridEl=null,front=null;
function $(id){return document.getElementById(id)}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function btn(t,fn){var b=el('button',0,t);b.onclick=fn;return b}
function get(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}}
function put(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch(e){IB.msg('The browser would not save this (storage is blocked or full).',1);return false}}
/* icons are shown through <img>, so a stored SVG can never run scripts */
function img(svg,px,fg){var i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg.replace(/currentColor/g,fg||'#1d1d1f'));i.style.width=i.style.height=px+'px';i.alt='';return i}
function find(){var r=null;get().forEach(function(e){if(e.id===cur)r=e});return r}

function saveCurrent(){var name=window.prompt('Name this icon','icon');if(!name||!name.trim())return;name=name.trim();
 var a=get(),hit=null;a.forEach(function(e){if(e.name===name)hit=e});
 if(hit)hit.svg=IB.ser();else a.push({id:Date.now(),name:name,svg:IB.ser()});
 if(put(a)){cur=hit?hit.id:a[a.length-1].id;IB.msg((hit?'Updated "':'Saved "')+name+'" in the library.')}}

function grid(){gridEl.innerHTML='';var a=get().filter(function(e){return e.name.toLowerCase().indexOf(q.toLowerCase())>=0});
 if(!a.length){gridEl.appendChild(el('div','empty',get().length?'Nothing matches your search.':'No icons yet. Press Save in the top bar to add the current icon.'));return}
 a.forEach(function(e){var d=el('div','ic'+(e.id===cur?' on':''));d.appendChild(img(e.svg,36));d.appendChild(el('span',0,e.name));
  d.onclick=function(){cur=e.id;grid();show()};d.ondblclick=function(){openIcon(e)};gridEl.appendChild(d)})}

function openIcon(e){close();IB.setTool('select');IB.importText(e.svg)}
function show(){front.innerHTML='';var e=find();
 if(!e){front.appendChild(el('div','empty','Pick an icon to preview it here.'));return}
 var fg=dark?'#ffffff':'#1d1d1f',big=el('div','big'+(dark?' dark':'')),sz=el('div','sizes'+(dark?' dark':'')),ac=el('div','acts');
 big.appendChild(img(e.svg,160,fg));[16,24,48,96].forEach(function(n){sz.appendChild(img(e.svg,n,fg))});
 ac.appendChild(btn('Open in editor',function(){openIcon(e)}));
 ac.appendChild(btn(dark?'Light preview':'Dark preview',function(){dark=!dark;show()}));
 ac.appendChild(btn('Rename',function(){var n=window.prompt('New name',e.name);if(!n||!n.trim())return;var a=get();a.forEach(function(x){if(x.id===e.id)x.name=n.trim()});put(a);grid();show()}));
 ac.appendChild(btn('Download SVG',function(){IB.saveBlob(e.name+'.svg',new Blob([e.svg],{type:'image/svg+xml'}))}));
 ac.appendChild(btn('Delete',function(){if(!window.confirm('Delete "'+e.name+'" from the library?'))return;put(get().filter(function(x){return x.id!==e.id}));cur=null;grid();show()}));
 front.appendChild(el('b',0,e.name));front.appendChild(big);front.appendChild(sz);front.appendChild(ac)}

function close(){if(win&&win.parentNode)win.parentNode.removeChild(win);win=null}
function openLib(){close();var ov=el('div','ov'),w=el('div','libwin glass'),h=el('div','h'),r=el('span'),s=el('input'),body=el('div','libbody');
 s.placeholder='Search';s.value=q;s.oninput=function(){q=s.value;grid()};r.appendChild(s);r.appendChild(btn('Close',close));
 h.appendChild(el('span',0,'Icon library'));h.appendChild(r);gridEl=el('div','libgrid');front=el('div','front');
 body.appendChild(gridEl);body.appendChild(front);w.appendChild(h);w.appendChild(body);ov.appendChild(w);
 ov.onmousedown=function(e){if(e.target===ov)close()};document.body.appendChild(ov);win=ov;grid();show()}
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
$('save').onclick=saveCurrent;$('lib').onclick=openLib;
})();
