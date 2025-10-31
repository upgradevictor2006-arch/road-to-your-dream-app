# 🤖 Руководство по использованию ИИ-менеджера

## 📋 Описание

ИИ-менеджер - это расширенный помощник, который работает как ваш личный менеджер. Он помогает:
- 🎯 **Разбивать цели на этапы** - автоматически создает план достижения цели
- 🧭 **Навигация** - подсказывает что делать дальше
- 💡 **Советы** - дает персональные рекомендации
- 📊 **Анализ прогресса** - анализирует ваши достижения
- 💪 **Мотивация** - вдохновляет продолжать путь

## 🚀 Быстрый старт

### 1. Подключение на фронтенде

Добавьте скрипт в ваш `index.html`:

```html
<script src="ai_manager_frontend.js"></script>
```

### 2. Использование в JavaScript

```javascript
// Получаем экземпляр менеджера
const manager = getAIManager();

// Telegram ID будет автоматически определен из Telegram WebApp
// Или установите вручную:
// manager.setTelegramId(123456789);
```

## 📚 API методы

### 1. Разбиение цели на этапы

Разбивает большую цель на конкретные, выполнимые этапы.

```javascript
try {
    const result = await manager.breakGoalIntoSteps(
        "Выучить английский язык",
        "Хочу свободно говорить на английском",
        "education"
    );
    
    console.log(result);
    // {
    //     success: true,
    //     steps: [
    //         {
    //             title: "Изучить основы грамматики",
    //             description: "Освоить основные времена и структуры",
    //             estimated_days: 14,
    //             priority: 5
    //         },
    //         ...
    //     ],
    //     advice: "Начните с основ...",
    //     total_steps: 4
    // }
} catch (error) {
    console.error("Ошибка:", error);
}
```

### 2. Получение навигации

Получает рекомендации что делать дальше на основе вашего прогресса.

```javascript
try {
    const navigation = await manager.getNavigation();
    
    console.log(navigation);
    // {
    //     success: true,
    //     next_actions: [
    //         {
    //             title: "Выполни ежедневное действие",
    //             description: "Сделай хотя бы один шаг к цели",
    //             priority: 5
    //         },
    //         ...
    //     ],
    //     focus: "Сосредоточься на...",
    //     warnings: []
    // }
} catch (error) {
    console.error("Ошибка:", error);
}
```

### 3. Получение персонального совета

Задайте вопрос и получите персональный совет с учетом вашего контекста.

```javascript
try {
    const advice = await manager.getAdvice(
        "Как мне лучше организовать свое время для достижения целей?"
    );
    
    console.log(advice);
    // {
    //     success: true,
    //     advice: "Создайте расписание...",
    //     steps: [
    //         "Планируйте день с вечера",
    //         "Выделяйте время на важные задачи",
    //         ...
    //     ],
    //     motivation: "Ты можешь это сделать!"
    // }
} catch (error) {
    console.error("Ошибка:", error);
}
```

### 4. Анализ прогресса

Получает детальный анализ вашего прогресса с рекомендациями.

```javascript
try {
    const analysis = await manager.analyzeProgress();
    
    console.log(analysis);
    // {
    //     success: true,
    //     strength: "У тебя 3 выполненных цели",
    //     weaknesses: "Продолжай выполнять ежедневные действия",
    //     recommendations: [
    //         "Поддерживай ежедневную серию",
    //         ...
    //     ],
    //     score: 75,
    //     streak: 5
    // }
} catch (error) {
    console.error("Ошибка:", error);
}
```

### 5. Получение мотивации

Получает персональное мотивационное сообщение.

```javascript
try {
    const motivation = await manager.getMotivation();
    
    console.log(motivation);
    // {
    //     success: true,
    //     message: "Каждый шаг приближает тебя к мечте!..."
    // }
} catch (error) {
    console.error("Ошибка:", error);
}
```

## 🎨 Примеры интеграции в UI

### Кнопка "Разбить цель на этапы"

