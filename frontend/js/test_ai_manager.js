/**
 * Скрипт для тестирования ИИ-менеджера
 * Использование: Скопируйте весь код в консоль браузера (F12)
 */

const BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

/**
 * Тестовый помощник для создания данных и проверки ИИ-менеджера
 */
class AIManagerTester {
    constructor(telegramId) {
        this.telegramId = telegramId;
        this.baseURL = BASE_URL;
        console.log(`✅ Инициализирован тестер для Telegram ID: ${telegramId}`);
    }
    
    /**
     * Регистрирует/обновляет пользователя
     */
    async registerUser() {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    username: `test_user_${this.telegramId}`,
                    first_name: "Тестовый",
                    last_name: "Пользователь"
                })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const user = await response.json();
            console.log('✅ Пользователь зарегистрирован:', user);
            return user;
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            throw error;
        }
    }
    
    /**
     * Создает тестовые цели
     */
    async createTestGoals() {
        const goals = [
            {
                goal_type: "career",
                description: "Научиться программировать на Python за 3 месяца"
            },
            {
                goal_type: "health",
                description: "Пробегать 5 км три раза в неделю"
            },
            {
                goal_type: "learning",
                description: "Изучить английский язык до уровня B2"
            }
        ];
        
        try {
            const response = await fetch(`${this.baseURL}/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId,
                    goals: goals
                })
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const result = await response.json();
            console.log(`✅ Создано ${goals.length} целей:`, result);
            return result;
        } catch (error) {
            console.error('❌ Ошибка создания целей:', error);
            throw error;
        }
    }
    
    /**
     * Создает тестовые ежедневные действия
     * ВАЖНО: API создает действие только на сегодня, поэтому создастся только 1 действие
     */
    async createTestActions(daysCount = 5) {
        console.log(`⚠️ ВНИМАНИЕ: API создает действия только на сегодняшнюю дату.`);
        console.log(`   Создаю действие на сегодня...`);
        
        try {
            const response = await fetch(`${this.baseURL}/actions/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_id: this.telegramId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 200 || errorData.message?.includes('уже отмечено')) {
                    console.log('ℹ️ Действие на сегодня уже существует');
                    return [{ message: 'Действие уже существует' }];
                }
                throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
            }
            
            const result = await response.json();
            console.log(`✅ Создано действие на сегодня:`, result.action?.action_date || 'сегодня');
            return [result];
        } catch (error) {
            console.error('❌ Ошибка создания действия:', error);
            throw error;
        }
    }
    
    /**
     * Проверяет, что данные действительно сохранились в БД
     */
    async verifyDataInDB() {
        console.log('\n🔍 ПРОВЕРКА ДАННЫХ В БАЗЕ...\n');
        const data = await this.getUserData();
        
        const hasUser = !!data.user;
        const hasGoals = data.goals && data.goals.length > 0;
        const hasActions = data.daily_actions && data.daily_actions.length > 0;
        
        console.log('📋 РЕЗУЛЬТАТЫ ПРОВЕРКИ:');
        console.log(`   ${hasUser ? '✅' : '❌'} Пользователь в БД`);
        console.log(`   ${hasGoals ? '✅' : '❌'} Цели в БД (${data.goals?.length || 0})`);
        console.log(`   ${hasActions ? '✅' : '❌'} Действия в БД (${data.daily_actions?.length || 0})`);
        
        if (hasUser && hasGoals && hasActions) {
            console.log('\n✅ ВСЕ ДАННЫЕ УСПЕШНО СОХРАНЕНЫ В БАЗУ!\n');
        } else {
            console.log('\n⚠️ НЕКОТОРЫЕ ДАННЫЕ НЕ СОХРАНИЛИСЬ\n');
        }
        
        return { hasUser, hasGoals, hasActions, data };
    }
    
    /**
     * Получает все данные пользователя
     */
    async getUserData() {
        try {
            const response = await fetch(`${this.baseURL}/users/${this.telegramId}/data`);
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            console.log('\n📊 ДАННЫЕ В БАЗЕ ДАННЫХ:');
            console.log('═══════════════════════════════════════');
            console.log(`👤 Пользователь:`, {
                id: data.user?.id,
                telegram_id: data.user?.telegram_id,
                username: data.user?.username,
                created_at: data.user?.created_at
            });
            console.log(`\n🎯 Цели (${data.goals?.length || 0}):`);
            data.goals?.forEach((goal, i) => {
                console.log(`   ${i + 1}. [${goal.goal_type}] ${goal.description} ${goal.is_completed ? '✅' : '⏳'}`);
            });
            console.log(`\n✅ Ежедневные действия (${data.daily_actions?.length || 0}):`);
            data.daily_actions?.slice(0, 10).forEach((action, i) => {
                console.log(`   ${i + 1}. ${action.action_date}`);
            });
            if (data.daily_actions?.length > 10) {
                console.log(`   ... и еще ${data.daily_actions.length - 10} действий`);
            }
            console.log(`\n📋 Карты (${data.cards?.length || 0}):`);
            data.cards?.forEach((card, i) => {
                console.log(`   ${i + 1}. [${card.card_type}] ${card.title} - ${card.status}`);
            });
            console.log('═══════════════════════════════════════\n');
            
            return data;
        } catch (error) {
            console.error('❌ Ошибка получения данных:', error);
            throw error;
        }
    }
    
    /**
     * Инициализирует ИИ-менеджер с тестовым ID
     */
    initAIManager() {
        if (!window.aiManagerUI || !window.aiManagerUI.manager) {
            console.error('❌ ИИ-менеджер не инициализирован! Убедитесь, что вы на странице с приложением.');
            return false;
        }
        
        window.aiManagerUI.manager.setTelegramId(this.telegramId);
        console.log(`✅ ИИ-менеджер настроен на Telegram ID: ${this.telegramId}`);
        return true;
    }
    
    /**
     * Полная настройка: регистрация + создание данных + инициализация ИИ
     */
    async setup(createGoals = true, createActions = true, actionsCount = 5) {
        console.log('🚀 Начинаю настройку тестовых данных...\n');
        
        try {
            // 1. Регистрация пользователя
            await this.registerUser();
            
            // 2. Создание целей
            if (createGoals) {
                await this.createTestGoals();
            }
            
            // 3. Создание действий
            if (createActions) {
                // Сначала удаляем существующие действия для "чистого" теста
                // (В реальности можно пропустить этот шаг)
                await this.createTestActions(actionsCount);
            }
            
            // 4. Инициализация ИИ-менеджера
            if (!this.initAIManager()) {
                console.warn('⚠️ ИИ-менеджер не инициализирован. Используйте initAIManager() после загрузки страницы.');
            }
            
            // 5. Получаем финальные данные и проверяем сохранение в БД
            const data = await this.getUserData();
            
            // 6. Проверяем, что данные действительно в БД
            await this.verifyDataInDB();
            
            console.log('\n✅ Настройка завершена!');
            console.log('\n📋 ЧТО ДАЛЬШЕ:');
            console.log('═══════════════════════════════════════');
            console.log('1. Перейдите на вкладку "ИИ-Менеджер"');
            console.log('2. Нажмите "🧭 Что делать дальше?" - должны увидеть рекомендации');
            console.log('3. Нажмите "📊 Анализ прогресса" - должны увидеть статистику');
            console.log('4. Задайте вопрос в чате');
            console.log('\nИли используйте команды:');
            console.log('   tester.testNavigation()');
            console.log('   tester.testAnalyzeProgress()');
            console.log('   tester.testAdvice("Как начать?")');
            console.log('   tester.verifyDataInDB()  - проверить данные в БД');
            console.log('═══════════════════════════════════════\n');
            
            return data;
        } catch (error) {
            console.error('❌ Ошибка настройки:', error);
            throw error;
        }
    }
    
    /**
     * Тест навигации
     */
    async testNavigation() {
        if (!this.initAIManager()) return;
        
        console.log('🧭 Тестирую навигацию...');
        try {
            await window.aiManagerUI.testNavigation();
        } catch (error) {
            console.error('❌ Ошибка:', error);
        }
    }
    
    /**
     * Тест анализа прогресса
     */
    async testAnalyzeProgress() {
        if (!this.initAIManager()) return;
        
        console.log('📊 Тестирую анализ прогресса...');
        try {
            await window.aiManagerUI.testAnalyzeProgress();
        } catch (error) {
            console.error('❌ Ошибка:', error);
        }
    }
    
    /**
     * Тест совета
     */
    async testAdvice(question = "Как лучше организовать свое время?") {
        if (!this.initAIManager()) return;
        
        console.log(`💡 Тестирую совет: "${question}"`);
        
        // Используем внутренний метод менеджера
        try {
            const result = await window.aiManagerUI.manager.getAdvice(question);
            console.log('✅ Ответ:', result);
            return result;
        } catch (error) {
            console.error('❌ Ошибка:', error);
        }
    }
    
    /**
     * Тест мотивации
     */
    async testMotivation() {
        if (!this.initAIManager()) return;
        
        console.log('💪 Тестирую мотивацию...');
        try {
            await window.aiManagerUI.testMotivation();
        } catch (error) {
            console.error('❌ Ошибка:', error);
        }
    }
}

