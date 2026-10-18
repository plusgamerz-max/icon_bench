/* rotate.js: rotating shapes. Rotate mode (T) turns the selected shape around its center or a pivot you move.
   The right-click menu has quick angles. Rotation is baked into the coordinates; rect and ellipse become paths. Needs app.js and ui.js. */
(function(){
var IB=window.IB,S=IB.S,px=null,py=null;
function sel(){return S.shapes[S.sel]}
function flat(s){var a=s.a,t=s.tag;function n(k){return parseFloat(a[k])||0}
 if(t==='line')return[n('x1'),n('y1'),n('x2'),n('y2')];
 if(t==='rect')return[n('x'),n('y'),n('x')+n('width'),n('y')+n('height')];
 if(t==='circle')return[n('cx')-n('r'),n('cy')-n('r'),n('cx')+n('r'),n('cy')+n('r')];
 if(t==='ellipse')return[n('cx')-n('rx'),n('cy')-n('ry'),n('cx')+n('rx'),n('cy')+n('ry')];
 if(t==='path'){var g=IB.abs(IB.pp(a.d||'')),o=[],cx=0,cy=0;
  g.forEach(function(q){var m=q.n;if(q.c==='H')cx=m[0];else if(q.c==='V')cy=m[0];else if(m.length){cx=m[m.length-2];cy=m[m.length-1]}if(q.c!=='Z')o.push(cx,cy)});return o}
 return IB.pts(s)}
IB.center=function(s){var f=flat(s),x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,i;if(!f.length)return{x:0,y:0};
 for(i=0;i+1<f.length;i+=2){x0=Math.min(x0,f[i]);x1=Math.max(x1,f[i]);y0=Math.min(y0,f[i+1]);y1=Math.max(y1,f[i+1])}
 return{x:IB.r((x0+x1)/2),y:IB.r((y0+y1)/2)}};
function toPath(s){var a=s.a,d,x,y,w,h,rx,ry,cx,cy;function n(k){return parseFloat(a[k])||0}
 if(s.tag==='rect'){x=n('x');y=n('y');w=n('width');h=n('height');rx=a.rx!==undefined?n('rx'):n('ry');ry=a.ry!==undefined?n('ry'):rx;rx=Math.min(rx,w/2);ry=Math.min(ry,h/2);
  d=(rx||ry)?'M'+(x+rx)+' '+y+' H'+(x+w-rx)+' A'+rx+' '+ry+' 0 0 1 '+(x+w)+' '+(y+ry)+' V'+(y+h-ry)+' A'+rx+' '+ry+' 0 0 1 '+(x+w-rx)+' '+(y+h)+' H'+(x+rx)+' A'+rx+' '+ry+' 0 0 1 '+x+' '+(y+h-ry)+' V'+(y+ry)+' A'+rx+' '+ry+' 0 0 1 '+(x+rx)+' '+y+' Z'
   :'M'+x+' '+y+' H'+(x+w)+' V'+(y+h)+' H'+x+' Z'}
 else{cx=n('cx');cy=n('cy');rx=n('rx');ry=n('ry');d='M'+(cx+rx)+' '+cy+' A'+rx+' '+ry+' 0 1 1 '+(cx-rx)+' '+cy+' A'+rx+' '+ry+' 0 1 1 '+(cx+rx)+' '+cy+' Z'}
 ['x','y','width','height','rx','ry','cx','cy'].forEach(function(k){delete a[k]});s.tag='path';a.d=d}
/* rotate shape s by deg degrees (clockwise on screen) around the point (px, py) */
IB.rotate=function(s,deg,ox,oy){if(!deg)return;var rad=deg*Math.PI/180,co=Math.cos(rad),si=Math.sin(rad);
 function rp(x,y){var dx=x-ox,dy=y-oy;return[IB.r(ox+dx*co-dy*si),IB.r(oy+dx*si+dy*co)]}
 function n(k){return parseFloat(s.a[k])||0}
 if(s.tag==='rect'||s.tag==='ellipse')toPath(s);
 var a=s.a,t=s.tag,p,q,i;
 if(t==='line'){p=rp(n('x1'),n('y1'));q=rp(n('x2'),n('y2'));a.x1=p[0];a.y1=p[1];a.x2=q[0];a.y2=q[1]}
 else if(t==='circle'){p=rp(n('cx'),n('cy'));a.cx=p[0];a.cy=p[1]}
 else if(t==='polyline'||t==='polygon'){var f=IB.pts(s),o=[];for(i=0;i+1<f.length;i+=2)o=o.concat(rp(f[i],f[i+1]));a.points=o.join(' ')}
 else if(t==='path'){var g=IB.abs(IB.pp(a.d||'')),cx=0,cy=0,sx=0,sy=0,out=[];
  g.forEach(function(e){var c=e.c,m=e.n;
   if(c==='Z'){cx=sx;cy=sy;out.push(e);return}
   if(c==='H'){cx=m[0];e={c:'L',n:[cx,cy]};m=e.n}else if(c==='V'){cy=m[0];e={c:'L',n:[cx,cy]};m=e.n}
   else{cx=m[m.length-2];cy=m[m.length-1];if(c==='M'){sx=cx;sy=cy}}
   if(e.c==='A'){p=rp(m[5],m[6]);m[5]=p[0];m[6]=p[1];m[2]=((m[2]||0)+deg)%360}
   else for(i=0;i<m.length;i+=2){p=rp(m[i],m[i+1]);m[i]=p[0];m[i+1]=p[1]}
   out.push(e)});
  a.d=IB.ps(out)}};
function apply(deg){var s=sel();if(!s||!deg)return;var c=S.pivot||IB.center(s);IB.rotate(s,deg,c.x,c.y);IB.commit();IB.buildInsp();IB.update()}
IB.rotateSel=apply;

IB.shapeMenu=function(x,y){IB.menu(x,y,[
 {label:'Rotate',sub:[{label:'90\u00b0 clockwise',fn:function(){apply(90)}},{label:'90\u00b0 counter-clockwise',fn:function(){apply(-90)}},
  {label:'180\u00b0',fn:function(){apply(180)}},{label:'45\u00b0 clockwise',fn:function(){apply(45)}},
  {label:'By angle...',fn:function(){var v=parseFloat(window.prompt('Rotate by how many degrees? (positive is clockwise)','30'));if(v)apply(v)}},
  {sep:1},{label:'Rotate mode (T)',fn:function(){IB.setTool('rotate')}}]},{sep:1},
 {label:'Duplicate',fn:IB.dup},{label:'Raise',fn:function(){IB.swap(1)}},{label:'Lower',fn:function(){IB.swap(-1)}},{sep:1},
 {label:'Delete',danger:1,fn:IB.del}])};

/* inspector section shown in rotate mode */
function pv(){var s=sel();return s?(S.pivot||IB.center(s)):{x:0,y:0}}
function refresh(){if(!px||!document.body.contains(px)||!sel())return;var p=pv();if(document.activeElement!==px)px.value=p.x;if(document.activeElement!==py)py.value=p.y}
function num(label,val,box){var l=document.createElement('label'),sp=document.createElement('span'),i=document.createElement('input');
 sp.textContent=label;i.type='number';i.step='any';i.value=val;l.appendChild(sp);l.appendChild(i);box.appendChild(l);return i}
IB.rotPanel=function(box){var w=document.createElement('div'),h=document.createElement('p'),qk=document.createElement('div'),p=pv(),ang,go,cb;
 w.className='rotp';h.textContent='Rotate mode: drag on the canvas to turn the shape (Shift snaps to 15\u00b0). Drag the orange dot to move the pivot. Angles are clockwise.';w.appendChild(h);
 ang=num('angle (deg)',15,w);go=document.createElement('button');go.textContent='Rotate by angle';go.onclick=function(){apply(parseFloat(ang.value)||0)};w.appendChild(go);
 qk.className='ar';[-90,90,180,45].forEach(function(d){var b=document.createElement('button');b.textContent=(d>0?'+':'')+d+'\u00b0';b.onclick=function(){apply(d)};qk.appendChild(b)});w.appendChild(qk);
 px=num('pivot x',p.x,w);py=num('pivot y',p.y,w);
 px.oninput=py.oninput=function(){S.pivot={x:parseFloat(px.value)||0,y:parseFloat(py.value)||0};IB.update('piv')};
 cb=document.createElement('button');cb.textContent='Pivot to center';cb.onclick=function(){S.pivot=null;IB.update('piv');refresh()};w.appendChild(cb);box.appendChild(w)};
var old=IB.segs;IB.segs=function(src){if(old)old(src);refresh()};
})();
