const $=s=>document.querySelector(s),app=$('#app');
const api=async(action,data={})=>{const r=await fetch('/api',{method:'POST',headers:{'content-type':'application/json','x-admin':sessionStorage.pw||''},body:JSON.stringify({action,...data})});let j;try{j=await r.json()}catch{throw new Error('API indisponível. Rode com "npx vercel dev" ou publique na Vercel.')}if(!r.ok)throw new Error(j.error);return j};
const fmt=d=>d?d.split('-').reverse().join('/'):'';
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'evento';
const slugs=ev=>{const seen={};return ev.map(e=>{let s=slug(e.name);if(seen[s])s+='-'+e.id;seen[s]=1;e.slug=s;return e})};
const nav=()=>`<div class="top"><a class="logo" href="/">PASCOM · Fotos</a><a class="tag" href="/eventos">Eventos</a></div>`;
const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src});
const readURL=f=>new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f)});
async function resize(file,max,q){const i=await loadImg(await readURL(file));const s=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
let modelsP;const models=()=>modelsP||(modelsP=(async()=>{const u='https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/';await Promise.all([faceapi.nets.ssdMobilenetv1.loadFromUri(u),faceapi.nets.faceLandmark68Net.loadFromUri(u),faceapi.nets.faceRecognitionNet.loadFromUri(u)])})());
const faces=async img=>{await models();return await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()};
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const fail=e=>{app.innerHTML=nav()+`<div class="page"><h2>Ops</h2><p class="muted">${esc(e.message||e)}</p></div>`};

const Pages={
async home(){let ev=[];try{ev=await api('events')}catch{}
 const imgs=ev.flatMap(e=>[e.cover,...e.peek]).filter(Boolean);
 app.innerHTML=nav()+`<div class="wall">${Array.from({length:9},(_,i)=>`<div style="${imgs[i]?`background-image:url(${imgs[i]})`:''}"></div>`).join('')}</div>
 <div class="hero" style="margin-top:-90px"><span class="tag">PASCOM</span><h1>Encontre suas fotos <span>tiradas pela PASCOM com facilidade</span></h1>
 <p>Escolha o evento, envie uma foto do seu rosto e receba todas as suas fotos.</p><a class="pill" href="/eventos">Encontrar minhas fotos →</a></div>`},

async eventos(){app.innerHTML=nav()+'<div class="page"><h2>Eventos</h2><div class="grid" id="g">Carregando…</div></div>';
 try{const ev=slugs(await api('events'));
 $('#g').innerHTML=ev.length?ev.map(e=>`<a class="card" href="/eventos/${e.slug}" style="text-decoration:none;color:inherit;display:block"><div class="im" id="im${e.id}" style="background-image:url(${e.cover||''})"></div><div class="tx"><b>${esc(e.name)}</b><br><small>${fmt(e.date)} · ${esc(e.organizer)} · ${e.n} fotos</small></div></a>`).join(''):'<p class="muted">Nenhum evento ainda.</p>';
 ev.filter(e=>e.slideshow&&e.peek.length).forEach(e=>{let k=0;const all=[e.cover,...e.peek].filter(Boolean);setInterval(()=>{k=(k+1)%all.length;const el=$('#im'+e.id);if(el)el.style.backgroundImage=`url(${all[k]})`},1800)})}catch(e){fail(e)}},

async evento(){try{const s=decodeURIComponent(location.pathname.replace(/\/$/,'').split('/').pop());const ev=slugs(await api('events')).find(e=>e.slug===s);
 if(!ev){location.href='/eventos';return}const id=ev.id;
 app.innerHTML=nav()+`<div class="page"><p><a href="/eventos" class="muted">← Eventos</a></p><h2>${esc(ev.name)}</h2><p class="muted">${fmt(ev.date)} · ${esc(ev.organizer)}</p>
 <div class="box"><b>Encontre suas fotos</b><p class="muted">Tire uma selfie ou envie uma foto do seu rosto. Ela não é guardada.</p>
 <div class="row"><label class="pill">Tirar foto<input type="file" accept="image/*" capture="user" hidden id="f1"></label><label class="pill light">Enviar foto<input type="file" accept="image/*" hidden id="f2"></label></div><div id="st" class="muted"></div></div><div id="res"></div></div>`;
 const run=async e=>{const f=e.target.files[0];if(!f)return;const st=$('#st');try{st.textContent='Carregando reconhecimento facial…';
  const img=await loadImg(await resize(f,800,.9));const me=await faces(img);if(!me.length){st.textContent='Não encontrei um rosto nessa foto. Tente outra, com boa luz.';return}
  st.textContent='Procurando suas fotos…';const mine=me[0].descriptor,all=await api('descs',{eventId:id});
  const ids=all.filter(p=>(p.d||[]).some(d=>dist(mine,d)<0.55)).map(p=>p.id);
  if(!ids.length){st.textContent='Nenhuma foto sua foi encontrada neste evento (ainda).';$('#res').innerHTML='';return}
  st.textContent=`${ids.length} foto(s) encontrada(s).`;const th=await api('thumbs',{ids});
  $('#res').innerHTML=`<div class="row"><button class="pill" id="all">Baixar todas</button></div><div class="grid">${th.map(t=>`<div class="photo" style="background-image:url(${t.thumb})"><button onclick="dl(${t.id})">Baixar</button></div>`).join('')}</div>`;
  $('#all').onclick=async()=>{for(const t of th){await dl(t.id);await new Promise(r=>setTimeout(r,400))}}}catch(e){st.textContent='Erro: '+e.message}};
 $('#f1').onchange=run;$('#f2').onchange=run}catch(e){fail(e)}},

async admin(){if(!await gate())return;try{const ev=await api('events');
 app.innerHTML=nav()+`<div class="page"><h2>Admin</h2><div class="row"><a class="pill" href="/admin/descarregar">Descarregar fotos →</a></div>
 <div class="box"><b>Novo evento</b><br><br><label>Dia</label><input type="date" id="d"><label>Nome</label><input id="n"><label>Realizador</label><input id="o">
 <label>Foto de destaque</label><input type="file" accept="image/*" id="c"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="s" style="width:auto;margin:0"> Ativar fotos passando no destaque</label><br>
 <button class="pill" id="ok">Criar evento</button></div><h2 style="font-size:24px">Eventos</h2>
 ${ev.map(e=>`<div class="box row" style="justify-content:space-between;align-items:center;margin:0 0 10px"><span><b>${esc(e.name)}</b> <small class="muted">${fmt(e.date)} · ${e.n} fotos</small></span><button class="pill light" onclick="delEv(${e.id})">Excluir evento</button></div>`).join('')}</div>`;
 $('#ok').onclick=async()=>{const f=$('#c').files[0];if(!$('#n').value||!$('#d').value)return alert('Preencha dia e nome');
  await api('createEvent',{name:$('#n').value,date:$('#d').value,organizer:$('#o').value,cover:f?await resize(f,900,.8):'',slideshow:$('#s').checked});Pages.admin()}}catch(e){fail(e)}},

async descarregar(){if(!await gate())return;try{const ev=await api('events');
 app.innerHTML=nav()+`<div class="page"><p><a href="/admin" class="muted">← Admin</a></p><h2>Descarregar fotos</h2><div class="box"><label>Evento</label><select id="e">${ev.map(e=>`<option value="${e.id}">${esc(e.name)} (${e.n} fotos)</option>`).join('')}</select>
 <label>Fotos (várias)</label><input type="file" accept="image/*" multiple id="fs"><div class="row"><button class="pill" id="up">Carregar fotos</button><button class="pill light" id="clr">Excluir todas as fotos do evento</button></div><div id="st" class="muted"></div></div></div>`;
 $('#up').onclick=async()=>{const fs=[...$('#fs').files],eventId=+$('#e').value;if(!fs.length)return;const st=$('#st');st.textContent='Carregando reconhecimento facial…';await models();let i=0;
  for(const f of fs){i++;st.textContent=`Enviando ${i}/${fs.length}…`;try{const full=await resize(f,1600,.82),thumb=await resize(f,260,.6),img=await loadImg(full),fc=await faces(img);
   await api('addPhoto',{eventId,full,thumb,descs:fc.map(x=>Array.from(x.descriptor).map(v=>+v.toFixed(4)))})}catch(e){st.textContent='Erro: '+e.message;return}}
  st.textContent='Pronto! Fotos somadas ao evento.';setTimeout(Pages.descarregar,1200)};
 $('#clr').onclick=async()=>{if(confirm('Excluir TODAS as fotos deste evento?')){await api('clearPhotos',{eventId:+$('#e').value});Pages.descarregar()}}}catch(e){fail(e)}}
};
async function dl(id){const {full}=await api('photo',{id});const a=document.createElement('a');a.href=full;a.download=`pascom-${id}.jpg`;a.click()}
async function delEv(id){if(confirm('Excluir evento e todas as fotos?')){await api('deleteEvent',{id});Pages.admin()}}
async function gate(){if(sessionStorage.pw)try{await api('check');return true}catch(e){if(!/Senha/.test(e.message)){fail(e);return false}}
 const pw=prompt('Senha do admin');if(!pw){location.href='/';return false}sessionStorage.pw=pw;try{await api('check');return true}catch(e){sessionStorage.pw='';alert(e.message);location.href='/';return false}}
