/* ui.js: floating menus, zoom, resizable panels, colour picker, import/export. Needs app.js (window.IB). */
(function(){
var IB=window.IB,S=IB.S,open=null;
function $(id){return document.getElementById(id)}
function fire(el){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}

/* floating menu: items are {label, fn} | {label, sub:[...]} | {sep:1}; add danger:1 for red */
function closeMenu(){if(open&&open.parentNode)open.parentNode.removeChild(open);open=null}
function build(items){var m=document.createElement('div');
 items.forEach(function(it){if(it.sep){var s=document.createElement('div');s.className='sep';m.appendChild(s);return}
  var b=document.createElement('div');b.className='mi'+(it.danger?' danger':'');b.appendChild(document.createTextNode(it.label));
  if(it.sub){b.className+=' has';var u=build(it.sub);u.className='sub glass';b.appendChild(u)}
  else b.onclick=function(e){e.stopPropagation();closeMenu();it.fn()};
  m.appendChild(b)});return m}
IB.menu=function(x,y,items){closeMenu();var m=build(items);m.className='menu glass';document.body.appendChild(m);open=m;
 var w=m.offsetWidth,h=m.offsetHeight;if(x+w+230>innerWidth)m.className+=' flip';
 m.style.left=Math.max(4,Math.min(x,innerWidth-w-8))+'px';m.style.top=Math.max(4,Math.min(y,innerHeight-h-8))+'px'};
document.addEventListener('mousedown',function(e){if(open&&!open.contains(e.target))closeMenu()},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});
document.addEventListener('contextmenu',function(e){if(e.target.id!=='stage'&&!e.target.__h&&!e.target.__i&&!/seg/.test(e.target.className+(e.target.parentNode?e.target.parentNode.className:'')))closeMenu()});
IB.shapeMenu=function(x,y){IB.menu(x,y,[{label:'Duplicate',fn:IB.dup},{label:'Raise',fn:function(){IB.swap(1)}},{label:'Lower',fn:function(){IB.swap(-1)}},{sep:1},{label:'Delete',danger:1,fn:IB.del}])};

/* zoom: buttons, + / - / 0 keys, Ctrl + mouse wheel */
function zoom(z){S.zoom=Math.max(.25,Math.min(16,z));$('zl').textContent=Math.round(S.zoom*100)+'%';IB.layout()}
$('zin').onclick=function(){zoom(S.zoom*1.25)};$('zout').onclick=function(){zoom(S.zoom/1.25)};$('zfit').onclick=function(){zoom(1)};
$('wrap').addEventListener('wheel',function(e){if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();zoom(S.zoom*(e.deltaY<0?1.15:1/1.15))},{passive:false});
document.addEventListener('keydown',function(e){var t=e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||e.ctrlKey)return;
 if(e.key==='+'||e.key==='=')zoom(S.zoom*1.25);else if(e.key==='-')zoom(S.zoom/1.25);else if(e.key==='0')zoom(1)});

/* VS Code style splitters: drag the thin bars between the panels */
function split(id,axis,v,min,max,inv){$(id).onmousedown=function(e){e.preventDefault();
 var sx=e.clientX,sy=e.clientY,st=parseFloat(getComputedStyle(document.body).getPropertyValue(v));
 function mv(ev){var d=axis==='x'?ev.clientX-sx:ev.clientY-sy;if(inv)d=-d;document.body.style.setProperty(v,Math.max(min,Math.min(max,st+d))+'px');IB.layout()}
 function up(){document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);document.body.className=''}
 document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);document.body.className='resizing'}}
split('s1','x','--lw',120,420);split('s2','x','--rw',230,700,1);split('s3','y','--bh',70,520,1);

/* colour picker next to the stroke / fill text fields */
function hex(v){var m=/^#([0-9a-f]{3})$/i.exec(v);if(m)return '#'+m[1].replace(/./g,'$&$&');return /^#[0-9a-f]{6}$/i.test(v)?v:null}
IB.colorize=function(label,inp){var c=document.createElement('input');c.type='color';c.className='cp';
 inp.sync=function(){c.value=hex(inp.value)||'#000000';c.style.opacity=hex(inp.value)?1:.4};
 c.oninput=function(){inp.value=c.value;fire(inp)};label.appendChild(c);
 [['none','none'],['cur','currentColor']].forEach(function(p){var b=document.createElement('button');b.className='mini';b.textContent=p[0];b.title=p[1];
  b.onclick=function(e){e.preventDefault();inp.value=p[1];fire(inp)};label.appendChild(b)})};

/* import / export */
function save(name,blob){if(navigator.msSaveBlob){navigator.msSaveBlob(blob,name);return}
 var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a)}
function png(w){var svg=IB.ser().replace(/currentColor/g,'#1d1d1f').replace('width="'+S.w+'" height="'+S.h+'"','width="'+w+'" height="'+Math.round(w*S.h/S.w)+'"'),
 img=new Image(),cv=document.createElement('canvas');cv.width=w;cv.height=Math.round(w*S.h/S.w);
 img.onload=function(){cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
  if(cv.toBlob)cv.toBlob(function(b){save('icon-'+w+'.png',b)});else IB.msg('This browser cannot export PNG.',1)};
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
$('export').onclick=function(){var b=this.getBoundingClientRect();
 IB.menu(b.left,b.bottom+4,[{label:'SVG file',fn:function(){save('icon.svg',new Blob([IB.ser()],{type:'image/svg+xml'}))}},
  {label:'PNG 128 px',fn:function(){png(128)}},{label:'PNG 512 px',fn:function(){png(512)}},{sep:1},
  {label:'Copy SVG code',fn:function(){var c=$('code');c.value=IB.ser();c.select();try{document.execCommand('copy');IB.msg('Copied.')}catch(x){IB.msg('Press Ctrl+C to copy.')}}}])};
function imp(t){var res=IB.load(t);if(res===false){IB.msg('That file is not valid SVG.',1);return}
 S.sel=-1;S.seg=-1;IB.msg(res===true?'Imported.':res);IB.layout();IB.buildInsp();IB.update();IB.commit()}
function readFile(f){var r=new FileReader();r.onload=function(){imp(r.result)};r.readAsText(f)}
var fi=document.createElement('input');fi.type='file';fi.accept='.svg,image/svg+xml';
$('import').onclick=function(){fi.value='';fi.click()};fi.onchange=function(){if(fi.files[0])readFile(fi.files[0])};
window.addEventListener('dragover',function(e){e.preventDefault()});
window.addEventListener('drop',function(e){e.preventDefault();if(e.dataTransfer.files[0])readFile(e.dataTransfer.files[0])});
})();
