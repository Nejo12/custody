import { describe, it, expect } from "vitest";

// Import all locale files to ensure line 1 (const declaration) is covered
describe("i18n locale imports", () => {
  it("imports ar locale", async () => {
    const ar = await import("../ar");
    expect(ar.default).toBeDefined();
    expect(typeof ar.default).toBe("object");
  });

  it("imports de locale", async () => {
    const de = await import("../de");
    expect(de.default).toBeDefined();
    expect(typeof de.default).toBe("object");
  });

  it("imports en locale", async () => {
    const en = await import("../en");
    expect(en.default).toBeDefined();
    expect(typeof en.default).toBe("object");
  });

  it("imports fr locale", async () => {
    const fr = await import("../fr");
    expect(fr.default).toBeDefined();
    expect(typeof fr.default).toBe("object");
  });

  it("imports pl locale", async () => {
    const pl = await import("../pl");
    expect(pl.default).toBeDefined();
    expect(typeof pl.default).toBe("object");
  });

  it("imports ru locale", async () => {
    const ru = await import("../ru");
    expect(ru.default).toBeDefined();
    expect(typeof ru.default).toBe("object");
  });

  it("imports tr locale", async () => {
    const tr = await import("../tr");
    expect(tr.default).toBeDefined();
    expect(typeof tr.default).toBe("object");
  });

  it("all locales have appName", async () => {
    const [ar, de, en, fr, pl, ru, tr] = await Promise.all([
      import("../ar"),
      import("../de"),
      import("../en"),
      import("../fr"),
      import("../pl"),
      import("../ru"),
      import("../tr"),
    ]);
    expect(ar.default.appName).toBeDefined();
    expect(de.default.appName).toBeDefined();
    expect(en.default.appName).toBeDefined();
    expect(fr.default.appName).toBeDefined();
    expect(pl.default.appName).toBeDefined();
    expect(ru.default.appName).toBeDefined();
    expect(tr.default.appName).toBeDefined();
  });
});
