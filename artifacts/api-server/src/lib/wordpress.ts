const WP_URL = (process.env.WP_SITE_URL ?? "").replace(/\/$/, "");
const WP_USER = process.env.WP_USERNAME ?? "";
const WP_PASS = (process.env.WP_APP_PASSWORD ?? "").replace(/\s/g, "");

function authHeader(): string {
  const token = Buffer.from(`${WP_USER}:${WP_PASS}`).toString("base64");
  return `Basic ${token}`;
}

export async function wpFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${WP_URL}/wp-json/wp/v2${path}`;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(options.headers ?? {}),
    },
  });
}

export async function wpGet(path: string): Promise<unknown> {
  const res = await wpFetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function wpPost(path: string, body: unknown): Promise<unknown> {
  const res = await wpFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function wpPatch(path: string, body: unknown): Promise<unknown> {
  const res = await wpFetch(path, {
    method: "POST", // WordPress REST API uses POST with _method override or just POST for updates
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function wpDelete(path: string): Promise<unknown> {
  const res = await wpFetch(path, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return {};
  return res.json();
}

export async function wpGetSettings(): Promise<unknown> {
  const url = `${WP_URL}/wp-json/wp/v2/settings`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress settings error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function wpUpdateSettings(body: unknown): Promise<unknown> {
  const url = `${WP_URL}/wp-json/wp/v2/settings`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WordPress settings error ${res.status}: ${text}`);
  }
  return res.json();
}
