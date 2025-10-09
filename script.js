// JavaScript для Telegram Mini App "Road to Your Dream"

class RoadToDreamApp {
    constructor() {
        this.currentScreen = 'map-screen';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupCompleteButton();
        this.setupTelegramWebApp();
        this.showScreen(this.currentScreen);
    }

    // Настройка навигации между экранами
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetScreen = button.getAttribute('data-screen');
                this.showScreen(targetScreen);
                this.updateActiveNavButton(button);
            });
        });
    }

    // Переключение между экранами
    showScreen(screenId) {
        // Скрыть все экраны
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });

        // Показать выбранный экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
    }

    // Обновление активной кнопки навигации
    updateActiveNavButton(activeButton) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    // Настройка кнопки выполнения шага
    setupCompleteButton() {
        const completeBtn = document.getElementById('complete-step-btn');
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                this.completeCurrentStep();
            });
        }
    }

    // Выполнение текущего шага
    completeCurrentStep() {
        console.log('Выполнение шага для экрана:', this.currentScreen);
        
        // Здесь будет логика выполнения шага в зависимости от текущего экрана
        switch (this.currentScreen) {
            case 'map-screen':
                this.handleMapStep();
                break;
            case 'plan-screen':
                this.handlePlanStep();
                break;
            case 'profile-screen':
                this.handleProfileStep();
                break;
        }
    }

    // Обработка шага на карте
    handleMapStep() {
        console.log('Обработка шага карты');
        // Логика для карты
        this.updateTaskInfo('Карта', 'Выберите следующую точку на карте');
    }

    // Обработка шага плана
    handlePlanStep() {
        console.log('Обработка шага плана');
        // Логика для плана
        this.updateTaskInfo('План', 'Добавьте новый пункт в план');
    }

    // Обработка шага профиля
    handleProfileStep() {
        console.log('Обработка шага профиля');
        // Логика для профиля
        this.updateTaskInfo('Профиль', 'Обновите информацию профиля');
    }

    // Обновление информации о задаче
    updateTaskInfo(title, description) {
        const taskTitle = document.querySelector('#task-info h3');
        const taskDescription = document.getElementById('task-description');
        
        if (taskTitle) taskTitle.textContent = title;
        if (taskDescription) taskDescription.textContent = description;
    }

    // Настройка Telegram WebApp
    setupTelegramWebApp() {
        // Проверяем, что мы в Telegram
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            
            // Инициализация
            tg.ready();
            tg.expand();
            
            // Настройка темы
            this.setupTheme(tg);
            
            // Настройка кнопки главного меню
            tg.MainButton.setText('Выполнить');
            tg.MainButton.show();
            
            // Обработчик кнопки главного меню
            tg.MainButton.onClick(() => {
                this.completeCurrentStep();
            });
            
            console.log('Telegram WebApp инициализирован');
        } else {
            console.log('Telegram WebApp не обнаружен, работаем в обычном браузере');
        }
    }

    // Настройка темы Telegram
    setupTheme(tg) {
        const themeParams = tg.themeParams;
        
        if (themeParams) {
            // Применяем цвета темы к CSS переменным
            const root = document.documentElement;
            
            if (themeParams.bg_color) {
                root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
            }
            if (themeParams.text_color) {
                root.style.setProperty('--tg-theme-text-color', themeParams.text_color);
            }
            if (themeParams.button_color) {
                root.style.setProperty('--tg-theme-button-color', themeParams.button_color);
            }
            if (themeParams.button_text_color) {
                root.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
            }
        }
    }

    // Публичные методы для внешнего использования
    setTaskInfo(title, description) {
        this.updateTaskInfo(title, description);
    }

    switchToScreen(screenId) {
        this.showScreen(screenId);
        const navButton = document.querySelector(`[data-screen="${screenId}"]`);
        if (navButton) {
            this.updateActiveNavButton(navButton);
        }
    }

    getCurrentScreen() {
        return this.currentScreen;
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.roadToDreamApp = new RoadToDreamApp();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoadToDreamApp;
}
