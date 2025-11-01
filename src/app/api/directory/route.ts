import data from '@/data/directory.berlin.json';

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
    items = Array.isArray(data) ? (data as DirectoryEntry[]) : [];
  }
  if (type) {
    items = items.filter((i) => i.type === type);
  }

  return Response.json({ services: items });
}

