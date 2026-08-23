/**
 * Resolve an asset path against Vite's base URL.
 * Keeps the app working at "/" in dev and at "/<repo>/" on GitHub Pages.
 */
export const assetUrl = path => import.meta.env.BASE_URL + path;
