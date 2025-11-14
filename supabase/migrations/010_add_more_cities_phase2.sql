-- ========================================
-- MIGRATION 010: Add More German Cities (Phase 2)
-- ========================================
-- Adds 30+ additional major German cities to reach 50+ cities total
-- Phase 3.4: Expand city resources
-- ========================================

-- Gelsenkirchen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Gelsenkirchen',
  '45879',
  '{"name": "Standesamt Gelsenkirchen", "address": "Goldbergstraße 12, 45879 Gelsenkirchen", "phone": "+49 209 169-0", "website": "https://www.gelsenkirchen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Gelsenkirchen", "address": "Goldbergstraße 12, 45879 Gelsenkirchen", "phone": "+49 209 169-0", "website": "https://www.gelsenkirchen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Mönchengladbach
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Mönchengladbach',
  '41061',
  '{"name": "Standesamt Mönchengladbach", "address": "Rathaus Abtei, 41061 Mönchengladbach", "phone": "+49 2161 25-0", "website": "https://www.moenchengladbach.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Mönchengladbach", "address": "Hindenburgstraße 85, 41061 Mönchengladbach", "phone": "+49 2161 25-0", "website": "https://www.moenchengladbach.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Braunschweig
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Braunschweig',
  '38100',
  '{"name": "Standesamt Braunschweig", "address": "Platz der Deutschen Einheit 1, 38100 Braunschweig", "phone": "+49 531 470-0", "website": "https://www.braunschweig.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Braunschweig", "address": "Löwenwall 18, 38100 Braunschweig", "phone": "+49 531 470-0", "website": "https://www.braunschweig.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Chemnitz
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Chemnitz',
  '09111',
  '{"name": "Standesamt Chemnitz", "address": "Markt 1, 09111 Chemnitz", "phone": "+49 371 488-0", "website": "https://www.chemnitz.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Chemnitz", "address": "Bahnhofstraße 53, 09111 Chemnitz", "phone": "+49 371 488-0", "website": "https://www.chemnitz.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Kiel
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Kiel',
  '24103',
  '{"name": "Standesamt Kiel", "address": "Fleethörn 9, 24103 Kiel", "phone": "+49 431 901-0", "website": "https://www.kiel.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Kiel", "address": "Fleethörn 9, 24103 Kiel", "phone": "+49 431 901-0", "website": "https://www.kiel.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Aachen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Aachen',
  '52062',
  '{"name": "Standesamt Aachen", "address": "Markt 39, 52062 Aachen", "phone": "+49 241 432-0", "website": "https://www.aachen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Aachen", "address": "Lagerhausstraße 20, 52064 Aachen", "phone": "+49 241 432-0", "website": "https://www.aachen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Halle (Saale)
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Halle',
  '06108',
  '{"name": "Standesamt Halle", "address": "Marktplatz 1, 06108 Halle (Saale)", "phone": "+49 345 221-0", "website": "https://www.halle.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Halle", "address": "Hansering 15, 06108 Halle (Saale)", "phone": "+49 345 221-0", "website": "https://www.halle.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Magdeburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Magdeburg',
  '39104',
  '{"name": "Standesamt Magdeburg", "address": "Alter Markt 6, 39104 Magdeburg", "phone": "+49 391 540-0", "website": "https://www.magdeburg.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Magdeburg", "address": "Leiterstraße 2-4, 39104 Magdeburg", "phone": "+49 391 540-0", "website": "https://www.magdeburg.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Freiburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Freiburg',
  '79098',
  '{"name": "Standesamt Freiburg", "address": "Rathausplatz 2-4, 79098 Freiburg", "phone": "+49 761 201-0", "website": "https://www.freiburg.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Freiburg", "address": "Fehrenbachallee 12, 79106 Freiburg", "phone": "+49 761 201-0", "website": "https://www.freiburg.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Krefeld
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Krefeld',
  '47798',
  '{"name": "Standesamt Krefeld", "address": "Von-der-Leyen-Platz 1, 47798 Krefeld", "phone": "+49 2151 86-0", "website": "https://www.krefeld.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Krefeld", "address": "Von-der-Leyen-Platz 1, 47798 Krefeld", "phone": "+49 2151 86-0", "website": "https://www.krefeld.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Lübeck
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Lübeck',
  '23552',
  '{"name": "Standesamt Lübeck", "address": "Breite Straße 62, 23552 Lübeck", "phone": "+49 451 122-0", "website": "https://www.luebeck.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Lübeck", "address": "Kronsforder Allee 2-6, 23560 Lübeck", "phone": "+49 451 122-0", "website": "https://www.luebeck.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Oberhausen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Oberhausen',
  '46045',
  '{"name": "Standesamt Oberhausen", "address": "Schwartzstraße 72, 46045 Oberhausen", "phone": "+49 208 825-0", "website": "https://www.oberhausen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Oberhausen", "address": "Schwartzstraße 72, 46045 Oberhausen", "phone": "+49 208 825-0", "website": "https://www.oberhausen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Erfurt
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Erfurt',
  '99084',
  '{"name": "Standesamt Erfurt", "address": "Fischmarkt 1, 99084 Erfurt", "phone": "+49 361 655-0", "website": "https://www.erfurt.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Erfurt", "address": "Juri-Gagarin-Ring 150, 99084 Erfurt", "phone": "+49 361 655-0", "website": "https://www.erfurt.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Rostock
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Rostock',
  '18055',
  '{"name": "Standesamt Rostock", "address": "Neuer Markt 1, 18055 Rostock", "phone": "+49 381 381-0", "website": "https://www.rostock.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Rostock", "address": "Grubenstraße 47, 18055 Rostock", "phone": "+49 381 381-0", "website": "https://www.rostock.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Mainz
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Mainz',
  '55116',
  '{"name": "Standesamt Mainz", "address": "Jockel-Fuchs-Platz 1, 55116 Mainz", "phone": "+49 6131 12-0", "website": "https://www.mainz.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Mainz", "address": "Kaiserstraße 3-5, 55116 Mainz", "phone": "+49 6131 12-0", "website": "https://www.mainz.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Kassel
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Kassel',
  '34117',
  '{"name": "Standesamt Kassel", "address": "Obere Königsstraße 8, 34117 Kassel", "phone": "+49 561 787-0", "website": "https://www.kassel.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Kassel", "address": "Wilhelmshöher Allee 19-21, 34117 Kassel", "phone": "+49 561 787-0", "website": "https://www.kassel.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Hagen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Hagen',
  '58095',
  '{"name": "Standesamt Hagen", "address": "Rathausstraße 11, 58095 Hagen", "phone": "+49 2331 207-0", "website": "https://www.hagen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Hagen", "address": "Rathausstraße 11, 58095 Hagen", "phone": "+49 2331 207-0", "website": "https://www.hagen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Hamm
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Hamm',
  '59065',
  '{"name": "Standesamt Hamm", "address": "Theodor-Heuss-Platz 16, 59065 Hamm", "phone": "+49 2381 17-0", "website": "https://www.hamm.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Hamm", "address": "Theodor-Heuss-Platz 16, 59065 Hamm", "phone": "+49 2381 17-0", "website": "https://www.hamm.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Saarbrücken
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Saarbrücken',
  '66111',
  '{"name": "Standesamt Saarbrücken", "address": "Rathaus St. Johann, 66111 Saarbrücken", "phone": "+49 681 905-0", "website": "https://www.saarbruecken.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Saarbrücken", "address": "Hohenzollernstraße 45, 66117 Saarbrücken", "phone": "+49 681 905-0", "website": "https://www.saarbruecken.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Mülheim
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Mülheim',
  '45468',
  '{"name": "Standesamt Mülheim", "address": "Am Rathaus 1, 45468 Mülheim an der Ruhr", "phone": "+49 208 455-0", "website": "https://www.muelheim-ruhr.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Mülheim", "address": "Am Rathaus 1, 45468 Mülheim an der Ruhr", "phone": "+49 208 455-0", "website": "https://www.muelheim-ruhr.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Potsdam
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Potsdam',
  '14467',
  '{"name": "Standesamt Potsdam", "address": "Friedrich-Ebert-Straße 79/81, 14467 Potsdam", "phone": "+49 331 289-0", "website": "https://www.potsdam.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Potsdam", "address": "Dortustraße 36, 14467 Potsdam", "phone": "+49 331 289-0", "website": "https://www.potsdam.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Ludwigshafen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Ludwigshafen',
  '67059',
  '{"name": "Standesamt Ludwigshafen", "address": "Rathausplatz 20, 67059 Ludwigshafen", "phone": "+49 621 504-0", "website": "https://www.ludwigshafen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Ludwigshafen", "address": "Bismarckstraße 29, 67059 Ludwigshafen", "phone": "+49 621 504-0", "website": "https://www.ludwigshafen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Oldenburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Oldenburg',
  '26122',
  '{"name": "Standesamt Oldenburg", "address": "Markt 1, 26122 Oldenburg", "phone": "+49 441 235-0", "website": "https://www.oldenburg.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Oldenburg", "address": "Theodor-Tantzen-Platz 8, 26122 Oldenburg", "phone": "+49 441 235-0", "website": "https://www.oldenburg.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Leverkusen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Leverkusen',
  '51373',
  '{"name": "Standesamt Leverkusen", "address": "Hauptstraße 217, 51373 Leverkusen", "phone": "+49 214 406-0", "website": "https://www.leverkusen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Leverkusen", "address": "Hauptstraße 217, 51373 Leverkusen", "phone": "+49 214 406-0", "website": "https://www.leverkusen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Osnabrück
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Osnabrück',
  '49074',
  '{"name": "Standesamt Osnabrück", "address": "Bierstraße 28-30, 49074 Osnabrück", "phone": "+49 541 323-0", "website": "https://www.osnabrueck.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Osnabrück", "address": "Natruper Straße 87, 49076 Osnabrück", "phone": "+49 541 323-0", "website": "https://www.osnabrueck.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Solingen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Solingen',
  '42651',
  '{"name": "Standesamt Solingen", "address": "Mummstraße 10, 42651 Solingen", "phone": "+49 212 290-0", "website": "https://www.solingen.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Solingen", "address": "Mummstraße 10, 42651 Solingen", "phone": "+49 212 290-0", "website": "https://www.solingen.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Heidelberg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Heidelberg',
  '69117',
  '{"name": "Standesamt Heidelberg", "address": "Marktplatz 10, 69117 Heidelberg", "phone": "+49 6221 58-0", "website": "https://www.heidelberg.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Heidelberg", "address": "Bergheimer Straße 69, 69115 Heidelberg", "phone": "+49 6221 58-0", "website": "https://www.heidelberg.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Herne
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Herne',
  '44623',
  '{"name": "Standesamt Herne", "address": "Friedrich-Ebert-Platz 5, 44623 Herne", "phone": "+49 2323 16-0", "website": "https://www.herne.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Herne", "address": "Friedrich-Ebert-Platz 5, 44623 Herne", "phone": "+49 2323 16-0", "website": "https://www.herne.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Neuss
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Neuss',
  '41460',
  '{"name": "Standesamt Neuss", "address": "Markt 2, 41460 Neuss", "phone": "+49 2131 90-0", "website": "https://www.neuss.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Neuss", "address": "Oberstraße 91, 41460 Neuss", "phone": "+49 2131 90-0", "website": "https://www.neuss.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Darmstadt
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Darmstadt',
  '64283',
  '{"name": "Standesamt Darmstadt", "address": "Luisenplatz 5, 64283 Darmstadt", "phone": "+49 6151 13-0", "website": "https://www.darmstadt.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Darmstadt", "address": "Frankfurter Straße 71, 64293 Darmstadt", "phone": "+49 6151 13-0", "website": "https://www.darmstadt.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Paderborn
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Paderborn',
  '33098',
  '{"name": "Standesamt Paderborn", "address": "Am Abdinghof 11, 33098 Paderborn", "phone": "+49 5251 88-0", "website": "https://www.paderborn.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Paderborn", "address": "Am Abdinghof 11, 33098 Paderborn", "phone": "+49 5251 88-0", "website": "https://www.paderborn.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Regensburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Regensburg',
  '93047',
  '{"name": "Standesamt Regensburg", "address": "Rathausplatz 1, 93047 Regensburg", "phone": "+49 941 507-0", "website": "https://www.regensburg.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Regensburg", "address": "D.-Martin-Luther-Straße 1, 93047 Regensburg", "phone": "+49 941 507-0", "website": "https://www.regensburg.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Ingolstadt
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Ingolstadt',
  '85049',
  '{"name": "Standesamt Ingolstadt", "address": "Rathausplatz 2, 85049 Ingolstadt", "phone": "+49 841 305-0", "website": "https://www.ingolstadt.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Ingolstadt", "address": "Rathausplatz 2, 85049 Ingolstadt", "phone": "+49 841 305-0", "website": "https://www.ingolstadt.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Würzburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Würzburg',
  '97070',
  '{"name": "Standesamt Würzburg", "address": "Rückermainstraße 2, 97070 Würzburg", "phone": "+49 931 37-0", "website": "https://www.wuerzburg.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Würzburg", "address": "Kaiserstraße 18, 97070 Würzburg", "phone": "+49 931 37-0", "website": "https://www.wuerzburg.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Fürth
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Fürth',
  '90762',
  '{"name": "Standesamt Fürth", "address": "Königstraße 88, 90762 Fürth", "phone": "+49 911 974-0", "website": "https://www.fuerth.de/standesamt", "hours": "Mon-Fri: 8:00-15:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  '{"name": "Jugendamt Fürth", "address": "Königstraße 88, 90762 Fürth", "phone": "+49 911 974-0", "website": "https://www.fuerth.de/jugendamt", "hours": "Mon-Fri: 8:00-16:00 (appointments required)", "appointmentRequired": true}'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

