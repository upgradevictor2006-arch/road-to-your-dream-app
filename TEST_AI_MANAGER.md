# 🧪 Инструкция по тестированию ИИ-менеджера

## ⚡ Быстрый старт

Самый простой способ протестировать:

1. Откройте приложение в браузере
2. Откройте консоль (F12)
3. Скопируйте весь код из `test_ai_manager.js` в консоль
4. Выполните:
   ```javascript
   await quickTest(123456789)
   ```
5. Перейдите на вкладку "ИИ-Менеджер" и протестируйте все функции!

---

## Способ 1: Тестирование через консоль браузера (Рекомендуется)

### Шаг 1: Подготовка

1. Откройте ваше приложение в браузере (или на странице GitHub Pages)
2. Откройте консоль разработчика: `F12` или `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Перейдите на вкладку "Console"

### Шаг 2: Загрузка скрипта

Скопируйте весь код из файла `test_ai_manager.js` и вставьте в консоль, затем нажмите Enter.

Или используйте команду для загрузки скрипта:
```javascript
// Загрузите файл test_ai_manager.js или скопируйте его содержимое
```

### Шаг 3: Запуск теста

```javascript
// Используйте свой Telegram ID (или любой тестовый)
await quickTest(123456789)
```

**Опции:**
```javascript
await quickTest(123456789, {
    createGoals: true,      // Создать тестовые цели
    createActions: true,    // Создать тестовые действия
    actionsCount: 5         // Количество дней с действиями
})
```

### Шаг 4: Проверка функций

После настройки можете протестировать все функции:

```javascript
// Проверить данные пользователя
await tester.getUserData();

// Тест навигации (что делать дальше)
await tester.testNavigation();

// Тест анализа прогресса
await tester.testAnalyzeProgress();

// Тест совета
await tester.testAdvice("Как лучше организовать время?");

// Тест мотивации
await tester.testMotivation();
```

Или используйте UI:
1. Перейдите на вкладку "ИИ-Менеджер"
2. Нажмите любую кнопку (🧭 Что делать дальше?, 📊 Анализ прогресса, и т.д.)
3. Проверьте результаты

---

## Способ 2: Использование curl (для тестирования API напрямую)

### 1. Регистрация пользователя

```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "username": "test_user",
    "first_name": "Тестовый",
    "last_name": "Пользователь"
  }'
```

### 2. Создание целей

```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/goals \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "goals": [
      {
        "goal_type": "career",
        "description": "Научиться программировать на Python"
      },
      {
        "goal_type": "health",
        "description": "Пробегать 5 км три раза в неделю"
      }
    ]
  }'
```

### 3. Создание ежедневного действия

```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/actions/complete \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789
  }'
```

### 4. Проверка данных пользователя

```bash
curl https://road-to-your-dream-app-imtd.onrender.com/users/123456789/data
```

### 5. Тест ИИ-менеджера

**Навигация:**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/navigation \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789
  }'
```

**Анализ прогресса:**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/analyze-progress \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789
  }'
```

**Совет:**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Как лучше организовать время?",
    "telegram_id": 123456789
  }'
```

**Мотивация:**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/motivation \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789
  }'
```

---

## Способ 3: Использование Postman или Insomnia

### Настройка

1. Base URL: `https://road-to-your-dream-app-imtd.onrender.com`
2. Headers: `Content-Type: application/json`

### Эндпоинты для тестирования:

1. **POST /register** - Регистрация пользователя
   ```json
   {
     "telegram_id": 123456789,
     "username": "test_user",
     "first_name": "Тестовый"
   }
   ```

2. **POST /goals** - Создание целей
   ```json
   {
     "telegram_id": 123456789,
     "goals": [
       {
         "goal_type": "career",
         "description": "Научиться Python"
       }
     ]
   }
   ```

3. **POST /actions/complete** - Отметить действие
   ```json
   {
     "telegram_id": 123456789
   }
   ```

4. **GET /users/{telegram_id}/data** - Получить данные

5. **POST /ai/manager/navigation** - Навигация
6. **POST /ai/manager/analyze-progress** - Анализ прогресса
7. **POST /ai/manager/advice** - Совет
8. **POST /ai/manager/motivation** - Мотивация

---

## Полный сценарий тестирования

### В консоли браузера:

```javascript
// 1. Загрузить скрипт test_ai_manager.js

// 2. Быстрый тест (создает все автоматически)
await quickTest(123456789);

// 3. Проверка данных
await tester.getUserData();

// 4. Тест всех функций ИИ-менеджера
await tester.testNavigation();
await tester.testAnalyzeProgress();
await tester.testAdvice("Как начать достигать цели?");
await tester.testMotivation();

// 5. Проверка через UI
// Перейдите на вкладку "ИИ-Менеджер" и нажмите все кнопки
```

---

## Получение реального Telegram ID

Если вы хотите использовать свой реальный Telegram ID:

1. Откройте Telegram Web App вашего приложения
2. В консоли выполните:
   ```javascript
   if (window.Telegram && window.Telegram.WebApp) {
       const id = window.Telegram.WebApp.initDataUnsafe?.user?.id;
       console.log('Ваш Telegram ID:', id);
   }
   ```

3. Используйте этот ID для тестирования:
   ```javascript
   await quickTest(ВАШ_TELEGRAM_ID);
   ```

---

## Проверка результатов

После выполнения тестов проверьте:

1. ✅ Данные созданы в базе (через `getUserData()`)
2. ✅ Навигация возвращает рекомендации
3. ✅ Анализ прогресса показывает статистику
4. ✅ Советы работают с контекстом
5. ✅ Мотивация генерируется
6. ✅ UI отображает результаты корректно

---

## Устранение проблем

### Ошибка 404
- Убедитесь, что сервер обновлен
- Проверьте, что файл `ai_personal_manager.py` загружен на сервер

### Ошибка "Telegram ID не установлен"
```javascript
// Установите ID вручную:
window.aiManagerUI.manager.setTelegramId(123456789);
```

### Действия создаются только на сегодня
**Примечание:** API `/actions/complete` создает действия только с сегодняшней датой. Для создания действий за прошлые дни нужно:
- Либо использовать прямой доступ к базе данных
- Либо вызывать API несколько дней подряд
- Либо модифицировать API для поддержки указания даты

Для тестирования достаточно создать действия на сегодня - ИИ-менеджер все равно проанализирует существующие данные.

### Данные не создаются
- Проверьте подключение к интернету
- Убедитесь, что сервер доступен
- Проверьте логи в консоли

---

## Дополнительные команды

```javascript
// Создать только цели (без действий)
const tester = new AIManagerTester(123456789);
await tester.registerUser();
await tester.createTestGoals();
tester.initAIManager();

// Создать только действия (без целей)
const tester = new AIManagerTester(123456789);
await tester.registerUser();
await tester.createTestActions(7); // 7 дней подряд
tester.initAIManager();

// Очистить данные (вручную через API или базу данных)
// Для полной очистки нужно удалить пользователя из базы
```

