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

// Uploads one image (staff only) and returns its URL, e.g. /api/uploads/<name>.png
export async function upload(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/uploads', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'error'), { code: data.error, status: res.status });
  return data.url;
}
