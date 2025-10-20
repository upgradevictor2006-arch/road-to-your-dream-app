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

### **7. Возможные проблемы и решения**

#### **❌ CORS ошибки:**
- Проверьте, что в `main.py` настроен CORS для всех источников
- Убедитесь, что фронтенд загружается с правильного домена

#### **❌ 404 ошибки:**
- Проверьте URL API в `frontend_integration.js`
- Убедитесь, что сервер запущен

#### **❌ 500 ошибки:**
- Проверьте логи в Render.com
- Убедитесь, что база данных настроена правильно

#### **❌ Telegram WebApp не работает:**
- Проверьте, что бот настроен правильно
- Убедитесь, что WebApp URL указан в настройках бота

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

---

**Готово!** 🎉 Теперь ваше приложение полностью интегрировано с бэкендом!
