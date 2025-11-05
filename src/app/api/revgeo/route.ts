type RevGeoResponse =
  | { postcode?: string; city?: "berlin" | "hamburg" | "nrw" }
  | { error: string };

function determineCity(address: {
  city?: string;
  state?: string;
  "ISO3166-2-lvl4"?: string;
}): "berlin" | "hamburg" | "nrw" | null {
  const cityLower = address.city?.toLowerCase() || "";
  const stateLower = address.state?.toLowerCase() || "";
  const isoCode = address["ISO3166-2-lvl4"]?.toLowerCase() || "";

  if (cityLower.includes("berlin") || stateLower.includes("berlin") || isoCode.includes("be")) {
    return "berlin";
  }
  if (cityLower.includes("hamburg") || stateLower.includes("hamburg") || isoCode.includes("hh")) {
    return "hamburg";
  }
  if (
    stateLower.includes("nordrhein-westfalen") ||
    stateLower.includes("north rhine-westphalia") ||
    stateLower.includes("nrw") ||
    isoCode.includes("nw")
  ) {
    return "nrw";
  }
  return null;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) {
      const res: RevGeoResponse = { error: "Missing lat/lon" };
      return new Response(JSON.stringify(res), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("addressdetails", "1");
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "CustodyClarity/1.0 (+https://example.org)",
        Accept: "application/json",
      },
      // Nominatim usage policy favors GET with proper UA and throttling; we only call on user click
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      const fail: RevGeoResponse = { error: "Reverse geocoding failed" };
      return new Response(JSON.stringify(fail), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    const data = (await res.json()) as {
      address?: {
        postcode?: string;
        city?: string;
        state?: string;
        "ISO3166-2-lvl4"?: string;
      };
    };
    const code = data?.address?.postcode || "";
    const city = data?.address ? determineCity(data.address) : null;
    const body: RevGeoResponse = city ? { postcode: code, city } : { postcode: code };
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    const body: RevGeoResponse = { error: msg };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
