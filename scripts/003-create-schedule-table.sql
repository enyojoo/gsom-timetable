-- Create schedule_events table
CREATE TABLE IF NOT EXISTS schedule_events (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_ru VARCHAR(255) NOT NULL,
    type_en VARCHAR(100) NOT NULL,
    type_ru VARCHAR(100) NOT NULL,
    teacher_en VARCHAR(255),
    teacher_ru VARCHAR(255),
    room VARCHAR(100),
    address_en VARCHAR(255),
    address_ru VARCHAR(255),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- 'weekly', 'bi-weekly', 'custom'
    recurrence_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_group_id ON schedule_events(group_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_group_date ON schedule_events(group_id, date);

-- Insert sample schedule data
INSERT INTO schedule_events (
    group_id, title_en, title_ru, type_en, type_ru, 
    teacher_en, teacher_ru, room, address_en, address_ru,
    start_time, end_time, date, is_recurring, recurrence_pattern, recurrence_end_date
) VALUES 
-- Sample events for group 1 (assuming it exists)
(1, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Лекция',
 'Dr. Smith', 'Д-р Смит', '101', 'Main Building', 'Главное здание',
 '09:00:00', '10:30:00', '2024-01-15', true, 'weekly', '2024-05-15'),

(1, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Семинар',
 'Prof. Johnson', 'Проф. Джонсон', '205', 'Business Building', 'Бизнес-здание',
 '11:00:00', '12:30:00', '2024-01-16', true, 'weekly', '2024-05-16'),

-- Sample events for group 2 (assuming it exists)
(2, 'Advanced Analytics', 'Продвинутая аналитика', 'Practical', 'Практическое занятие',
 'Dr. Brown', 'Д-р Браун', '301', 'IT Building', 'IT-здание',
 '14:00:00', '15:30:00', '2024-01-17', true, 'weekly', '2024-05-17'),

(2, 'Digital Transformation', 'Цифровая трансформация', 'Lecture', 'Лекция',
 'Prof. Davis', 'Проф. Дэвис', '102', 'Main Building', 'Главное здание',
 '16:00:00', '17:30:00', '2024-01-18', true, 'weekly', '2024-05-18')

ON CONFLICT DO NOTHING;
