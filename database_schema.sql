-- SQL-скрипт для PostgreSQL
-- Создание базы данных для приложения управления целями

-- Включаем расширение для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- 4. Таблица карт пользователей
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    card_type TEXT NOT NULL, -- 'goal', 'habit', 'task', 'note', 'milestone'
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived', 'deleted'
    priority INTEGER DEFAULT 1, -- 1-5, где 5 - высший приоритет
    due_date DATE,
    tags TEXT[], -- массив тегов
    metadata JSONB, -- дополнительные данные в JSON формате
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_completed ON goals(is_completed);
CREATE INDEX idx_daily_actions_user_id ON daily_actions(user_id);
CREATE INDEX idx_daily_actions_date ON daily_actions(action_date);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_type ON cards(card_type);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_priority ON cards(priority);
CREATE INDEX idx_cards_due_date ON cards(due_date);

-- Создаем составной индекс для уникальности ежедневных действий пользователя
CREATE UNIQUE INDEX idx_daily_actions_user_date ON daily_actions(user_id, action_date);

-- Создаем GIN индекс для поиска по тегам
CREATE INDEX idx_cards_tags ON cards USING GIN(tags);

-- Создаем GIN индекс для поиска по метаданным
CREATE INDEX idx_cards_metadata ON cards USING GIN(metadata);

-- Комментарии к таблицам
COMMENT ON TABLE users IS 'Таблица пользователей Telegram';
COMMENT ON TABLE goals IS 'Таблица целей пользователей';
COMMENT ON TABLE daily_actions IS 'Таблица ежедневных действий пользователей';
COMMENT ON TABLE cards IS 'Таблица карт пользователей';

-- Комментарии к полям
COMMENT ON COLUMN users.telegram_id IS 'Уникальный ID пользователя в Telegram';
COMMENT ON COLUMN users.username IS 'Имя пользователя в Telegram';
COMMENT ON COLUMN users.first_name IS 'Имя пользователя из Telegram';
COMMENT ON COLUMN users.last_name IS 'Фамилия пользователя из Telegram';
COMMENT ON COLUMN users.photo_url IS 'URL аватарки пользователя из Telegram';
COMMENT ON COLUMN goals.goal_type IS 'Тип цели (например: health, career, education)';
COMMENT ON COLUMN goals.description IS 'Описание цели';
COMMENT ON COLUMN goals.is_completed IS 'Статус выполнения цели';
COMMENT ON COLUMN daily_actions.action_date IS 'Дата выполнения действия';
COMMENT ON COLUMN cards.title IS 'Заголовок карты';
COMMENT ON COLUMN cards.description IS 'Описание карты';
COMMENT ON COLUMN cards.card_type IS 'Тип карты (goal, habit, task, note, milestone)';
COMMENT ON COLUMN cards.status IS 'Статус карты (active, completed, archived, deleted)';
COMMENT ON COLUMN cards.priority IS 'Приоритет карты (1-5)';
COMMENT ON COLUMN cards.due_date IS 'Срок выполнения карты';
COMMENT ON COLUMN cards.tags IS 'Теги карты (массив строк)';
COMMENT ON COLUMN cards.metadata IS 'Дополнительные данные карты в JSON формате';
