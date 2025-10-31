# ✅ Проверка интеграции бэкенда, фронтенда и ИИ-агента

## 🚀 После коммита и деплоя

### **1. Проверка базового API (бэкенд работает)**

#### В браузере (откройте консоль F12):

```javascript
// Проверка доступности API
fetch('https://road-to-your-dream-app-imtd.onrender.com/')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API работает:', data);
    // Ожидаем: {status: "ok"}
  })
  .catch(err => {
    console.error('❌ API недоступен:', err);
  });
```

**Ожидаемый результат:**
```json
{"status": "ok"}
```

---

### **2. Проверка авторизации через Telegram WebApp**

#### В браузере (консоль):

```javascript
// Проверка Telegram WebApp данных
if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
    console.log('✅ Telegram данные:', tgUser);
    
    // Проверяем авторизацию через API
    fetch('https://road-to-your-dream-app-imtd.onrender.com/auth/telegram', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            telegram_id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            photo_url: tgUser.photo_url
        })
    })
    .then(r => r.json())
    .then(data => {
        console.log('✅ Авторизация успешна:', data);
        // Ожидаем данные пользователя
    })
    .catch(err => console.error('❌ Ошибка авторизации:', err));
} else {
    console.log('⚠️ Telegram WebApp не обнаружен (работаете в браузере)');
}
```

**Ожидаемый результат:**
```json
{
  "id": "uuid...",
  "telegram_id": 123456789,
  "username": "your_username",
  "first_name": "Имя",
  ...
}
```

---

### **3. Проверка ИИ-менеджера (разбиение цели)**

#### В браузере (консоль):

```javascript
// Проверка эндпоинта разбиения цели
fetch('https://road-to-your-dream-app-imtd.onrender.com/ai/manager/break-goal', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        title: "Выучить английский язык",
        description: "Хочу свободно говорить",
        goal_type: "education"
    })
})
.then(r => r.json())
.then(data => {
    if (data.success) {
        console.log('✅ ИИ-менеджер работает!', data);
        console.log('Этапов создано:', data.total_steps);
        console.log('Этапы:', data.steps);
    } else {
        console.error('❌ ИИ-менеджер вернул ошибку:', data);
    }
})
.catch(err => {
    console.error('❌ ИИ-менеджер недоступен:', err);
    console.log('⚠️ Возможно, сервер еще не обновлен. Подождите 2-3 минуты после деплоя.');
});
```

**✅ Если работает:**
```json
{
  "success": true,
  "steps": [
    {
      "title": "Изучить основы...",
      "description": "...",
      "estimated_days": 14,
      "priority": 5
    }
  ],
  "advice": "Начните с основ...",
  "total_steps": 4
}
```

**❌ Если не работает (404):**
```json
{
  "detail": "Not Found"
}
```
→ **Решение:** Подождите несколько минут после деплоя или проверьте, что `ai_personal_manager.py` загружен на сервер.

---

### **4. Проверка статистики ИИ-менеджера**

#### В браузере (консоль):

```javascript
// Проверка статистики ИИ-менеджера
fetch('https://road-to-your-dream-app-imtd.onrender.com/ai/manager/stats')
  .then(r => r.json())
  .then(data => {
    if (data.success) {
        console.log('✅ ИИ-менеджер доступен');
        console.log('Статистика:', data.stats);
    } else {
        console.error('❌ ИИ-менеджер недоступен');
    }
  })
  .catch(err => {
    console.error('❌ Ошибка:', err);
  });
```

**Ожидаемый результат:**
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

---

### **5. Проверка через UI приложения**

1. **Откройте приложение** (в Telegram или в браузере)

2. **Проверьте консоль браузера (F12)**
   - Должны увидеть: `✅ ИИ-менеджер инициализирован`
   - Должны увидеть: `✅ Telegram ID установлен` (если в Telegram)

3. **Перейдите в раздел "ИИ"** (кнопка в нижней навигации)

4. **Протестируйте функции:**
   - 🎯 **Разбить цель на этапы** - введите название цели
   - 🧭 **Что делать дальше?** - требует Telegram ID
   - 💡 **Получить совет** - введите вопрос
   - 📊 **Анализ прогресса** - требует Telegram ID и данные в БД
   - 💪 **Мотивация** - должно показать сообщение

---

### **6. Проверка интеграции API в приложении**

#### В браузере (консоль):

