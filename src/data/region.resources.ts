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
  berlin: [{ label: "Gerichte Berlin", url: "https://www.berlin.de/gerichte/" }],
  hamburg: [{ label: "Gerichte Hamburg", url: "https://www.hamburg.de/justiz/gerichte/" }],
  nrw: [{ label: "Justiz NRW", url: "https://www.justiz.nrw" }],
  bayern: [{ label: "Justiz Bayern", url: "https://www.justiz.bayern.de" }],
  bw: [{ label: "Justiz Baden‑Württemberg", url: "https://justiz-bw.de" }],
  hessen: [{ label: "Justiz Hessen", url: "https://justiz.hessen.de" }],
  sachsen: [{ label: "Justiz Sachsen", url: "https://www.justiz.sachsen.de" }],
  niedersachsen: [{ label: "Justiz Niedersachsen", url: "https://www.mj.niedersachsen.de" }],
  rlp: [{ label: "Justiz Rheinland‑Pfalz", url: "https://www.justiz.rlp.de" }],
  sh: [
    {
      label: "Justiz Schleswig‑Holstein",
      url: "https://www.schleswig-holstein.de/DE/landesregierung/III/justiz/justiz_node.html",
    },
  ],
  bremen: [{ label: "Justiz Bremen", url: "https://www.justiz.bremen.de" }],
  saarland: [{ label: "Justiz Saarland", url: "https://www.saarland.de/justiz" }],
  brandenburg: [{ label: "Justiz Brandenburg", url: "https://www.justiz.brandenburg.de" }],
  mv: [{ label: "Justiz Mecklenburg‑Vorpommern", url: "https://www.justiz-in-mv.de" }],
  thueringen: [{ label: "Justiz Thüringen", url: "https://justiz.thueringen.de" }],
};
