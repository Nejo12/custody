export type RegionKey =
  | "berlin"
  | "hamburg"
  | "nrw"
  | "bayern"
  | "bw"
  | "hessen"
  | "sachsen"
  | "niedersachsen"
  | "rlp"
  | "sh"
  | "bremen"
  | "saarland"
  | "brandenburg"
  | "mv"
  | "thueringen";

export type Citation = { label: string; url: string };

export const regionCitations: Record<RegionKey, Citation[]> = {
  berlin: [
    { label: "Gerichte Berlin", url: "https://www.berlin.de/gerichte/" },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  hamburg: [
    { label: "Gerichte Hamburg", url: "https://www.hamburg.de/justiz/gerichte/" },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  nrw: [
    { label: "Justiz NRW", url: "https://www.justiz.nrw" },
    { label: "Familienportal – Entfernung/Umgang", url: "https://www.familienportal.de/" },
  ],
  bayern: [
    { label: "Justiz Bayern", url: "https://www.justiz.bayern.de" },
    { label: "Familienportal – Umgang und Kindeswohl", url: "https://www.familienportal.de/" },
  ],
  bw: [
    { label: "Justiz Baden‑Württemberg", url: "https://justiz-bw.de" },
    { label: "Leitfäden Familiengericht (allg.)", url: "https://www.familienportal.de/" },
  ],
  hessen: [
    { label: "Justiz Hessen", url: "https://justiz.hessen.de" },
    { label: "Familienportal – Mediation", url: "https://www.familienportal.de/" },
  ],
  sachsen: [
    { label: "Justiz Sachsen", url: "https://www.justiz.sachsen.de" },
    { label: "Leitfäden Umgang/Entfernung", url: "https://www.familienportal.de/" },
  ],
  niedersachsen: [
    { label: "Justiz Niedersachsen", url: "https://www.mj.niedersachsen.de" },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  rlp: [
    { label: "Justiz Rheinland‑Pfalz", url: "https://www.justiz.rlp.de" },
    { label: "Familienportal – Mediation", url: "https://www.familienportal.de/" },
  ],
  sh: [
    {
      label: "Justiz Schleswig‑Holstein",
      url: "https://www.schleswig-holstein.de/DE/landesregierung/III/justiz/justiz_node.html",
    },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  bremen: [
    { label: "Justiz Bremen", url: "https://www.justiz.bremen.de" },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  saarland: [
    { label: "Justiz Saarland", url: "https://www.saarland.de/justiz" },
    { label: "Familienportal – Kindeswohl", url: "https://www.familienportal.de/" },
  ],
  brandenburg: [
    { label: "Justiz Brandenburg", url: "https://www.justiz.brandenburg.de" },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  mv: [
    { label: "Justiz Mecklenburg‑Vorpommern", url: "https://www.justiz-in-mv.de" },
    { label: "Familienportal – Umgang", url: "https://www.familienportal.de/" },
  ],
  thueringen: [
    { label: "Justiz Thüringen", url: "https://justiz.thueringen.de" },
    { label: "Familienportal – Mediation", url: "https://www.familienportal.de/" },
  ],
};
