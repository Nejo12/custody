-- ========================================
-- MIGRATION 009: Add Additional German Cities
-- ========================================
-- Adds 17 additional major German cities to the city_resources table
-- Uses placeholder data structure that can be updated with real data later
-- ========================================

-- Cologne (Köln)
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Cologne',
  '50667',
  '{
    "name": "Standesamt Köln",
    "address": "Willy-Brandt-Platz 2, 50679 Köln",
    "phone": "+49 221 221-0",
    "website": "https://www.stadt-koeln.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Köln",
    "address": "Willy-Brandt-Platz 2, 50679 Köln",
    "phone": "+49 221 221-0",
    "website": "https://www.stadt-koeln.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district. Check website for district-specific offices.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Frankfurt
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Frankfurt',
  '60311',
  '{
    "name": "Standesamt Frankfurt am Main",
    "address": "Braubachstraße 15, 60311 Frankfurt am Main",
    "phone": "+49 69 212-0",
    "website": "https://www.frankfurt.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Frankfurt am Main",
    "address": "Mainzer Landstraße 293, 60326 Frankfurt am Main",
    "phone": "+49 69 212-0",
    "website": "https://www.frankfurt.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available. Check website for your district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Stuttgart
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Stuttgart',
  '70173',
  '{
    "name": "Standesamt Stuttgart",
    "address": "Marktplatz 1, 70173 Stuttgart",
    "phone": "+49 711 216-0",
    "website": "https://www.stuttgart.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Stuttgart",
    "address": "Hohenheimer Straße 4, 70184 Stuttgart",
    "phone": "+49 711 216-0",
    "website": "https://www.stuttgart.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Düsseldorf
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Düsseldorf',
  '40213',
  '{
    "name": "Standesamt Düsseldorf",
    "address": "Marktplatz 1, 40213 Düsseldorf",
    "phone": "+49 211 89-0",
    "website": "https://www.duesseldorf.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Düsseldorf",
    "address": "Willi-Becker-Allee 7, 40227 Düsseldorf",
    "phone": "+49 211 89-0",
    "website": "https://www.duesseldorf.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Dortmund
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Dortmund',
  '44135',
  '{
    "name": "Standesamt Dortmund",
    "address": "Friedensplatz 1, 44135 Dortmund",
    "phone": "+49 231 50-0",
    "website": "https://www.dortmund.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Dortmund",
    "address": "Märkische Straße 24, 44141 Dortmund",
    "phone": "+49 231 50-0",
    "website": "https://www.dortmund.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Essen
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Essen',
  '45127',
  '{
    "name": "Standesamt Essen",
    "address": "Porscheplatz 1, 45127 Essen",
    "phone": "+49 201 88-0",
    "website": "https://www.essen.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Essen",
    "address": "Hollestraße 3, 45127 Essen",
    "phone": "+49 201 88-0",
    "website": "https://www.essen.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Leipzig
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Leipzig',
  '04109',
  '{
    "name": "Standesamt Leipzig",
    "address": "Martin-Luther-Ring 4-6, 04109 Leipzig",
    "phone": "+49 341 123-0",
    "website": "https://www.leipzig.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Leipzig",
    "address": "Praxedisstraße 1, 04103 Leipzig",
    "phone": "+49 341 123-0",
    "website": "https://www.leipzig.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Dresden
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Dresden',
  '01067',
  '{
    "name": "Standesamt Dresden",
    "address": "Dr.-Külz-Ring 19, 01067 Dresden",
    "phone": "+49 351 488-0",
    "website": "https://www.dresden.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Dresden",
    "address": "Grunaer Straße 2, 01069 Dresden",
    "phone": "+49 351 488-0",
    "website": "https://www.dresden.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Hannover
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Hannover',
  '30159',
  '{
    "name": "Standesamt Hannover",
    "address": "Trammplatz 2, 30159 Hannover",
    "phone": "+49 511 168-0",
    "website": "https://www.hannover.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Hannover",
    "address": "Ihmepassage 5, 30159 Hannover",
    "phone": "+49 511 168-0",
    "website": "https://www.hannover.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Nuremberg (Nürnberg)
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Nuremberg',
  '90402',
  '{
    "name": "Standesamt Nürnberg",
    "address": "Rathausplatz 2, 90403 Nürnberg",
    "phone": "+49 911 231-0",
    "website": "https://www.nuernberg.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Nürnberg",
    "address": "Kopernikusplatz 12, 90459 Nürnberg",
    "phone": "+49 911 231-0",
    "website": "https://www.nuernberg.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Duisburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Duisburg',
  '47051',
  '{
    "name": "Standesamt Duisburg",
    "address": "Burgplatz 19, 47051 Duisburg",
    "phone": "+49 203 283-0",
    "website": "https://www.duisburg.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Duisburg",
    "address": "Königstraße 47, 47051 Duisburg",
    "phone": "+49 203 283-0",
    "website": "https://www.duisburg.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Bochum
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Bochum',
  '44787',
  '{
    "name": "Standesamt Bochum",
    "address": "Willy-Brandt-Platz 2-4, 44787 Bochum",
    "phone": "+49 234 910-0",
    "website": "https://www.bochum.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Bochum",
    "address": "Willy-Brandt-Platz 2-4, 44787 Bochum",
    "phone": "+49 234 910-0",
    "website": "https://www.bochum.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Wuppertal
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Wuppertal',
  '42103',
  '{
    "name": "Standesamt Wuppertal",
    "address": "Johannes-Rau-Platz 1, 42103 Wuppertal",
    "phone": "+49 202 563-0",
    "website": "https://www.wuppertal.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Wuppertal",
    "address": "Friedrich-Engels-Allee 25, 42285 Wuppertal",
    "phone": "+49 202 563-0",
    "website": "https://www.wuppertal.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Bielefeld
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Bielefeld',
  '33602',
  '{
    "name": "Standesamt Bielefeld",
    "address": "Niederwall 23, 33602 Bielefeld",
    "phone": "+49 521 51-0",
    "website": "https://www.bielefeld.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Bielefeld",
    "address": "Niederwall 23, 33602 Bielefeld",
    "phone": "+49 521 51-0",
    "website": "https://www.bielefeld.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Bonn
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Bonn',
  '53111',
  '{
    "name": "Standesamt Bonn",
    "address": "Berliner Platz 2, 53111 Bonn",
    "phone": "+49 228 77-0",
    "website": "https://www.bonn.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Bonn",
    "address": "Berliner Platz 2, 53111 Bonn",
    "phone": "+49 228 77-0",
    "website": "https://www.bonn.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Münster
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Münster',
  '48143',
  '{
    "name": "Standesamt Münster",
    "address": "Klemensstraße 10, 48143 Münster",
    "phone": "+49 251 492-0",
    "website": "https://www.muenster.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Münster",
    "address": "Hafenstraße 30, 48153 Münster",
    "phone": "+49 251 492-0",
    "website": "https://www.muenster.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Karlsruhe
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Karlsruhe',
  '76131',
  '{
    "name": "Standesamt Karlsruhe",
    "address": "Kaiserstraße 3, 76131 Karlsruhe",
    "phone": "+49 721 133-0",
    "website": "https://www.karlsruhe.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Karlsruhe",
    "address": "Kaiserstraße 3, 76131 Karlsruhe",
    "phone": "+49 721 133-0",
    "website": "https://www.karlsruhe.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Mannheim
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Mannheim',
  '68159',
  '{
    "name": "Standesamt Mannheim",
    "address": "E7, 68159 Mannheim",
    "phone": "+49 621 293-0",
    "website": "https://www.mannheim.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Mannheim",
    "address": "E7, 68159 Mannheim",
    "phone": "+49 621 293-0",
    "website": "https://www.mannheim.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Augsburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Augsburg',
  '86150',
  '{
    "name": "Standesamt Augsburg",
    "address": "Rathausplatz 1, 86150 Augsburg",
    "phone": "+49 821 324-0",
    "website": "https://www.augsburg.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Augsburg",
    "address": "Halderstraße 1, 86150 Augsburg",
    "phone": "+49 821 324-0",
    "website": "https://www.augsburg.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Contact information may vary by district.'
) ON CONFLICT (city, postcode) DO NOTHING;

-- Wiesbaden
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes)
VALUES (
  'Wiesbaden',
  '65183',
  '{
    "name": "Standesamt Wiesbaden",
    "address": "Schlossplatz 6, 65183 Wiesbaden",
    "phone": "+49 611 31-0",
    "website": "https://www.wiesbaden.de/standesamt",
    "hours": "Mon-Fri: 8:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Wiesbaden",
    "address": "Schlossplatz 6, 65183 Wiesbaden",
    "phone": "+49 611 31-0",
    "website": "https://www.wiesbaden.de/jugendamt",
    "hours": "Mon-Fri: 8:00-16:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Multiple district offices available.'
) ON CONFLICT (city, postcode) DO NOTHING;

