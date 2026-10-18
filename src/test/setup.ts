import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

type Listener = (event: { matches: boolean }) => void;

export interface MatchMediaMock {
  matches: boolean;
  setMatches(next: boolean): void;
  listenerCount(): number;
}

/** Controllable prefers-color-scheme mock, installed on window before each test. */
export const matchMediaMock: MatchMediaMock = {
  matches: false,
  setMatches(next) {
    this.matches = next;
    listeners.forEach((listener) => listener({ matches: next }));
  },
  listenerCount: () => listeners.size,
};

const listeners = new Set<Listener>();

beforeEach(() => {
  matchMediaMock.matches = false;
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query.includes("prefers-color-scheme: dark")
          ? matchMediaMock.matches
          : false;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: Listener) => {
        listeners.delete(listener);
      },
      addListener: (listener: Listener) => listeners.add(listener),
      removeListener: (listener: Listener) => listeners.delete(listener),
      dispatchEvent: () => false,
    })),
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
  vi.unstubAllGlobals();
});
