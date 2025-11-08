import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Result from "../result/page";
import { I18nProvider } from "@/i18n";
import { useAppStore } from "@/store/app";

describe("Result page tone and actions", () => {
  beforeEach(() => {
    useAppStore.getState().wipeAll();
    // Mock fetch for HelpSheet internal calls
    const mockFetch: typeof fetch = (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (/\/api\/directory/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify({ services: [] }), { status: 200 }));
      }
      if (/\/api\/queue/.test(url)) {
        return Promise.resolve(new Response(JSON.stringify({ aggregates: [] }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    };
    vi.stubGlobal("fetch", mockFetch);
  });

  it("shows plain language confirmation need when key answers missing", () => {
    // With empty answers, there are 4 important missing
    render(
      <I18nProvider>
        <Result />
      </I18nProvider>
    );
    expect(screen.getByText(/We need 4 quick details to confirm/)).toBeInTheDocument();
  });

  it("Continue navigates to interview with next key question", () => {
    // Override window.location.href setter to capture assignment
    let assignedHref = "";
    const originalDesc = Object.getOwnPropertyDescriptor(window, "location");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return assignedHref;
        },
        set href(v: string) {
          assignedHref = v;
        },
      },
    });
    render(
      <I18nProvider>
        <Result />
      </I18nProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /Next|Continue/i }));
    expect(assignedHref).toContain("/interview?q=");
    // restore
    if (originalDesc) Object.defineProperty(window, "location", originalDesc);
  });

  it("opens HelpSheet when Find Help is clicked", async () => {
    render(
      <I18nProvider>
        <Result />
      </I18nProvider>
    );
    fireEvent.click(screen.getByText(/Find Help Now/i));
    // The dialog overlay should appear
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });
});
