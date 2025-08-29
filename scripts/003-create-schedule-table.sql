-- Create schedule_events table
CREATE TABLE IF NOT EXISTS schedule_events (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    subject_en VARCHAR(255) NOT NULL,
    subject_ru VARCHAR(255),
    event_type VARCHAR(50) NOT NULL DEFAULT 'Lecture',
    teacher_en VARCHAR(255),
    teacher_ru VARCHAR(255),
    room VARCHAR(100),
    address VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    recurrence_type VARCHAR(20) DEFAULT 'none',
    recurrence_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_events_group_id ON schedule_events(group_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_start_time ON schedule_events(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_events_group_time ON schedule_events(group_id, start_time);

-- Insert sample schedule events for testing
-- First, let's get some group IDs to work with
DO $$
DECLARE
    group_b01_id INTEGER;
    group_b02_id INTEGER;
BEGIN
    -- Get group IDs for sample data
    SELECT id INTO group_b01_id FROM groups WHERE full_code = '24.B01-vshm' LIMIT 1;
    SELECT id INTO group_b02_id FROM groups WHERE full_code = '24.B02-vshm' LIMIT 1;
    
    -- Only insert if we found the groups
    IF group_b01_id IS NOT NULL THEN
        -- Sample events for group B01
        INSERT INTO schedule_events (group_id, subject_en, subject_ru, event_type, teacher_en, teacher_ru, room, address, start_time, end_time) VALUES
        (group_b01_id, 'Strategic Management', 'Стратегический менеджмент', 'Lecture', 'Dr. Smith', 'Др. Смит', '101', 'Main Building', '2024-01-15 09:00:00', '2024-01-15 10:30:00'),
        (group_b01_id, 'Marketing Research', 'Маркетинговые исследования', 'Seminar', 'Prof. Johnson', 'Проф. Джонсон', '205', 'Business Center', '2024-01-15 11:00:00', '2024-01-15 12:30:00'),
        (group_b01_id, 'Financial Analysis', 'Финансовый анализ', 'Practical', 'Dr. Brown', 'Др. Браун', '301', 'Finance Lab', '2024-01-16 14:00:00', '2024-01-16 15:30:00');
    END IF;
    
    IF group_b02_id IS NOT NULL THEN
        -- Sample events for group B02
        INSERT INTO schedule_events (group_id, subject_en, subject_ru, event_type, teacher_en, teacher_ru, room, address, start_time, end_time) VALUES
        (group_b02_id, 'Operations Management', 'Операционный менеджмент', 'Lecture', 'Dr. Wilson', 'Др. Вилсон', '102', 'Main Building', '2024-01-15 10:00:00', '2024-01-15 11:30:00'),
        (group_b02_id, 'Business Ethics', 'Бизнес-этика', 'Seminar', 'Prof. Davis', 'Проф. Дэвис', '206', 'Business Center', '2024-01-15 13:00:00', '2024-01-15 14:30:00');
    END IF;
END $$;
