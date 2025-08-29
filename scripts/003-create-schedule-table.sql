-- Create schedule_events table
CREATE TABLE IF NOT EXISTS schedule_events (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) NOT NULL,
    type_en VARCHAR(100) NOT NULL DEFAULT 'Lecture',
    type_ru VARCHAR(100) NOT NULL DEFAULT 'Лекция',
    teacher_en VARCHAR(255),
    teacher_ru VARCHAR(255),
    room VARCHAR(100),
    address_en VARCHAR(255),
    address_ru VARCHAR(255),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- 'weekly', 'biweekly', 'custom'
    recurrence_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_group_id ON schedule_events(group_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_group_date ON schedule_events(group_id, date);

-- Insert sample schedule events for testing
-- First, let's get some group IDs to work with
DO $$
DECLARE
    group_bak_men_24_b01 INTEGER;
    group_bak_men_24_b02 INTEGER;
    group_mag_men_24_m01 INTEGER;
BEGIN
    -- Get group IDs
    SELECT id INTO group_bak_men_24_b01 FROM groups WHERE full_code = '24.B01-vshm' LIMIT 1;
    SELECT id INTO group_bak_men_24_b02 FROM groups WHERE full_code = '24.B02-vshm' LIMIT 1;
    SELECT id INTO group_mag_men_24_m01 FROM groups WHERE full_code = '24.M01-vshm' LIMIT 1;

    -- Insert sample events only if groups exist and no events exist yet
    IF group_bak_men_24_b01 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM schedule_events WHERE group_id = group_bak_men_24_b01) THEN
        -- Bachelor Management 24 B01 schedule
        INSERT INTO schedule_events (group_id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru, room, address_en, address_ru, start_time, end_time, date) VALUES
        (group_bak_men_24_b01, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция', 'Dr. Smith', 'Д-р Смит', '101', 'Main Building', 'Главное здание', '09:00', '10:30', '2024-12-30'),
        (group_bak_men_24_b01, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Семинар', 'Prof. Johnson', 'Проф. Джонсон', '205', 'Business Center', 'Бизнес-центр', '11:00', '12:30', '2024-12-30'),
        (group_bak_men_24_b01, 'Financial Analysis', 'Финансовый анализ', 'Practical', 'Практическое занятие', 'Dr. Brown', 'Д-р Браун', '301', 'Finance Lab', 'Финансовая лаборатория', '14:00', '15:30', '2024-12-30'),
        (group_bak_men_24_b01, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция', 'Dr. Smith', 'Д-р Смит', '101', 'Main Building', 'Главное здание', '09:00', '10:30', '2024-12-31'),
        (group_bak_men_24_b01, 'Operations Management', 'Операционный менеджмент', 'Seminar', 'Семинар', 'Prof. Davis', 'Проф. Дэвис', '102', 'Main Building', 'Главное здание', '11:00', '12:30', '2024-12-31');
    END IF;

    IF group_bak_men_24_b02 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM schedule_events WHERE group_id = group_bak_men_24_b02) THEN
        -- Bachelor Management 24 B02 schedule
        INSERT INTO schedule_events (group_id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru, room, address_en, address_ru, start_time, end_time, date) VALUES
        (group_bak_men_24_b02, 'Business Ethics', 'Деловая этика', 'Lecture', 'Лекция', 'Dr. Wilson', 'Д-р Уилсон', '201', 'Ethics Hall', 'Зал этики', '10:00', '11:30', '2024-12-30'),
        (group_bak_men_24_b02, 'Project Management', 'Управление проектами', 'Practical', 'Практическое занятие', 'Prof. Taylor', 'Проф. Тейлор', '302', 'Project Lab', 'Проектная лаборатория', '13:00', '14:30', '2024-12-30');
    END IF;

    IF group_mag_men_24_m01 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM schedule_events WHERE group_id = group_mag_men_24_m01) THEN
        -- Master Management 24 M01 schedule
        INSERT INTO schedule_events (group_id, title_en, title_ru, type_en, type_ru, teacher_en, teacher_ru, room, address_en, address_ru, start_time, end_time, date) VALUES
        (group_mag_men_24_m01, 'Advanced Analytics', 'Продвинутая аналитика', 'Lecture', 'Лекция', 'Prof. Anderson', 'Проф. Андерсон', '401', 'Analytics Center', 'Центр аналитики', '09:30', '11:00', '2024-12-30'),
        (group_mag_men_24_m01, 'Digital Transformation', 'Цифровая трансформация', 'Seminar', 'Семинар', 'Dr. Martinez', 'Д-р Мартинес', '402', 'Digital Lab', 'Цифровая лаборатория', '11:30', '13:00', '2024-12-30');
    END IF;
END $$;
