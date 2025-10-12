// JavaScript для Telegram Mini App "Road to Your Dream"

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        console.log('RoadToDreamApp constructor called');
        this.currentScreen = 'map';
        this.init();
    }

    init() {
        this.setupTelegramWebApp();
        this.showScreen(this.currentScreen);
    }

    // Переключение между экранами
    showScreen(screenId) {
            this.currentScreen = screenId;
        this.renderCurrentScreen();
    }
    
    // Рендеринг текущего экрана
    renderCurrentScreen() {
        console.log('Rendering screen:', this.currentScreen);
        
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;
        
        switch(this.currentScreen) {
            case 'map':
                this.renderMapScreen();
                break;
            case 'caravan':
                this.renderCaravanScreen();
                break;
            case 'garage':
                this.renderGarageScreen();
                break;
        }
    }

    // Рендеринг экрана карты
    renderMapScreen() {
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="screen-content">
                <h2>🗺️ Карта</h2>
                <p>Здесь будет реализован экран карты с целями</p>
            </div>
        `;
    }

    // Рендеринг экрана каравана
    renderCaravanScreen() {
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="screen-content">
                <h2>🚐 Караван</h2>
                <p>Здесь будет реализован экран каравана</p>
            </div>
        `;
    }

    // Рендеринг экрана гаража
    renderGarageScreen() {
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="screen-content">
                <h2>🏠 Гараж</h2>
                <p>Здесь будет реализован экран гаража/профиля</p>
            </div>
        `;
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
}

// Функция для управления навигацией
function setupNavigation() {
    const navigation = document.getElementById('navigation');
    
    if (!navigation) {
        console.warn('Панель навигации не найдена');
        return;
    }
    
    // Добавляем один обработчик событий на всю панель навигации
    navigation.addEventListener('click', (event) => {
        // Проверяем, что клик был по кнопке навигации
        const navButton = event.target.closest('.nav-btn');
        
        if (!navButton) {
            return; // Клик не по кнопке навигации
        }
        
        // Получаем data-screen атрибут
        const targetScreenId = navButton.getAttribute('data-screen');
        
        if (!targetScreenId) {
            console.warn('Кнопка навигации не имеет атрибута data-screen');
            return;
        }
        
        // Переключаем экран
        switchToScreen(targetScreenId);
        
        // Обновляем активную кнопку
        updateActiveNavButton(navButton);
    });
}

// Функция переключения экрана
function switchToScreen(screenId) {
        console.log(`Переключились на экран: ${screenId}`);
        
    // Обновляем текущий экран в приложении
        if (window.roadToDreamApp) {
        window.roadToDreamApp.showScreen(screenId);
    }
}

// Функция обновления активной кнопки навигации
function updateActiveNavButton(activeButton) {
    // Убираем класс active со всех кнопок
    const allNavButtons = document.querySelectorAll('.nav-btn');
    allNavButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Добавляем класс active к текущей кнопке
    activeButton.classList.add('active');
}

// Функции будут добавлены по мере необходимости

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Настраиваем навигацию
    setupNavigation();
    
    // Инициализируем тему
    initializeTheme();
    
    // Настраиваем кнопку переключения темы
    setupThemeToggle();
        
        // Инициализируем основное приложение
        window.roadToDreamApp = new RoadToDreamApp();
});

// Функция для переключения темы
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.setAttribute('data-theme', 'light');
        themeToggle.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Функция для инициализации темы
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.body.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').setAttribute('data-theme', theme);
}

// Настройка кнопки переключения темы
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        console.warn('Кнопка переключения темы не найдена');
        return;
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    console.log('Кнопка переключения темы настроена');
}
