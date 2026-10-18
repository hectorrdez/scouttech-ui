import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** The stored preference. */
  mode: ThemeMode;
  /** What is actually painted: `system` is resolved against the OS. */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** localStorage key for the preference. Configure one per app. */
  storageKey?: string;
  /** Used when nothing valid is stored. */
  defaultMode?: ThemeMode;
}

export const DEFAULT_THEME_STORAGE_KEY = "scouttech-ui-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/**
 * Single source of truth for `system` resolution. themeInitScript() mirrors
 * this exact expression in the inline script; the parity test guards drift.
 */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

function readStoredMode(storageKey: string, fallback: ThemeMode): ThemeMode {
  try {
    const stored = localStorage.getItem(storageKey);
    if (isThemeMode(stored)) return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked site data).
  }
  return fallback;
}

function writeStoredMode(storageKey: string, mode: ThemeMode): void {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // The preference is lost on reload, the UI keeps working.
  }
}

function getDarkMediaQuery(): MediaQueryList | null {
  try {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return null;
    }
    return window.matchMedia(DARK_QUERY);
  } catch {
    return null;
  }
}

function readSystemPrefersDark(): boolean {
  return getDarkMediaQuery()?.matches ?? false;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  defaultMode = "system",
}: ThemeProviderProps) {
  const fallback: ThemeMode = isThemeMode(defaultMode) ? defaultMode : "system";
  const [mode, setModeState] = useState<ThemeMode>(() =>
    readStoredMode(storageKey, fallback),
  );
  const [prefersDark, setPrefersDark] = useState<boolean>(readSystemPrefersDark);
  const resolved = resolveTheme(mode, prefersDark);

  // Follow the OS only while the preference is "system".
  useEffect(() => {
    if (mode !== "system") return;
    const media = getDarkMediaQuery();
    if (!media) return;

    const onChange = (event: { matches: boolean }) => setPrefersDark(event.matches);
    setPrefersDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
  }, [resolved]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      writeStoredMode(storageKey, next);
    },
    [storageKey],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}

/**
 * Inline `<script>` body for index.html. Applies the same resolution as
 * ThemeProvider before first paint. Wrap it: `<script>${themeInitScript()}</script>`.
 */
export function themeInitScript(
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
  defaultMode: ThemeMode = "system",
): string {
  const key = JSON.stringify(storageKey);
  const fallback = JSON.stringify(isThemeMode(defaultMode) ? defaultMode : "system");
  const dark = JSON.stringify(DARK_QUERY);
  return (
    "(function(){try{" +
    `var stored=null;try{stored=localStorage.getItem(${key})}catch(e){}` +
    `var mode=(stored==="light"||stored==="dark"||stored==="system")?stored:${fallback};` +
    `var prefersDark=false;try{prefersDark=window.matchMedia(${dark}).matches}catch(e){}` +
    `var resolved=mode==="system"?(prefersDark?"dark":"light"):mode;` +
    "document.documentElement.dataset.theme=resolved;" +
    "document.documentElement.style.colorScheme=resolved;" +
    "}catch(e){}})();"
  );
}
