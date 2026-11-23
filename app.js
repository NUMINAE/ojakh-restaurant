// Ojakh: motion and live tiles. Everything degrades to a static page without JS.
const R=document.documentElement, still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const DISHES={
 'dish-khorovats':['Khorovats','9 800','Lamb and pork over apricot wood, blistered tomato and pepper, served on lavash.','From the tonir'],
 'dish-ishkhan':['Sevan ishkhan','8 600','Whole trout baked in the tonir with tarragon butter and lemon.','From the tonir'],
 'dish-ghapama':['Ghapama','7 400','Whole pumpkin baked with rice, dried apricots, walnuts and honey. For two.','From the tonir'],
 'dish-zhingyalov':['Zhingyalov hats','3 200','Thin flatbread folded over a dozen chopped herbs.','From the tonir'],
 'dish-lavash':['Lavash, cheese and herbs','2 400','Lavash from this morning, chanakh cheese, basil, tarragon, radish.','From the tonir'],
 'dish-dolma':['Tolma','4 600','Grape leaves rolled around beef, rice and herbs, with garlic matsun.','Cold table'],
 'dish-salad':['Garden salad','3 400','Tomato, cucumber, purslane, white cheese, walnuts, pomegranate.','Cold table'],
 'dish-gata':['Gata','2 600','Round butter pastry, baked each afternoon. Served warm.','Sweet'],
 'drink-areni':['Areni, by the glass','2 800','Red wine from Vayots Dzor, poured from a clay jug.','To drink'],
};

/* ---- page transitions: a different one for each destination ---- */
const TX={'menu.html':'slats','story.html':'drop','index.html':'melt'};
const tx=document.createElement('div');tx.className='tx';tx.setAttribute('aria-hidden','true');
tx.innerHTML=[0,1,2,3,4,5].map(n=>`<i style="--n:${n}"></i>`).join('')+'<div class="drop"></div>';
document.body.append(tx);
let came=null;try{came=sessionStorage.getItem('tx');sessionStorage.removeItem('tx')}catch(e){}
if(came&&!still){R.classList.add('in-'+came);setTimeout(()=>R.classList.remove('in-'+came),1300)}
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||still||e.metaKey||e.ctrlKey)return;
  const file=a.getAttribute('href').split('#')[0];const kind=TX[file];
  if(!kind||location.pathname.endsWith('/'+file)&&a.getAttribute('href').includes('#'))return;
  e.preventDefault();
  R.style.setProperty('--cx',e.clientX+'px');R.style.setProperty('--cy',e.clientY+'px');
  R.classList.add('out-'+kind);try{sessionStorage.setItem('tx',kind)}catch(e){}
  setTimeout(()=>location.href=a.href,kind==='slats'?860:700);
});
addEventListener('pageshow',e=>{if(e.persisted)R.className='js'});

/* ---- pour-in on load and on scroll ---- */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.12});
document.querySelectorAll('.pour').forEach(el=>io.observe(el));

/* ---- light follows the pointer; glass catches it ---- */
if(!still&&matchMedia('(pointer:fine)').matches){
  addEventListener('pointermove',e=>{
    R.style.setProperty('--mx',e.clientX+'px');R.style.setProperty('--my',e.clientY+'px');
    R.style.setProperty('--tx',(e.clientX/innerWidth-.5).toFixed(3));R.style.setProperty('--ty',(e.clientY/innerHeight-.5).toFixed(3));
    for(const g of document.querySelectorAll('.glass')){const r=g.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)continue;
      g.style.setProperty('--gx',(e.clientX-r.left)+'px');g.style.setProperty('--gy',(e.clientY-r.top)+'px')}
  },{passive:true});
}

