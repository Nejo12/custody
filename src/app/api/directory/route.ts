import data from '@/data/directory.berlin.json';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get('city') || 'berlin').toLowerCase();
  const type = searchParams.get('type');

  let items: any[] = [];
  if (city === 'berlin') items = (data as any[]);
  if (type) items = items.filter((i) => i.type === type);

  return Response.json({ services: items });
}

