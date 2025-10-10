# 🆓 Настройка бесплатных AI API

## Доступные бесплатные API для Беларуси

### 1. Hugging Face Inference API (Рекомендуется)

#### Получение API ключа:
1. Зайдите на https://huggingface.co/
2. Создайте аккаунт или войдите
3. Перейдите в Settings → Access Tokens
4. Создайте новый токен с правами "Read"
5. Скопируйте токен

#### Добавление в .env:
```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

### 2. Cohere API

#### Получение API ключа:
1. Зайдите на https://cohere.ai/
2. Создайте аккаунт
3. Перейдите в Dashboard → API Keys
4. Создайте новый ключ
5. Скопируйте ключ

#### Добавление в .env:
```env
COHERE_API_KEY=your_cohere_key_here
```

## Обновление .env файла

Добавьте в ваш .env файл:

```env
BOT_TOKEN=your_bot_token_here
HUGGINGFACE_API_KEY=hf_your_token_here
COHERE_API_KEY=your_cohere_key_here
```

## Запуск простого бота

```bash
python bot_simple.py
```

## Тестирование AI

```bash
python ai_agent_simple.py
```

## Команды бота

- `/start` - главное меню
- `/motivation` - получить мотивацию
- `/test_ai` - протестировать AI
- `/events` - список событий
- `/stats` - статистика использования

## Преимущества простого бота

✅ **Работает в Беларуси** - нет географических ограничений
✅ **Бесплатные API** - Hugging Face и Cohere
✅ **Fallback система** - всегда работает
✅ **Простота** - минимум зависимостей
✅ **Статистика** - отслеживание использования

## Fallback система

Если API недоступны, бот использует качественные предустановленные мотивационные сообщения с метафорами путешествий.

## Рекомендации

1. **Начните с Hugging Face** - проще в настройке
2. **Добавьте Cohere** - для резерва
3. **Fallback всегда работает** - бот никогда не сломается
