# 🚀 Инструкция по деплою сервера с ИИ-менеджером

## ❗ Важно

Если вы видите ошибки **404** для эндпоинтов `/ai/manager/*`, это означает, что сервер еще не обновлен с новым кодом.

## 📋 Шаги для деплоя

### 1. Убедитесь, что файл `ai_personal_manager.py` есть в проекте

Проверьте, что файл `ai_personal_manager.py` находится в корне проекта (там же, где `main.py`).

### 2. Проверьте, что `main.py` импортирует ИИ-менеджер

В файле `main.py` должна быть строка:
```python
from ai_personal_manager import PersonalAIManager
```

### 3. Закоммитьте и запушьте изменения

```bash
git add ai_personal_manager.py main.py
git commit -m "Добавлен ИИ-менеджер"
git push origin main
```

### 4. Дождитесь автоматического деплоя

- На **Render.com**: деплой запускается автоматически после push
- На других платформах: следуйте инструкциям вашего хостинга

### 5. Проверьте логи деплоя

Убедитесь, что:
- ✅ Деплой прошел успешно
- ✅ Сервер перезапустился
- ✅ Нет ошибок импорта `ai_personal_manager`

### 6. Проверьте доступность эндпоинтов

После деплоя подождите **2-3 минуты** и выполните в консоли браузера:

```javascript
// Проверка эндпоинтов ИИ-менеджера
const apiBase = 'https://road-to-your-dream-app-imtd.onrender.com';
const endpoints = [
    '/ai/manager/stats',
    '/ai/manager/navigation',
    '/ai/manager/break-goal'
];

endpoints.forEach(async (endpoint) => {
    try {
        const response = await fetch(apiBase + endpoint, {
            method: endpoint === '/ai/manager/stats' ? 'GET' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: endpoint !== '/ai/manager/stats' ? JSON.stringify({ telegram_id: 123456789 }) : undefined
        });
        console.log(`${endpoint}: ${response.status === 404 ? '❌ 404' : response.status === 200 ? '✅ 200' : response.status}`);
    } catch (error) {
        console.error(`${endpoint}: ❌ Ошибка`, error);
    }
});
```

## 🔍 Если после деплоя все еще 404

### Проверка 1: Файл на сервере

Убедитесь, что `ai_personal_manager.py` действительно загружен на сервер:
- Проверьте через веб-интерфейс хостинга (если доступен)
- Проверьте логи деплоя на наличие ошибок импорта

### Проверка 2: Логи сервера

Проверьте логи сервера на наличие ошибок:
```
ModuleNotFoundError: No module named 'ai_personal_manager'
```

### Проверка 3: Перезапуск сервера

Если файл загружен, но эндпоинты не работают:
- Попробуйте вручную перезапустить сервер
- На Render.com: Settings → Manual Deploy → Deploy latest commit

### Проверка 4: Зависимости

Убедитесь, что все зависимости установлены:
- `httpx` (для HTTP запросов к AI API)
- `groq` (опционально, если используете Groq)
- `cohere` (опционально, если используете Cohere)

## ⚠️ Важно

**Frontend работает с fallback**: даже если сервер не обновлен, чат и некоторые функции будут работать с локальными fallback-ответами. Но для полной функциональности нужно обновить сервер.

## 📞 После успешного деплоя

1. Обновите страницу в браузере (Ctrl+Shift+R)
2. Проверьте консоль браузера — не должно быть ошибок 404
3. Попробуйте функции ИИ-менеджера — они должны работать с реальными ответами от сервера

