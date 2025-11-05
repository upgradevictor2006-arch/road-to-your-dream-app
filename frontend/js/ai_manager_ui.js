/**
 * UI модуль для работы с ИИ-менеджером
 * Предоставляет интерфейс для тестирования всех функций
 */

class AIManagerUI {
    constructor(app) {
        this.app = app;
        this.manager = null;
        
        // Инициализируем менеджер
        if (typeof getAIManager !== 'undefined') {
            try {
                this.manager = getAIManager();
                console.log('✅ ИИ-менеджер инициализирован');
                
                // Устанавливаем Telegram ID если доступен
                if (window.Telegram && window.Telegram.WebApp) {
                    const initData = window.Telegram.WebApp.initDataUnsafe;
                    if (initData && initData.user && initData.user.id) {
                        this.manager.setTelegramId(initData.user.id);
                        console.log('✅ Telegram ID установлен:', initData.user.id);
                    }
                }
            } catch (error) {
                console.error('❌ Ошибка инициализации ИИ-менеджера:', error);
                this.manager = null;
            }
        } else {
            console.error('❌ getAIManager не найден! Проверьте подключение ai_manager_frontend.js');
        }
    }
    
    /**
     * Рендерит экран ИИ-менеджера
     */
    renderAIManagerScreen() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;
        
