export type Court = { name?: string; address?: string };

export function resolveCourtTemplate(template?: string): Court {
  switch (template) {
    case "berlin-mitte":
      return {
        name: "Amtsgericht Mitte (Familiengericht)",
        address: "Littenstraße 12–17, 10179 Berlin",
      };
    case "berlin-pankow":
      return {
        name: "Amtsgericht Pankow/Weißensee (Familiengericht)",
        address: "Parkstraße 71, 13086 Berlin",
      };
    case "hamburg":
      return {
        name: "Amtsgericht Hamburg (Familiengericht)",
        address: "Sievekingplatz 1, 20355 Hamburg",
      };
    case "koeln":
      return {
        name: "Amtsgericht Köln (Familiengericht)",
        address: "Luxemburger Straße 101, 50939 Köln",
      };
    case "duesseldorf":
      return {
        name: "Amtsgericht Düsseldorf (Familiengericht)",
        address: "Cecilienallee 3, 40474 Düsseldorf",
      };
    case "essen":
      return { name: "Amtsgericht Essen (Familiengericht)", address: "Burgplatz 2, 45127 Essen" };
    case "dortmund":
      return {
        name: "Amtsgericht Dortmund (Familiengericht)",
        address: "Luisenstraße 2-4, 44135 Dortmund",
      };
    case "bonn":
      return {
        name: "Amtsgericht Bonn (Familiengericht)",
        address: "Wilhelmstraße 21, 53111 Bonn",
      };
    case "wuppertal":
      return {
        name: "Amtsgericht Wuppertal (Familiengericht)",
        address: "Eiland 10, 42103 Wuppertal",
      };
    case "bochum":
      return {
        name: "Amtsgericht Bochum (Familiengericht)",
        address: "Viktoriastraße 14, 44787 Bochum",
      };
    // Bavaria
    case "bayern-muenchen":
      return {
        name: "Amtsgericht München (Familiengericht)",
        address: "Pacellistraße 5, 80333 München",
      };
    // Baden-Württemberg
    case "bw-stuttgart":
      return {
        name: "Amtsgericht Stuttgart (Familiengericht)",
        address: "Hauffstraße 5, 70190 Stuttgart",
      };
    // Hesse
    case "hessen-frankfurt":
      return {
        name: "Amtsgericht Frankfurt am Main (Familiengericht)",
        address: "Gerichtsstraße 2, 60313 Frankfurt am Main",
      };
    // Saxony
    case "sachsen-leipzig":
      return {
        name: "Amtsgericht Leipzig (Familiengericht)",
        address: "Bernhard‑Göring‑Straße 64, 04275 Leipzig",
      };
    // Lower Saxony
    case "nds-hannover":
      return {
        name: "Amtsgericht Hannover (Familiengericht)",
        address: "Volgersweg 65, 30175 Hannover",
      };
    // Rhineland-Palatinate
    case "rlp-mainz":
      return {
        name: "Amtsgericht Mainz (Familiengericht)",
        address: "Diether‑von‑Isenburg‑Straße 1, 55116 Mainz",
      };
    // Schleswig-Holstein
    case "sh-kiel":
      return {
        name: "Amtsgericht Kiel (Familiengericht)",
        address: "Eggerstedtstraße 10, 24103 Kiel",
      };
    // Bremen
    case "bremen":
      return {
        name: "Amtsgericht Bremen (Familiengericht)",
        address: "Am Wall 198‑212, 28195 Bremen",
      };
    // Saarland
    case "saar-saarbruecken":
      return {
        name: "Amtsgericht Saarbrücken (Familiengericht)",
        address: "Franz‑Joseph‑Röder‑Straße 15, 66119 Saarbrücken",
      };
    // Brandenburg
    case "bb-potsdam":
      return {
        name: "Amtsgericht Potsdam (Familiengericht)",
        address: "Jägerallee 10‑12, 14469 Potsdam",
      };
    // Mecklenburg-Vorpommern
    case "mv-rostock":
      return {
        name: "Amtsgericht Rostock (Familiengericht)",
        address: "August‑Bebel‑Straße 15, 18055 Rostock",
      };
    // Thuringia
    case "thueringen-erfurt":
      return {
        name: "Amtsgericht Erfurt (Familiengericht)",
        address: "Domplatz 37, 99084 Erfurt",
      };
    // Saxony-Anhalt
    case "st-magdeburg":
      return {
        name: "Amtsgericht Magdeburg (Familiengericht)",
        address: "Breiter Weg 203‑206, 39104 Magdeburg",
      };
    default:
      return {};
  }
}
