'use strict';
(() => {
const $ = id => document.getElementById(id);
const root = document.documentElement;
const reduced = typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
let preference = null;
try { preference = localStorage.getItem('rpbrc-motion'); } catch {}
let motion = preference==='on'||(preference!=='off'&&!reduced.matches);
let bootFrame = 0, bootTimeout = 0, exitTimeout = 0, bootActive = false, savedFocus = null;
let ambientFrame = 0, ambientLast = 0, bootPending = false;
const boot = $('boot'), content = $('site-content'), hero = document.querySelector('.hero');
function getCanvasContext(element){try{return element?.getContext('2d')||null;}catch{return null;}}
const bootCanvas = $('boot-canvas'), bootContext = getCanvasContext(bootCanvas);
const ambient = $('ambient'), ctx = null; // ambient field disabled for performance (white edition)
const smooth = x => {const c=Math.min(1,Math.max(0,x));return c*c*(3-2*c);};
const escapeText = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const featureData = {
clicker:{kicker:'find your rhythm',title:'the little details<br>between every click.',description:'set your clicks per second and hold time. save the combinations that work for you, then switch with a keybind.',facts:[['your pace','adjust clicks per second and hold time.'],['your profiles','save a setup and switch without starting over.'],['your timing','frame-sync options and precision controls.']]},
practice:{kicker:'a feel for every session',title:'a little practice.<br>a better sense of timing.',description:'test your clicks per second and reaction time. track your records and see the spacing between your clicks.',facts:[['cps tests','choose a 5- or 10-second test and find your pace.'],['reaction time','wait for the signal, then see how quickly you respond.'],['your records','keep your best results and compare your sessions.']]},
engine:{kicker:'fine-tune your game',title:'the right settings.<br>all in one place.',description:'adjust frame-rate and rendering settings, choose a performance preset, or use your own client flags as json. support depends on the roblox client.',facts:[['frame rate','manage frame-rate limits and scheduler options.'],['rendering','explore graphics, detail, and texture controls.'],['custom flags','bring your own json. paid adds a searchable flag library.']]},
capture:{kicker:'keep the good moments',title:'that moment?<br>keep it.',description:'start capture, then save the last moments with your clip keybind. the paid edition adds screenshots, a media library, and editing tools.',facts:[['instant replay','save a recent moment with your clip keybind.'],['your capture','choose length, resolution, frame rate, and audio.'],['a little extra','paid adds clip trimming and screenshot annotation.']]},
personalize:{kicker:'a setup that feels yours',title:'familiar controls.<br>personal details.',description:'choose your crosshair placement, roblox font, and icon colors. the paid studio brings themes, layouts, logos, motion, and sounds together.',facts:[['crosshair','position an overlay that stays over fullscreen roblox.'],['fonts & colors','make the small details of roblox feel more like you.'],['your studio','paid adds a dedicated space for deeper customization.']]}
};
const tabs=[...document.querySelectorAll('[data-feature]')];
function selectFeature(tab, focus=false){
 const data=featureData[tab.dataset.feature]; if(!data)return;
 for(const t of tabs){const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;}
 $('feature-panel').setAttribute('aria-labelledby',tab.id);
 $('feature-kicker').textContent=data.kicker;
 $('feature-title').innerHTML=data.title;
 $('feature-description').textContent=data.description;
 $('feature-facts').innerHTML=data.facts.map(([title,text],index)=>`<div><span>0${index+1}</span><strong>${escapeText(title)}</strong><p>${escapeText(text)}</p></div>`).join('');
 const panel=$('feature-panel');panel.classList.remove('panel-changing');
 if(motion){void panel.offsetWidth;panel.classList.add('panel-changing');}
 if(focus)tab.focus();
}
for(const tab of tabs){
 tab.addEventListener('click',()=>selectFeature(tab));
 tab.addEventListener('keydown',event=>{let next=tabs.indexOf(tab);if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(next+1)%tabs.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(next-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectFeature(tabs[next],true);});
}
function finishBoot(){
 if(!bootActive)return;
 bootActive=false;bootPending=false;cancelAnimationFrame(bootFrame);clearTimeout(bootTimeout);
 boot.classList.add('exiting');content.inert=false;document.body.style.overflow='';
 if(motion)content.classList.add('site-enter');
 exitTimeout=setTimeout(()=>{boot.hidden=true;boot.classList.remove('exiting');if(savedFocus?.isConnected&&savedFocus!==document.body)savedFocus.focus({preventScroll:true});else $('main').focus({preventScroll:true});startAmbient();},motion?450:0);
}
function runBoot(){
 if(document.hidden){bootPending=true;return;}
 if(bootActive)finishBoot();clearTimeout(exitTimeout);bootPending=false;
 savedFocus=document.activeElement;
 bootActive=true;boot.hidden=false;boot.classList.remove('exiting');content.classList.remove('site-enter');content.inert=true;document.body.style.overflow='hidden';
 $('skip-boot').focus({preventScroll:true});stopAmbient();
 bootTimeout=setTimeout(finishBoot,4500);
 const points=window.RP_BOOT_POINTS||[];
 const full=motion&&bootContext&&points.length>0;
 boot.classList.toggle('reduced',!full);
 if(!full){$('boot-mark').style.opacity=1;document.querySelector('.boot-title').style.cssText='opacity:1;letter-spacing:1px;filter:none';clearTimeout(bootTimeout);bootTimeout=setTimeout(finishBoot,700);return;}
 const dpr=Math.min(window.devicePixelRatio||1,2);bootCanvas.width=280*dpr;bootCanvas.height=280*dpr;bootContext.setTransform(dpr,0,0,dpr,0,0);
 const steps=[...document.querySelectorAll('.boot-checklist span')];
 const start=performance.now();
 function frame(now){
  if(!bootActive)return;
  const t=Math.min(1.9,(now-start)/1000);
  $('ring-progress').style.strokeDashoffset=703.72*(1-t/1.9);
  const logoFade=smooth((t-1.4)/.28),logoScale=.94+.06*smooth((t-1.4)/.35);
  $('boot-mark').style.opacity=logoFade;$('boot-mark').style.transform=`scale(${logoScale})`;
  $('boot-mark').style.filter=`drop-shadow(0 0 ${22*smooth((t-1.45)/.3)}px rgba(255,255,255,.3))`;
  const name=smooth((t-.3)/.6),tracking=14-13*smooth((t-.35)/.8);
  document.querySelector('.boot-title').style.cssText=`opacity:${name};letter-spacing:${tracking}px;filter:blur(${6*(1-name)}px)`;
  steps.forEach((step,i)=>{const a=smooth((t-[.35,.7,1,1.3][i])/.2);step.style.opacity=a;step.style.transform=`translateX(${-6*(1-a)}px)`;});
  bootContext.clearRect(0,0,280,280);
  const assemble=smooth((t-.05)/.85),yaw=(1-assemble)*-2.2+Math.sin(t*2.2)*.35*(1-smooth((t-1.1)/.45));
  const pitch=-.12*(1-assemble)+.06*Math.sin(t*1.7),sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
  const scale=150+120*(1-smooth((t-1.05)/.4)),fade=1-smooth((t-1.42)/.22);
  for(const point of points){
   const [hx,hy,hz,sx,syPoint,sz,seed,edge]=point,a=smooth((t-.05-seed*.25)/.8),scatter=(1-a)**2;
   let x=hx+sx*scatter,y=hy+syPoint*scatter,z=hz+sz*scatter;
   const radius=Math.hypot(x,y),age=t-1,phase=(age-radius*.5)/.35;
   if(age>0&&age<.5&&phase>0&&phase<1){const push=Math.sin(phase*Math.PI)*.035;x+=x/Math.max(radius,.01)*push;y+=y/Math.max(radius,.01)*push;}
   const x1=x*cy+z*sy,z1=-x*sy+z*cy,y2=y*cp-z1*sp,z2=y*sp+z1*cp;
   const perspective=1.6/(1.6+z2);if(perspective<=0||perspective>5)continue;
   const dot=(edge?1.25:.95)*perspective,brightness=Math.min(1,Math.max(.25,.75-z2*3))*(edge?1:.7);
   bootContext.fillStyle=`rgba(245,240,250,${brightness*fade})`;bootContext.beginPath();bootContext.arc(140+x1*scale*perspective,140+y2*scale*perspective,dot,0,Math.PI*2);bootContext.fill();
  }
  if(t>=1.9)finishBoot();else bootFrame=requestAnimationFrame(frame);
 }
 bootFrame=requestAnimationFrame(frame);
}
$('skip-boot').addEventListener('click',finishBoot);
$('replay-boot').addEventListener('click',()=>{if(!motion){motion=true;preference='on';try{localStorage.setItem('rpbrc-motion','on');}catch{}applyMotion();}runBoot();});
boot.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finishBoot();}if(e.key==='Tab'){e.preventDefault();$('skip-boot').focus();}});
// A shared, mouse/touch-reactive silver field. Animation pauses in background tabs.
const pointer={x:0,y:0,last:0},field={x:0,y:0};let ripples=[],width=1,height=1;const stars=[];
for(let i=0;i<76;i++)stars.push({x:Math.random(),y:Math.random(),seed:Math.random()*10,alpha:.14+Math.random()*.24});
function sizeAmbient(){
 width=Math.max(1,window.innerWidth||document.documentElement.clientWidth||1000);height=Math.max(1,window.innerHeight||document.documentElement.clientHeight||700);
 const dpr=Math.min(window.devicePixelRatio||1,1.5);ambient.width=Math.round(width*dpr);ambient.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);
 if(!motion)ctx?.clearRect(0,0,width,height);
}
function ambientTick(now){
 if(!motion||document.hidden||bootActive){ambientFrame=0;return;}
 ambientFrame=requestAnimationFrame(ambientTick);
 if(now-ambientLast<33)return;const dt=Math.min((now-ambientLast)/1000,.06);ambientLast=now;
 const time=now/1000,idle=now-pointer.last>3500;
 const targetX=idle?width*(.58+Math.sin(time*.17)*.21):pointer.x,targetY=idle?height*(.4+Math.cos(time*.14)*.15):pointer.y;
 field.x+=(targetX-field.x)*Math.min(1,dt*4);field.y+=(targetY-field.y)*Math.min(1,dt*4);
 ctx.clearRect(0,0,width,height);
 const glow=ctx.createRadialGradient(field.x,field.y,0,field.x,field.y,Math.min(400,width*.6));
 glow.addColorStop(0,'rgba(20,20,30,.05)');glow.addColorStop(.5,'rgba(20,20,30,.015)');glow.addColorStop(1,'rgba(20,20,30,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 // Broad, lightly curved silver currents respond to the pointer without obscuring copy.
 for(let j=0;j<5;j++){
  const base=height*(.2+j*.17),bend=Math.sin(time*.18+j)*26+(field.y-height*.5)*.08;
  ctx.strokeStyle=`rgba(20,20,28,${.07-j*.008})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-60,base);
  ctx.bezierCurveTo(width*.3,base+bend-55,width*.65,base-bend+45,width+60,base+Math.sin(time*.13+j)*32);ctx.stroke();
 }
 const count=width<700?44:76,positions=[];
 for(let i=0;i<count;i++){
  const star=stars[i];star.x+=dt*(.003+star.seed*.00025);if(star.x>1.06)star.x=-.06;
  let x=star.x*width+Math.sin(time*.15+star.seed)*10,y=star.y*height+Math.cos(time*.17+star.seed)*13;
  const dx=x-field.x,dy=y-field.y,distance=Math.hypot(dx,dy),push=Math.max(0,1-distance/190)*16;
  x+=dx/Math.max(distance,1)*push;y+=dy/Math.max(distance,1)*push;
  const alpha=star.alpha+Math.max(0,1-distance/180)*.22;positions.push({x,y,alpha});
  ctx.fillStyle=`rgba(18,18,24,${alpha*.85})`;ctx.beginPath();ctx.arc(x,y,i%7===0?1.4:.8,0,Math.PI*2);ctx.fill();
 }
 for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){
  const a=positions[i],b=positions[j],dist=Math.hypot(a.x-b.x,a.y-b.y);if(dist>110)continue;
  ctx.strokeStyle=`rgba(18,18,24,${.09*(1-dist/110)})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
 }
 ripples=ripples.filter(r=>now-r.time<1000);for(const r of ripples){const age=(now-r.time)/1000;ctx.strokeStyle=`rgba(10,10,14,${.25*(1-age)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(r.x,r.y,12+age*165,0,Math.PI*2);ctx.stroke();}
}
function startAmbient(){if(ctx&&motion&&!ambientFrame&&!document.hidden&&!bootActive){ambientLast=performance.now();ambientFrame=requestAnimationFrame(ambientTick);}}
function stopAmbient(){cancelAnimationFrame(ambientFrame);ambientFrame=0;}
function movePointer(e){pointer.x=e.clientX;pointer.y=e.clientY;pointer.last=performance.now();}
document.addEventListener('pointermove',movePointer,{passive:true});
document.addEventListener('pointerdown',e=>{if(!motion||bootActive)return;movePointer(e);if(!e.target.closest('a,button,input,dialog')){ripples.push({x:e.clientX,y:e.clientY,time:performance.now()});if(ripples.length>6)ripples.shift();}},{passive:true});
const visual=$('hero-visual');
visual.addEventListener('pointermove',e=>{if(!motion||e.pointerType==='touch')return;const r=visual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;$('hero-logo').style.setProperty('--ry',`${x*8}deg`);$('hero-logo').style.setProperty('--rx',`${-y*6}deg`);});
visual.addEventListener('pointerleave',()=>{$('hero-logo').style.setProperty('--rx','0deg');$('hero-logo').style.setProperty('--ry','0deg');});
for(const card of document.querySelectorAll('.detail-card'))card.addEventListener('pointermove',e=>{if(!motion)return;const r=card.getBoundingClientRect();card.style.setProperty('--spot-x',`${e.clientX-r.left}px`);card.style.setProperty('--spot-y',`${e.clientY-r.top}px`);});
for(const button of document.querySelectorAll('.magnetic')){button.addEventListener('pointermove',e=>{if(!motion||e.pointerType==='touch')return;const r=button.getBoundingClientRect();button.style.transform=`translate(${((e.clientX-r.left)/r.width-.5)*4}px,${((e.clientY-r.top)/r.height-.5)*4}px)`;});button.addEventListener('pointerleave',()=>button.style.transform='');}
if('IntersectionObserver' in window){try{
 root.classList.add('js-reveals');const reveals=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');reveals.unobserve(entry.target);}},{threshold:.12,rootMargin:'0px 0px -25px 0px'});for(const el of document.querySelectorAll('.reveal'))reveals.observe(el);
 const navLinks=[...document.querySelectorAll('.navigation nav a')];const sections=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){for(const link of navLinks){if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}}},{rootMargin:'-15% 0px -60% 0px'});for(const id of ['features','editions','questions'])sections.observe($(id));
}catch{root.classList.remove('js-reveals');}}
function applyMotion(){
 root.classList.toggle('motion-off',!motion);root.classList.toggle('motion-enabled',motion);
 $('motion-toggle').setAttribute('aria-pressed',String(motion));$('motion-toggle').disabled=false;
 $('motion-toggle').title='choose full animation or gentle motion';$('motion-toggle').textContent=motion?'motion on':'motion off';
 $('replay-boot').hidden=false;$('replay-label').textContent=motion?'replay the launch':'play animated launch';$('replay-boot').title=motion?'replay the launch':'enable animation and replay the introduction';
 if(motion)startAmbient();else{stopAmbient();ctx?.clearRect(0,0,width,height);if(bootActive)finishBoot();}
}
$('motion-toggle').addEventListener('click',()=>{motion=!motion;preference=motion?'on':'off';try{localStorage.setItem('rpbrc-motion',preference);}catch{}applyMotion();});
function systemMotionChanged(){motion=preference==='on'||(preference!=='off'&&!reduced.matches);applyMotion();}
if(reduced.addEventListener)reduced.addEventListener('change',systemMotionChanged);else if(reduced.addListener)reduced.addListener(systemMotionChanged);
const install=$('install-dialog');let installTrigger=null;
for(const button of document.querySelectorAll('[data-install]'))button.addEventListener('click',()=>{installTrigger=button;if(install.showModal){install.showModal();document.body.style.overflow='hidden';}else{install.setAttribute('open','');install.scrollIntoView({behavior:'auto',block:'center'});}});
function closeInstall(){if(install.close)install.close();else install.removeAttribute('open');document.body.style.overflow='';installTrigger?.focus({preventScroll:true});}
$('close-install').addEventListener('click',closeInstall);
install.addEventListener('close',()=>{document.body.style.overflow='';});
install.addEventListener('click',e=>{if(e.target!==install)return;const r=install.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeInstall();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAmbient();if(bootActive)finishBoot();}else if(bootPending)runBoot();else startAmbient();});
addEventListener('resize',sizeAmbient,{passive:true});
sizeAmbient();applyMotion();runBoot();
})();



