import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HelpSheet from "../HelpSheet";
import { I18nProvider } from "@/i18n";
import { useAppStore } from "@/store/app";

describe("HelpSheet", () => {
  beforeEach(() => {
    useAppStore.getState().wipeAll();
    // Seed interview postcode
    useAppStore.getState().setAnswer("postcode", "10115");
    // Mock fetch calls inside HelpSheet
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

  it("prefills postcode from interview answers when opened", async () => {
    render(
      <I18nProvider>
        <HelpSheet open={true} onClose={() => {}} />
      </I18nProvider>
    );
    const inputEl = (await screen.findByPlaceholderText(
      /Postcode|Kod pocztowy|PLZ|Kode/
    )) as HTMLElement;
    // Wait for effect to set postcode after mount
    await new Promise((r) => setTimeout(r, 0));
    if (!(inputEl instanceof HTMLInputElement)) {
      throw new Error("Expected an input element");
    }
    expect(inputEl.value).toBe("10115");
  });
});
