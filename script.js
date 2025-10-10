// JavaScript для Telegram Mini App "Road to Your Dream"

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        this.currentScreen = 'map-screen';
        this.init();
    }

    init() {
        this.setupTelegramWebApp();
        this.showScreen(this.currentScreen);
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
                handleCompleteStep();
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
        // Используем глобальную функцию переключения экранов
        switchToScreen(screenId);
        this.currentScreen = screenId;
    }

    getCurrentScreen() {
        return this.currentScreen;
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
    // Скрываем все экраны (добавляем класс .hidden)
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Показываем только нужный экран (убираем класс .hidden)
    const targetScreen = document.getElementById(screenId);
    
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        console.log(`Переключились на экран: ${screenId}`);
    } else {
        console.error(`Экран с id "${screenId}" не найден`);
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

// Обработчик клика на кнопку выполнения шага
async function handleCompleteStep() {
    const completeBtn = document.getElementById('complete-step-btn');
    
    if (!completeBtn) {
        console.error('Кнопка выполнения шага не найдена');
        return;
    }
    
    // 1. Блокируем кнопку, чтобы предотвратить двойные нажатия
    completeBtn.disabled = true;
    completeBtn.textContent = 'Выполняется...';
    
    try {
        // 2. Получаем telegram_id пользователя
        let telegram_id = null;
        
        if (window.Telegram && window.Telegram.WebApp) {
            telegram_id = Telegram.WebApp.initDataUnsafe?.user?.id;
        }
        
        if (!telegram_id) {
            throw new Error('Telegram ID не найден');
        }
        
        console.log('Выполняем шаг для пользователя:', telegram_id);
        
        // 3. Делаем POST-запрос на API бэкенда
        const response = await fetch(`${BACKEND_BASE_URL}/actions/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                telegram_id: telegram_id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Результат выполнения шага:', result);
        
        // 5. Если успех - обрабатываем результат (теперь проверяем по ответу бэкенда)
        if (result.action || result.message) {
            // Находим .user-avatar и добавляем CSS-класс .animate-jump
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.classList.add('animate-jump');
                
                // Через setTimeout (500ms) удаляем этот класс
                setTimeout(() => {
                    userAvatar.classList.remove('animate-jump');
                }, 500);
            }
            
            // Изменяем текст на плашке на "Отлично! Шаг сделан"
            const taskDescription = document.getElementById('task-description');
            if (taskDescription) {
                const originalText = taskDescription.textContent;
                taskDescription.textContent = 'Отлично! Шаг сделан';
                
                // Возвращаем оригинальный текст через 2 секунды
                setTimeout(() => {
                    taskDescription.textContent = originalText;
                }, 2000);
            }
            
            console.log('Шаг успешно выполнен!');
        } else {
            throw new Error(result.message || 'Неизвестная ошибка при выполнении шага');
        }
        
    } catch (error) {
        console.error('Ошибка при выполнении шага:', error);
        
        // 6. Если ошибка - показываем уведомление через Telegram.WebApp.showAlert
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.showAlert('Произошла ошибка');
        } else {
            // Fallback для обычного браузера
            alert('Произошла ошибка');
        }
    } finally {
        // 7. В блоке finally разблокируем кнопку
        completeBtn.disabled = false;
        completeBtn.textContent = 'Выполнить шаг';
    }
}

// Настройка обработчика кнопки выполнения шага
function setupCompleteStepButton() {
    const completeBtn = document.getElementById('complete-step-btn');
    
    if (!completeBtn) {
        console.warn('Кнопка выполнения шага не найдена');
        return;
    }
    
    // Добавляем обработчик клика
    completeBtn.addEventListener('click', handleCompleteStep);
    
    console.log('Обработчик кнопки выполнения шага настроен');
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Получаем все нужные DOM-элементы в константы
    const mapScreen = document.getElementById('map-screen');
    const planScreen = document.getElementById('plan-screen');
    const profileScreen = document.getElementById('profile-screen');
    const taskInfo = document.getElementById('task-info');
    const taskDescription = document.getElementById('task-description');
    const completeStepBtn = document.getElementById('complete-step-btn');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Настраиваем навигацию
    setupNavigation();
    
    // Настраиваем кнопку выполнения шага
    setupCompleteStepButton();
    
    // Создаем и вызываем главную асинхронную функцию
    initializeApp();
});

// Главная асинхронная функция инициализации приложения
async function initializeApp() {
    try {
        // Инициализируем Telegram Web App
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.ready();
            
            // Получаем telegram_id из Telegram.WebApp.initDataUnsafe.user.id
            const telegram_id = Telegram.WebApp.initDataUnsafe?.user?.id;
            
            if (telegram_id) {
                console.log('Telegram ID:', telegram_id);
                
                // Создаем и вызываем функцию для получения данных с сервера
                const data = await fetchDataFromServer(telegram_id);
                
                // Передаем полученные данные в функцию рендеринга
                renderApp(data);
            } else {
                console.warn('Telegram ID не найден');
                // Инициализируем приложение без данных пользователя
                renderApp(null);
            }
        } else {
            console.log('Telegram WebApp не обнаружен, работаем в обычном браузере');
            // Инициализируем приложение без Telegram данных
            renderApp(null);
        }
        
        // Инициализируем основное приложение
        window.roadToDreamApp = new RoadToDreamApp();
        
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        // Инициализируем приложение с базовой функциональностью
        window.roadToDreamApp = new RoadToDreamApp();
    }
}

// Асинхронная функция для получения данных с сервера
async function fetchDataFromServer(telegram_id) {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/users/${telegram_id}/data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Данные получены с сервера:', data);
        return data;
        
    } catch (error) {
        console.error('Ошибка при получении данных с сервера:', error);
        return null;
    }
}

// Функция для рендеринга приложения с полученными данными
function renderApp(data) {
    console.log('Рендеринг приложения с данными:', data);
    
    // 1. Полностью очищаем содержимое контейнеров
    const mapCanvas = document.getElementById('map-canvas');
    const planContent = document.getElementById('plan-content');
    const profileContent = document.getElementById('profile-content');
    
    if (mapCanvas) mapCanvas.innerHTML = '';
    if (planContent) planContent.innerHTML = '';
    if (profileContent) profileContent.innerHTML = '';
    
    if (!data) {
        console.log('Рендеринг приложения без пользовательских данных');
        return;
    }
    
    // 2. Отрисовка карты
    renderMap(data);
    
    // 3. Отрисовка плана
    renderPlan(data);
    
    // 4. Отрисовка профиля
    renderProfile(data);
}

// Функция отрисовки карты
function renderMap(data) {
    const mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    
    // Отрисовка целей на карте
    if (data.goals && Array.isArray(data.goals)) {
        data.goals.forEach((goal, index) => {
            const goalDot = document.createElement('div');
            goalDot.className = 'goal-dot';
            goalDot.setAttribute('data-goal-id', goal.id || index);
            goalDot.setAttribute('title', goal.title || `Цель ${index + 1}`);
            
            // Рассчитываем позицию цели (в процентах)
            const left = goal.position?.x || Math.random() * 80 + 10; // 10-90%
            const top = goal.position?.y || Math.random() * 80 + 10;  // 10-90%
            
            goalDot.style.left = `${left}%`;
            goalDot.style.top = `${top}%`;
            
            // Добавляем стили в зависимости от статуса цели
            if (goal.completed) {
                goalDot.classList.add('completed');
            } else if (goal.current) {
                goalDot.classList.add('current');
            }
            
            mapCanvas.appendChild(goalDot);
        });
    }
    
    // Отрисовка аватара пользователя
    if (data.user) {
        const userAvatar = document.createElement('div');
        userAvatar.className = 'user-avatar';
        userAvatar.setAttribute('title', data.user.first_name || 'Пользователь');
        
        // Позиция аватара пользователя (обычно в центре или в начальной точке)
        const avatarLeft = data.user.position?.x || 50; // центр по умолчанию
        const avatarTop = data.user.position?.y || 50;  // центр по умолчанию
        
        userAvatar.style.left = `${avatarLeft}%`;
        userAvatar.style.top = `${avatarTop}%`;
        
        // Добавляем инициалы или эмодзи аватара
        if (data.user.first_name) {
            userAvatar.textContent = data.user.first_name.charAt(0).toUpperCase();
        } else {
            userAvatar.textContent = '👤';
        }
        
        mapCanvas.appendChild(userAvatar);
    }
}

// Функция отрисовки плана
function renderPlan(data) {
    const planContent = document.getElementById('plan-content');
    if (!planContent) return;
    
    let planHTML = '<div class="plan-container">';
    
    if (data.goals && Array.isArray(data.goals)) {
        planHTML += '<h2>Мои цели</h2>';
        planHTML += '<ul class="goals-list">';
        
        data.goals.forEach((goal, index) => {
            const statusClass = goal.completed ? 'completed' : (goal.current ? 'current' : 'pending');
            const statusIcon = goal.completed ? '✅' : (goal.current ? '🎯' : '⏳');
            
            planHTML += `
                <li class="goal-item ${statusClass}" data-goal-id="${goal.id || index}">
                    <div class="goal-header">
                        <span class="goal-icon">${statusIcon}</span>
                        <h3 class="goal-title">${goal.title || `Цель ${index + 1}`}</h3>
                    </div>
                    <p class="goal-description">${goal.description || 'Описание цели не указано'}</p>
                    <div class="goal-meta">
                        <span class="goal-priority">Приоритет: ${goal.priority || 'Средний'}</span>
                        ${goal.deadline ? `<span class="goal-deadline">До: ${goal.deadline}</span>` : ''}
                    </div>
                </li>
            `;
        });
        
        planHTML += '</ul>';
    } else {
        planHTML += '<div class="empty-state">';
        planHTML += '<h2>План пуст</h2>';
        planHTML += '<p>Добавьте свои первые цели для начала путешествия к мечте!</p>';
        planHTML += '</div>';
    }
    
    planHTML += '</div>';
    planContent.innerHTML = planHTML;
}

// Функция отрисовки профиля
function renderProfile(data) {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return;
    
    let profileHTML = '<div class="profile-container">';
    
    // Информация о пользователе
    if (data.user) {
        profileHTML += `
            <div class="user-info">
                <div class="user-avatar-large">
                    ${data.user.first_name ? data.user.first_name.charAt(0).toUpperCase() : '👤'}
                </div>
                <h2>${data.user.first_name || 'Пользователь'}</h2>
                ${data.user.username ? `<p class="username">@${data.user.username}</p>` : ''}
            </div>
        `;
    }
    
    // Статистика
    profileHTML += '<div class="stats-section">';
    profileHTML += '<h3>Статистика</h3>';
    
    const totalGoals = data.goals ? data.goals.length : 0;
    const completedGoals = data.goals ? data.goals.filter(goal => goal.completed).length : 0;
    const currentGoals = data.goals ? data.goals.filter(goal => goal.current).length : 0;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    profileHTML += `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalGoals}</div>
                <div class="stat-label">Всего целей</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${completedGoals}</div>
                <div class="stat-label">Выполнено</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${currentGoals}</div>
                <div class="stat-label">В работе</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${completionRate}%</div>
                <div class="stat-label">Прогресс</div>
            </div>
        </div>
    `;
    
    // Дополнительная статистика
    if (data.stats) {
        profileHTML += '<div class="additional-stats">';
        if (data.stats.daysActive) {
            profileHTML += `<p>Активен ${data.stats.daysActive} дней</p>`;
        }
        if (data.stats.streak) {
            profileHTML += `<p>Серия: ${data.stats.streak} дней подряд</p>`;
        }
        profileHTML += '</div>';
    }
    
    profileHTML += '</div>';
    profileHTML += '</div>';
    
    profileContent.innerHTML = profileHTML;
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoadToDreamApp;
}
