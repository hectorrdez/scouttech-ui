/** Paths in the ScoutTech matrix (scouttech-frontend routes). */
export const SCOUTTECH_PATHS = {
  home: "/",
  products: "/productos",
  register: "/crear-cuenta",
  legal: "/legal",
  privacy: "/legal/privacidad",
  cookies: "/legal/cookies",
  terms: "/legal/terminos",
} as const;

/** Absolute URL in ScoutTech. Pure: the app passes its own base (e.g. `import.meta.env.VITE_SCOUTTECH_URL`). */
export function scouttechUrl(
  base: string,
  path = "/",
  params?: Record<string, string | undefined>,
): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  return url.toString();
}
