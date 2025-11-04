import { PDFDocument, StandardFonts, PDFFont } from 'pdf-lib';
import type { Citation, ErrorWithMessage } from '@/types';
import type { Schedule } from '@/lib/schedule';

type Court = { name?: string; address?: string };
type PartyRole = 'parentA' | 'parentB';
type UmgangForm = {
  proposal?: Schedule;
  court?: Court;
  roles?: { applicant?: PartyRole; respondent?: PartyRole };
  interim?: boolean;
  place?: string;
  dateISO?: string;
} & Record<string, unknown>;

type RequestBody = {
  formData?: UmgangForm;
  citations?: Citation[] | string[];
  snapshotIds?: string[];
  locale?: string;
};

const PAGE_SIZE: [number, number] = [595.28, 841.89];
const MARGIN_X = 50;
const MARGIN_Y = 40;
const Y_START = 800 - MARGIN_Y;

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { formData = {}, citations = [], snapshotIds = [], locale = 'de' } = body;
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    let page = doc.addPage(PAGE_SIZE);

    const title = locale === 'de' ? 'Antrag auf Umgangsregelung' : 'Contact/Visitation order application';
    doc.setTitle(title);
    doc.setSubject(locale === 'de' ? 'Amtsgericht – Familiengericht; Vorgeschlagener Umgang; Einstweilige Anordnung; Unterschrift' : 'Local Court – Family Court; Proposed schedule; Interim relief; Signature');
    doc.setKeywords([
      title,
      locale === 'de' ? 'Amtsgericht' : 'Court',
      locale === 'de' ? 'Vorgeschlagener Umgang' : 'Proposed schedule',
      locale === 'de' ? 'Einstweilige Anordnung' : 'Interim relief',
      locale === 'de' ? 'Unterschrift' : 'Signature'
    ]);

    page.drawText(locale === 'de' ? 'An das Amtsgericht – Familiengericht' : 'To the Local Court – Family Court', { x: MARGIN_X, y: 800, size: 10, font });
    page.drawText(title, { x: MARGIN_X, y: 785, size: 16, font });

    let y = Y_START;

    const drawHeading = (text: string) => {
      if (y < MARGIN_Y + 20) {
        page = doc.addPage(PAGE_SIZE);
        y = Y_START;
      }
      page.drawText(text, { x: MARGIN_X, y, size: 12, font });
      y -= 16;
    };

    const drawField = (label: string, value: string) => {
      if (!value) return;
      const maxWidth = PAGE_SIZE[0] - MARGIN_X * 2;
      const lines = wrapText(`${label}: ${value}`, maxWidth, font, 10);
      for (const line of lines) {
        if (y < MARGIN_Y + 10) {
          page = doc.addPage(PAGE_SIZE);
          y = Y_START;
        }
        page.drawText(line, { x: MARGIN_X + 10, y, size: 10, font });
        y -= 12;
      }
    };

    const court = resolveCourt(formData);
    const roles = formData.roles || {};

    drawHeading(locale === 'de' ? 'Gericht' : 'Court');
    if (court.name) drawField(locale === 'de' ? 'Name' : 'Name', court.name);
    if (court.address) drawField(locale === 'de' ? 'Adresse' : 'Address', court.address);

    // Roles table two-column
    drawHeading(locale === 'de' ? 'Parteien' : 'Parties');
    const col1x = MARGIN_X + 10;
    const col2x = MARGIN_X + 220;
    const rowH = 14;
    const labelApplicant = locale==='de'?'Antragsteller':'Applicant';
    const labelRespondent = locale==='de'?'Antragsgegner':'Respondent';
    const roleLabel = (r?: PartyRole) => r === 'parentA' ? 'Elternteil A' : r === 'parentB' ? 'Elternteil B' : '';
    page.drawText(labelApplicant, { x: col1x, y, size: 10, font });
    page.drawText(labelRespondent, { x: col2x, y, size: 10, font });
    y -= rowH;
    page.drawText(roleLabel(roles.applicant), { x: col1x, y, size: 10, font });
    page.drawText(roleLabel(roles.respondent), { x: col2x, y, size: 10, font });

    const proposal = formData.proposal;
    if (proposal && proposal.weekday) {
      drawHeading(locale === 'de' ? 'Vorgeschlagener Umgang' : 'Proposed schedule');
      const wd = proposal.weekday;
      const rows: Array<[string, string | undefined]> = [
        ['Mon', wd.monday], ['Tue', wd.tuesday], ['Wed', wd.wednesday],
        ['Thu', wd.thursday], ['Fri', wd.friday], ['Sat', wd.saturday], ['Sun', wd.sunday],
      ];
      for (const [label, val] of rows) {
        drawField(label, String(val || '-'));
      }
      const weekend = proposal.weekend || {};
      drawField(locale === 'de' ? 'Wochenende (gerade)' : 'Weekend even', String(weekend.even || '-'));
      drawField(locale === 'de' ? 'Wochenende (ungerade)' : 'Weekend odd', String(weekend.odd || '-'));
      const handover = proposal.handover || {};
      if (handover.location) drawField(locale === 'de' ? 'Übergabe' : 'Handover', handover.location);
    }

    if (formData.interim) {
      y -= 6;
      drawHeading(locale === 'de' ? 'Einstweilige Anordnung' : 'Interim relief');
      drawField('', locale === 'de' ? 'Es wird hilfsweise die einstweilige Anordnung beantragt.' : 'Applicant also requests interim relief.');
    }

    // Attachments (checkbox style)
    const drawCheckbox = (label: string) => {
      if (y < MARGIN_Y + 12) { page = doc.addPage(PAGE_SIZE); y = Y_START; }
      page.drawRectangle({ x: MARGIN_X + 10, y: y - 10, width: 10, height: 10, borderWidth: 1 });
      page.drawText(label, { x: MARGIN_X + 26, y: y - 2, size: 10, font });
      y -= 14;
    };
    y -= 6;
    drawHeading(locale === 'de' ? 'Anlagen' : 'Attachments');
    drawCheckbox(locale === 'de' ? 'Kommunikation/Logs' : 'Communications/Logs');
    drawCheckbox(locale === 'de' ? 'Nachweise Zahlungen' : 'Proof of payments');

    y -= 10;
    drawHeading(locale === 'de' ? 'Unterschrift' : 'Signature');
    const dateText = formData.dateISO || new Date().toISOString().slice(0, 10);
    const placeText = formData.place || '';
    drawField(locale === 'de' ? 'Ort, Datum' : 'Place, Date', `${placeText} ${dateText}`.trim());
    drawField(locale === 'de' ? 'Unterschrift Antragsteller(in)' : 'Applicant signature', '____________________________');

    const date = new Date().toISOString().slice(0, 10);
    const sourcesStr = citations.map((c): string => {
      if (typeof c === 'string') return c;
      return c.label || c.url || '';
    }).join(', ');
    const snapshotStr = snapshotIds.join(', ');
    const footer = `Generated on ${date}. Sources: ${sourcesStr}. Snapshots: ${snapshotStr}. Information, not legal advice.`;
    page.drawText(footer.slice(0, 240), { x: MARGIN_X, y: MARGIN_Y, size: 8, font });

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

