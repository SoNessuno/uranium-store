// Forwards every /api/* request to the API on the VPS, so the browser only ever talks to this site
// (same origin: no CORS, first-party cookies). The shared secret proves the request came from here.
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set('x-proxy-secret', env.PROXY_SECRET);
  headers.set('x-real-ip', request.headers.get('cf-connecting-ip') || '');
  headers.delete('host');
  headers.delete('accept-encoding');
  const upstream = await fetch(env.API_ORIGIN.replace(/\/$/, '') + url.pathname + url.search, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  }).catch(() => null);
  if (!upstream) return new Response(JSON.stringify({ error: 'unavailable' }), { status: 502, headers: { 'content-type': 'application/json' } });
  return new Response(upstream.body, { status: upstream.status, headers: upstream.headers });
}
