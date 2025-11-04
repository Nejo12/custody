import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.mock("next/font/google", () => {
  return {
    Geist: () => ({ className: "geist", variable: "--font-geist-sans" }),
    Geist_Mono: () => ({ className: "geist-mono", variable: "--font-geist-mono" }),
  };
});

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => {
    return { type: "a", props: { href, children } } as React.ReactElement<{
      href: string;
      children: React.ReactNode;
    }>;
  },
}));

// Stub matchMedia for tests
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
