(()=>{
const st=window.setTimeout.bind(window),si=window.setInterval.bind(window),raf=window.requestAnimationFrame.bind(window);
let paused=false,q=[],box=null;
window.setTimeout=(f,ms,...a)=>st(()=>paused?q.push(()=>f(...a)):f(...a),ms);
window.setInterval=(f,ms,...a)=>si(()=>{if(!paused)f(...a)},ms);
window.requestAnimationFrame=cb=>raf(t=>paused?q.push(()=>raf(cb)):cb(t));
const css=document.createElement('style');
css.textContent='.exit-paused *{animation-play-state:paused!important}#exit-dlg{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Fredoka,"Trebuchet MS",system-ui,sans-serif}#exit-dlg .card{background:#fff;color:#1b2740;border-radius:20px;padding:26px 22px;max-width:340px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.35)}#exit-dlg p{margin:0 0 20px;font-size:1.35rem;font-weight:700;line-height:1.3}#exit-dlg .row{display:flex;gap:12px}#exit-dlg button{flex:1;border:0;border-radius:14px;padding:14px;font-family:inherit;font-weight:700;font-size:1.2rem;cursor:pointer;color:#fff}#exit-dlg .yes{background:#d6334a}#exit-dlg .no{background:#2f9e57}#exit-dlg button:focus-visible{outline:3px solid #1b2740;outline-offset:2px}#pause-btn{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;z-index:9998;width:42px;height:42px;padding:0;border-radius:50%;border:2px solid rgba(0,0,0,.25);background:rgba(255,255,255,.88);color:#1b2740;font-size:1.05rem;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.22);touch-action:manipulation}#pause-btn:focus-visible{outline:3px solid #2f9e57;outline-offset:2px}@media (prefers-color-scheme:dark){#exit-dlg .card{background:#1e2536;color:#f1f5ff}#exit-dlg button:focus-visible{outline-color:#fff}#pause-btn{background:rgba(30,37,54,.88);color:#fff;border-color:rgba(255,255,255,.35)}}';
document.head.append(css);
function leave(){
const home='../index.html?back='+Date.now()+'#dashboard';
if(parent===window){location.href=home;return}
let ack=false;
addEventListener('message',e=>{if(e.data==='exit-ack')ack=true});
parent.postMessage('exit-game','*');
st(()=>{
if(ack)return;
try{top.location.href=home}catch(x){location.href=home}},700)}
function close(){
if(!box)return;
box.remove();
box=null;
paused=false;
document.documentElement.classList.remove('exit-paused');
const items=q;
q=[];
dispatchEvent(new Event('gameresume'));
items.forEach(f=>f())}
function show(html,onYes){
if(box)return;
paused=true;
document.documentElement.classList.add('exit-paused');
dispatchEvent(new Event('gamepause'));
box=document.createElement('div');
box.id='exit-dlg';
box.setAttribute('role','dialog');
box.setAttribute('aria-modal','true');
box.setAttribute('aria-labelledby','exit-q');
box.innerHTML=html;
box.querySelector('.no').onclick=close;
box.querySelector('.yes').onclick=onYes;
box.addEventListener('click',e=>{if(e.target===box)close()});
document.body.append(box);
box.querySelector('.no').focus()}
function ask(){
show('<div class="card"><p id="exit-q">Are you sure you want to exit the game?</p><div class="row"><button class="yes">Yes</button><button class="no">No</button></div></div>',()=>{box.remove();box=null;leave()})}
function askPause(){
show('<div class="card"><p id="exit-q">Paused ⏸</p><div class="row"><button class="no">▶ Continue</button><button class="yes">Exit</button></div></div>',()=>{box.remove();box=null;ask()})}
const pb=document.createElement('button');
pb.id='pause-btn';
pb.type='button';
pb.setAttribute('aria-label','Pause');
pb.textContent='⏸';
pb.addEventListener('click',askPause);
document.body.append(pb);
document.addEventListener('click',e=>{
const a=e.target.closest&&e.target.closest('#exit');
if(!a)return;
e.preventDefault();
e.stopPropagation();
ask()},true);
addEventListener('keydown',e=>{
if(!box){
if(e.key==='p'||e.key==='P')askPause();
return}
if(e.key==='Escape'||e.key==='p'||e.key==='P')close();
e.stopImmediatePropagation()},true)})();