```html
<button id="break-goal-btn" onclick="breakGoal()">
    🎯 Разбить цель на этапы
</button>

<script>
async function breakGoal() {
    const title = prompt("Название цели:");
    if (!title) return;
    
    const description = prompt("Описание (необязательно):") || "";
    
    try {
        const manager = getAIManager();
        const result = await manager.breakGoalIntoSteps(title, description);
        
        // Показываем результат
        let stepsHtml = "<h3>Этапы:</h3><ul>";
        result.steps.forEach((step, index) => {
            stepsHtml += `
                <li>
                    <strong>${index + 1}. ${step.title}</strong><br>
                    ${step.description}<br>
                    <small>Дней: ${step.estimated_days}, Приоритет: ${step.priority}</small>
                </li>
            `;
        });
        stepsHtml += "</ul>";
        
        if (result.advice) {
            stepsHtml += `<p><strong>Совет:</strong> ${result.advice}</p>`;
        }
        
        document.getElementById('result-container').innerHTML = stepsHtml;
    } catch (error) {
        alert("Ошибка: " + error.message);
    }
}
</script>
```

### Виджет навигации

```html
<div id="navigation-widget">
    <button onclick="showNavigation()">🧭 Что делать дальше?</button>
    <div id="navigation-result"></div>
</div>

<script>
async function showNavigation() {
    try {
        const manager = getAIManager();
        const navigation = await manager.getNavigation();
        
        let html = "<h3>Следующие шаги:</h3><ul>";
        navigation.next_actions.forEach(action => {
            html += `
                <li>
                    <strong>${action.title}</strong><br>
                    ${action.description}
                </li>
            `;
        });
        html += "</ul>";
        
        if (navigation.focus) {
            html += `<p><strong>Фокус:</strong> ${navigation.focus}</p>`;
        }
        
        document.getElementById('navigation-result').innerHTML = html;
    } catch (error) {
        alert("Ошибка: " + error.message);
    }
}
</script>
```

### Чат с ИИ-советником

```html
<div id="ai-chat">
    <div id="chat-messages"></div>
    <input type="text" id="question-input" placeholder="Задайте вопрос...">
    <button onclick="askQuestion()">Спросить</button>
</div>

<script>
async function askQuestion() {
    const input = document.getElementById('question-input');
    const question = input.value.trim();
    if (!question) return;
    
    // Показываем вопрос пользователя
    addMessage('user', question);
    input.value = '';
    
    // Показываем загрузку
    const loadingId = addMessage('ai', 'Думаю...');
    
    try {
        const manager = getAIManager();
        const advice = await manager.getAdvice(question);
        
        // Убираем загрузку и показываем ответ
        updateMessage(loadingId, 'ai', `
            <strong>Совет:</strong> ${advice.advice}<br><br>
            <strong>Шаги:</strong>
            <ul>
                ${advice.steps.map(step => `<li>${step}</li>`).join('')}
            </ul><br>
            <em>${advice.motivation}</em>
        `);
    } catch (error) {
        updateMessage(loadingId, 'ai', 'Извините, произошла ошибка: ' + error.message);
    }
}

function addMessage(sender, text) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageId = 'msg-' + Date.now();
    messagesDiv.innerHTML += `
        <div id="${messageId}" class="message ${sender}">
            ${text}
        </div>
    `;
    return messageId;
}

function updateMessage(id, sender, text) {
    document.getElementById(id).innerHTML = text;
}
</script>
```

## 🔧 Backend API

Все методы также доступны через REST API:

### POST `/ai/manager/break-goal`
```json
{
    "title": "Выучить английский",
    "description": "Хочу свободно говорить",
    "goal_type": "education"
}
```

### POST `/ai/manager/navigation`
```json
{
    "telegram_id": 123456789
}
```

### POST `/ai/manager/advice`
```json
{
    "question": "Как организовать время?",
    "telegram_id": 123456789
}
```

### POST `/ai/manager/analyze-progress`
```json
{
    "telegram_id": 123456789
}
```

### POST `/ai/manager/motivation`
```json
{
    "telegram_id": 123456789
}
```

### GET `/ai/manager/stats`
Возвращает статистику использования менеджера.

## 📝 Примечания

1. **Telegram ID**: Автоматически определяется из Telegram WebApp. Если используется вне Telegram, установите вручную через `manager.setTelegramId()`.

2. **Fallback**: Если ИИ API недоступен, используются качественные предустановленные ответы.

3. **Контекст**: Многие методы используют контекст пользователя (цели, прогресс) для более персонализированных ответов.

4. **Обработка ошибок**: Всегда оборачивайте вызовы в `try-catch` для обработки ошибок сети или API.

## 🎉 Готово!

Теперь у вас есть полноценный ИИ-менеджер, который поможет пользователям достигать своих целей!

