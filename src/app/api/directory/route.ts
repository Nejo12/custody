import dataBerlin from '@/data/directory.berlin.json';
import dataHamburg from '@/data/directory.hamburg.json';
import dataNRW from '@/data/directory.nrw.json';

type DirectoryEntry = {
  name?: string;
  address?: string;
  postalCode?: string;
  type?: string;
  phone?: string;
  email?: string;
  website?: string;
  [key: string]: unknown;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get('city') || 'berlin').toLowerCase();
  const type = searchParams.get('type');

  let items: DirectoryEntry[] = [];
  if (city === 'berlin') {
    items = Array.isArray(dataBerlin) ? (dataBerlin as DirectoryEntry[]) : [];
  } else if (city === 'hamburg') {
    items = Array.isArray(dataHamburg) ? (dataHamburg as DirectoryEntry[]) : [];
  } else if (city === 'nrw') {
    items = Array.isArray(dataNRW) ? (dataNRW as DirectoryEntry[]) : [];
  }
  if (type) {
    items = items.filter((i) => i.type === type);
  }

  // Map data structure to match Service type
  const services = items.map((item) => ({
    id: (item as { id?: string }).id || '',
    type: item.type || '',
    name: item.name || '',
    postcode: (item.postalCode || (item as { postcode?: string }).postcode || '').toString(),
    address: item.address || '',
    phone: item.phone || '',
    url: item.website || (item as { url?: string }).url || '',
    opening: (item as { opening?: string }).opening,
  }));

  return Response.json({ services });
}
