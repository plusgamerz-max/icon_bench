/* zip.js: a tiny zip writer (files are stored, not compressed). IB.zip([{name, text}]) returns a Blob. */
(function(){
var IB=window.IB,T=null;
function crc(b){if(!T){T=[];for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0}}
 var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=T[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function u8(s){if(window.TextEncoder)return new TextEncoder().encode(s);var u=unescape(encodeURIComponent(s)),a=new Uint8Array(u.length);for(var i=0;i<u.length;i++)a[i]=u.charCodeAt(i);return a}
function le(n,v){var a=[];for(var i=0;i<n;i++){a.push(v&255);v=Math.floor(v/256)}return a}
IB.zip=function(files){var parts=[],cen=[],off=0,cs=0,now=new Date(),
 dt=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate(),tm=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
 files.forEach(function(f){var nm=u8(f.name),d=u8(f.text),c=crc(d),
  h=[].concat(le(4,0x04034b50),le(2,20),le(2,0x0800),le(2,0),le(2,tm),le(2,dt),le(4,c),le(4,d.length),le(4,d.length),le(2,nm.length),le(2,0));
  parts.push(new Uint8Array(h),nm,d);
  cen.push(new Uint8Array([].concat(le(4,0x02014b50),le(2,20),le(2,20),le(2,0x0800),le(2,0),le(2,tm),le(2,dt),le(4,c),le(4,d.length),le(4,d.length),le(2,nm.length),le(2,0),le(2,0),le(2,0),le(2,0),le(4,0),le(4,off))),nm);
  off+=h.length+nm.length+d.length});
 cen.forEach(function(p){cs+=p.length});
 var end=new Uint8Array([].concat(le(4,0x06054b50),le(2,0),le(2,0),le(2,files.length),le(2,files.length),le(4,cs),le(4,off),le(2,0)));
 return new Blob(parts.concat(cen,[end]),{type:'application/zip'})};
})();
