// Thin fetch wrapper for /api. Errors carry `.code` (the API's error string) and `.status`.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api/' + path, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body && JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'error'), { code: data.error, status: res.status });
  return data;
}

let mePromise;
// Current user (or null), fetched once per page.
export const getMe = () => (mePromise ??= api('me').then(d => d.user).catch(() => null));
