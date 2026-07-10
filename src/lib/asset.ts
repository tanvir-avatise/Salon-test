/**
 * Resolve a public asset path against Vite's base URL so `/images/…` assets
 * work both at the site root (dev) and under the GitHub Pages repo subpath
 * (e.g. "/Salon-test/") in production.
 */
export const asset = (path: string): string =>
  import.meta.env.BASE_URL + path.replace(/^\//, "");
