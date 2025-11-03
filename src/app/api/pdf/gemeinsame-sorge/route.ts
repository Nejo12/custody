import { PDFDocument, StandardFonts, PDFFont } from 'pdf-lib';
import type { Citation, FormData, ErrorWithMessage } from '@/types';

type Parent = { fullName?: string; address?: string };
type Child = { fullName?: string; dob?: string; birthRegistryRef?: string };
type Court = { name?: string; address?: string };
type PartyRole = 'parentA' | 'parentB';
type GSForm = FormData & {
  parentA?: Parent;
  parentB?: Parent;
  children?: Child[];
  court?: Court;
  roles?: { applicant?: PartyRole; respondent?: PartyRole };
  place?: string;
  dateISO?: string;
};

type RequestBody = {
  formData?: GSForm;
  citations?: Citation[] | string[];
  snapshotIds?: string[];
  locale?: string;
};

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { formData = {}, citations = [], snapshotIds = [], locale = 'de' } = body;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    let page = doc.addPage([595.28, 841.89]); // A4

    const title = locale === 'de' ? 'Antrag auf gemeinsame Sorge' : 'Joint custody application';
    const marginX = 50;
    const marginY = 40;
    const yStart = 800 - marginY;
    // PDF metadata for testability/searchability
    doc.setTitle(title);
    doc.setSubject(locale === 'de' ? 'Amtsgericht – Familiengericht; Antrag; Begründung; Anlagen; Unterschrift' : 'Local Court – Family Court; Request; Reasoning; Attachments; Signature');
    doc.setKeywords([
      title,
      locale === 'de' ? 'Amtsgericht' : 'Court',
      locale === 'de' ? 'Antragsteller' : 'Applicant',
      locale === 'de' ? 'Antragsgegner' : 'Respondent',
      locale === 'de' ? 'Unterschrift' : 'Signature',
    ]);
    page.drawText(locale === 'de' ? 'An das Amtsgericht – Familiengericht' : 'To the Local Court – Family Court', { x: marginX, y: 800 - marginY + 40, size: 10, font });
    page.drawText(title, { x: marginX, y: 800 - marginY + 25, size: 16, font });
    let y = yStart;
    // Structured sections
    const parentA = formData.parentA || {};
    const parentB = formData.parentB || {};
    const children = formData.children || [];
    const court = formData.court || {};
    const roles = formData.roles || {};

    const drawHeading = (text: string) => {
      if (y < marginY + 20) { page = doc.addPage([595.28, 841.89]); y = yStart; }
      page.drawText(text, { x: marginX, y, size: 12, font });
      y -= 16;
    };
    const drawField = (label: string, value?: string) => {
      if (!value) return;
      const maxWidth = 595.28 - marginX * 2;
      const lines = wrapText(`${label}${label ? ': ' : ''}${value}`, maxWidth, font, 10);
      for (const line of lines) {
        if (y < marginY + 10) { page = doc.addPage([595.28, 841.89]); y = yStart; }
        page.drawText(line, { x: marginX + 10, y, size: 10, font });
        y -= 12;
      }
    };

    // Court block
    drawHeading(locale === 'de' ? 'Gericht' : 'Court');
    if (court.name) drawField(locale==='de'?'Name':'Name', court.name);
    if (court.address) drawField(locale==='de'?'Adresse':'Address', court.address);

    // Parties
    drawHeading(locale === 'de' ? 'Elternteil A' : 'Parent A');
    drawField(locale==='de'?'Name':'Name', String(parentA.fullName || ''));
    drawField(locale==='de'?'Adresse':'Address', String(parentA.address || ''));

    y -= 6;
    drawHeading(locale === 'de' ? 'Elternteil B' : 'Parent B');
    drawField(locale==='de'?'Name':'Name', String(parentB.fullName || ''));
    drawField(locale==='de'?'Adresse':'Address', String(parentB.address || ''));

    // Roles
    if (roles.applicant || roles.respondent) {
      y -= 6;
      drawHeading(locale==='de' ? 'Parteien' : 'Parties');
      const roleLabel = (r?: PartyRole) => r === 'parentA' ? (parentA.fullName || 'Elternteil A') : r === 'parentB' ? (parentB.fullName || 'Elternteil B') : '';
      if (roles.applicant) drawField(locale==='de'?'Antragsteller':'Applicant', roleLabel(roles.applicant));
      if (roles.respondent) drawField(locale==='de'?'Antragsgegner':'Respondent', roleLabel(roles.respondent));
    }

    y -= 6;
    drawHeading(locale === 'de' ? 'Kinder' : 'Children');
    if (Array.isArray(children) && children.length > 0) {
      const max = Math.min(children.length, 4);
      for (let i = 0; i < max; i++) {
        const ch = children[i] || {};
        const nm = String(ch.fullName || '');
        const dob = String(ch.dob || '');
        const line = `${i+1}. ${nm} ${dob ? '(' + dob + ')' : ''}`;
        drawField(locale==='de'?'Kind':'Child', line);
      }
    } else {
      drawField('', locale==='de'?'(keine Angaben)':'(no entries)');
    }

    // Antrag (request)
    y -= 6;
    drawHeading(locale==='de' ? 'Antrag' : 'Request');
    drawField('', locale==='de' ? 'Es wird beantragt, die gemeinsame elterliche Sorge anzuordnen.' : 'It is requested to order joint parental custody.');
    // Begründung (reasoning)
    y -= 6;
    drawHeading(locale==='de' ? 'Begründung (Kurzangaben)' : 'Reasoning (Summary)');
    drawField('', locale==='de' ? 'Vaterschaft ist anerkannt; keine entgegenstehenden Gründe bekannt.' : 'Paternity is acknowledged; no opposing reasons known.');
    // Anlagen (attachments)
    y -= 6;
    drawHeading(locale==='de' ? 'Anlagen' : 'Attachments');
    drawField('', locale==='de' ? 'Geburtsurkunden, Vaterschaftsanerkennung, Kommunikation/Logs.' : 'Birth certificates, paternity acknowledgement, communications/logs.');

    // Signature block
    y -= 10;
    drawHeading(locale==='de' ? 'Unterschrift' : 'Signature');
    const dateText = formData.dateISO || new Date().toISOString().slice(0, 10);
    const placeText = formData.place || '';
    drawField(locale==='de'?'Ort, Datum':'Place, Date', `${placeText} ${dateText}`.trim());
    drawField(locale==='de'?'Unterschrift Antragsteller(in)':'Applicant signature', '____________________________');

    // Footer
    const date = new Date().toISOString().slice(0, 10);
    const sourcesStr = citations.map((c): string => {
      if (typeof c === 'string') return c;
      return c.label || c.url || '';
    }).join(', ');
    const snapshotStr = snapshotIds.join(', ');
    const footer = `Generated on ${date}. Sources: ${sourcesStr}. Snapshots: ${snapshotStr}. Information, not legal advice.`;
    page.drawText(footer.slice(0, 240), { x: marginX, y: marginY, size: 8, font });

    const bytes = await doc.save();
    return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf' } });
  } catch (e) {
    const error = e as ErrorWithMessage;
    return new Response(JSON.stringify({ error: error?.message || 'Invalid request' }), { status: 400 });
  }
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
