/* icons.js: small inline icons for the toolbar and the layer list (window.IBI(name) returns an <svg> string). */
(function(){
var P={view:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 select:'<path d="M5 3 L19 10 L12 12 L10 19 Z"/>',
 rotate:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
 line:'<path d="M5 19 L19 5"/>',
 rect:'<rect x="4" y="6" width="16" height="12" rx="2"/>',
 circle:'<circle cx="12" cy="12" r="8"/>',
 ellipse:'<ellipse cx="12" cy="12" rx="9" ry="6"/>',
 polyline:'<path d="M3 17 L9 8 L15 14 L21 5"/>',
 polygon:'<path d="M12 3 L21 10 L17.5 21 L6.5 21 L3 10 Z"/>',
 path:'<path d="M4 18 C8 4 16 4 20 18"/><circle cx="4" cy="18" r="1.6"/><circle cx="20" cy="18" r="1.6"/>'};
window.IBI=function(n){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(P[n]||'')+'</svg>'};
Array.prototype.forEach.call(document.querySelectorAll('#tools button'),function(b){b.innerHTML=window.IBI(b.getAttribute('data-t'))});
})();
