-- ========================================
-- MIGRATION 008: Migrate Existing City Resources
-- ========================================
-- Migrates the 3 existing cities from JSON to database
-- ========================================

-- Insert Berlin
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, notes, verified_at)
VALUES (
  'Berlin',
  '10115',
  '{
    "name": "Standesamt Mitte",
    "address": "Mathilde-Jacob-Platz 1, 10551 Berlin",
    "phone": "+49 30 9018-0",
    "website": "https://www.berlin.de/ba-mitte/politik-und-verwaltung/aemter/amt-fuer-buergerdienste/standesamt/",
    "hours": "Mon-Fri: 8:00-15:00 (appointments recommended)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Mitte",
    "address": "Mathilde-Jacob-Platz 1, 10551 Berlin",
    "phone": "+49 30 9018-0",
    "website": "https://www.berlin.de/ba-mitte/politik-und-verwaltung/aemter/jugendamt/",
    "hours": "Mon-Fri: 9:00-15:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  'Berlin has 12 district Jugendamt offices. This is for Mitte district. Find your district office on berlin.de',
  NOW()
) ON CONFLICT (city, postcode) DO NOTHING;

-- Insert Hamburg
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, verified_at)
VALUES (
  'Hamburg',
  '20095',
  '{
    "name": "Standesamt Hamburg-Mitte",
    "address": "Caffamacherreihe 1-3, 20355 Hamburg",
    "phone": "+49 40 428 63-0",
    "website": "https://www.hamburg.de/standesaemter/",
    "hours": "Mon, Wed, Fri: 7:30-14:00, Thu: 7:30-18:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Jugendamt Hamburg-Mitte",
    "address": "Caffamacherreihe 1-3, 20355 Hamburg",
    "phone": "+49 40 428 54-0",
    "website": "https://www.hamburg.de/jugendaemter/",
    "hours": "Mon-Thu: 7:30-16:00, Fri: 7:30-13:00",
    "appointmentRequired": true
  }'::jsonb,
  NOW()
) ON CONFLICT (city, postcode) DO NOTHING;

-- Insert Munich
INSERT INTO city_resources (city, postcode, standesamt, jugendamt, verified_at)
VALUES (
  'Munich',
  '80331',
  '{
    "name": "Standesamt München",
    "address": "Ruppertstraße 11, 80337 München",
    "phone": "+49 89 233-96000",
    "website": "https://www.muenchen.de/rathaus/Stadtverwaltung/Kreisverwaltungsreferat/Standesamt.html",
    "hours": "Mon-Fri: 8:30-12:00 (appointments required)",
    "appointmentRequired": true
  }'::jsonb,
  '{
    "name": "Stadtjugendamt München",
    "address": "Severinstraße 2, 81541 München",
    "phone": "+49 89 233-49501",
    "website": "https://www.muenchen.de/rathaus/Stadtverwaltung/Sozialreferat/Jugendamt.html",
    "hours": "Mon-Fri: 8:30-12:00, Tue & Thu: also 14:00-16:00",
    "appointmentRequired": true
  }'::jsonb,
  NOW()
) ON CONFLICT (city, postcode) DO NOTHING;