/* ---- scroll: sky parallax, fire story, drifting word ---- */
const story=document.querySelector('.story'),scenes=[...document.querySelectorAll('.scene')],rail=[...document.querySelectorAll('.rail i')];
const drifters=[...document.querySelectorAll('[data-drift]')];
function onScroll(){
  R.style.setProperty('--sy',(scrollY/innerHeight).toFixed(3));
  if(story){const r=story.getBoundingClientRect();const p=clamp(-r.top/(r.height-innerHeight))*scenes.length;
    scenes.forEach((s,i)=>{let d=p-(i+.5);if(i===0)d=Math.max(d,0);if(i===scenes.length-1)d=Math.min(d,0);
      const k=clamp(d/.6,-1,1),a=Math.abs(k),o=1-clamp((Math.abs(d)-.3)/.28);
      s.style.setProperty('--o',o.toFixed(3));s.style.setProperty('--k',k.toFixed(3));s.style.setProperty('--a',a.toFixed(3));
      if(rail[i])rail[i].style.setProperty('--f',clamp(p-i).toFixed(3));});}
  for(const el of drifters){const r=el.getBoundingClientRect();el.style.setProperty('--sp',clamp(1-(r.top+r.height/2)/innerHeight,-.5,1.5).toFixed(3))}
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();

/* ---- live tiles ---- */
const $=id=>document.getElementById(id);
if($('temp')){
  const cyc=document.querySelectorAll('.t-food img');let ci=0;
  setInterval(()=>{if(!cyc.length)return;cyc[ci].classList.remove('on');ci=(ci+1)%cyc.length;cyc[ci].classList.add('on');$('pname').textContent=cyc[ci].alt},4200);
  let left=252;
  const tick=()=>{ $('temp').textContent=404+Math.round(Math.random()*16);
    left=left<=0?360:left-1;$('lav').textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');$('lavbar').style.setProperty('--w',(100-left/3.6)+'%');};
  tick();setInterval(tick,1000);
  $('seats').innerHTML=Array.from({length:24},(_,i)=>`<i class="${[1,4,9,12,15,19,22].includes(i)?'on':''}"></i>`).join('');
  // open now? (Yerevan time, 12:00 to 23:00)
  const h=+new Intl.DateTimeFormat('en-GB',{hour:'numeric',hour12:false,timeZone:'Asia/Yerevan'}).format(new Date());
  const open=h>=12&&h<23;$('open').innerHTML=`<span class="dot${open?'':' off'}"></span>${open?'Open now, until 23:00':'Closed now, opens at 12:00'}`;
}

/* ---- 3D ring ---- */
const box=document.querySelector('.ringbox');
if(box){
  const ring=box.querySelector('.ring'),keys=(box.dataset.dishes||'').split(',');const n=keys.length,step=360/n;
  ring.style.setProperty('--step',step+'deg');
  ring.innerHTML=keys.map((k,i)=>`<button class="rcard" style="--i:${i}" data-k="${k}" aria-label="${DISHES[k][0]}"><img src="img/${k}.jpg" alt="" draggable="false"><span>${DISHES[k][0]}<em>${DISHES[k][3]}</em></span></button>`).join('');
  let ang=0,vel=0,drag=false,lx=0,moved=0,idle=0;
  box.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;moved=0;vel=0;box.setPointerCapture(e.pointerId)});
  box.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx;lx=e.clientX;moved+=Math.abs(dx);ang+=dx*.28;vel=dx*.28});
  const up=()=>{drag=false;idle=0};box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);
  box.addEventListener('click',e=>{const c=e.target.closest('.rcard');if(c&&moved<8)openDish(c.dataset.k)},true);
  box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){ang+=step;idle=0}if(e.key==='ArrowRight'){ang-=step;idle=0}});
  (function loop(){if(!drag){ang+=vel;vel*=.94;idle++;if(idle>120&&!still)ang-=.07}
    ring.style.setProperty('--ang',ang+'deg');requestAnimationFrame(loop)})();
}

/* ---- dish sheet ---- */
const dlg=$('sheet');
function openDish(k){const d=DISHES[k];if(!dlg||!d)return;dlg.querySelector('img').src=`img/${k}.jpg`;dlg.querySelector('img').alt=d[0];
  dlg.querySelector('h3').textContent=d[0];dlg.querySelector('p').textContent=d[2];dlg.querySelector('b').textContent=d[1]+' AMD';dlg.showModal()}
if(dlg){dlg.querySelector('button').onclick=()=>dlg.close();dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
  document.querySelectorAll('.item img').forEach(i=>{i.onclick=()=>openDish(i.dataset.k);i.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDish(i.dataset.k)}}});}

/* ---- menu filter ---- */
const chips=document.querySelectorAll('.fchip');
chips.forEach(c=>c.onclick=()=>{chips.forEach(x=>x.setAttribute('aria-pressed',x===c));const f=c.dataset.f;let n=0;
  document.querySelectorAll('.item').forEach(it=>{const show=f==='all'||it.dataset.veg==='1';it.hidden=!show;
    if(show){it.classList.remove('in');it.style.setProperty('--d',(n++%8));requestAnimationFrame(()=>requestAnimationFrame(()=>it.classList.add('in')))}});
  document.querySelectorAll('.msec').forEach(s=>s.hidden=!s.querySelector('.item:not([hidden])'));});
