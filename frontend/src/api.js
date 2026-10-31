export async function api(path, { method = 'GET', body } = {}) {
  const t = localStorage.getItem('token');
  const r = await fetch('/api' + path, {
    method, body: body && JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || (r.status === 401 ? 'Please log in' : 'Error ' + r.status));
  return d;
}
