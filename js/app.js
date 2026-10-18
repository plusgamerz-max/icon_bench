(function(){
var IB=window.IB={},NS='http://www.w3.org/2000/svg',ACC='#0a84ff';
function $(id){return document.getElementById(id)}
var S={w:24,h:24,root:{fill:'none',stroke:'currentColor','stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round'},shapes:[],sel:-1,tool:'select',step:1,zoom:1,seg:-1,vx:0,vy:0};
var scale=10,drag=null,drawing=-1,ghost=null,hist=[],hi=-1,fields=[],curH=[],ct=0;
var GEO={line:['x1','y1','x2','y2'],rect:['x','y','width','height','rx','ry'],circle:['cx','cy','r'],ellipse:['cx','cy','rx','ry'],polyline:['points'],polygon:['points'],path:['d']};
var STY=['stroke','stroke-width','fill','stroke-linecap','stroke-linejoin'];
var CN={M:2,L:2,T:2,H:1,V:1,C:6,S:4,Q:4,A:7,Z:0};
var st=$('stage');
function r(n){return Math.round(n*100)/100}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function el(tag,at,par){var e=document.createElementNS(NS,tag);for(var k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e}
function clear(n){while(n.firstChild)n.removeChild(n.firstChild)}
function num(s,k){return parseFloat(s.a[k])||0}
function sn(v){return S.step?r(Math.round(v/S.step)*S.step):r(v)}
function msg(t,bad){var m=$('msg');m.textContent=t||'';m.className=bad?'bad':''}

/* ---------- path helpers ---------- */
function pp(d){var re=/([a-zA-Z])|(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/gi,m,raw=[],c=null,out=[];
 while((m=re.exec(d))){if(m[1]){c={c:m[1],n:[]};raw.push(c)}else if(c)c.n.push(parseFloat(m[2]))}
 raw.forEach(function(s){var k=CN[s.c.toUpperCase()];if(!k){out.push({c:s.c,n:[]});return}
  for(var i=0;i+k<=s.n.length;i+=k){var cc=i>0?(s.c==='M'?'L':s.c==='m'?'l':s.c):s.c;out.push({c:cc,n:s.n.slice(i,i+k)})}});
 return out}
function ps(g){return g.map(function(q){return q.c+q.n.map(r).join(' ')}).join(' ')}
function abs(g){var cx=0,cy=0,sx=0,sy=0;
 var out=g.map(function(q){var U=q.c.toUpperCase(),n=q.n.slice(),i;
  if(q.c!==U){if(U==='H')n[0]+=cx;else if(U==='V')n[0]+=cy;else if(U==='A'){n[5]+=cx;n[6]+=cy}else for(i=0;i<n.length;i+=2){n[i]+=cx;n[i+1]+=cy}}
  if(U==='Z'){cx=sx;cy=sy}else if(U==='H')cx=n[0];else if(U==='V')cy=n[0];else{cx=n[n.length-2];cy=n[n.length-1];if(U==='M'){sx=cx;sy=cy}}
  return {c:U,n:n}});
 abs.cx=cx;abs.cy=cy;return out}
function pts(s){return (s.a.points||'').match(/-?(?:\d+\.?\d*|\.\d+)/g)?(s.a.points.match(/-?(?:\d+\.?\d*|\.\d+)/g)).map(parseFloat):[]}

/* ---------- model <-> code ---------- */
function ser(){var o='<svg xmlns="'+NS+'" viewBox="'+S.vx+' '+S.vy+' '+S.w+' '+S.h+'" width="'+S.w+'" height="'+S.h+'"',k;
 for(k in S.root)o+=' '+k+'="'+esc(S.root[k])+'"';o+='>\n';
 S.shapes.forEach(function(s){o+='  <'+s.tag;for(var k in s.a)o+=' '+k+'="'+esc(s.a[k])+'"';o+='/>\n'});
 return o+'</svg>'}
function load(str){var d=new DOMParser().parseFromString(str,'image/svg+xml');
 if(d.getElementsByTagName('parsererror').length||d.documentElement.nodeName!=='svg')return false;
 var rt=d.documentElement,vb=(rt.getAttribute('viewBox')||'').split(/[\s,]+/),i,j,a,c,at,skip=0,root={},sh=[];
 var w=parseFloat(vb[2])||parseFloat(rt.getAttribute('width'))||24,h=parseFloat(vb[3])||parseFloat(rt.getAttribute('height'))||24;
 for(i=0;i<rt.attributes.length;i++){a=rt.attributes[i];if(!/^(xmlns.*|viewBox|width|height|version|xml:.*)$/.test(a.name))root[a.name]=a.value}
 for(i=0;i<rt.childNodes.length;i++){c=rt.childNodes[i];if(c.nodeType!==1)continue;
  if(GEO[c.nodeName]){at={};for(j=0;j<c.attributes.length;j++)at[c.attributes[j].name]=c.attributes[j].value;sh.push({tag:c.nodeName,a:at})}else skip++}
 S.w=w;S.h=h;S.vx=parseFloat(vb[0])||0;S.vy=parseFloat(vb[1])||0;S.root=root;S.shapes=sh;if(S.sel>=sh.length)S.sel=-1;
 return skip?'Ignored '+skip+' element(s) this editor does not support (such as g).':true}
function commit(){var s=ser();if(hist[hi]===s)return;hist=hist.slice(0,hi+1);hist.push(s);hi++;if(hist.length>100){hist.shift();hi--}}
function undo(){if(hi>0){hi--;load(hist[hi]);layout();buildInsp();update()}}
function redo(){if(hi<hist.length-1){hi++;load(hist[hi]);layout();buildInsp();update()}}

/* ---------- handles and moving ---------- */
function handles(s){var h=[],t=s.tag;
 function add(x,y,f,c,sg){h.push({x:x,y:y,f:f,c:c,sg:sg})}
 function sa(k,v){s.a[k]=String(r(v))}
 var cx=num(s,'cx'),cy=num(s,'cy');
 if(t==='line'){add(num(s,'x1'),num(s,'y1'),function(x,y){sa('x1',x);sa('y1',y)});add(num(s,'x2'),num(s,'y2'),function(x,y){sa('x2',x);sa('y2',y)})}
 else if(t==='rect'){var x0=num(s,'x'),y0=num(s,'y'),w=num(s,'width'),hh=num(s,'height');
  add(x0,y0,function(x,y){var X=x0+w,Y=y0+hh;sa('x',Math.min(x,X));sa('y',Math.min(y,Y));sa('width',Math.max(0,X-x));sa('height',Math.max(0,Y-y))});
  add(x0+w,y0+hh,function(x,y){sa('width',Math.max(0,x-x0));sa('height',Math.max(0,y-y0))})}
 else if(t==='circle'){add(cx,cy,function(x,y){sa('cx',x);sa('cy',y)});add(cx+num(s,'r'),cy,function(x){sa('r',Math.abs(x-cx))},1)}
 else if(t==='ellipse'){add(cx,cy,function(x,y){sa('cx',x);sa('cy',y)});add(cx+num(s,'rx'),cy,function(x){sa('rx',Math.abs(x-cx))},1);add(cx,cy+num(s,'ry'),function(x,y){sa('ry',Math.abs(y-cy))},1)}
 else if(t==='path'){var g=abs(pp(s.a.d||'')),px=0,py=0;
  var wr=function(){s.a.d=ps(g)};
  g.forEach(function(q,qi){var n=q.n,P={M:[0],L:[0],T:[0],C:[0,2,4],S:[0,2],Q:[0,2],A:[5]}[q.c];
   if(q.c==='H'){add(n[0],py,function(x){n[0]=x;wr()},0,qi);px=n[0]}
   else if(q.c==='V'){add(px,n[0],function(x,y){n[0]=y;wr()},0,qi);py=n[0]}
   else if(P){P.forEach(function(i,pi){add(n[i],n[i+1],function(x,y){n[i]=x;n[i+1]=y;wr()},pi<P.length-1,qi)});px=n[n.length-2];py=n[n.length-1]}})}
 else{var p=pts(s);for(var i=0;i<p.length-1;i+=2)(function(i){add(p[i],p[i+1],function(x,y){p[i]=x;p[i+1]=y;s.a.points=p.map(r).join(' ')})})(i)}
 return h}
function move(s,dx,dy){var t=s.tag;function sh(k,d){s.a[k]=String(r(num(s,k)+d))}
 if(t==='line'){sh('x1',dx);sh('x2',dx);sh('y1',dy);sh('y2',dy)}
 else if(t==='rect'){sh('x',dx);sh('y',dy)}
 else if(t==='circle'||t==='ellipse'){sh('cx',dx);sh('cy',dy)}
 else if(t==='path'){var g=abs(pp(s.a.d||''));g.forEach(function(q){var n=q.n,i;if(q.c==='H')n[0]+=dx;else if(q.c==='V')n[0]+=dy;else if(q.c==='A'){n[5]+=dx;n[6]+=dy}else for(i=0;i<n.length;i+=2){n[i]+=dx;n[i+1]+=dy}});s.a.d=ps(g)}
 else{var p=pts(s);for(var i=0;i<p.length-1;i+=2){p[i]+=dx;p[i+1]+=dy}s.a.points=p.map(r).join(' ')}}

/* ---------- drawing the stage ---------- */
function layout(){var w=$('wrap'),cw=w.clientWidth-40,ch=w.clientHeight-40;
 var f=Math.min(cw/S.w,ch/S.h);scale=Math.max(.05,(f>=1?Math.floor(f):f)*S.zoom);
 st.setAttribute('width',S.w*scale);st.setAttribute('height',S.h*scale);st.setAttribute('viewBox',S.vx+' '+S.vy+' '+S.w+' '+S.h);
 var g=$('grid'),i,ev=1;while(ev*scale<8)ev*=2;clear(g);
 for(i=0;i<=S.w;i+=ev)el('line',{x1:S.vx+i,y1:S.vy,x2:S.vx+i,y2:S.vy+S.h,stroke:(i/ev)%4?'#e6ecf7':'#c3d1ea','stroke-width':1/scale},g);
 for(i=0;i<=S.h;i+=ev)el('line',{x1:S.vx,y1:S.vy+i,x2:S.vx+S.w,y2:S.vy+i,stroke:(i/ev)%4?'#e6ecf7':'#c3d1ea','stroke-width':1/scale},g);
 draw()}
function draw(){var art=$('art'),ui=$('ui'),k;clear(art);clear(ui);
 for(k=art.attributes.length-1;k>=0;k--){if(art.attributes[k].name!=='id')art.removeAttribute(art.attributes[k].name)}
 for(k in S.root)art.setAttribute(k,S.root[k]);
 S.shapes.forEach(function(s,i){var e=el(s.tag,s.a,art);e.__i=i});
 var s=S.tool==='view'?null:S.shapes[S.sel];curH=[];
 if(s){var o=el(s.tag,s.a,ui);o.setAttribute('fill','none');o.setAttribute('stroke',ACC);o.setAttribute('stroke-width',1.5/scale);o.setAttribute('stroke-linecap','butt');o.setAttribute('opacity','.85');o.style.pointerEvents='none';
  curH=handles(s);
  curH.forEach(function(h,i){var c=el('circle',{cx:h.x,cy:h.y,r:(h.c?3.5:5)/scale,fill:h.sg!==undefined&&h.sg===S.seg?'#ff9f0a':(h.c?ACC:'#fff'),stroke:ACC,'stroke-width':1.5/scale},ui);c.__h=i;c.style.cursor='move'})}
 if(ghost){var gl=el('line',ghost,ui);gl.setAttribute('stroke',ACC);gl.setAttribute('stroke-width',1/scale);gl.setAttribute('stroke-dasharray',(3/scale)+' '+(3/scale));gl.style.pointerEvents='none'}}
function brief(s){var g=GEO[s.tag];return (g[0]==='d'||g[0]==='points')?(s.a[g[0]]||'').slice(0,16):g.map(function(k){return s.a[k]||0}).join(' ')}
function layers(){var ul=$('layers');ul.innerHTML='';
 S.shapes.forEach(function(s,i){var li=document.createElement('li');li.className=i===S.sel?'on':'';li.textContent=s.tag+'  '+brief(s);li.onclick=function(){select(i)};ul.appendChild(li)})}
function preview(){var s=ser(),o='';[16,24,48].forEach(function(n){o+='<span>'+s.replace('width="'+S.w+'" height="'+S.h+'"','width="'+n+'" height="'+n+'"')+'</span>'});$('pv').innerHTML=o}
function update(src){draw();layers();if(src!=='code')$('code').value=ser();refreshInsp();preview();if(IB.segs)IB.segs(src)}
function select(i){if(S.tool==='view'&&i>=0)return;S.sel=i;S.seg=-1;buildInsp();update('sel')}

/* ---------- inspector ---------- */
function row(box,label,kind,get,set,ph,wide){var l=document.createElement('label'),sp=document.createElement('span'),i=document.createElement(kind==='area'?'textarea':'input');
 if(wide)l.className='w';sp.textContent=label;
 if(kind==='number'){i.type='number';i.step=S.step||'any'}else if(kind==='text')i.type='text';else i.spellcheck=false;
 if(ph)i.placeholder=ph;
 i.oninput=function(){set(i.value);update('insp')};i.onchange=commit;
 l.appendChild(sp);l.appendChild(i);if((label==='stroke'||label==='fill')&&IB.colorize)IB.colorize(l,i);box.appendChild(l);fields.push({i:i,get:get})}
function buildInsp(){var box=$('insp'),s=S.shapes[S.sel],p;box.innerHTML='';fields=[];
 if(!s){p=document.createElement('p');p.textContent='Canvas. Select a shape to edit its numbers. Values set here are inherited by every shape.';box.appendChild(p);
  row(box,'width','number',function(){return S.w},function(v){S.w=Math.max(1,Math.min(256,parseInt(v,10)||24));layout()});
  row(box,'height','number',function(){return S.h},function(v){S.h=Math.max(1,Math.min(256,parseInt(v,10)||24));layout()});
  STY.forEach(function(k){row(box,k,'text',function(){return S.root[k]||''},function(v){if(v==='')delete S.root[k];else S.root[k]=v})});return}
 p=document.createElement('p');p.textContent=s.tag+', layer '+(S.sel+1)+(s.tag==='path'?'. Dragging a point rewrites the path with absolute coordinates.':'');box.appendChild(p);
 GEO[s.tag].forEach(function(k){var big=k==='d'||k==='points';row(box,k,big?'area':'number',function(){return s.a[k]===undefined?'':s.a[k]},function(v){if(v!=='')s.a[k]=v},'',big)});if(s.tag==='path'&&IB.segsPanel)IB.segsPanel(box);else if((s.tag==='polyline'||s.tag==='polygon')&&IB.ptsPanel)IB.ptsPanel(box);
 STY.forEach(function(k){row(box,k,'text',function(){return s.a[k]===undefined?'':s.a[k]},function(v){if(v==='')delete s.a[k];else s.a[k]=v},S.root[k]||'inherit')})}
function refreshInsp(){fields.forEach(function(f){if(document.activeElement!==f.i)f.i.value=f.get();if(f.i.sync)f.i.sync()})}

/* ---------- mouse ---------- */
function pt(e){var b=st.getBoundingClientRect();return{x:S.vx+(e.clientX-b.left)/scale,y:S.vy+(e.clientY-b.top)/scale}}
st.onmousedown=function(e){if(e.button)return;e.preventDefault();if(S.tool==='view'){var w=$('wrap');drag={m:'pan',sx:e.clientX,sy:e.clientY,l:w.scrollLeft,t:w.scrollTop};return}
 var p=pt(e),x=sn(p.x),y=sn(p.y),t=e.target,tl=S.tool,a;
 if(t.__h!==undefined){var hh=curH[t.__h];drag={m:'h',h:hh};if(hh.sg!==undefined&&hh.sg!==S.seg){S.seg=hh.sg;draw();if(IB.segs)IB.segs()}return}
 if(tl==='select'){if(t.__i!==undefined){drag={m:'mv',lx:x,ly:y};select(t.__i)}else select(-1);return}
 if(tl==='path'||tl==='polyline'||tl==='polygon'){var pk=tl==='path'?'d':'points';
  if(drawing<0||!S.shapes[drawing]){a={};a[pk]=pk==='d'?'M'+x+' '+y:x+' '+y;S.shapes.push({tag:tl,a:a});drawing=S.shapes.length-1;select(drawing)}
  else{S.shapes[drawing].a[pk]+=(pk==='d'?' L':' ')+x+' '+y;update()}return}
 if(tl==='line')a={x1:x,y1:y,x2:x,y2:y};else if(tl==='rect')a={x:x,y:y,width:0,height:0};else if(tl==='circle')a={cx:x,cy:y,r:0};else a={cx:x,cy:y,rx:0,ry:0};
 S.shapes.push({tag:tl,a:a});drag={m:'new',sx:x,sy:y};select(S.shapes.length-1)};
st.ondblclick=function(){finishPath()};
document.onmousemove=function(e){var p=pt(e),x=sn(p.x),y=sn(p.y),over=p.x>=S.vx&&p.y>=S.vy&&p.x<=S.vx+S.w&&p.y<=S.vy+S.h;
 $('pos').textContent=over?x+', '+y:'';
 if(drawing>=0&&S.shapes[drawing]){var lp=lastPt(S.shapes[drawing]);ghost={x1:lp.x,y1:lp.y,x2:x,y2:y};if(!drag)draw()}
 if(!drag)return;
 if(drag.m==='pan'){var w=$('wrap');w.scrollLeft=drag.l-(e.clientX-drag.sx);w.scrollTop=drag.t-(e.clientY-drag.sy);return}var s=S.shapes[S.sel];if(!s)return;
 if(drag.m==='h'){drag.h.f(x,y)}
 else if(drag.m==='mv'){var dx=x-drag.lx,dy=y-drag.ly;if(!dx&&!dy)return;move(s,dx,dy);drag.lx=x;drag.ly=y}
 else{var a=s.a,sx=drag.sx,sy=drag.sy,t=s.tag;
  if(t==='line'){a.x2=x;a.y2=y}
  else if(t==='rect'){a.x=Math.min(sx,x);a.y=Math.min(sy,y);a.width=Math.abs(x-sx);a.height=Math.abs(y-sy)}
  else if(t==='circle'){a.r=sn(Math.sqrt((x-sx)*(x-sx)+(y-sy)*(y-sy)))}
  else{a.rx=Math.abs(x-sx);a.ry=Math.abs(y-sy)}}
 update()};
document.onmouseup=function(){if(!drag)return;
 if(drag.m==='new'){var s=S.shapes[S.sel],a=s.a,bad=s.tag==='line'?(a.x1==a.x2&&a.y1==a.y2):s.tag==='rect'?(!+a.width||!+a.height):s.tag==='circle'?!+a.r:(!+a.rx||!+a.ry);
  if(bad){S.shapes.splice(S.sel,1);S.sel=-1;buildInsp()}}
 drag=null;commit();update()};
function lastPt(s){if(s.tag==='path'){abs(pp(s.a.d||''));return{x:abs.cx,y:abs.cy}}var p=pts(s);return{x:p[p.length-2]||0,y:p[p.length-1]||0}}
function finishPath(){if(drawing<0)return;var s=S.shapes[drawing],g,p;
 if(s&&s.tag==='path'){g=pp(s.a.d);while(g.length>1&&g[g.length-1].n.join()===g[g.length-2].n.join())g.pop();
  if(g.length<2){S.shapes.splice(drawing,1);S.sel=-1}else s.a.d=ps(g)}
 else if(s){p=pts(s);while(p.length>2&&p[p.length-1]===p[p.length-3]&&p[p.length-2]===p[p.length-4]){p.pop();p.pop()}
  if(p.length<4){S.shapes.splice(drawing,1);S.sel=-1}else s.a.points=p.map(r).join(' ')}
 drawing=-1;ghost=null;commit();buildInsp();update()}

/* ---------- actions ---------- */
function setTool(t){finishPath();S.tool=t;Array.prototype.forEach.call(document.querySelectorAll('#tools button'),function(b){b.className=b.getAttribute('data-t')===t?'on':''});st.style.cursor=t==='view'?'grab':t==='select'?'default':'crosshair';if(t==='view'&&S.sel>=0){S.sel=-1;buildInsp();update()}}
function del(){if(S.sel<0)return;S.shapes.splice(S.sel,1);S.sel=-1;commit();buildInsp();update()}
function dup(){var s=S.shapes[S.sel];if(!s)return;var c=JSON.parse(JSON.stringify(s));move(c,1,1);S.shapes.push(c);commit();select(S.shapes.length-1)}
function swap(d){var i=S.sel,j=i+d;if(i<0||j<0||j>=S.shapes.length)return;var t=S.shapes[i];S.shapes[i]=S.shapes[j];S.shapes[j]=t;S.sel=j;commit();update()}
Array.prototype.forEach.call(document.querySelectorAll('#tools button'),function(b){b.onclick=function(){setTool(b.getAttribute('data-t'))}});
$('step').onchange=function(){S.step=parseFloat(this.value)||0;buildInsp();update()};
$('undo').onclick=undo;$('redo').onclick=redo;$('del').onclick=del;$('dup').onclick=dup;
$('up').onclick=function(){swap(1)};$('dn').onclick=function(){swap(-1)};
$('code').oninput=function(){var res=load(this.value);
 if(res===false){msg('This is not valid SVG yet. The canvas keeps the last good version.',1);return}
 msg(res===true?'':res);layout();buildInsp();update('code');clearTimeout(ct);ct=setTimeout(commit,500)};
document.onkeydown=function(e){var tg=e.target.tagName,inp=tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT',ctrl=e.ctrlKey||e.metaKey,
 M={Left:'ArrowLeft',Right:'ArrowRight',Up:'ArrowUp',Down:'ArrowDown',Del:'Delete',Esc:'Escape'},k=e.key||'';k=M[k]||k;
 if(ctrl&&!inp){var l=k.toLowerCase();
  if(l==='z'){e.preventDefault();e.shiftKey?redo():undo();return}
  if(l==='y'){e.preventDefault();redo();return}
  if(l==='d'){e.preventDefault();dup();return}}
 if(inp||ctrl)return;
 if(k==='Enter'||k==='Escape'){if(drawing>=0)finishPath();else if(k==='Escape')select(-1);return}
 if(k==='Delete'||k==='Backspace'){e.preventDefault();del();return}
 if(k.indexOf('Arrow')===0&&S.sel>=0){e.preventDefault();var d=(S.step||1)*(e.shiftKey?4:1);
  move(S.shapes[S.sel],k==='ArrowLeft'?-d:k==='ArrowRight'?d:0,k==='ArrowUp'?-d:k==='ArrowDown'?d:0);update();commit();return}
 var tl={v:'select',l:'line',r:'rect',c:'circle',e:'ellipse',p:'path',y:'polyline',g:'polygon',h:'view'}[k.toLowerCase()];if(tl)setTool(tl)};
window.onresize=layout;

/* ---------- public API for the other modules ---------- */
IB.S=S;IB.update=update;IB.commit=commit;IB.buildInsp=buildInsp;IB.select=select;IB.layout=layout;IB.load=load;IB.ser=ser;IB.msg=msg;
IB.pp=pp;IB.pts=pts;IB.ps=ps;IB.abs=abs;IB.r=r;IB.del=del;IB.dup=dup;IB.swap=swap;IB.draw=draw;IB.setTool=setTool;
st.oncontextmenu=function(e){e.preventDefault();if(S.tool==='view')return false;var t=e.target,h=t.__h!==undefined?curH[t.__h]:null;
 if(h&&h.sg!==undefined){S.seg=h.sg;draw();if(IB.segs)IB.segs();IB.segMenu(e.clientX,e.clientY,h.sg)}
 else if(t.__i!==undefined){select(t.__i);IB.shapeMenu(e.clientX,e.clientY)}return false};
/* ---------- start with a small sample icon ---------- */
S.shapes=[{tag:'circle',a:{cx:'12',cy:'12',r:'9'}},{tag:'path',a:{d:'M8 12 L11 15 L16 9'}}];
layout();buildInsp();update();commit();
})();
