// Обновленные функции для script.js
// ВНИМАНИЕ: Это файл-шаблон с фрагментами кода для копирования в класс RoadToDreamApp
// НЕ подключайте этот файл напрямую в index.html!
// Используйте эти функции, заменяя соответствующие методы в script.js

// ============================================
// ФРАГМЕНТЫ КОДА ДЛЯ КЛАССА RoadToDreamApp
// ============================================

/*
// Обновленная функция setupTelegramWebApp
setupTelegramWebApp() {
    // Проверяем, что мы в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Инициализация
        tg.ready();
        tg.expand();
        
        console.log('Telegram WebApp инициализирован');
        
        // Авторизуемся с новым API
        this.initializeUser();
    } else {
        console.log('Telegram WebApp не обнаружен, работаем в обычном браузере');
        // Для тестирования в браузере
        this.initializeTestUser();
    }
}

// Новая функция инициализации пользователя
async initializeUser() {
    try {
        // Авторизуемся через Telegram
        const user = await window.apiIntegration.authWithTelegram();
        
        if (user) {
            this.user = user;
            console.log('👤 Пользователь инициализирован:', user);
            
            // Загружаем данные пользователя
            await this.loadUserData();
            
            // Показываем приветствие с именем пользователя
            this.showUserWelcome(user);
        } else {
            console.error('❌ Не удалось авторизовать пользователя');
        }
    } catch (error) {
        console.error('❌ Ошибка инициализации пользователя:', error);
    }
}

// Функция для тестирования в браузере
async initializeTestUser() {
    const testUser = {
        telegram_id: 123456789,
        first_name: "Тест",
        last_name: "Пользователь",
        username: "test_user"
    };
    
    this.user = testUser;
    console.log('🧪 Тестовый пользователь инициализирован:', testUser);
}

// Загрузка данных пользователя
async loadUserData() {
    if (!this.user?.telegram_id) return;
    
    try {
        const userData = await window.apiIntegration.getUserData(this.user.telegram_id);
        
        if (userData) {
            // Обновляем данные в приложении
            this.userData = userData;
            
            // Загружаем карты в модуль карты
            if (this.mapModule && userData.cards) {
                this.mapModule.loadCardsFromAPI(userData.cards);
            }
            
            // Загружаем цели
            if (userData.goals) {
                this.loadGoalsFromAPI(userData.goals);
            }
            
            console.log('📊 Данные пользователя загружены:', userData);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
}

// Показ приветствия пользователя
showUserWelcome(user) {
    const welcomeMessage = `Добро пожаловать, ${user.first_name || user.username || 'Пользователь'}!`;
    console.log('👋', welcomeMessage);
    
    // Можно показать уведомление в интерфейсе
    if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(welcomeMessage);
    }
}

// Создание цели через API
async createGoalAPI(goalData) {
    if (!this.user?.telegram_id) {
        console.error('❌ Пользователь не авторизован');
        return null;
    }
    
    const goal = {
        goal_type: goalData.type || 'general',
        description: goalData.description || goalData.title
    };
    
    try {
        const result = await window.apiIntegration.createGoals(this.user.telegram_id, [goal]);
        
        if (result) {
            console.log('🎯 Цель создана через API:', result);
            
            // Показываем AI мотивацию
            await this.showAIMotivation('first_goal');
            
            return result;
        }
    } catch (error) {
        console.error('❌ Ошибка создания цели:', error);
    }
    
    return null;
}

// Создание карты через API
async createCardAPI(cardData) {
    if (!this.user?.telegram_id) {
        console.error('❌ Пользователь не авторизован');
        return null;
    }
    
    const card = {
        title: cardData.title,
        description: cardData.description,
        card_type: cardData.type || 'goal',
        priority: cardData.priority || 1,
        tags: cardData.tags || []
    };
    
    try {
        const result = await window.apiIntegration.createCards(this.user.telegram_id, [card]);
        
        if (result) {
            console.log('🃏 Карта создана через API:', result);
            return result;
        }
    } catch (error) {
        console.error('❌ Ошибка создания карты:', error);
    }
    
    return null;
}

// Отметка выполнения действия
async completeActionAPI() {
    if (!this.user?.telegram_id) {
        console.error('❌ Пользователь не авторизован');
        return null;
    }
    
    try {
        const result = await window.apiIntegration.completeAction(this.user.telegram_id);
        
        if (result) {
            console.log('✅ Действие отмечено через API:', result);
            
            // Показываем AI мотивацию
            await this.showAIMotivation('motivation_needed');
            
            return result;
        }
    } catch (error) {
        console.error('❌ Ошибка отметки действия:', error);
    }
    
    return null;
}

// Показ AI мотивации
async showAIMotivation(event) {
    try {
        const motivation = await window.apiIntegration.getAIMotivation(event);
        
        if (motivation?.message) {
            console.log('🤖 AI мотивация:', motivation.message);
            
            // Показываем мотивацию в интерфейсе
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(motivation.message);
            } else {
                // Для браузера
                alert(`🤖 ${motivation.message}`);
            }
        }
    } catch (error) {
        console.error('❌ Ошибка получения мотивации:', error);
    }
}

// Загрузка целей из API
loadGoalsFromAPI(goals) {
    console.log('🎯 Загружаем цели из API:', goals);
    
    // Здесь можно обновить интерфейс с загруженными целями
    // Например, добавить их в список целей пользователя
}

// Обновленная функция инициализации приложения
async init() {
    console.log('🚀 Инициализация приложения...');
    
    // Настраиваем Telegram WebApp
    this.setupTelegramWebApp();
    
    // Инициализируем модули
    this.initializeModules();
    
    // Показываем главный экран
    this.showScreen('map');
    
    console.log('✅ Приложение инициализировано');
}
*/
