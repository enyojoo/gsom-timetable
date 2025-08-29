-- Insert degrees
INSERT INTO degrees (name_en, name_ru, code) VALUES
('Bachelor''s', 'Бакалавриат', 'bachelor'),
('Master''s', 'Магистратура', 'master')
ON CONFLICT (code) DO NOTHING;

-- Insert programs for Bachelor's degree
INSERT INTO programs (degree_id, name_en, name_ru, code) VALUES
((SELECT id FROM degrees WHERE code = 'bachelor'), 'Management', 'Менеджмент', 'management'),
((SELECT id FROM degrees WHERE code = 'bachelor'), 'International Management', 'Международный менеджмент', 'international-management'),
((SELECT id FROM degrees WHERE code = 'bachelor'), 'Public Administration', 'Государственное и муниципальное управление', 'public-administration')
ON CONFLICT (degree_id, code) DO NOTHING;

-- Insert programs for Master's degree
INSERT INTO programs (degree_id, name_en, name_ru, code) VALUES
((SELECT id FROM degrees WHERE code = 'master'), 'Management', 'Менеджмент', 'management'),
((SELECT id FROM degrees WHERE code = 'master'), 'Business Analytics and Big Data', 'Бизнес-аналитика и большие данные', 'business-analytics'),
((SELECT id FROM degrees WHERE code = 'master'), 'Smart City Management', 'Управление умным городом', 'smart-city-management'),
((SELECT id FROM degrees WHERE code = 'master'), 'Corporate Finance', 'Корпоративные финансы', 'corporate-finance')
ON CONFLICT (degree_id, code) DO NOTHING;

-- Insert groups for Bachelor's Management
INSERT INTO groups (program_id, year, code, full_code, name_en, name_ru) VALUES
-- 2021 Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B01', '21.B01-vshm', 'B01', 'Б01'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B02', '21.B02-vshm', 'B02', 'Б02'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B03', '21.B03-vshm', 'B03', 'Б03'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B04', '21.B04-vshm', 'B04', 'Б04'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B05', '21.B05-vshm', 'B05', 'Б05'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B06', '21.B06-vshm', 'B06', 'Б06'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B07', '21.B07-vshm', 'B07', 'Б07'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B08', '21.B08-vshm', 'B08', 'Б08'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2021, 'B14', '21.B14-vshm', 'B14', 'Б14'),

-- 2022 Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B01', '22.B01-vshm', 'B01', 'Б01'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B02', '22.B02-vshm', 'B02', 'Б02'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B03', '22.B03-vshm', 'B03', 'Б03'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B04', '22.B04-vshm', 'B04', 'Б04'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B05', '22.B05-vshm', 'B05', 'Б05'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B06', '22.B06-vshm', 'B06', 'Б06'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B07', '22.B07-vshm', 'B07', 'Б07'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2022, 'B08', '22.B08-vshm', 'B08', 'Б08'),

-- 2023 Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B01', '23.B01-vshm', 'B01', 'Б01'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B02', '23.B02-vshm', 'B02', 'Б02'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B03', '23.B03-vshm', 'B03', 'Б03'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B04', '23.B04-vshm', 'B04', 'Б04'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B05', '23.B05-vshm', 'B05', 'Б05'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B06', '23.B06-vshm', 'B06', 'Б06'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2023, 'B07', '23.B07-vshm', 'B07', 'Б07'),

-- 2024 Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B01', '24.B01-vshm', 'B01', 'Б01'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B02', '24.B02-vshm', 'B02', 'Б02'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B03', '24.B03-vshm', 'B03', 'Б03'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B04', '24.B04-vshm', 'B04', 'Б04'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B05', '24.B05-vshm', 'B05', 'Б05'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B06', '24.B06-vshm', 'B06', 'Б06'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B07', '24.B07-vshm', 'B07', 'Б07'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'management'), 2024, 'B08', '24.B08-vshm', 'B08', 'Б08')
ON CONFLICT (full_code) DO NOTHING;

-- Insert International Management groups
INSERT INTO groups (program_id, year, code, full_code, name_en, name_ru) VALUES
-- 2021 International Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2021, 'B10', '21.B10-vshm', 'B10', 'Б10'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2021, 'B11', '21.B11-vshm', 'B11', 'Б11'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2021, 'B12', '21.B12-vshm', 'B12', 'Б12'),

-- 2022 International Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2022, 'B12', '22.B12-vshm', 'B12', 'Б12'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2022, 'B13', '22.B13-vshm', 'B13', 'Б13'),

-- 2023 International Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2023, 'B11', '23.B11-vshm', 'B11', 'Б11'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2023, 'B12', '23.B12-vshm', 'B12', 'Б12'),

-- 2024 International Management groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2024, 'B11', '24.B11-vshm', 'B11', 'Б11'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'international-management'), 2024, 'B12', '24.B12-vshm', 'B12', 'Б12')
ON CONFLICT (full_code) DO NOTHING;

-- Insert Public Administration groups
INSERT INTO groups (program_id, year, code, full_code, name_en, name_ru) VALUES
-- 2021 Public Administration groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2021, 'B09', '21.B09-vshm', 'B09', 'Б09'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2021, 'B13', '21.B13-vshm', 'B13', 'Б13'),

-- 2022 Public Administration groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2022, 'B10', '22.B10-vshm', 'B10', 'Б10'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2022, 'B11', '22.B11-vshm', 'B11', 'Б11'),

-- 2023 Public Administration groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2023, 'B09', '23.B09-vshm', 'B09', 'Б09'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2023, 'B10', '23.B10-vshm', 'B10', 'Б10'),

-- 2024 Public Administration groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2024, 'B09', '24.B09-vshm', 'B09', 'Б09'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'bachelor' AND p.code = 'public-administration'), 2024, 'B10', '24.B10-vshm', 'B10', 'Б10')
ON CONFLICT (full_code) DO NOTHING;

-- Insert Master's groups
INSERT INTO groups (program_id, year, code, full_code, name_en, name_ru) VALUES
-- 2023 Master's groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'management'), 2023, 'M01', '23.M01-vshm', 'M01', 'М01'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'corporate-finance'), 2023, 'M02', '23.M02-vshm', 'M02', 'М02'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'smart-city-management'), 2023, 'M03', '23.M03-vshm', 'M03', 'М03'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'business-analytics'), 2023, 'M04', '23.M04-vshm', 'M04', 'М04'),

-- 2024 Master's groups
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'management'), 2024, 'M01', '24.M01-vshm', 'M01', 'М01'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'corporate-finance'), 2024, 'M02', '24.M02-vshm', 'M02', 'М02'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'smart-city-management'), 2024, 'M03', '24.M03-vshm', 'M03', 'М03'),
((SELECT p.id FROM programs p JOIN degrees d ON p.degree_id = d.id WHERE d.code = 'master' AND p.code = 'business-analytics'), 2024, 'M04', '24.M04-vshm', 'M04', 'М04')
ON CONFLICT (full_code) DO NOTHING;
