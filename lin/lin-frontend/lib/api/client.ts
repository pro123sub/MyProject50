const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/';

export type ApiError = {
  status: number;
  message: string;
  body?: any;
};

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: body && body.message ? body.message : res.statusText,
      body,
    };
    throw err;
  }

  return body;
}

export function apiUrl(path: string) {
  // normalize so we never end up with double slashes
  const cleaned = path.replace(/^\//, '');
  return BASE.endsWith('/') ? `${BASE}${cleaned}` : `${BASE}/${cleaned}`;
}

export async function get(path: string, token?: string) {
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetchJson(apiUrl(path), { method: 'GET', headers });
}

export async function post(path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetchJson(apiUrl(path), { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined });
}

export default { get, post, apiUrl };