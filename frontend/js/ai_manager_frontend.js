/**
 * Фронтенд модуль для работы с личным ИИ-менеджером
 * Предоставляет функции для разбиения целей, получения советов, навигации и т.д.
 */

class AIManagerClient {
    constructor(baseURL = "https://road-to-your-dream-app-imtd.onrender.com") {
        this.baseURL = baseURL;
        this.telegramId = null;
        
        // Инициализируем telegram_id из WebApp
        this.initTelegramId();
    }
    
    /**
     * Инициализирует telegram_id из Telegram WebApp
     */
    initTelegramId() {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const initData = window.Telegram.WebApp.initDataUnsafe;
            if (initData && initData.user) {
                this.telegramId = initData.user.id;
            }
        }
    }
    
    /**
     * Устанавливает telegram_id вручную
     */
    setTelegramId(telegramId) {
        this.telegramId = telegramId;
    }
    
    /**
     * Разбивает цель на этапы
     * @param {string} title - Название цели
     * @param {string} description - Описание цели (опционально)
     * @param {string} goalType - Тип цели (опционально)
     * @returns {Promise<Object>} Объект с этапами и рекомендациями
     */
    async breakGoalIntoSteps(title, description = "", goalType = "goal") {
        try {
            const response = await fetch(`${this.baseURL}/ai/manager/break-goal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    goal_type: goalType
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при разбиении цели на этапы:', error);
            throw error;
        }
    }
    
    /**
     * Получает рекомендации по навигации (что делать дальше)
     * @returns {Promise<Object>} Объект с рекомендациями
     */
    async getNavigation() {
        if (!this.telegramId) {
            throw new Error('Telegram ID не установлен');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/ai/manager/navigation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при получении навигации:', error);
            throw error;
        }
    }
    
    /**
     * Получает персональный совет по вопросу
     * @param {string} question - Вопрос пользователя
     * @returns {Promise<Object>} Объект с советом
     */
    async getAdvice(question) {
        try {
            const requestBody = {
                question: question
            };
            
            // Добавляем telegram_id если доступен
            if (this.telegramId) {
                requestBody.telegram_id = this.telegramId;
            }
            
            const response = await fetch(`${this.baseURL}/ai/manager/advice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при получении совета:', error);
            throw error;
        }
    }
    
    /**
     * Анализирует прогресс пользователя
     * @returns {Promise<Object>} Объект с анализом прогресса
     */
    async analyzeProgress() {
        if (!this.telegramId) {
            throw new Error('Telegram ID не установлен');
        }
        
        try {
            const response = await fetch(`${this.baseURL}/ai/manager/analyze-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при анализе прогресса:', error);
            throw error;
        }
    }
    
    /**
     * Получает мотивационное сообщение
     * @returns {Promise<Object>} Объект с мотивационным сообщением
     */
    async getMotivation() {
        try {
            const requestBody = {
                telegram_id: this.telegramId || null
            };
            
            const response = await fetch(`${this.baseURL}/ai/manager/motivation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при получении мотивации:', error);
            throw error;
        }
    }
    
    /**
     * Разбивает цель на подпериоды с заполнением задач
     * @param {string} title - Название цели
     * @param {string} description - Описание цели
     * @param {number} totalDays - Общее количество дней
     * @param {Array} periodStructure - Структура периодов
     * @returns {Promise<Object>} Объект с заполненными периодами
     */
    async breakGoalIntoPeriods(title, description, totalDays, periodStructure = []) {
        try {
            const response = await fetch(`${this.baseURL}/ai/manager/break-goal-periods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description || "",
                    total_days: totalDays,
                    period_structure: periodStructure
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при разбиении цели на периоды:', error);
            throw error;
        }
    }
    
    /**
     * Получает статистику использования менеджера
     * @returns {Promise<Object>} Объект со статистикой
     */
    async getStats() {
        try {
            const response = await fetch(`${this.baseURL}/ai/manager/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
            throw error;
        }
    }
}

// Создаем глобальный экземпляр
let aiManager = null;

/**
 * Получает экземпляр клиента AI менеджера
 * @param {string} baseURL - Базовый URL API
 * @returns {AIManagerClient} Экземпляр клиента
 */
function getAIManager(baseURL) {
    if (!aiManager) {
        try {
            aiManager = new AIManagerClient(baseURL);
            console.log('✅ AIManagerClient создан');
        } catch (error) {
            console.error('❌ Ошибка создания AIManagerClient:', error);
            return null;
        }
    }
    return aiManager;
}

// Проверка загрузки
console.log('✅ ai_manager_frontend.js загружен');
console.log('  - AIManagerClient:', typeof AIManagerClient !== 'undefined' ? '✅' : '❌');
console.log('  - getAIManager:', typeof getAIManager !== 'undefined' ? '✅' : '❌');

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIManagerClient, getAIManager };
}