// ========== ИСПОЛЬЗОВАНИЕ ==========

/**
 * Быстрый старт - создает тестер и настраивает все автоматически
 * 
 * @param {number} telegramId - Telegram ID для тестирования
 * @param {object} options - Опции настройки
 */
async function quickTest(telegramId = 123456789, options = {}) {
    const {
        createGoals = true,
        createActions = true,
        actionsCount = 5
    } = options;
    
    const tester = new AIManagerTester(telegramId);
    await tester.setup(createGoals, createActions, actionsCount);
    
    // Делаем доступным глобально
    window.tester = tester;
    
    return tester;
}

// Инструкция при загрузке
console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🧪 ТЕСТЕР ИИ-МЕНЕДЖЕРА                                   ║
╚═══════════════════════════════════════════════════════════╝

📖 ИСПОЛЬЗОВАНИЕ:

1. Быстрый тест (создает все автоматически):
   quickTest(123456789)
   
   Или с опциями:
   quickTest(123456789, {
       createGoals: true,
       createActions: true,
       actionsCount: 5
   })

2. Пошаговая настройка:
   const tester = new AIManagerTester(123456789);
   await tester.registerUser();
   await tester.createTestGoals();
   await tester.createTestActions(5);
   tester.initAIManager();

3. Тестирование функций:
   await tester.testNavigation();
   await tester.testAnalyzeProgress();
   await tester.testAdvice("Как начать?");
   await tester.testMotivation();

4. Проверка данных:
   await tester.getUserData();

📝 ПРИМЕЧАНИЯ:
- Используйте реальный или тестовый Telegram ID
- Убедитесь, что вы на странице приложения
- Все данные создаются на сервере
- Можно использовать несколько раз с разными ID

`);

