-- Create schedule_events table
CREATE TABLE IF NOT EXISTS schedule_events (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255),
    type_en VARCHAR(100) NOT NULL DEFAULT 'Lecture',
    type_ru VARCHAR(100) DEFAULT 'Лекция',
    teacher_en VARCHAR(255),
    teacher_ru VARCHAR(255),
    room VARCHAR(50),
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
    group_id_1 INTEGER;
    group_id_2 INTEGER;
BEGIN
    -- Get first available group ID
    SELECT id INTO group_id_1 FROM groups LIMIT 1;
    
    -- Get second available group ID
    SELECT id INTO group_id_2 FROM groups OFFSET 1 LIMIT 1;
    
    -- Only insert if we have groups
    IF group_id_1 IS NOT NULL THEN
        -- Insert sample events for the first group
        INSERT INTO schedule_events (
            group_id, title_en, title_ru, type_en, type_ru, 
            teacher_en, teacher_ru, room, address_en, address_ru,
            start_time, end_time, date
        ) VALUES
        (group_id_1, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция',
         'Dr. Smith', 'Др. Смит', 'A101', 'Main Building', 'Главное здание',
         '09:00', '10:30', CURRENT_DATE),
        (group_id_1, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Семинар',
         'Prof. Johnson', 'Проф. Джонсон', 'B205', 'Business Building', 'Бизнес здание',
         '11:00', '12:30', CURRENT_DATE),
        (group_id_1, 'Financial Analysis', 'Финансовый анализ', 'Practical Lesson', 'Практическое занятие',
         'Dr. Brown', 'Др. Браун', 'C301', 'Finance Center', 'Финансовый центр',
         '14:00', '15:30', CURRENT_DATE + INTERVAL '1 day');
    END IF;
    
    IF group_id_2 IS NOT NULL THEN
        -- Insert sample events for the second group
        INSERT INTO schedule_events (
            group_id, title_en, title_ru, type_en, type_ru,
            teacher_en, teacher_ru, room, address_en, address_ru,
            start_time, end_time, date
        ) VALUES
        (group_id_2, 'Advanced Analytics', 'Продвинутая аналитика', 'Lecture', 'Лекция',
         'Dr. Wilson', 'Др. Уилсон', 'D401', 'Tech Building', 'Технологическое здание',
         '10:00', '11:30', CURRENT_DATE),
        (group_id_2, 'Digital Transformation', 'Цифровая трансформация', 'Workshop', 'Мастер-класс',
         'Prof. Davis', 'Проф. Дэвис', 'E502', 'Innovation Lab', 'Лаборатория инноваций',
         '13:00', '14:30', CURRENT_DATE + INTERVAL '2 days');
    END IF;
END $$;
