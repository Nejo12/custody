import type { NextRequest } from 'next/server';

type RevGeoResponse = { postcode?: string } | { error: string };

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    if (!lat || !lon) {
      const res: RevGeoResponse = { error: 'Missing lat/lon' };
      return new Response(JSON.stringify(res), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', lat);
    url.searchParams.set('lon', lon);
    url.searchParams.set('addressdetails', '1');
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'CustodyClarity/1.0 (+https://example.org)',
        'Accept': 'application/json',
      },
      // Nominatim usage policy favors GET with proper UA and throttling; we only call on user click
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      const fail: RevGeoResponse = { error: 'Reverse geocoding failed' };
      return new Response(JSON.stringify(fail), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
    const data = (await res.json()) as { address?: { postcode?: string } };
    const code = data?.address?.postcode || '';
    const body: RevGeoResponse = { postcode: code };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unexpected error';
    const body: RevGeoResponse = { error: msg };
    return new Response(JSON.stringify(body), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

