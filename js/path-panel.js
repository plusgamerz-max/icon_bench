/* path-panel.js: the list of path points under the "d" box, plus the add-point and right-click menus.
   Supports every path command: M L H V C S Q T A Z, absolute and relative. Needs app.js and ui.js. */
(function(){
var IB=window.IB,S=IB.S,list=null,UP='MLHVCSQTAZ'.split('');
var NM={M:'Move to',L:'Line to',H:'Horizontal line',V:'Vertical line',C:'Cubic curve',S:'Smooth cubic',Q:'Quadratic curve',T:'Smooth quadratic',A:'Arc',Z:'Close path'};
var AR={M:'x y',L:'x y',H:'x',V:'y',C:'x1 y1 x2 y2 x y',S:'x2 y2 x y',Q:'x1 y1 x y',T:'x y',A:'rx ry rot large sweep x y',Z:''};
function cur(){var s=S.shapes[S.sel];return s&&s.tag==='path'?s:null}
function read(){var s=cur();return s?IB.pp(s.a.d||''):[]}
function save(g){cur().a.d=IB.ps(g);S.seg=Math.min(S.seg,g.length-1);IB.update();IB.commit()}
function ends(g){var x=0,y=0,sx=0,sy=0,o=[];g.forEach(function(q){var n=q.n;
 if(q.c==='Z'){x=sx;y=sy}else if(q.c==='H')x=n[0];else if(q.c==='V')y=n[0];else{x=n[n.length-2];y=n[n.length-1];if(q.c==='M'){sx=x;sy=y}}o.push({x:x,y:y})});return o}
function make(c,p,x,y){var dx=(x-p.x)/3,dy=(y-p.y)/3,rr=Math.max(1,Math.round(Math.sqrt(dx*dx+dy*dy)*1.5));
 return {M:[x,y],L:[x,y],T:[x,y],H:[x],V:[y],C:[p.x+dx,p.y+dy,p.x+2*dx,p.y+2*dy,x,y],S:[p.x+2*dx,p.y+2*dy,x,y],Q:[(p.x+x)/2,(p.y+y)/2,x,y],A:[rr,rr,0,0,1,x,y],Z:[]}[c]}
function rel(q,p){var n=q.n.slice(),i;if(q.c==='H')n[0]-=p.x;else if(q.c==='V')n[0]-=p.y;else if(q.c==='A'){n[5]-=p.x;n[6]-=p.y}else for(i=0;i<n.length;i+=2){n[i]-=p.x;n[i+1]-=p.y}return{c:q.c.toLowerCase(),n:n}}
function seg(c,p,x,y){var u=c.toUpperCase(),q={c:u,n:make(u,p,x,y).map(IB.r)};return c===u?q:rel(q,p)}
/* editing works on an absolute copy, so moving and deleting points never changes the shape of the rest */
function ins(i,c){var g=IB.abs(read()),e=ends(g),a=i>=0&&e[i]?e[i]:{x:3,y:3},b=e[i+1],x=b?(a.x+b.x)/2:a.x+3,y=b?(a.y+b.y)/2:a.y+3;
 if(!g.length){c='M';x=a.x;y=a.y}g.splice(i+1,0,seg(c,a,IB.r(x),IB.r(y)));S.seg=i+1;save(g)}
function retype(i,c){var g=IB.abs(read()),e=ends(g),p=i>0?e[i-1]:{x:0,y:0};g[i]=seg(c,p,e[i].x,e[i].y);save(g)}
function del(i){var g=IB.abs(read()),e=ends(g);g.splice(i,1);if(i===0&&g.length)g[0]={c:'M',n:[e[1].x,e[1].y]};S.seg=-1;save(g)}
function dup(i){var g=IB.abs(read()),q=JSON.parse(JSON.stringify(g[i])),k;
 if(q.c==='H')q.n[0]+=2;else if(q.c==='V')q.n[0]+=2;else if(q.c==='A'){q.n[5]+=2;q.n[6]+=2}else for(k=0;k<q.n.length;k+=2){q.n[k]+=2;q.n[k+1]+=2}
 g.splice(i+1,0,q);S.seg=i+1;save(g)}
function mv(i,d){var g=IB.abs(read()),j=i+d;if(j<0||j>=g.length)return;var t=g[i];g[i]=g[j];g[j]=t;
 if(g[0].c!=='M'){IB.msg('A path has to start with a Move (M).',1);return}S.seg=j;save(g)}
function allAbs(){save(IB.abs(read()))}
function allRel(){var g=IB.abs(read()),e=ends(g);save(g.map(function(q,i){return i?rel(q,e[i-1]):q}))}
function types(fn){var a=UP.map(function(c){return{label:c+'   '+NM[c],fn:function(){fn(c)}}});
 a.push({sep:1});a.push({label:'Relative (lowercase)',sub:UP.map(function(c){return{label:c.toLowerCase()+'   '+NM[c],fn:function(){fn(c.toLowerCase())}}})});return a}
IB.segMenu=function(x,y,i){IB.menu(x,y,[
 {label:'Insert point after',sub:types(function(c){ins(i,c)})},{label:'Change type to',sub:types(function(c){retype(i,c)})},
 {label:'Duplicate',fn:function(){dup(i)}},{label:'Move up',fn:function(){mv(i,-1)}},{label:'Move down',fn:function(){mv(i,1)}},{sep:1},
 {label:'Close path here',fn:function(){ins(i,'Z')}},{label:'Start new subpath here',fn:function(){ins(i,'M')}},
 {label:'Convert path to absolute',fn:allAbs},{label:'Convert path to relative',fn:allRel},{sep:1},
 {label:'Delete point',danger:1,fn:function(){del(i)}}])};

function row(q,i){var d=document.createElement('div'),h=document.createElement('div'),n=document.createElement('span'),sel=document.createElement('select'),x=document.createElement('button'),a=document.createElement('div'),U=q.c.toUpperCase();
 d.__c=q.c;h.className='hd';n.className='no';n.textContent=i+1;
 [['Absolute',UP],['Relative',UP.map(function(c){return c.toLowerCase()})]].forEach(function(gp){var og=document.createElement('optgroup');og.label=gp[0];
  gp[1].forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c+'  '+NM[c.toUpperCase()];og.appendChild(o)});sel.appendChild(og)});
 sel.value=q.c;sel.onchange=function(){retype(i,sel.value)};x.textContent='\u00d7';x.title='Delete point';x.onclick=function(e){e.stopPropagation();del(i)};
 h.appendChild(n);h.appendChild(sel);h.appendChild(x);a.className='ar';
 AR[U].split(' ').forEach(function(nm,k){if(!nm)return;var inp=document.createElement('input');inp.type='number';inp.step=S.step||'any';inp.title=nm;inp.placeholder=nm;inp.value=q.n[k];
  inp.oninput=function(){var g=read();if(!g[i])return;g[i].n[k]=parseFloat(inp.value)||0;cur().a.d=IB.ps(g);IB.update('panel')};inp.onchange=IB.commit;a.appendChild(inp)});
 d.appendChild(h);d.appendChild(a);
 d.onclick=function(){S.seg=i;IB.draw();mark()};
 d.oncontextmenu=function(e){e.preventDefault();S.seg=i;IB.draw();mark();IB.segMenu(e.clientX,e.clientY,i)};return d}
