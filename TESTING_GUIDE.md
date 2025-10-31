# 🧪 Руководство по тестированию интеграции

## 📋 **Пошаговая инструкция**

### **1. Подготовка фронтенда**

1. **Добавьте файл `frontend_integration.js`** в ваш проект
2. **Подключите его в `index.html`:**
   ```html
   <script src="frontend_integration.js"></script>
   <script src="script.js"></script>
   ```

3. **Обновите функции в `script.js`** используя код из `updated_script_functions.js`

### **1.1. Подготовка ИИ-менеджера**

1. **Добавьте файлы ИИ-менеджера** в ваш проект:
   - `ai_manager_frontend.js` - клиент для работы с API
   - `ai_manager_ui.js` - UI модуль для интерфейса

2. **Подключите их в `index.html`:**
   ```html
   <script src="ai_manager_frontend.js"></script>
   <script src="ai_manager_ui.js"></script>
   <script src="script.js"></script>
   ```

3. **Убедитесь, что файл `ai_personal_manager.py` добавлен на сервер** (должен быть в той же папке, что и `main.py`)

### **2. Тестирование в браузере**

1. **Откройте `index.html` в браузере**
2. **Откройте консоль разработчика (F12)**
3. **Проверьте, что API доступен:**
   ```javascript
   // В консоли браузера
   fetch('https://road-to-your-dream-app-imtd.onrender.com/')
     .then(r => r.json())
     .then(console.log);
   ```

4. **Ожидаемый результат:**
   ```json
   {"status": "ok"}
   ```

### **3. Тестирование в Telegram**

1. **Запустите бота в Telegram**
2. **Нажмите кнопку "🚀 Открыть мой путь"**
3. **Проверьте консоль** - должны появиться логи авторизации

### **4. Тестирование API эндпоинтов**

#### **4.1. Проверка статуса API**
```bash
curl https://road-to-your-dream-app-imtd.onrender.com/
```

#### **4.2. Тестирование авторизации**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "first_name": "Тест",
    "last_name": "Пользователь",
    "username": "test_user",
    "photo_url": "https://example.com/photo.jpg"
  }'
```

#### **4.3. Тестирование создания карт**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/cards \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_id": 123456789,
    "cards": [{
      "title": "Изучить Python",
      "description": "Пройти курс по Python",
      "card_type": "goal",
      "priority": 3,
      "tags": ["обучение", "программирование"]
    }]
  }'
```

#### **4.4. Тестирование AI мотивации**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/motivation \
  -H "Content-Type: application/json" \
  -d '{"event": "first_goal"}'
```

#### **4.5. Тестирование ИИ-менеджера (разбиение цели)**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/break-goal \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Выучить английский язык",
    "description": "Хочу свободно говорить на английском",
    "goal_type": "education"
  }'
```

#### **4.6. Тестирование навигации ИИ-менеджера**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/navigation \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789}'
```

#### **4.7. Тестирование персонального совета**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Как организовать время для достижения целей?",
    "telegram_id": 123456789
  }'
```

#### **4.8. Тестирование анализа прогресса**
```bash
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/analyze-progress \
  -H "Content-Type: application/json" \
  -d '{"telegram_id": 123456789}'
```

#### **4.9. Тестирование статистики ИИ-менеджера**
```bash
curl https://road-to-your-dream-app-imtd.onrender.com/ai/manager/stats
```

### **5. Проверка базы данных в Supabase**

1. **Откройте ваш проект в Supabase**
2. **Перейдите в Table Editor**
3. **Проверьте таблицы:**
   - `users` - должны появиться пользователи
   - `cards` - должны появиться карты
   - `goals` - должны появиться цели
   - `daily_actions` - должны появиться действия

### **6. Ожидаемые результаты**

