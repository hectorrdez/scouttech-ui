import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { matchMediaMock } from "./test/setup.js";
import {
  DEFAULT_THEME_STORAGE_KEY,
  ThemeProvider,
  themeInitScript,
  useTheme,
  type ThemeMode,
} from "./theme.js";

function wrapper(props: { storageKey?: string; defaultMode?: ThemeMode } = {}) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider {...props}>{children}</ThemeProvider>;
  };
}

describe("ThemeProvider", () => {
  it("sets html data-theme and color-scheme", () => {
    matchMediaMock.setMatches(false);
    renderHook(() => useTheme(), { wrapper: wrapper({ defaultMode: "dark" }) });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("system mode follows the OS and reacts to changes", () => {
    matchMediaMock.setMatches(true);
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.mode).toBe("system");
    expect(result.current.resolved).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    act(() => matchMediaMock.setMatches(false));
    expect(result.current.resolved).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("stops listening to the OS when mode is not system", () => {
    matchMediaMock.setMatches(false);
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(matchMediaMock.listenerCount()).toBe(1);

    act(() => result.current.setMode("light"));
    expect(matchMediaMock.listenerCount()).toBe(0);
    act(() => matchMediaMock.setMatches(true));
    expect(result.current.resolved).toBe("light");
  });

  it("setMode persists under the custom storageKey and reloads from it", () => {
    matchMediaMock.setMatches(false);
    const { result, unmount } = renderHook(() => useTheme(), {
      wrapper: wrapper({ storageKey: "app-theme" }),
    });
    act(() => result.current.setMode("dark"));
    expect(localStorage.getItem("app-theme")).toBe("dark");
    expect(localStorage.getItem(DEFAULT_THEME_STORAGE_KEY)).toBeNull();
    unmount();

    const again = renderHook(() => useTheme(), {
      wrapper: wrapper({ storageKey: "app-theme" }),
    });
    expect(again.result.current.mode).toBe("dark");
    expect(again.result.current.resolved).toBe("dark");
  });

  it("ignores invalid stored values and falls back to the default", () => {
    localStorage.setItem(DEFAULT_THEME_STORAGE_KEY, "neon");
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ defaultMode: "light" }),
    });
    expect(result.current.mode).toBe("light");
  });

  it("does not crash when localStorage throws", () => {
    const getSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    try {
      matchMediaMock.setMatches(false);
      const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
      expect(result.current.mode).toBe("system");
      expect(() => act(() => result.current.setMode("dark"))).not.toThrow();
      expect(result.current.resolved).toBe("dark");
    } finally {
      getSpy.mockRestore();
      setSpy.mockRestore();
    }
  });

  it("useTheme throws outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used inside <ThemeProvider>",
    );
    spy.mockRestore();
  });
});

describe("themeInitScript parity", () => {
  const storedValues: Array<string | null> = ["light", "dark", "system", "neon", null];
  const osDark = [true, false];

  for (const stored of storedValues) {
    for (const dark of osDark) {
      it(`stored=${stored} os=${dark ? "dark" : "light"} matches ThemeProvider`, () => {
        localStorage.clear();
        if (stored !== null) localStorage.setItem("parity-key", stored);
        matchMediaMock.setMatches(dark);

        // Run the inline script first, as index.html would.
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.style.colorScheme = "";
        new Function(themeInitScript("parity-key"))();
        const fromScript = document.documentElement.dataset.theme;
        const scriptScheme = document.documentElement.style.colorScheme;

        // Then mount the provider with the same storage and compare.
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.style.colorScheme = "";
        renderHook(() => useTheme(), { wrapper: wrapper({ storageKey: "parity-key" }) });
        expect(scriptScheme).toBe(fromScript);
        expect(fromScript).toBe(document.documentElement.dataset.theme);
        expect(document.documentElement.style.colorScheme).toBe(scriptScheme);
      });
    }
  }

  it("is a self-contained IIFE string", () => {
    const script = themeInitScript("k");
    expect(script.startsWith("(function(){")).toBe(true);
    expect(script).toContain('"k"');
  });

  it("does not throw when storage is unavailable", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    try {
      matchMediaMock.setMatches(true);
      expect(() => new Function(themeInitScript())()).not.toThrow();
      expect(document.documentElement.dataset.theme).toBe("dark");
    } finally {
      spy.mockRestore();
    }
  });
});

describe("useTheme usage", () => {
  it("exposes the mode through the provider in the DOM", async () => {
    matchMediaMock.setMatches(false);
    function Probe() {
      const { mode, setMode } = useTheme();
      return (
        <button type="button" onClick={() => setMode("dark")}>
          modo: {mode}
        </button>
      );
    }
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "modo: system" }));
    expect(screen.getByRole("button", { name: "modo: dark" })).toBeInTheDocument();
  });
});
