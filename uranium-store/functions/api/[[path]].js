// Uranium Store API: Discord login, orders (D1), Discord bot messages and buttons.
const API = 'https://discord.com/api/v10';
const enc = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const str = (v, n) => String(v ?? '').trim().slice(0, n);
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = t => Uint8Array.from(atob(t.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const getCookie = (req, n) => (req.headers.get('cookie') || '').split(/;\s*/).map(c => c.split('=')).find(c => c[0] === n)?.[1] || '';
const setCookie = (n, v, age) => `${n}=${v}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const dc = (env, method, path, body) => fetch(API + path, { method, headers: { authorization: 'Bot ' + env.DISCORD_BOT_TOKEN, 'content-type': 'application/json' }, body: body && JSON.stringify(body) });

const NEXT = { new: ['accepted', 'rejected'], accepted: ['done', 'rejected'] };
const LBL = { new: 'New', accepted: 'Accepted', done: 'Completed', rejected: 'Rejected' };
const COL = { new: 0xf06eb4, accepted: 0x3ba55d, done: 0x5865f2, rejected: 0xed4245 };

async function mac(env, data) {
  const k = await crypto.subtle.importKey('raw', enc.encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
async function sign(env, obj) { const p = b64u(enc.encode(JSON.stringify(obj))); return p + '.' + await mac(env, p); }
async function verify(env, tok) {
  const [p, sig] = (tok || '').split('.');
  if (!p || !sig || sig !== await mac(env, p)) return null;
  try { const o = JSON.parse(new TextDecoder().decode(unb64u(p))); return o.exp > now() ? o : null; } catch { return null; }
}

// Discord message for an order (embed + buttons depending on status)
function msg(o) {
  const b = (a, label, style) => ({ type: 2, style, label, custom_id: `o:${a}:${o.id}` });
  const row = o.status === 'new' ? [b('accepted', 'Accept', 3), b('rejected', 'Reject', 4)]
    : o.status === 'accepted' ? [b('done', 'Mark completed', 1), b('rejected', 'Reject', 4)] : [];
  return {
    embeds: [{
      title: `Order #${o.id} · ${o.product_name}`, color: COL[o.status], timestamp: new Date(o.created_at * 1000).toISOString(),
      fields: [
        { name: 'Customer', value: `<@${o.user_id}>`, inline: true },
        { name: 'Roblox', value: o.roblox, inline: true },
        { name: 'Status', value: LBL[o.status] + (o.handler ? ` · ${o.handler}` : ''), inline: true },
        { name: 'Details', value: o.details || '—' }]
    }],
    components: row.length ? [{ type: 1, components: row }] : [],
    allowed_mentions: { parse: [] }
  };
}
const notify = (env, o) => dc(env, 'POST', `/channels/${env.ORDERS_CHANNEL_ID}/messages`,
  { content: `<@${o.user_id}> your order #${o.id} is now **${LBL[o.status]}**.`, allowed_mentions: { users: [o.user_id] } });

async function setStatus(env, id, status, who) {
  const cur = await env.DB.prepare('SELECT status FROM orders WHERE id=?').bind(id).first();
  if (!cur || !NEXT[cur.status]?.includes(status)) return null;
  await env.DB.prepare('UPDATE orders SET status=?,handler=?,updated_at=? WHERE id=?').bind(status, who, now(), id).run();
  return env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(id).first();
}

