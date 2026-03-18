-- Migration: 004b_seed_data_additional.sql
-- Description: Add additional countries to reach ~200
-- Created: 2026-03-18
-- Purpose: Complete country seed data

insert into public.countries (name, code, multiplier) values
('Andorra', 'AD', 0.80),
('Antigua and Barbuda', 'AG', 0.60),
('Bahamas', 'BS', 0.65),
('Barbados', 'BB', 0.60),
('Belize', 'BZ', 0.55),
('Benin', 'BJ', 0.40),
('Bhutan', 'BT', 0.45),
('Bolivia', 'BO', 0.50),
('Congo Democratic Republic', 'CD', 0.40),
('Dominica', 'DM', 0.55),
('East Timor', 'TL', 0.40),
('Falkland Islands', 'FK', 0.50),
('Greenland', 'GL', 0.75),
('Guernsey', 'GG', 1.00),
('Guam', 'GU', 0.80),
('Isle of Man', 'IM', 0.90),
('Jersey', 'JE', 0.90),
('Macau', 'MO', 0.80),
('Micronesia', 'FM', 0.45),
('Montserrat', 'MS', 0.50),
('Niue', 'NU', 0.40),
('Norfolk Island', 'NF', 0.50),
('Palestine', 'PS', 0.45),
('Pitcairn Islands', 'PN', 0.40),
('Puerto Rico', 'PR', 0.75),
('Svalbard and Jan Mayen', 'SJ', 0.70),
('Tokelau', 'TK', 0.40),
('Turks and Caicos Islands', 'TC', 0.60),
('Virgin Islands British', 'VG', 0.70),
('Virgin Islands US', 'VI', 0.75),
('Wallis and Futuna', 'WF', 0.40)
on conflict (code) do nothing;
