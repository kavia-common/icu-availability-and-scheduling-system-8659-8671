//
// PUBLIC_INTERFACE
// This helper centralizes the backend base URL. In development, set REACT_APP_API_BASE or rely on same-origin proxy.
//
export function apiBase(path: string) {
  const base = process.env.REACT_APP_API_BASE || "";
  // If base is set, ensure it does not end with a slash
  const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
  if (normalized) return `${normalized}${path}`;
  return path; // same-origin or dev proxy (/api/*)
}
