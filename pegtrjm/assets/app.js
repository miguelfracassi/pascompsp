const $=s=>document.querySelector(s),app=$('#app');
const P={camera:'<path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',scan:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="11" r="2.5"/><path d="M8 17c.6-2 2-3 4-3s3.4 1 4 3"/>',download:'<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',upload:'<path d="M12 16V5m0 0-4 4m4-4 4 4M5 20h14"/>',shield:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',zap:'<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z"/>',calendar:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 8"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',arrow:'<path d="M5 12h14m0 0-5-5m5 5-5 5"/>',sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/>',users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5 6.5-5s5.7 1.5 6.5 5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 15c2 .5 3.2 2 3.5 5"/>',phone:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',trash:'<path d="M4 7h16M10 3h4M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 5 5 9-10"/>',chevron:'<path d="m6 9 6 6 6-6"/>',pin:'<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const logo='<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#0b0b0f"/><circle cx="16" cy="16" r="6.2" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="16" cy="16" r="2.4" fill="#c45bff"/></svg>';
const api=async(action,data={})=>{const r=await fetch('/api',{method:'POST',headers:{'content-type':'application/json','x-admin':encodeURIComponent(sessionStorage.pw||'')},body:JSON.stringify({action,...data})});let j;try{j=await r.json()}catch{throw new Error(`API indisponível (HTTP ${r.status}). `+(r.status===404?'A pasta api/ não foi encontrada: confira se package.json e api/ estão na raiz do projeto e rode com "npx vercel dev" ou publique na Vercel.':'A função falhou no servidor: veja Deployments → Logs na Vercel.'))}if(!r.ok)throw new Error(j.error);return j};
const fmt=d=>d?d.split('-').reverse().join('/'):'';
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'evento';
const slugs=ev=>{const seen={};return ev.map(e=>{let s=slug(e.name);if(seen[s])s+='-'+e.id;seen[s]=1;e.slug=s;return e})};
const nav=()=>`<header class="nav"><div class="nav-in"><a class="brand" href="/">${logo}<span>AchaFot<em>by PASCOM</em></span></a><nav class="links"><a href="/#como">Como funciona</a><a href="/eventos">Eventos</a><a href="/#faq">Perguntas</a></nav><a class="btn sm" href="/eventos">Encontrar fotos ${ic('arrow')}</a></div></header>`;
const foot=()=>`<footer class="foot"><a class="brand" href="/">${logo}<span>AchaFot<em>by PASCOM</em></span></a><nav><a href="/eventos">Eventos</a><a href="/#faq">Perguntas</a></nav><span>Feito com carinho pela PASCOM</span></footer>`;
const card=e=>`<a class="ev" href="/eventos/${e.slug}"><div class="im" id="im${e.id}" style="${e.cover?`background-image:url(${e.cover})`:''}"><span class="dt">${ic('calendar')}${fmt(e.date)}</span></div><div class="tx"><b>${esc(e.name)}</b><small><span>${ic('user')}${esc(e.organizer)}</span><span>${ic('image')}${e.n} fotos</span></small></div></a>`;
function fx(){const io=new IntersectionObserver(es=>es.forEach(x=>{if(!x.isIntersecting)return;x.target.classList.add('in');x.target.querySelectorAll('.num').forEach(n=>{const t=+n.dataset.n,s=performance.now();const f=now=>{const p=Math.min(1,(now-s)/1200);n.textContent=Math.round(t*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)});io.unobserve(x.target)}),{threshold:.15});document.querySelectorAll('.reveal').forEach(e=>io.observe(e))}
function slideshow(ev){ev.filter(e=>e.slideshow&&e.peek.length).forEach(e=>{let k=0;const all=[e.cover,...e.peek].filter(Boolean);setInterval(()=>{k=(k+1)%all.length;const el=$('#im'+e.id);if(el)el.style.backgroundImage=`url(${all[k]})`},1800)})}
const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src});
const readURL=f=>new Promise(r=>{const x=new FileReader();x.onload=()=>r(x.result);x.readAsDataURL(f)});
async function resize(file,max,q){const i=await loadImg(await readURL(file));const s=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q)}
let modelsP;const models=()=>modelsP||(modelsP=(async()=>{const u='https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model/';await Promise.all([faceapi.nets.ssdMobilenetv1.loadFromUri(u),faceapi.nets.faceLandmark68Net.loadFromUri(u),faceapi.nets.faceRecognitionNet.loadFromUri(u)])})());
const faces=async img=>{await models();return await faceapi.detectAllFaces(img,new faceapi.SsdMobilenetv1Options({minConfidence:.3})).withFaceLandmarks().withFaceDescriptors()};
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
async function facesDeep(img){const all=[...await faces(img)],W=img.width,H=img.height,w=W*.6,h=H*.6;
 for(const[x,y]of[[0,0],[.4,0],[0,.4],[.4,.4]]){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,x*W,y*H,w,h,0,0,w,h);
  for(const f of await faces(c))if(!all.some(a=>dist(a.descriptor,f.descriptor)<.3))all.push(f)}return all}