function mark(){Array.prototype.forEach.call(list.children,function(r,i){r.className='seg'+(i===S.seg?' on':'')})}
function render(){var g=read(),rows=list.children,same=rows.length===g.length,i;
 for(i=0;same&&i<g.length;i++)if(rows[i].__c!==g[i].c)same=false;
 if(!same){list.innerHTML='';g.forEach(function(q,i){list.appendChild(row(q,i))})}
 else Array.prototype.forEach.call(rows,function(r,i){var ins=r.getElementsByTagName('input');for(var k=0;k<ins.length;k++)if(document.activeElement!==ins[k])ins[k].value=g[i].n[k]});
 mark()}
IB.segsPanel=function(box){var w=document.createElement('div'),h=document.createElement('div'),b=document.createElement('button');
 w.className='segs';h.className='segh';h.innerHTML='<b>Path points</b>';b.textContent='+ Add point';
 b.onclick=function(){var r=b.getBoundingClientRect();IB.menu(r.left,r.bottom+4,types(function(c){ins(read().length-1,c)}))};
 h.appendChild(b);list=document.createElement('div');w.appendChild(h);w.appendChild(list);box.appendChild(w);render()};
IB.segs=function(src){if(src==='panel'||!list||!document.body.contains(list)||!cur())return;render()};
})();