```javascript
// Проверка, что API интеграция загружена
if (window.apiIntegration) {
    console.log('✅ API интеграция загружена');
    console.log('API клиент:', window.apiIntegration);
    
    // Проверка методов
    console.log('Доступные методы:', {
        authWithTelegram: typeof window.apiIntegration.authWithTelegram,
        getUserData: typeof window.apiIntegration.getUserData,
        createGoals: typeof window.apiIntegration.createGoals,
        createCards: typeof window.apiIntegration.createCards
    });
} else {
    console.error('❌ API интеграция НЕ загружена! Проверьте подключение frontend_integration.js');
}
```

**Ожидаемый результат:**
```
✅ API интеграция загружена
Доступные методы: {
  authWithTelegram: "function",
  getUserData: "function",
  createGoals: "function",
  createCards: "function"
}
```

---

### **7. Проверка через curl (альтернативный способ)**

#### В терминале:

```bash
# 1. Базовый API
curl https://road-to-your-dream-app-imtd.onrender.com/

# 2. Статистика ИИ-менеджера
curl https://road-to-your-dream-app-imtd.onrender.com/ai/manager/stats

# 3. Разбиение цели (пример)
curl -X POST https://road-to-your-dream-app-imtd.onrender.com/ai/manager/break-goal \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Выучить Python",
    "description": "Хочу стать программистом",
    "goal_type": "education"
  }'
```

---

### **8. Чеклист проверки**

- [ ] **API доступен** → `GET /` возвращает `{"status": "ok"}`
- [ ] **API интеграция загружена** → `window.apiIntegration` существует
- [ ] **ИИ-менеджер доступен** → `GET /ai/manager/stats` возвращает статистику
- [ ] **Разбиение цели работает** → `POST /ai/manager/break-goal` возвращает этапы
- [ ] **Telegram авторизация работает** → Авторизация через WebApp успешна
- [ ] **UI ИИ-менеджера открывается** → Кнопка "ИИ" в навигации работает
- [ ] **Все функции ИИ-менеджера доступны** → Кнопки работают, показывают результаты

---

### **9. Если что-то не работает**

#### **Проблема: API возвращает 404**
```bash
# Решение:
1. Проверьте логи сервера в Render.com
2. Убедитесь, что все файлы загружены на сервер
3. Подождите 2-3 минуты после деплоя
4. Проверьте, что файл ai_personal_manager.py на сервере
```

#### **Проблема: window.apiIntegration не определен**
```bash
# Решение:
1. Проверьте в index.html, что frontend_integration.js подключен
2. Проверьте порядок загрузки скриптов
3. Обновите страницу с очисткой кэша (Ctrl+Shift+R)
```

#### **Проблема: ИИ-менеджер показывает 404**
```bash
# Решение:
1. Убедитесь, что ai_personal_manager.py загружен на сервер
2. Проверьте импорт в main.py: from ai_personal_manager import PersonalAIManager
3. Проверьте логи сервера на ошибки импорта
4. Перезапустите сервер
```

---

### **10. Быстрая проверка одним скриптом**

Скопируйте и выполните в консоли браузера:

```javascript
(async function checkIntegration() {
    console.log('🔍 Начинаю проверку интеграции...\n');
    
    // 1. Проверка API
    try {
        const apiCheck = await fetch('https://road-to-your-dream-app-imtd.onrender.com/');
        const apiData = await apiCheck.json();
        console.log('✅ API:', apiData.status === 'ok' ? 'РАБОТАЕТ' : 'ОШИБКА');
    } catch (e) {
        console.error('❌ API:', 'НЕДОСТУПЕН', e);
    }
    
    // 2. Проверка API интеграции
    console.log('✅ API интеграция:', window.apiIntegration ? 'ЗАГРУЖЕНА' : 'НЕ ЗАГРУЖЕНА');
    
    // 3. Проверка ИИ-менеджера
    try {
        const aiCheck = await fetch('https://road-to-your-dream-app-imtd.onrender.com/ai/manager/stats');
        const aiData = await aiCheck.json();
        console.log('✅ ИИ-менеджер:', aiData.success ? 'РАБОТАЕТ' : 'ОШИБКА');
    } catch (e) {
        console.error('❌ ИИ-менеджер:', 'НЕДОСТУПЕН (возможно сервер не обновлен)');
    }
    
    // 4. Проверка Telegram
    console.log('✅ Telegram WebApp:', window.Telegram?.WebApp ? 'ОБНАРУЖЕН' : 'НЕ ОБНАРУЖЕН');
    
    // 5. Проверка ИИ UI
    console.log('✅ ИИ UI:', window.aiManagerUI || typeof initAIManagerUI !== 'undefined' ? 'ДОСТУПЕН' : 'НЕ ДОСТУПЕН');
    
    console.log('\n✅ Проверка завершена!');
})();
```

---

**Готово!** 🎉 Теперь вы можете проверить всю интеграцию за несколько минут!

