# 🔧 Устранение проблем с интеграцией

## ❌ Проблема: API интеграция не загружена

### Симптомы:
```
✅ API интеграция: НЕ ЗАГРУЖЕНА
window.apiIntegration === undefined
```

### Решения:

#### 1. Очистите кэш браузера
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- Или: F12 → Network tab → поставьте галочку "Disable cache"

#### 2. Проверьте Network tab
1. Откройте DevTools (F12)
2. Перейдите в **Network tab**
3. Обновите страницу (F5)
4. Найдите `frontend_integration.js`:
   - ✅ **Статус 200** = файл загружен
   - ❌ **Статус 404** = файл не найден
   - ❌ **Статус 0** = ошибка сети

#### 3. Проверьте консоль на ошибки
- Откройте **Console tab** в DevTools
- Ищите красные ошибки загрузки
- Если видите ошибку типа `Uncaught SyntaxError` - есть проблема в коде

#### 4. Проверьте порядок загрузки
В `index.html` порядок должен быть:
```html
<script src="frontend_integration.js"></script>
<script src="ai_manager_frontend.js"></script>
<script src="ai_manager_ui.js"></script>
<script src="script.js"></script>
```

#### 5. Проверьте, что файл существует
Откройте напрямую в браузере:
```
http://localhost:port/frontend_integration.js
```
или
```
https://your-domain.com/frontend_integration.js
```

---

## ❌ Проблема: ИИ UI не доступен

### Симптомы:
```
✅ ИИ UI: НЕ ДОСТУПЕН
initAIManagerUI === undefined
window.aiManagerUI === undefined
```

### Решения:

#### 1. Проверьте Network tab
- Найдите `ai_manager_ui.js`
- Проверьте статус загрузки

#### 2. Проверьте консоль
- Ищите ошибки при загрузке `ai_manager_ui.js`
- Проверьте, есть ли сообщение: `✅ ai_manager_ui.js загружен`

#### 3. Проверьте зависимости
Убедитесь, что загружены перед `ai_manager_ui.js`:
- ✅ `frontend_integration.js` (для API)
- ✅ `ai_manager_frontend.js` (для клиента ИИ)

---

## ❌ Проблема: ИИ-менеджер на сервере возвращает 404

### Симптомы:
```
✅ ИИ-менеджер: НЕДОСТУПЕН
{detail: "Not Found"}
```

### Решения:

#### 1. Убедитесь, что файл `ai_personal_manager.py` загружен на сервер
- Файл должен быть в той же папке, что и `main.py`

#### 2. Проверьте импорт в `main.py`
Должна быть строка:
```python
from ai_personal_manager import PersonalAIManager
```

#### 3. Перезапустите сервер
- После загрузки `ai_personal_manager.py` перезапустите сервер
- Render.com делает это автоматически при деплое

#### 4. Подождите 2-3 минуты после деплоя
- Render.com может занять время для обновления

---

## ✅ Проверка после исправления

Выполните в консоли браузера:

```javascript
// Быстрая проверка
console.log('API интеграция:', typeof window.apiIntegration !== 'undefined' ? '✅' : '❌');
console.log('ИИ UI:', typeof initAIManagerUI !== 'undefined' ? '✅' : '❌');
console.log('ИИ менеджер:', typeof getAIManager !== 'undefined' ? '✅' : '❌');
```

Если все ✅ - всё работает!

---

## 📋 Чеклист для отладки

- [ ] Обновлено с очисткой кэша (Ctrl+Shift+R)
- [ ] Network tab проверен - все файлы загружаются (статус 200)
- [ ] Console tab проверен - нет ошибок JavaScript
- [ ] Файлы `frontend_integration.js`, `ai_manager_frontend.js`, `ai_manager_ui.js` существуют
- [ ] Порядок загрузки скриптов правильный в `index.html`
- [ ] Сервер обновлен с `ai_personal_manager.py`
- [ ] Подождано 2-3 минуты после деплоя (если используете Render.com)

---

**Если проблема осталась:**
1. Скопируйте ошибки из консоли
2. Проверьте логи сервера в Render.com
3. Убедитесь, что все файлы закоммичены и запушены в репозиторий

