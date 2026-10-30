window.GA=(()=>{
let ac,master,cfg={},timer,step=0,started=false,fileAudio=null;
const slug=location.pathname.split('/').pop().replace('.html','');
const st=()=>{try{return JSON.parse(localStorage.getItem('hubSettings'))||{}}catch(e){return{}}};
const on=()=>st().sound!==false&&!document.hidden;
const vol=()=>(st().vol??50)/100;
function ctx(){
if(!ac){
const C=window.AudioContext||window.webkitAudioContext;
if(!C)return null;
ac=new C();
master=ac.createGain();
master.connect(ac.destination)}
master.gain.value=vol();
if(ac.state==='suspended')ac.resume();
return ac}
function tone(f,d,type,g,at){
const c=ctx();
if(!c||!on())return;
const t=c.currentTime+(at||0),o=c.createOscillator(),v=c.createGain();
o.type=type||'sine';
o.frequency.setValueAtTime(f,t);
v.gain.setValueAtTime(0,t);
v.gain.linearRampToValueAtTime(g,t+.01);
v.gain.exponentialRampToValueAtTime(.001,t+d);
o.connect(v);v.connect(master);
o.start(t);o.stop(t+d+.02)}
function slide(f1,f2,d,type,g){
const c=ctx();
if(!c||!on())return;
const t=c.currentTime,o=c.createOscillator(),v=c.createGain();
o.type=type;
o.frequency.setValueAtTime(f1,t);
o.frequency.exponentialRampToValueAtTime(f2,t+d);
v.gain.setValueAtTime(g,t);
v.gain.exponentialRampToValueAtTime(.001,t+d);
o.connect(v);v.connect(master);
o.start(t);o.stop(t+d+.02)}
function hz(d){
const sc=cfg.scale,n=sc.length,o=Math.floor(d/n),i=((d%n)+n)%n;
return cfg.root*Math.pow(2,(sc[i]+12*o)/12)}
function beat(){
if(!on())return;
const p=cfg.pat,d=p[step%p.length],b=60/cfg.bpm/2;
if(d!=='_')tone(hz(+d),b*1.6,cfg.wave,cfg.gain||.1);
if(step%4===0)tone(hz(step%8===0?0:3)/2,b*3.5,'triangle',.09);
step++}
function startSynth(){
if(timer||!cfg.pat)return;
timer=setInterval(beat,60/cfg.bpm/2*1000)}
function stopSynth(){
clearInterval(timer);
timer=null}
function useFile(){
stopSynth();
fileAudio.volume=vol();
if(on())fileAudio.play().catch(()=>{})}
function init(c){
cfg={...c,pat:c.pat.split(' ')};
if(!c.nofile){
const a=new Audio('../audio/'+slug+'.mp3');
a.loop=true;
a.addEventListener('canplaythrough',()=>{fileAudio=a;if(started)useFile()},{once:true})}
const go=()=>{
if(started)return;
started=true;
ctx();
fileAudio?useFile():startSynth()};
if(!c.manual){addEventListener('pointerdown',go);addEventListener('keydown',go)}
setInterval(()=>{
if(!fileAudio)return;
fileAudio.volume=vol();
if(!started)return;
if(on()){if(fileAudio.paused)fileAudio.play().catch(()=>{})}else fileAudio.pause()},700);
addEventListener('gamepause',()=>{if(fileAudio)fileAudio.pause()});
addEventListener('gameresume',()=>{if(fileAudio&&started&&on())fileAudio.play().catch(()=>{})});
document.addEventListener('visibilitychange',()=>{
if(!ac)return;
document.hidden?ac.suspend():ac.resume()})}
function sfx(n){
if(!cfg.scale)return;
const w=cfg.wave==='sawtooth'?'square':cfg.wave||'sine';
const f={
good:()=>[0,2,4].forEach((d,i)=>tone(hz(d+7),.18,w,.2,i*.07)),
bad:()=>{tone(hz(-3),.2,'square',.1);tone(hz(-5),.25,'square',.1,.12)},
pop:()=>slide(900,300,.12,'sine',.25),
tick:()=>tone(hz(7),.05,'triangle',.15),
win:()=>[0,2,4,7,9].forEach((d,i)=>tone(hz(d+7),.22,w,.2,i*.09)),
lose:()=>[4,2,0,-3].forEach((d,i)=>tone(hz(d),.28,'triangle',.18,i*.16)),
jump:()=>slide(280,720,.14,'square',.1),
hit:()=>slide(500,90,.18,'sawtooth',.15)}[n];
if(f)f()}
function music(w){
if(w){ctx();fileAudio?useFile():startSynth()}
else{stopSynth();if(fileAudio)fileAudio.pause()}}
return{init,sfx,music}})();
