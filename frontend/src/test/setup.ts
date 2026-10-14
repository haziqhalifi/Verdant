import "@testing-library/jest-dom/vitest";

// Initialize MSW for all test files. The beforeAll/afterAll/afterEach hooks
// in this module ensure every test has the mock API server ready.
import "@/test/handlers";

// jsdom doesn't provide fetch; Node 18+ has a native fetch we can expose.
if (typeof globalThis.fetch === "undefined") {
  // Node 18+ has fetch on globalThis; it just isn't wired into jsdom's window.
}

// Make Node's fetch available to the jsdom window so MSW can intercept it.
if (typeof window.fetch === "undefined" && typeof globalThis.fetch !== "undefined") {
  window.fetch = globalThis.fetch.bind(globalThis);
}

// jsdom doesn't implement matchMedia; Layout and friends never call it today but
// matchMedia is a common landmine for component tests.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom doesn't implement ResizeObserver; some UI primitives may use it.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