export async function onRequest(ctx) {
  const { request: req, env } = ctx, url = new URL(req.url), m = req.method;
  const [route, id] = url.pathname.replace(/^\/api\/?/, '').split('/');
  const user = await verify(env, getCookie(req, 'sid'));
  if (m !== 'GET' && route !== 'discord' && req.headers.get('origin') !== url.origin) return json({ error: 'origin' }, 403);
  try {
    switch (route) {
      case 'login': {
        const state = crypto.randomUUID();
        const q = new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, redirect_uri: url.origin + '/api/callback', response_type: 'code', scope: 'identify', state });
        return new Response(null, { status: 302, headers: { location: 'https://discord.com/oauth2/authorize?' + q, 'set-cookie': setCookie('st', state, 600) } });
      }
      case 'callback': return callback(req, env, url);
      case 'logout': return new Response(null, { status: 302, headers: { location: '/', 'set-cookie': setCookie('sid', '', 0) } });
      case 'me': return json({ user: user && { id: user.id, name: user.name, avatar: user.avatar, staff: user.staff } });
      case 'products': return products(req, env, user, id);
      case 'orders': return orders(req, env, ctx, user, id);
      case 'discord': return interaction(req, env, ctx);
    }
  } catch (e) { console.error(e); return json({ error: 'server' }, 500); }
  return json({ error: 'not_found' }, 404);
}

async function callback(req, env, url) {
  const code = url.searchParams.get('code'), st = url.searchParams.get('state');
  if (!code || !st || st !== getCookie(req, 'st')) return new Response('Invalid login state, please try again.', { status: 400 });
  const tr = await fetch(API + '/oauth2/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, client_secret: env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: url.origin + '/api/callback' })
  });
  if (!tr.ok) return new Response('Discord login failed.', { status: 400 });
  const { access_token } = await tr.json();
  const u = await (await fetch(API + '/users/@me', { headers: { authorization: 'Bearer ' + access_token } })).json();
  const mr = await dc(env, 'GET', `/guilds/${env.GUILD_ID}/members/${u.id}`);
  const mem = mr.ok ? await mr.json() : null;
  const staff = !!mem?.roles?.includes(env.STAFF_ROLE_ID);
  const age = staff ? 43200 : 604800;
  const tok = await sign(env, { id: u.id, name: u.global_name || u.username, avatar: u.avatar, staff, exp: now() + age });
  const h = new Headers({ location: '/' });
  h.append('set-cookie', setCookie('sid', tok, age)); h.append('set-cookie', setCookie('st', '', 0));
  return new Response(null, { status: 302, headers: h });
}

