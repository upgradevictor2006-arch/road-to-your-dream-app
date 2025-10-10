-- SQL-скрипт для PostgreSQL
-- Создание базы данных для приложения управления целями

-- Включаем расширение для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица целей
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    goal_type TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Таблица ежедневных действий
CREATE TABLE daily_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_completed ON goals(is_completed);
CREATE INDEX idx_daily_actions_user_id ON daily_actions(user_id);
CREATE INDEX idx_daily_actions_date ON daily_actions(action_date);

-- Создаем составной индекс для уникальности ежедневных действий пользователя
CREATE UNIQUE INDEX idx_daily_actions_user_date ON daily_actions(user_id, action_date);

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Таблица пользователей Telegram';
COMMENT ON TABLE goals IS 'Таблица целей пользователей';
COMMENT ON TABLE daily_actions IS 'Таблица ежедневных действий пользователей';

-- Комментарии к полям
COMMENT ON COLUMN users.telegram_id IS 'Уникальный ID пользователя в Telegram';
COMMENT ON COLUMN users.username IS 'Имя пользователя в Telegram';
COMMENT ON COLUMN goals.goal_type IS 'Тип цели (например: health, career, education)';
COMMENT ON COLUMN goals.description IS 'Описание цели';
COMMENT ON COLUMN goals.is_completed IS 'Статус выполнения цели';
COMMENT ON COLUMN daily_actions.action_date IS 'Дата выполнения действия';
