importScripts('games.js');
const OS=typeof ONESIGNAL_APP_ID!=='undefined'&&!!ONESIGNAL_APP_ID;
if(OS){try{importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js')}catch(e){}}
const CACHE='game-hub-v'+SITE_VERSION;
const FILES=['./','index.html','games.js','sound.js','exit.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',...GAMES.map(g=>g.file)];
self.addEventListener('install',e=>{
e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>{if(!self.registration.active)self.skipWaiting()}))});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',e=>{
e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
if(e.request.method!=='GET')return;
e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(res=>{
if(res.ok&&new URL(e.request.url).origin===location.origin){
const copy=res.clone();
caches.open(CACHE).then(c=>c.put(e.request,copy))}
return res})))});
async function checkUpdate(){
try{
await self.registration.update().catch(()=>{});
const r=await fetch('games.js',{cache:'no-store'});
const m=(await r.text()).match(/SITE_VERSION\s*=\s*(\d+)/);
if(m&&+m[1]>SITE_VERSION)await self.registration.showNotification('New games are ready! 🎮',{body:'Open Play Champs to update.',icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'play-champs-update'})}
catch(x){}}
if(!OS){
self.addEventListener('periodicsync',e=>{if(e.tag==='check-update')e.waitUntil(checkUpdate())});
self.addEventListener('notificationclick',e=>{
e.notification.close();
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow('./index.html')))})}