function resolveCourt(formData: { court?: Court; [k: string]: unknown }): Court {
  if (formData.court && (formData.court.name || formData.court.address)) return formData.court;
  const t = (formData as { courtTemplate?: string }).courtTemplate;
  switch (t) {
    case 'berlin-mitte':
      return { name: 'Amtsgericht Mitte (Familiengericht)', address: 'Littenstraße 12–17, 10179 Berlin' };
    case 'berlin-pankow':
      return { name: 'Amtsgericht Pankow/Weißensee (Familiengericht)', address: 'Parkstraße 71, 13086 Berlin' };
    case 'hamburg':
      return { name: 'Amtsgericht Hamburg (Familiengericht)', address: 'Sievekingplatz 1, 20355 Hamburg' };
    case 'koeln':
      return { name: 'Amtsgericht Köln (Familiengericht)', address: 'Luxemburger Straße 101, 50939 Köln' };
    case 'duesseldorf':
      return { name: 'Amtsgericht Düsseldorf (Familiengericht)', address: 'Cecilienallee 3, 40474 Düsseldorf' };
    case 'essen':
      return { name: 'Amtsgericht Essen (Familiengericht)', address: 'Burgplatz 2, 45127 Essen' };
    case 'dortmund':
      return { name: 'Amtsgericht Dortmund (Familiengericht)', address: 'Luisenstraße 2-4, 44135 Dortmund' };
    case 'bonn':
      return { name: 'Amtsgericht Bonn (Familiengericht)', address: 'Wilhelmstraße 21, 53111 Bonn' };
    case 'wuppertal':
      return { name: 'Amtsgericht Wuppertal (Familiengericht)', address: 'Eiland 10, 42103 Wuppertal' };
    case 'bochum':
      return { name: 'Amtsgericht Bochum (Familiengericht)', address: 'Viktoriastraße 14, 44787 Bochum' };
    default:
      return formData.court || {};
  }
}
