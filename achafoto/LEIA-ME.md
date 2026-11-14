# AchaFot (by PASCOM)
1. No Supabase, abra o SQL Editor e rode o conteúdo de `schema.sql`.
2. Em Project Settings > API, copie a Project URL e a chave `service_role`.
3. Suba na Vercel com SUPABASE_URL, SUPABASE_SERVICE_KEY e ADMIN_PASSWORD (veja .env.example).
Rotas: / · /eventos · /evento/:id · /admin · /admin/descarregar
Fotos carregadas de navegadores diferentes somam no mesmo evento. A selfie de quem busca não é enviada nem guardada.

## Páginas (arquivos separados)
index.html → `/` · eventos.html → `/eventos` · evento.html → `/eventos/nome-do-evento` · admin.html → `/admin` · descarregar.html → `/admin/descarregar`
As URLs limpas vêm do vercel.json. Para testar no PC use `npx vercel dev` (o Live Server não tem /api nem essas rotas).
