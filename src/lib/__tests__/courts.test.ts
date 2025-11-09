import { describe, it, expect } from "vitest";
import { resolveCourtTemplate } from "@/lib/courts";

describe("courts", () => {
  it("resolves berlin-mitte template", () => {
    const court = resolveCourtTemplate("berlin-mitte");
    expect(court.name).toBe("Amtsgericht Mitte (Familiengericht)");
    expect(court.address).toBe("Littenstraße 12–17, 10179 Berlin");
  });

  it("resolves berlin-pankow template", () => {
    const court = resolveCourtTemplate("berlin-pankow");
    expect(court.name).toBe("Amtsgericht Pankow/Weißensee (Familiengericht)");
    expect(court.address).toBe("Parkstraße 71, 13086 Berlin");
  });

  it("resolves hamburg template", () => {
    const court = resolveCourtTemplate("hamburg");
    expect(court.name).toBe("Amtsgericht Hamburg (Familiengericht)");
    expect(court.address).toBe("Sievekingplatz 1, 20355 Hamburg");
  });

  it("resolves koeln template", () => {
    const court = resolveCourtTemplate("koeln");
    expect(court.name).toBe("Amtsgericht Köln (Familiengericht)");
    expect(court.address).toBe("Luxemburger Straße 101, 50939 Köln");
  });

  it("resolves duesseldorf template", () => {
    const court = resolveCourtTemplate("duesseldorf");
    expect(court.name).toBe("Amtsgericht Düsseldorf (Familiengericht)");
    expect(court.address).toBe("Cecilienallee 3, 40474 Düsseldorf");
  });

  it("resolves essen template", () => {
    const court = resolveCourtTemplate("essen");
    expect(court.name).toBe("Amtsgericht Essen (Familiengericht)");
    expect(court.address).toBe("Burgplatz 2, 45127 Essen");
  });

  it("resolves dortmund template", () => {
    const court = resolveCourtTemplate("dortmund");
    expect(court.name).toBe("Amtsgericht Dortmund (Familiengericht)");
    expect(court.address).toBe("Luisenstraße 2-4, 44135 Dortmund");
  });

  it("resolves bonn template", () => {
    const court = resolveCourtTemplate("bonn");
    expect(court.name).toBe("Amtsgericht Bonn (Familiengericht)");
    expect(court.address).toBe("Wilhelmstraße 21, 53111 Bonn");
  });

  it("resolves wuppertal template", () => {
    const court = resolveCourtTemplate("wuppertal");
    expect(court.name).toBe("Amtsgericht Wuppertal (Familiengericht)");
    expect(court.address).toBe("Eiland 10, 42103 Wuppertal");
  });

  it("resolves bochum template", () => {
    const court = resolveCourtTemplate("bochum");
    expect(court.name).toBe("Amtsgericht Bochum (Familiengericht)");
    expect(court.address).toBe("Viktoriastraße 14, 44787 Bochum");
  });

  it("resolves bayern-muenchen template", () => {
    const court = resolveCourtTemplate("bayern-muenchen");
    expect(court.name).toBe("Amtsgericht München (Familiengericht)");
    expect(court.address).toBe("Pacellistraße 5, 80333 München");
  });

  it("resolves bw-stuttgart template", () => {
    const court = resolveCourtTemplate("bw-stuttgart");
    expect(court.name).toBe("Amtsgericht Stuttgart (Familiengericht)");
    expect(court.address).toBe("Hauffstraße 5, 70190 Stuttgart");
  });

  it("resolves hessen-frankfurt template", () => {
    const court = resolveCourtTemplate("hessen-frankfurt");
    expect(court.name).toBe("Amtsgericht Frankfurt am Main (Familiengericht)");
    expect(court.address).toBe("Gerichtsstraße 2, 60313 Frankfurt am Main");
  });

  it("resolves sachsen-leipzig template", () => {
    const court = resolveCourtTemplate("sachsen-leipzig");
    expect(court.name).toBe("Amtsgericht Leipzig (Familiengericht)");
    expect(court.address).toBe("Bernhard‑Göring‑Straße 64, 04275 Leipzig");
  });

  it("resolves nds-hannover template", () => {
    const court = resolveCourtTemplate("nds-hannover");
    expect(court.name).toBe("Amtsgericht Hannover (Familiengericht)");
    expect(court.address).toBe("Volgersweg 65, 30175 Hannover");
  });

  it("resolves rlp-mainz template", () => {
    const court = resolveCourtTemplate("rlp-mainz");
    expect(court.name).toBe("Amtsgericht Mainz (Familiengericht)");
    expect(court.address).toBe("Diether‑von‑Isenburg‑Straße 1, 55116 Mainz");
  });

  it("resolves sh-kiel template", () => {
    const court = resolveCourtTemplate("sh-kiel");
    expect(court.name).toBe("Amtsgericht Kiel (Familiengericht)");
    expect(court.address).toBe("Eggerstedtstraße 10, 24103 Kiel");
  });

  it("resolves bremen template", () => {
    const court = resolveCourtTemplate("bremen");
    expect(court.name).toBe("Amtsgericht Bremen (Familiengericht)");
    expect(court.address).toBe("Am Wall 198‑212, 28195 Bremen");
  });

  it("resolves saar-saarbruecken template", () => {
    const court = resolveCourtTemplate("saar-saarbruecken");
    expect(court.name).toBe("Amtsgericht Saarbrücken (Familiengericht)");
    expect(court.address).toBe("Franz‑Joseph‑Röder‑Straße 15, 66119 Saarbrücken");
  });

  it("resolves bb-potsdam template", () => {
    const court = resolveCourtTemplate("bb-potsdam");
    expect(court.name).toBe("Amtsgericht Potsdam (Familiengericht)");
    expect(court.address).toBe("Jägerallee 10‑12, 14469 Potsdam");
  });

  it("resolves mv-rostock template", () => {
    const court = resolveCourtTemplate("mv-rostock");
    expect(court.name).toBe("Amtsgericht Rostock (Familiengericht)");
    expect(court.address).toBe("August‑Bebel‑Straße 15, 18055 Rostock");
  });

  it("resolves thueringen-erfurt template", () => {
    const court = resolveCourtTemplate("thueringen-erfurt");
    expect(court.name).toBe("Amtsgericht Erfurt (Familiengericht)");
    expect(court.address).toBe("Domplatz 37, 99084 Erfurt");
  });

  it("resolves st-magdeburg template", () => {
    const court = resolveCourtTemplate("st-magdeburg");
    expect(court.name).toBe("Amtsgericht Magdeburg (Familiengericht)");
    expect(court.address).toBe("Breiter Weg 203‑206, 39104 Magdeburg");
  });

  it("returns empty object for unknown template", () => {
    const court = resolveCourtTemplate("unknown");
    expect(court).toEqual({});
  });

  it("returns empty object for undefined template", () => {
    const court = resolveCourtTemplate(undefined);
    expect(court).toEqual({});
  });
});