async function products(req, env, user, id) {
  const staff = user?.staff;
  if (req.method === 'GET') {
    const all = staff && new URL(req.url).searchParams.get('all');
    const { results } = await env.DB.prepare(`SELECT id,name,description,price,image,active,sort FROM products ${all ? '' : 'WHERE active=1'} ORDER BY sort,id`).all();
    return json(results);
  }
  if (!staff) return json({ error: 'forbidden' }, 403);
  if (req.method === 'DELETE' && id) { await env.DB.prepare('DELETE FROM products WHERE id=?').bind(+id).run(); return json({ ok: 1 }); }
  if (req.method === 'POST') {
    const b = await req.json();
    const name = str(b.name, 80); if (!name) return json({ error: 'name' }, 400);
    const image = str(b.image, 500); if (image && !/^https:\/\//.test(image)) return json({ error: 'image' }, 400);
    const v = [name, str(b.description, 300), str(b.price, 30), image, b.active === false ? 0 : 1, parseInt(b.sort) || 0];
    if (b.id) await env.DB.prepare('UPDATE products SET name=?,description=?,price=?,image=?,active=?,sort=? WHERE id=?').bind(...v, +b.id).run();
    else await env.DB.prepare('INSERT INTO products(name,description,price,image,active,sort) VALUES(?,?,?,?,?,?)').bind(...v).run();
    return json({ ok: 1 });
  }
  return json({ error: 'method' }, 405);
}

async function orders(req, env, ctx, user, id) {
  if (!user) return json({ error: 'login' }, 401);
  if (req.method === 'GET') {
    if (user.staff) {
      const st = new URL(req.url).searchParams.get('status');
      const { results } = await env.DB.prepare('SELECT * FROM orders WHERE (?1 IS NULL OR status=?1) ORDER BY id DESC LIMIT 200').bind(st || null).all();
      return json(results);
    }
    const { results } = await env.DB.prepare('SELECT id,product_name,status,created_at FROM orders WHERE user_id=?1 ORDER BY id DESC LIMIT 50').bind(user.id).all();
    return json(results);
  }
  if (req.method === 'POST') {
    const b = await req.json();
    const roblox = str(b.roblox, 20);
    if (!/^[A-Za-z0-9_]{3,20}$/.test(roblox)) return json({ error: 'roblox' }, 400);
    const p = await env.DB.prepare('SELECT id,name FROM products WHERE id=? AND active=1').bind(+b.product_id).first();
    if (!p) return json({ error: 'product' }, 400);
    const open = await env.DB.prepare("SELECT COUNT(*) n FROM orders WHERE user_id=? AND status IN ('new','accepted')").bind(user.id).first();
    if (open.n >= 5) return json({ error: 'limit' }, 429);
    const t = now();
    const r = await env.DB.prepare('INSERT INTO orders(user_id,user_name,product_id,product_name,roblox,details,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(user.id, user.name, p.id, p.name, roblox, str(b.details, 500), t, t).run();
    const o = await env.DB.prepare('SELECT * FROM orders WHERE id=?').bind(r.meta.last_row_id).first();
    const m = await dc(env, 'POST', `/channels/${env.ORDERS_CHANNEL_ID}/messages`,
      { ...msg(o), content: `<@&${env.STAFF_ROLE_ID}> New order`, allowed_mentions: { roles: [env.STAFF_ROLE_ID] } });
    if (m.ok) await env.DB.prepare('UPDATE orders SET msg_id=? WHERE id=?').bind((await m.json()).id, o.id).run();
    return json({ id: o.id, discord: m.ok }, 201);
  }
  if (req.method === 'PATCH' && user.staff && id) {
    const { status } = await req.json();
    const o = await setStatus(env, +id, status, user.name);
    if (!o) return json({ error: 'transition' }, 409);
    if (o.msg_id) ctx.waitUntil(dc(env, 'PATCH', `/channels/${env.ORDERS_CHANNEL_ID}/messages/${o.msg_id}`, msg(o)));
    ctx.waitUntil(notify(env, o));
    return json({ ok: 1 });
  }
  return json({ error: 'forbidden' }, 403);
}

// Discord Interactions endpoint: buttons on the order messages
async function edVerify(pub, sig, data) {
  const hex = h => Uint8Array.from(h.match(/../g).map(x => parseInt(x, 16)));
  for (const alg of [{ name: 'Ed25519' }, { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' }]) {
    try {
      const k = await crypto.subtle.importKey('raw', hex(pub), alg, false, ['verify']);
      return await crypto.subtle.verify(alg.name, k, hex(sig), enc.encode(data));
    } catch { /* try next */ }
  }
  return false;
}
async function interaction(req, env, ctx) {
  const sig = req.headers.get('x-signature-ed25519'), ts = req.headers.get('x-signature-timestamp'), body = await req.text();
  if (!sig || !ts || !await edVerify(env.DISCORD_PUBLIC_KEY, sig, ts + body)) return new Response('bad signature', { status: 401 });
  const i = JSON.parse(body);
  if (i.type === 1) return json({ type: 1 });
  const eph = content => json({ type: 4, data: { content, flags: 64 } });
  if (i.type === 3 && i.data.custom_id?.startsWith('o:')) {
    const [, status, id] = i.data.custom_id.split(':');
    if (!i.member?.roles?.includes(env.STAFF_ROLE_ID)) return eph('Staff only.');
    const who = i.member.user.global_name || i.member.user.username;
    const o = await setStatus(env, +id, status, who);
    if (!o) return eph('This order was already handled.');
    ctx.waitUntil(notify(env, o));
    return json({ type: 7, data: msg(o) });
  }
  return eph('Unsupported action.');
}