const fail=e=>{app.innerHTML=nav()+`<div class="page"><h2>Ops</h2><p class="muted">${esc(e.message||e)}</p></div>`+foot()};

const Pages={
async home(){let ev=[];try{ev=slugs(await api('events'))}catch{}
 const imgs=ev.flatMap(e=>[e.cover,...e.peek]).filter(Boolean),tot=ev.reduce((a,e)=>a+e.n,0);
 const col=i=>[0,1].map(j=>{const u=imgs[(i*2+j)%Math.max(imgs.length,1)];return imgs.length?`<div class="ph" style="background-image:url(${u})"></div>`:`<div class="ph">${ic('image')}</div>`}).join('');
 const tags=['Missas','Batizados','Crismas','Casamentos','Retiros','Procissões','Festas','Encontros','Formações','Celebrações'];
 const mq=tags.map(t=>`<span>${t}${ic('sparkle')}</span>`).join('');
 const step=(n,i,t,d)=>`<div class="card hov reveal"><span class="num-s">0${n}</span><div class="ico">${ic(i)}</div><h3>${t}</h3><p>${d}</p></div>`;
 const faqs=[['Preciso fazer cadastro?','Não. Basta escolher o evento, enviar ou tirar uma selfie e ver suas fotos.'],['Minha selfie fica guardada?','Não. O reconhecimento acontece no seu aparelho e a selfie nunca é enviada nem salva em lugar nenhum.'],['E se eu não aparecer em nenhuma foto?','Tente uma selfie de frente e com boa luz. Se mesmo assim nada aparecer, as fotos do evento podem ainda não ter sido publicadas.'],['Posso baixar todas de uma vez?','Pode. Depois da busca, use o botão "Baixar todas" ou baixe uma por uma.'],['Funciona no celular?','Sim, e dá para tirar a selfie direto pela câmera do aparelho.']];
 app.innerHTML=nav()+`<section class="hero"><div class="blob b1"></div><div class="blob b2"></div>
 <span class="chip">${ic('sparkle')} Reconhecimento facial direto no seu navegador</span>
 <h1>Suas melhores fotos, <span class="grad">achadas em segundos.</span></h1>
 <p class="lead">Encontre suas fotos tiradas pela PASCOM com facilidade. Escolha o evento, mande uma selfie e baixe tudo.</p>
 <div class="cta"><a class="btn" href="/eventos">Encontrar minhas fotos ${ic('arrow')}</a><a class="btn ghost" href="#como">Ver como funciona</a></div>
 <div class="checks"><span>${ic('check')}Sem cadastro</span><span>${ic('check')}Selfie não é guardada</span><span>${ic('check')}Download em alta</span></div>
 <div class="wall">${[0,1,2,3,4,5,6].map(i=>`<div class="col">${col(i)}</div>`).join('')}</div></section>
 <div class="mq"><div class="mq-t">${mq}${mq}</div></div>
 <section class="sec"><div class="stats reveal" style="margin-top:0">
  <div class="stat"><b class="num" data-n="${ev.length}">0</b><span>eventos publicados</span></div>
  <div class="stat"><b class="num" data-n="${tot}">0</b><span>fotos para encontrar</span></div>
  <div class="stat"><b class="num" data-n="0">0</b><span>selfies guardadas</span></div>
  <div class="stat"><b>1 clique</b><span>para baixar tudo</span></div></div></section>
 <section class="sec head" id="como"><span class="chip">${ic('zap')} Simples assim</span><h2>Três passos e suas fotos<br>estão no bolso.</h2><p class="sub">Sem filas, sem pedir foto por mensagem, sem procurar em álbum gigante.</p>
  <div class="steps" style="text-align:left">${step(1,'calendar','Escolha o evento','Veja a lista de eventos da paróquia e abra aquele em que você esteve.')}${step(2,'camera','Mande uma selfie','Tire uma foto na hora ou envie uma da galeria. Rápido, e ela não é guardada.')}${step(3,'download','Baixe suas fotos','Encontramos todas em que você aparece. Baixe uma ou todas de uma vez.')}</div></section>
 <section class="sec head"><span class="chip">${ic('sparkle')} Por dentro</span><h2>Feito para ser rápido,<br>bonito e seguro.</h2>
  <div class="bento" style="text-align:left">
   <div class="card hov w2 reveal"><div class="scan">${ic('user')}<i></i></div><h3>Busca por rosto</h3><p>A tecnologia compara seu rosto com todas as fotos do evento, mesmo as de grupo, e mostra só as suas.</p></div>
   <div class="card hov reveal"><div class="ico">${ic('lock')}</div><h3>Privacidade de verdade</h3><p>A comparação acontece no seu aparelho. Sua selfie nunca vai para um servidor.</p></div>
   <div class="card hov reveal"><div class="ico">${ic('phone')}</div><h3>Pensado para o celular</h3><p>Abra o link, toque em tirar foto e pronto.</p></div>
   <div class="card hov reveal"><div class="ico">${ic('zap')}</div><h3>Resultado na hora</h3><p>Sem esperar a equipe separar e enviar as fotos.</p></div>
   <div class="card hov reveal"><div class="ico">${ic('users')}</div><h3>Para a família toda</h3><p>Pais, amigos e grupos acham suas fotos sem depender de ninguém.</p></div>
  </div></section>
 ${ev.length?`<section class="sec"><div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap"><div><span class="chip">${ic('image')} Recentes</span><h2 style="margin-bottom:0">Últimos eventos</h2></div><a class="btn ghost" href="/eventos">Ver todos ${ic('arrow')}</a></div><div class="grid reveal" style="margin-top:28px">${ev.slice(0,3).map(card).join('')}</div></section>`:''}
 <section class="dark reveal"><span class="chip" style="background:#ffffff14;border-color:#ffffff22;color:#fff">${ic('shield')} Privacidade</span><h2 style="margin-top:18px">Sua selfie não sai do seu celular.</h2><p>Nada de cadastro, nada de guardar seu rosto. Você usa, vê suas fotos e pronto.</p>
  <div class="dk"><div>${ic('lock')}<b>Processado no aparelho</b><span>O reconhecimento roda no seu navegador.</span></div><div>${ic('trash')}<b>Nada fica salvo</b><span>A selfie é descartada assim que a busca termina.</span></div><div>${ic('shield')}<b>Acesso controlado</b><span>Só a equipe da PASCOM publica e apaga fotos.</span></div></div></section>
 <section class="sec head" id="faq"><span class="chip">${ic('search')} Dúvidas</span><h2>Perguntas frequentes</h2>
  <div class="faq" style="text-align:left">${faqs.map(([q,a])=>`<details class="reveal"><summary>${q}${ic('chevron')}</summary><p>${a}</p></details>`).join('')}</div></section>
 <section class="final reveal"><h2>Pronto para achar suas fotos?</h2><p>Leva menos de um minuto.</p><a class="btn light" href="/eventos">Encontrar minhas fotos ${ic('arrow')}</a></section>`+foot();
 fx()},

async eventos(){app.innerHTML=nav()+`<div class="page"><span class="chip">${ic('calendar')} Eventos</span><h2>Escolha o seu evento</h2><div class="grid" id="g"><p class="muted">Carregando…</p></div></div>`+foot();
 try{const ev=slugs(await api('events'));$('#g').innerHTML=ev.length?ev.map(card).join(''):'<p class="muted">Nenhum evento ainda.</p>';slideshow(ev)}catch(e){fail(e)}},

async evento(){try{const s=decodeURIComponent(location.pathname.replace(/\/$/,'').split('/').pop());const ev=slugs(await api('events')).find(e=>e.slug===s);
 if(!ev){location.href='/eventos';return}const id=ev.id;
 app.innerHTML=nav()+`<div class="page"><a class="back" href="/eventos">${ic('arrow')} Eventos</a><h2 style="margin-top:14px">${esc(ev.name)}</h2>
 <div class="meta"><span class="chip">${ic('calendar')}${fmt(ev.date)}</span><span class="chip">${ic('user')}${esc(ev.organizer)}</span><span class="chip">${ic('image')}${ev.n} fotos</span></div>
 <div class="drop"><div class="ico">${ic('scan')}</div><h3>Encontre suas fotos</h3><p class="muted" style="margin:0">Tire uma selfie ou envie uma foto do seu rosto. Ela não é guardada.</p>
 <div class="row"><label class="btn">${ic('camera')} Tirar foto<input type="file" accept="image/*" capture="user" id="f1"></label><label class="btn ghost">${ic('upload')} Enviar foto<input type="file" accept="image/*" id="f2"></label></div><div id="st" class="status"></div></div><div id="res"></div></div>`+foot();
 const run=async e=>{const f=e.target.files[0];if(!f)return;const st=$('#st');try{st.textContent='Carregando reconhecimento facial…';
  const img=await loadImg(await resize(f,800,.9));let me=await faces(img);if(!me.length)me=await facesDeep(img);me.sort((a,b)=>b.detection.box.area-a.detection.box.area);if(!me.length){st.textContent='Não encontrei um rosto nessa foto. Tente outra, de frente e com boa luz.';return}
  st.textContent='Procurando suas fotos…';const mine=me[0].descriptor,all=await api('descs',{eventId:id});
  const LIM=0.6,ids=all.filter(p=>(p.d||[]).some(d=>dist(mine,d)<LIM)).map(p=>p.id);const best=Math.min(99,...all.flatMap(p=>(p.d||[]).map(d=>dist(mine,d))));const comRosto=all.filter(p=>(p.d||[]).length).length;
  if(!ids.length){st.textContent=`Nenhuma foto sua foi encontrada. Fotos do evento: ${all.length} (${comRosto} com rosto registrado). `+(best<99?`Semelhança mais próxima: ${best.toFixed(2)} (precisa ser menor que ${LIM}).`:'Nenhuma foto do evento tem rosto registrado.');$('#res').innerHTML='';return}
  st.textContent=`${ids.length} foto(s) encontrada(s).`;const th=await api('thumbs',{ids});
  $('#res').innerHTML=`<div class="row"><button class="btn" id="all">${ic('download')} Baixar todas</button></div><div class="pgrid">${th.map(t=>`<div class="photo" style="background-image:url(${t.thumb})"><button onclick="dl(${t.id})">${ic('download')} Baixar</button></div>`).join('')}</div>`;
  $('#all').onclick=async()=>{for(const t of th){await dl(t.id);await new Promise(r=>setTimeout(r,400))}}}catch(e){st.textContent='Erro: '+e.message}};
 $('#f1').onchange=run;$('#f2').onchange=run}catch(e){fail(e)}},

async admin(){if(!await gate())return;try{const ev=await api('events');
 app.innerHTML=nav()+`<div class="page"><span class="chip">${ic('lock')} Admin</span><h2>Painel da PASCOM</h2><div class="row" style="margin-top:0"><a class="btn" href="/admin/descarregar">${ic('upload')} Descarregar fotos</a></div>
 <div class="card" style="margin:20px 0 34px"><h3 style="margin-bottom:16px">Novo evento</h3><label class="f">Dia</label><input type="date" id="d"><label class="f">Nome</label><input id="n"><label class="f">Realizador</label><input id="o">
 <label class="f">Foto de destaque</label><input type="file" accept="image/*" id="c"><label class="f" style="display:flex;gap:10px;align-items:center;margin-bottom:18px"><input type="checkbox" id="s" style="width:auto;margin:0"> Ativar fotos passando no destaque</label>
 <button class="btn" id="ok">${ic('plus')} Criar evento</button></div><h3 style="font-size:22px;letter-spacing:-.02em">Eventos</h3>
 ${ev.map(e=>`<div class="er"><span><b>${esc(e.name)}</b> <small class="muted">${fmt(e.date)} · ${e.n} fotos</small></span><button class="btn ghost sm" onclick="delEv(${e.id})">${ic('trash')} Excluir</button></div>`).join('')||'<p class="muted">Nenhum evento ainda.</p>'}</div>`+foot();
 $('#ok').onclick=async()=>{const f=$('#c').files[0];if(!$('#n').value||!$('#d').value)return alert('Preencha dia e nome');
  await api('createEvent',{name:$('#n').value,date:$('#d').value,organizer:$('#o').value,cover:f?await resize(f,900,.8):'',slideshow:$('#s').checked});Pages.admin()}}catch(e){fail(e)}},

async descarregar(){if(!await gate())return;try{const ev=await api('events');
 app.innerHTML=nav()+`<div class="page"><a class="back" href="/admin">${ic('arrow')} Admin</a><h2 style="margin-top:14px">Descarregar fotos</h2><div class="card"><label class="f">Evento</label><select id="e">${ev.map(e=>`<option value="${e.id}">${esc(e.name)} (${e.n} fotos)</option>`).join('')}</select>
 <label class="f">Fotos (várias)</label><input type="file" accept="image/*" multiple id="fs"><div class="row"><button class="btn" id="up">${ic('upload')} Carregar fotos</button><button class="btn ghost" id="clr">${ic('trash')} Excluir todas as fotos do evento</button></div><div id="st" class="status"></div></div></div>`+foot();
 $('#up').onclick=async()=>{const fs=[...$('#fs').files],eventId=+$('#e').value;if(!fs.length)return;const st=$('#st');st.textContent='Carregando reconhecimento facial…';await models();let i=0,semRosto=0;
  for(const f of fs){i++;st.textContent=`Enviando ${i}/${fs.length}…`;try{const full=await resize(f,1600,.82),thumb=await resize(f,260,.6),img=await loadImg(full),fc=await facesDeep(img);if(!fc.length)semRosto++;
   await api('addPhoto',{eventId,full,thumb,descs:fc.map(x=>Array.from(x.descriptor).map(v=>+v.toFixed(4)))})}catch(e){st.textContent='Erro: '+e.message;return}}
  st.textContent='Pronto! Fotos somadas ao evento.'+(semRosto?` (${semRosto} sem rosto detectado)`:'');setTimeout(Pages.descarregar,2500)};
 $('#clr').onclick=async()=>{if(confirm('Excluir TODAS as fotos deste evento?')){await api('clearPhotos',{eventId:+$('#e').value});Pages.descarregar()}}}catch(e){fail(e)}}
};
async function dl(id){const {full}=await api('photo',{id});const a=document.createElement('a');a.href=full;a.download=`pascom-${id}.jpg`;a.click()}
async function delEv(id){if(confirm('Excluir evento e todas as fotos?')){await api('deleteEvent',{id});Pages.admin()}}
async function gate(){
 if(sessionStorage.pw){try{await api('check');return true}catch(e){if(!/Senha/.test(e.message)){fail(e);return false}sessionStorage.pw=''}}
 app.innerHTML=nav()+`<div class="page" style="max-width:440px"><span class="chip">${ic('lock')} Área restrita</span><h2>Entrar no admin</h2><div class="card"><label class="f">Senha</label><input type="password" id="pw" autofocus><button class="btn" id="go" style="width:100%">Entrar ${ic('arrow')}</button><p class="status" id="msg"></p></div></div>`;
 return new Promise(res=>{const t=async()=>{$('#msg').textContent='Verificando…';sessionStorage.pw=$('#pw').value.trim();try{await api('check');res(true)}catch(e){sessionStorage.pw='';$('#msg').textContent=e.message}};$('#go').onclick=t;$('#pw').onkeydown=e=>{if(e.key==='Enter')t()}})}