        appContainer.innerHTML = `
            <div class="ai-manager-screen">
                <div class="ai-manager-header">
                    <h2>🤖 ИИ-Менеджер</h2>
                    <p class="ai-manager-subtitle">Ваш личный помощник для достижения целей</p>
                </div>
                
                <div class="ai-manager-content">
                    <!-- Быстрые действия -->
                    <div class="ai-quick-actions">
                        <button class="ai-action-btn" onclick="if(window.aiManagerUI) { window.aiManagerUI.testBreakGoal(); }">
                            <span class="ai-btn-icon">🎯</span>
                            <span class="ai-btn-text">Разбить цель на этапы</span>
                        </button>
                        
                        <button class="ai-action-btn" onclick="if(window.aiManagerUI) { window.aiManagerUI.testNavigation(); }">
                            <span class="ai-btn-icon">🧭</span>
                            <span class="ai-btn-text">Что делать дальше?</span>
                        </button>
                        
                        <button class="ai-action-btn" onclick="if(window.aiManagerUI) { window.aiManagerUI.testAdvice(); }">
                            <span class="ai-btn-icon">💡</span>
                            <span class="ai-btn-text">Получить совет</span>
                        </button>
                        
                        <button class="ai-action-btn" onclick="if(window.aiManagerUI) { window.aiManagerUI.testAnalyzeProgress(); }">
                            <span class="ai-btn-icon">📊</span>
                            <span class="ai-btn-text">Анализ прогресса</span>
                        </button>
                        
                        <button class="ai-action-btn" onclick="if(window.aiManagerUI) { window.aiManagerUI.testMotivation(); }">
                            <span class="ai-btn-icon">💪</span>
                            <span class="ai-btn-text">Мотивация</span>
                        </button>
                    </div>
                    
                    <!-- Результаты -->
                    <div id="ai-manager-result" class="ai-manager-result"></div>
                    
                    <!-- Чат с ИИ -->
                    <div class="ai-chat-section">
                        <h3>💬 Чат с ИИ-советником</h3>
                        <div id="ai-chat-messages" class="ai-chat-messages">
                            <div class="ai-chat-message ai" style="padding: 12px; background: #e2e8f0; border-radius: 10px; margin-bottom: 15px;">
                                👋 Привет! Я твой ИИ-помощник. Задай мне вопрос, и я помогу с достижением целей!
                            </div>
                        </div>
                        <div class="ai-chat-input-container">
                            <input 
                                type="text" 
                                id="ai-chat-input" 
                                class="ai-chat-input" 
                                placeholder="Задайте вопрос..."
                                onkeypress="if(event.key === 'Enter' && window.aiManagerUI) { window.aiManagerUI.askQuestion(); }"
                            >
                            <button class="ai-chat-send-btn" onclick="if(window.aiManagerUI) { window.aiManagerUI.askQuestion(); } else { alert('ИИ-менеджер не загружен. Обновите страницу.'); }">
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем стили если их нет
        this.injectStyles();
        
        // Привязываем события после рендеринга
        setTimeout(() => {
            this.bindChatEvents();
        }, 100);
    }
    
    /**
     * Привязывает события чата
     */
    bindChatEvents() {
        const input = document.getElementById('ai-chat-input');
        const sendBtn = document.querySelector('.ai-chat-send-btn');
        
        if (input) {
            // Обработчик Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.askQuestion();
                }
            });
        }
        
        if (sendBtn) {
            // Обработчик клика
            sendBtn.addEventListener('click', () => {
                this.askQuestion();
            });
        }
        
        console.log('✅ События чата привязаны');
    }
    
    /**
     * Инжектит стили для ИИ-менеджера
     */
    injectStyles() {
        if (document.getElementById('ai-manager-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ai-manager-styles';
        style.textContent = `
            .ai-manager-screen {
                padding: 20px;
                padding-bottom: 85px;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .ai-manager-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .ai-manager-header h2 {
                margin: 0 0 10px 0;
                color: #6366f1;
            }
            
            .ai-manager-subtitle {
                color: #64748b;
                margin: 0;
            }
            
            .ai-quick-actions {
                display: grid;
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .ai-action-btn {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 15px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            
            .ai-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .ai-action-btn:active {
                transform: translateY(0);
            }
            
            .ai-btn-icon {
                font-size: 24px;
            }
            
            .ai-btn-text {
                flex: 1;
                text-align: left;
            }
            
            .ai-manager-result {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                min-height: 50px;
                display: none;
            }
            
            .ai-manager-result.show {
                display: block;
            }
            
            .ai-result-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #1e293b;
            }
            
            .ai-result-content {
                color: #475569;
                line-height: 1.6;
            }
            
            .ai-result-steps {
                margin-top: 15px;
            }
            
            .ai-result-step {
                padding: 10px;
                margin-bottom: 10px;
                background: white;
                border-left: 4px solid #6366f1;
                border-radius: 5px;
            }
            
            .ai-result-step strong {
                color: #1e293b;
            }
            
            .ai-chat-section {
                background: #f8fafc;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .ai-chat-section h3 {
                margin: 0 0 15px 0;
                color: #1e293b;
            }
            
            .ai-chat-messages {
                max-height: 300px;
                overflow-y: auto;
                margin-bottom: 15px;
                padding: 15px;
                background: white;
                border-radius: 10px;
                min-height: 100px;
            }
            
            .ai-chat-message {
                margin-bottom: 15px;
                padding: 12px;
                border-radius: 10px;
            }
            
            .ai-chat-message.user {
                background: #6366f1;
                color: white;
                text-align: right;
            }
            
            .ai-chat-message.ai {
                background: #e2e8f0;
                color: #1e293b;
            }
            
            .ai-chat-input-container {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                position: relative;
                z-index: 10;
            }
            
            .ai-chat-input {
                flex: 1;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                font-size: 14px;
            }
            
            .ai-chat-input:focus {
                outline: none;
                border-color: #6366f1;
            }
            
            .ai-chat-send-btn {
                padding: 12px 20px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .ai-chat-send-btn:hover {
                background: #4f46e5;
            }
            
            .loading {
                color: #64748b;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Показывает результат в контейнере
     */
    showResult(title, content) {
        const resultDiv = document.getElementById('ai-manager-result');
        if (!resultDiv) return;
        
        resultDiv.innerHTML = `
            <div class="ai-result-title">${title}</div>
            <div class="ai-result-content">${content}</div>
        `;
        resultDiv.classList.add('show');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Добавляет сообщение в чат
     */
    addChatMessage(sender, text) {
        const messagesDiv = document.getElementById('ai-chat-messages');
        if (!messagesDiv) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-chat-message ${sender}`;
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        return messageDiv;
    }
    
    /**
     * Тест: Разбить цель на этапы
     */
    async testBreakGoal() {
        if (!this.manager) {
            alert('ИИ-менеджер не инициализирован!');
            return;
        }
        
        const title = prompt('Введите название цели:');
        if (!title) return;
        
        const description = prompt('Введите описание (можно оставить пустым):') || '';
        
        this.showResult('⏳ Обработка...', 'Разбиваю цель на этапы...');
        
        try {
            const result = await this.manager.breakGoalIntoSteps(title, description);
            
            if (result && result.success) {
                let html = '<div class="ai-result-steps">';
                if (result.steps && result.steps.length > 0) {
                    result.steps.forEach((step, index) => {
                        html += `
                            <div class="ai-result-step">
                                <strong>${index + 1}. ${step.title || 'Этап ' + (index + 1)}</strong><br>
                                ${step.description || ''}<br>
                                <small>Дней: ${step.estimated_days || 'н/д'}, Приоритет: ${step.priority || 'н/д'}/5</small>
                            </div>
                        `;
                    });
                } else {
                    html += '<p>Этапы будут созданы автоматически...</p>';
                }
                html += '</div>';
                
                if (result.advice) {
                    html += `<p><strong>💡 Совет:</strong> ${result.advice}</p>`;
                }
                
                this.showResult(`✅ Цель "${title}" разбита на ${result.total_steps || 0} этапов`, html);
            } else {
                this.showResult('❌ Ошибка', 'Не удалось разбить цель на этапы. Возможно, сервер не обновлен. Попробуйте позже.');
            }
        } catch (error) {
            console.error('Ошибка разбиения цели:', error);
            let errorMsg = `Ошибка: ${error.message || 'Неизвестная ошибка'}`;
            
            // Если 404, значит эндпоинт не найден
            if (error.message && error.message.includes('404')) {
                errorMsg = '⚠️ Эндпоинт не найден. Возможно, сервер еще не обновлен с новым кодом. Попробуйте позже или используйте fallback версию.';
                
                // Показываем fallback версию
                this.showFallbackBreakGoal(title, description);
                return;
            }
            
            this.showResult('❌ Ошибка', errorMsg);
        }
    }
    
    /**
     * Fallback версия разбиения цели (без API)
     */
    showFallbackBreakGoal(title, description) {
        const steps = [
            {
                title: `Изучить основы "${title}"`,
                description: "Найти ресурсы и изучить основные концепции",
                estimated_days: 7,
                priority: 3
            },
            {
                title: `Составить план действий`,
                description: "Детально расписать шаги и сроки",
                estimated_days: 3,
                priority: 4
            },
            {
                title: `Начать практическую реализацию`,
                description: "Приступить к выполнению первого практического шага",
                estimated_days: 14,
                priority: 5
            },
            {
                title: `Оценить прогресс`,
                description: "Проанализировать результаты и скорректировать план",
                estimated_days: 2,
                priority: 2
            }
        ];
        
        let html = '<div style="background: #fef3c7; padding: 10px; border-radius: 5px; margin-bottom: 15px;">';
        html += '<strong>⚠️ Используется локальная версия (API недоступен)</strong></div>';
        html += '<div class="ai-result-steps">';
        steps.forEach((step, index) => {
            html += `
                <div class="ai-result-step">
                    <strong>${index + 1}. ${step.title}</strong><br>
                    ${step.description}<br>
                    <small>Дней: ${step.estimated_days}, Приоритет: ${step.priority}/5</small>
                </div>
            `;
        });
        html += '</div>';
        html += `<p><strong>💡 Совет:</strong> Разбей большую цель "${title}" на небольшие шаги. Начни с изучения основ, затем составь план и приступай к практике.</p>`;
        
        this.showResult(`✅ Цель "${title}" разбита на ${steps.length} этапов (локальная версия)`, html);
    }
    
    /**
     * Тест: Навигация
     */
    async testNavigation() {
        if (!this.manager) {
            alert('ИИ-менеджер не инициализирован!');
            return;
        }
        
        if (!this.manager.telegramId) {
            alert('Telegram ID не установлен. Установите его вручную через: aiManagerUI.manager.setTelegramId(ваш_id)');
            return;
        }
        
        this.showResult('⏳ Обработка...', 'Анализирую ваш прогресс...');
        
        try {
            const result = await this.manager.getNavigation();
            
            if (result && result.success) {
                let html = '';
                
                // Если у пользователя нет целей - показываем специальное сообщение
                if (result.no_goals) {
                    html += '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffc107;">';
                    html += '<p style="margin: 0; font-weight: bold; color: #856404;">⚠️ У тебя еще нет целей!</p>';
                    html += '<p style="margin: 10px 0 0 0; color: #856404;">Чтобы получить персональные рекомендации, сначала нужно поставить хотя бы одну цель.</p>';
                    html += '</div>';
                }
                
                if (result.next_actions && result.next_actions.length > 0) {
                    html += '<div class="ai-result-steps"><strong>🎯 Следующие действия:</strong>';
                    result.next_actions.forEach((action, index) => {
                        html += `
                            <div class="ai-result-step">
                                <strong>${index + 1}. ${action.title}</strong><br>
                                ${action.description}<br>
                                <small>Приоритет: ${action.priority}/5</small>
                            </div>
                        `;
                    });
                    html += '</div>';
                }
                
                if (result.focus) {
                    html += `<p><strong>🎯 Фокус:</strong> ${result.focus}</p>`;
                }
                
                if (result.warnings && result.warnings.length > 0) {
                    html += `<p><strong>⚠️ Предупреждения:</strong><ul>`;
                    result.warnings.forEach(warning => {
                        html += `<li>${warning}</li>`;
                    });
                    html += `</ul></p>`;
                }
                
                const title = result.no_goals ? '🧭 Начни свой путь' : '🧭 Навигационные рекомендации';
                this.showResult(title, html);
            } else {
                this.showResult('❌ Ошибка', 'Не удалось получить навигацию');
            }
        } catch (error) {
            console.error('Ошибка навигации:', error);
            if (error.message && error.message.includes('404')) {
                this.showResult('⚠️ API недоступен', 
                    'Эндпоинт не найден. Сервер еще не обновлен с новым кодом. ' +
                    'Подождите несколько минут после деплоя или проверьте, что файл ai_personal_manager.py загружен на сервер.');
            } else {
                this.showResult('❌ Ошибка', `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
            }
        }
    }
    
    /**
     * Тест: Совет
     */
    async testAdvice() {
        if (!this.manager) {
            alert('ИИ-менеджер не инициализирован!');
            return;
        }
        
        const question = prompt('Задайте вопрос:');
        if (!question) return;
        
        this.showResult('⏳ Обработка...', 'Думаю над советом...');
        
        try {
            const result = await this.manager.getAdvice(question);
            
            if (result && result.success) {
                let html = `<p><strong>💡 Совет:</strong> ${result.advice || 'Продолжай двигаться к своей цели маленькими шагами каждый день.'}</p>`;
                
                if (result.steps && result.steps.length > 0) {
                    html += '<div class="ai-result-steps"><strong>📋 Шаги:</strong>';
                    result.steps.forEach((step, index) => {
                        html += `<div class="ai-result-step">${index + 1}. ${step}</div>`;
                    });
                    html += '</div>';
                }
                
                if (result.motivation) {
                    html += `<p><em>💪 ${result.motivation}</em></p>`;
                }
                
                this.showResult('💡 Персональный совет', html);
            } else {
                this.showResult('❌ Ошибка', 'Не удалось получить совет');
            }
        } catch (error) {
            console.error('Ошибка получения совета:', error);
            if (error.message && error.message.includes('404')) {
                this.showResult('⚠️ API недоступен', 
                    'Эндпоинт не найден. Сервер еще не обновлен. ' +
                    'Используйте общие советы: планируй день заранее, выполняй задачи последовательно, отмечай прогресс.');
            } else {
                this.showResult('❌ Ошибка', `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
            }
        }
    }
    
    /**
     * Тест: Анализ прогресса
     */
    async testAnalyzeProgress() {
        if (!this.manager) {
            alert('ИИ-менеджер не инициализирован!');
            return;
        }
        
        if (!this.manager.telegramId) {
            alert('Telegram ID не установлен. Установите его вручную через manager.setTelegramId()');
            return;
        }
        
        this.showResult('⏳ Обработка...', 'Анализирую ваш прогресс...');
        
        try {
            const result = await this.manager.analyzeProgress();
            
            if (result.success) {
                let html = '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">';
                html += '<h3 style="margin: 0 0 10px 0; color: #333;">📊 Основные показатели</h3>';
                html += `<p style="margin: 5px 0;"><strong>Оценка:</strong> <span style="font-size: 1.2em; color: #007bff;">${result.score}/100</span></p>`;
                html += `<p style="margin: 5px 0;"><strong>🔥 Серия дней:</strong> ${result.streak}</p>`;
                if (result.days_since_start !== undefined) {
                    html += `<p style="margin: 5px 0;"><strong>📅 Дней с регистрации:</strong> ${result.days_since_start}</p>`;
                }
                if (result.total_actions !== undefined) {
                    html += `<p style="margin: 5px 0;"><strong>✅ Всего действий:</strong> ${result.total_actions}</p>`;
                }
                if (result.avg_actions_per_week !== undefined) {
                    html += `<p style="margin: 5px 0;"><strong>📈 Активность:</strong> ${result.avg_actions_per_week} действий/неделю</p>`;
                }
                if (result.goal_completion_rate !== undefined) {
                    html += `<p style="margin: 5px 0;"><strong>🎯 Выполнение целей:</strong> ${result.goal_completion_rate}%</p>`;
                }
                html += '</div>';
                
                html += `<p><strong>✅ Сильные стороны:</strong> ${result.strength}</p>`;
                html += `<p><strong>⚠️ Слабые места:</strong> ${result.weaknesses}</p>`;
                
                if (result.recommendations && result.recommendations.length > 0) {
                    html += '<div class="ai-result-steps"><strong>💡 Рекомендации:</strong>';
                    result.recommendations.forEach((rec, index) => {
                        html += `<div class="ai-result-step">${index + 1}. ${rec}</div>`;
                    });
                    html += '</div>';
                }
                
                this.showResult('📊 Анализ прогресса', html);
            } else {
                this.showResult('❌ Ошибка', 'Не удалось проанализировать прогресс');
            }
        } catch (error) {
            console.error('Ошибка анализа прогресса:', error);
            if (error.message && error.message.includes('404')) {
                this.showResult('⚠️ API недоступен', 
                    'Эндпоинт не найден. Сервер еще не обновлен. ' +
                    '<p><strong>Локальная оценка:</strong></p>' +
                    '<p>• Продолжай выполнять ежедневные действия</p>' +
                    '<p>• Отмечай прогресс регулярно</p>' +
                    '<p>• Фокусируйся на одной цели за раз</p>');
            } else {
                this.showResult('❌ Ошибка', `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
            }
        }
    }
    
    /**
     * Тест: Мотивация
     */
    async testMotivation() {
        if (!this.manager) {
            alert('ИИ-менеджер не инициализирован!');
            return;
        }
        
        this.showResult('⏳ Обработка...', 'Генерирую мотивацию...');
        
        try {
            const result = await this.manager.getMotivation();
            
            if (result && result.success) {
                this.showResult('💪 Мотивация', `<p>${result.message}</p>`);
            } else {
                // Fallback мотивация
                this.showFallbackMotivation();
            }
        } catch (error) {
            console.error('Ошибка получения мотивации:', error);
            if (error.message && error.message.includes('404')) {
                this.showFallbackMotivation();
            } else {
                this.showResult('❌ Ошибка', `Ошибка: ${error.message || 'Неизвестная ошибка'}`);
            }
        }
    }
    
    /**
     * Fallback мотивация
     */
    showFallbackMotivation() {
        const fallbackMessages = [
            "🚀 Каждый шаг приближает тебя к мечте. Продолжай двигаться вперед, даже если шаги маленькие!",
            "💪 Помни: самые великие путешествия начинаются с одного шага. Ты уже в пути!",
            "🌟 Сложности — это просто повороты на твоей дороге. После каждого поворота открывается новая дорога.",
            "🔥 Каждый день, когда ты действуешь — это инвестиция в свою мечту. Не останавливайся!",
            "✨ Мечта становится реальностью, когда маленькие действия становятся привычкой. Ты на правильном пути!"
        ];
        const message = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        this.showResult('💪 Мотивация', `<p>${message}</p><p><small>⚠️ Сервер еще не обновлен. Используется локальная версия.</small></p>`);
    }
    
    /**
     * Задать вопрос в чате
     */
    async askQuestion() {
        if (!this.manager) {
            alert('ИИ-менеджер не инициализирован! Обновите страницу.');
            return;
        }
        
        const input = document.getElementById('ai-chat-input');
        if (!input) {
            console.error('Поле ввода чата не найдено');
            return;
        }
        
        const question = input.value.trim();
        if (!question) {
            alert('Введите вопрос');
            return;
        }
        
        // Показываем вопрос пользователя
        this.addChatMessage('user', question);
        input.value = '';
        
        // Показываем загрузку
        const loadingMsg = this.addChatMessage('ai', 'Думаю...');
        
        try {
            const result = await this.manager.getAdvice(question);
            
            // Обновляем сообщение загрузки на ответ
            if (loadingMsg && result && result.success) {
                let responseText = result.advice || 'Продолжай двигаться к своей цели маленькими шагами каждый день.';
                if (result.steps && result.steps.length > 0) {
                    responseText += '\n\n📋 Шаги:\n' + result.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
                }
                if (result.motivation) {
                    responseText += `\n\n💪 ${result.motivation}`;
                }
                loadingMsg.textContent = responseText;
            } else {
                // Fallback ответ
                loadingMsg.textContent = this.getFallbackAdvice(question);
            }
        } catch (error) {
            console.error('Ошибка получения совета:', error);
            if (loadingMsg) {
                if (error.message && error.message.includes('404')) {
                    loadingMsg.textContent = this.getFallbackAdvice(question) + '\n\n⚠️ Сервер еще не обновлен. Используется локальная версия.';
                } else {
                    loadingMsg.textContent = this.getFallbackAdvice(question);
                }
            }
        }
    }
    
    /**
     * Fallback совет (если API недоступен)
     */
    getFallbackAdvice(question) {
        const fallbackAdvice = [
            "Продолжай двигаться к своей цели маленькими шагами каждый день. Постоянство важнее скорости.",
            "Планируй день заранее, выделяй время на важные задачи, отмечай прогресс.",
            "Разбей большую цель на маленькие шаги. Выполняй их последовательно, один за другим.",
            "Помни: каждое маленькое действие приближает тебя к большой мечте. Не останавливайся!"
        ];
        
        // Простая логика выбора совета на основе вопроса
        const questionLower = question.toLowerCase();
        if (questionLower.includes('время') || questionLower.includes('организовать')) {
            return "Планируй свой день заранее:\n1. Составь список задач с вечера\n2. Расставь приоритеты\n3. Выдели время на важные задачи\n4. Выполняй задачи последовательно";
        } else if (questionLower.includes('мотивация') || questionLower.includes('не могу')) {
            return "Каждый путешественник проходит через трудные участки. Помни: за каждым холмом открывается новая дорога. Продолжай двигаться вперед!";
        } else if (questionLower.includes('начать') || questionLower.includes('как начать')) {
            return "Начни с малого:\n1. Определи одну конкретную цель\n2. Разбей её на 3-5 шагов\n3. Выполни первый шаг сегодня\n4. Продолжай ежедневно";
        }
        
        return fallbackAdvice[Math.floor(Math.random() * fallbackAdvice.length)];
    }
}

// Глобальный экземпляр
let aiManagerUI = null;

/**
 * Инициализирует UI ИИ-менеджера
 */
function initAIManagerUI(app) {
    if (!aiManagerUI) {
        try {
            aiManagerUI = new AIManagerUI(app);
            // Делаем доступным глобально
            window.aiManagerUI = aiManagerUI;
            console.log('✅ ai_manager_ui.js загружен, UI ИИ-менеджера инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации UI ИИ-менеджера:', error);
            return null;
        }
    }
    return aiManagerUI;
}

// Проверка загрузки при инициализации
console.log('✅ ai_manager_ui.js загружен');