#### **✅ Успешная авторизация:**
```json
{
  "id": "uuid-here",
  "telegram_id": 123456789,
  "username": "test_user",
  "first_name": "Тест",
  "last_name": "Пользователь",
  "photo_url": "https://example.com/photo.jpg",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### **✅ Успешное создание карты:**
```json
{
  "message": "Создано 1 карт",
  "cards": [{
    "id": "uuid-here",
    "user_id": "user-uuid-here",
    "title": "Изучить Python",
    "description": "Пройти курс по Python",
    "card_type": "goal",
    "status": "active",
    "priority": 3,
    "tags": ["обучение", "программирование"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }]
}
```

#### **✅ AI мотивация:**
```json
{
  "message": "Твой путь начинается! Каждое великое путешествие начинается с первого шага. Вперед к мечте!",
  "event": "first_goal"
}
```

#### **✅ Разбиение цели на этапы:**
```json
{
  "success": true,
  "steps": [
    {
      "title": "Изучить основы грамматики",
      "description": "Освоить основные времена и структуры",
      "estimated_days": 14,
      "priority": 5
    }
  ],
  "advice": "Начните с основ...",
  "total_steps": 4
}
```

#### **✅ Навигационные рекомендации:**
```json
{
  "success": true,
  "next_actions": [
    {
      "title": "Выполни ежедневное действие",
      "description": "Сделай хотя бы один шаг к своей цели сегодня",
      "priority": 5
    }
  ],
  "focus": "Сосредоточься на выполнении ежедневных действий",
  "warnings": []
}
```

### **7. Возможные проблемы и решения**

#### **❌ CORS ошибки:**
- Проверьте, что в `main.py` настроен CORS для всех источников
- Убедитесь, что фронтенд загружается с правильного домена

#### **❌ 404 ошибки:**
- Проверьте URL API в `frontend_integration.js`
- Убедитесь, что сервер запущен
- **Для ИИ-менеджера:** Убедитесь, что файл `ai_personal_manager.py` загружен на сервер и сервер перезапущен
- Проверьте, что эндпоинты `/ai/manager/*` доступны (см. раздел 4.5-4.9)

#### **❌ 500 ошибки:**
- Проверьте логи в Render.com
- Убедитесь, что база данных настроена правильно

#### **❌ Telegram WebApp не работает:**
- Проверьте, что бот настроен правильно
- Убедитесь, что WebApp URL указан в настройках бота

#### **❌ ИИ-менеджер показывает 404 ошибку:**
- Убедитесь, что файл `ai_personal_manager.py` загружен на сервер
- Проверьте, что файл находится в той же директории, что и `main.py`
- Перезапустите сервер после добавления файла
- Проверьте логи сервера на наличие ошибок импорта
- Временно приложение будет использовать fallback версию (локальная версия без ИИ)

### **8. Мониторинг**

#### **В Render.com:**
- Проверьте логи развертывания
- Убедитесь, что сервис работает

#### **В Supabase:**
- Проверьте логи запросов
- Убедитесь, что данные сохраняются

#### **В браузере:**
- Проверьте Network tab в DevTools
- Убедитесь, что запросы отправляются

### **9. Тестирование ИИ-менеджера в браузере**

1. **Откройте `index.html` в браузере**
2. **Нажмите кнопку "ИИ" в нижней навигации**
3. **Протестируйте функции:**

#### **9.1. Разбиение цели на этапы**
- Нажмите кнопку "🎯 Разбить цель на этапы"
- Введите название цели и описание
- Проверьте результат

#### **9.2. Навигация**
- Нажмите кнопку "🧭 Что делать дальше?"
- **Примечание:** Требует Telegram ID (автоматически определяется в Telegram WebApp)

#### **9.3. Персональный совет**
- Нажмите кнопку "💡 Получить совет"
- Введите вопрос
- Проверьте ответ

#### **9.4. Анализ прогресса**
- Нажмите кнопку "📊 Анализ прогресса"
- **Примечание:** Требует Telegram ID и данные пользователя в базе

#### **9.5. Чат с ИИ**
- Введите вопрос в поле ввода
- Нажмите Enter или кнопку "Отправить"
- Проверьте ответ

### **10. Проверка доступности эндпоинтов ИИ-менеджера**

Откройте консоль браузера (F12) и выполните:

```javascript
// Проверка базового эндпоинта
fetch('https://road-to-your-dream-app-imtd.onrender.com/ai/manager/stats')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**✅ Если сервер обновлен:**
```json
{
  "success": true,
  "stats": {
    "groq_success": 0,
    "groq_failures": 0,
    "fallback_used": 0,
    "total_requests": 0
  }
}
```

**❌ Если сервер не обновлен:**
```json
{
  "detail": "Not Found"
}
```

В этом случае используйте fallback версию или обновите сервер.

---

**Готово!** 🎉 Теперь ваше приложение полностью интегрировано с бэкендом и ИИ-менеджером!
