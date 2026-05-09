-- Wipes votes, candidates, constituencies, parties, elections, and users.
-- Keeps only cities in these provinces: Punjab, Sindh, KPK, Balochistan, Gilgit-Baltistan.
-- Re-run admin seed after: npx ts-node src/seeds/seed-admin.ts (or npm script).
--
-- psql $DATABASE_URL -f backend/scripts/reset-data-keep-five-provinces.sql

BEGIN;

TRUNCATE TABLE votes, candidates, constituencies, parties, elections, users CASCADE;

-- Normalize common spellings, then drop cities outside the five provinces
UPDATE cities SET province = 'Punjab' WHERE LOWER(TRIM(province)) = 'punjab';
UPDATE cities SET province = 'Sindh' WHERE LOWER(TRIM(province)) = 'sindh';
UPDATE cities SET province = 'KPK' WHERE LOWER(TRIM(province)) IN ('kpk', 'kp', 'khyber pakhtunkhwa');
UPDATE cities SET province = 'Balochistan' WHERE LOWER(TRIM(province)) = 'balochistan';
UPDATE cities SET province = 'Gilgit-Baltistan' WHERE LOWER(TRIM(province)) IN ('gilgit-baltistan', 'gilgit baltistan', 'gb');

DELETE FROM cities
WHERE province NOT IN ('Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan');

COMMIT;
