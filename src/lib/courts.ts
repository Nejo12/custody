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
    default:
      return {};
  }
}
