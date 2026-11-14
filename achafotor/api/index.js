import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
const normUrl = v => {
  let u = String(v || '').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (/^[a-z0-9]{15,25}$/i.test(u)) u = `https://${u}.supabase.co`;
  else if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  return u.replace(/\/(rest|auth)\/v1.*$/, '');
};
const ok = r => { if (r.error) throw new Error(r.error.message); return r.data; };

export default async function handler(req, res) {
  try {
    const miss = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ADMIN_PASSWORD'].filter(k => !process.env[k]);
    if (miss.length) return res.status(500).json({ error: 'Faltam variáveis de ambiente na Vercel: ' + miss.join(', ') + '. Adicione e faça Redeploy.' });
    const sb = createClient(normUrl(process.env.SUPABASE_URL), process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
    const b = req.body || {};
    let sent = ''; try { sent = decodeURIComponent(req.headers['x-admin'] || ''); } catch {}
    const admin = sent.trim() !== '' && sent.trim() === String(process.env.ADMIN_PASSWORD).trim();
    const need = () => { if (!admin) { res.status(401).json({ error: 'Senha inválida' }); return true; } };
    switch (b.action) {
      case 'events': {
        const ev = ok(await sb.from('events').select('*').order('date', { ascending: false }).order('id', { ascending: false }));
        await Promise.all(ev.map(async e => {
          const c = await sb.from('photos').select('id', { count: 'exact', head: true }).eq('event_id', e.id);
          e.n = c.count || 0;
          e.peek = e.slideshow ? ok(await sb.from('photos').select('thumb').eq('event_id', e.id).order('id', { ascending: false }).limit(6)).map(r => r.thumb) : [];
        }));
        if (!admin) ev.forEach(e => delete e.share_token);
        return res.json(ev);
      }
      case 'descs': return res.json(ok(await sb.from('photos').select('id,d:descs').eq('event_id', b.eventId)));
      case 'thumbs': return res.json(ok(await sb.from('photos').select('id,thumb').in('id', b.ids)));
      case 'photo': return res.json(ok(await sb.from('photos').select('full:full_img').eq('id', b.id).single()));
      case 'shared': {
        const t = String(b.token || '');
        const bad = () => res.status(404).json({ error: 'Link inválido ou desativado.' });
        if (t.length < 16) return bad();
        const e = await sb.from('events').select('id,name,date,organizer').eq('share_token', t).maybeSingle();
        if (e.error) throw new Error(e.error.message);
        if (!e.data) return bad();
        const ids = ok(await sb.from('photos').select('id').eq('event_id', e.data.id).order('id')).map(r => r.id);
        return res.json({ event: e.data, ids });
      }
      case 'share': {
        if (need()) return;
        const cur = ok(await sb.from('events').select('share_token').eq('id', b.id).single());
        let t = cur.share_token;
        if (!t) { t = randomUUID().replace(/-/g, ''); ok(await sb.from('events').update({ share_token: t }).eq('id', b.id)); }
        return res.json({ token: t });
      }
      case 'unshare': if (need()) return;
        ok(await sb.from('events').update({ share_token: null }).eq('id', b.id)); return res.json({ ok: true });
      case 'check': if (need()) return; return res.json({ ok: true });
      case 'createEvent': if (need()) return;
        ok(await sb.from('events').insert({ name: b.name, date: b.date, organizer: b.organizer, cover: b.cover, slideshow: !!b.slideshow }));
        return res.json({ ok: true });
      case 'addPhoto': if (need()) return;
        ok(await sb.from('photos').insert({ event_id: b.eventId, full_img: b.full, thumb: b.thumb, descs: b.descs || [] }));
        return res.json({ ok: true });
      case 'clearPhotos': if (need()) return;
        ok(await sb.from('photos').delete().eq('event_id', b.eventId)); return res.json({ ok: true });
      case 'deleteEvent': if (need()) return;
        ok(await sb.from('events').delete().eq('id', b.id)); return res.json({ ok: true });
    }
    res.status(400).json({ error: 'ação inválida' });
  } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
}
