// JavaScript для Telegram Mini App "Road to Your Dream"

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        console.log('RoadToDreamApp constructor called');
        this.currentScreen = 'map-screen';
        this.demoData = null;
        this.init();
    }

    init() {
        this.setupTelegramWebApp();
        this.showScreen(this.currentScreen);
        
        // Инициализируем демо-данные и рендерим карту
        this.initializeDemoData();
    }
    
    // Настройка кнопки выполнения шага
    setupCompleteButton() {
        const completeBtn = document.getElementById('complete-step-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', handleCompleteStep);
            console.log('Complete button setup completed');
        } else {
            console.warn('Complete button not found');
        }
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
            
            // Рендерим контент для текущего экрана
            this.renderCurrentScreen();
        }
    }
    
    // Инициализация демо-данных
    initializeDemoData() {
        console.log('Initializing demo data...');
        const demoData = {
            user: {
                name: "Алексей",
                avatar: "👨‍💻",
                currentGoal: "Изучить Python",
                progress: 65
            },
            goals: [
                {
                    id: 1,
                    title: "Изучить Python",
                    description: "Освоить основы программирования на Python",
                    category: "Обучение",
                    priority: "высокий",
                    progress: 65,
                    status: "current",
                    deadline: "2024-03-15"
                },
                {
                    id: 2,
                    title: "Запустить проект",
                    description: "Создать и запустить собственный проект",
                    category: "Проекты",
                    priority: "высокий",
                    progress: 30,
                    status: "pending",
                    deadline: "2024-04-20"
                },
                {
                    id: 3,
                    title: "Изучить дизайн",
                    description: "Освоить основы UI/UX дизайна",
                    category: "Творчество",
                    priority: "средний",
                    progress: 100,
                    status: "completed",
                    deadline: "2024-02-10"
                },
                {
                    id: 4,
                    title: "Научиться гитаре",
                    description: "Изучить базовые аккорды и сыграть 5 песен",
                    category: "Хобби",
                    priority: "низкий",
                    progress: 15,
                    status: "pending",
                    deadline: "2024-05-30"
                },
                {
                    id: 5,
                    title: "Прочитать книги",
                    description: "Прочитать 10 книг по саморазвитию",
                    category: "Развитие",
                    priority: "средний",
                    progress: 40,
                    status: "pending",
                    deadline: "2024-06-15"
                }
            ]
        };
        
        // Сохраняем демо-данные
        this.demoData = demoData;
        console.log('Demo data initialized:', this.demoData);
        
        // Рендерим полноценную карту
        // this.testMapRender(); // Убираем тест
        
        // Рендерим текущий экран
        this.renderCurrentScreen();
    }
    
    
    // Рендеринг текущего экрана
    renderCurrentScreen() {
        console.log('renderCurrentScreen called for:', this.currentScreen);
        if (!this.demoData) {
            console.warn('No demo data available');
            return;
        }
        
        switch(this.currentScreen) {
            case 'map-screen':
                console.log('Rendering map with data:', this.demoData);
                renderMap(this.demoData);
                break;
            case 'goals-screen':
                console.log('Rendering goals with data:', this.demoData);
                renderPlan(this.demoData);
                break;
            case 'caravan-screen':
                console.log('Caravan screen - TODO');
                // TODO: Добавить рендеринг каравана
                break;
            case 'profile-screen':
                console.log('Rendering profile with data:', this.demoData);
                renderProfile(this.demoData);
                break;
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
        
        // Обновляем текущий экран в приложении и рендерим контент
        if (window.roadToDreamApp) {
            window.roadToDreamApp.currentScreen = screenId;
            window.roadToDreamApp.renderCurrentScreen();
        }
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
    
    // Инициализируем тему
    initializeTheme();
    
    // Настраиваем кнопку переключения темы
    setupThemeToggle();
    
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
            }
        } else {
            console.log('Telegram WebApp не обнаружен, работаем в обычном браузере');
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

// Функция отрисовки карты в стиле Duolingo
function renderMap(data) {
    console.log('renderMap called with data:', data);
    const mapCanvas = document.getElementById('map-canvas');
    console.log('mapCanvas element:', mapCanvas);
    if (!mapCanvas) {
        console.error('map-canvas element not found!');
        return;
    }
    
    // Очищаем предыдущий контент
    mapCanvas.innerHTML = '';
    console.log('Starting to render Duolingo-style map...');
    
    // Используем данные из класса приложения
    if (!data || !data.goals) {
        console.warn('No goals data available for map rendering');
        return;
    }
    
    const goals = data.goals;
    
    // Создаем структуру карты в стиле Duolingo
    createDuolingoMap(mapCanvas, goals, data.user);
}

// Функция создания карты в стиле Duolingo
function createDuolingoMap(container, goals, user) {
    // Создаем основной контейнер карты
    const mapContainer = document.createElement('div');
    mapContainer.className = 'duolingo-map';
    
    // Создаем путь (road) для целей
    const road = document.createElement('div');
    road.className = 'duolingo-road';
    
    // Создаем узлы целей и соединяем их
    goals.forEach((goal, index) => {
        // Создаем узел цели
        const goalNode = createGoalNode(goal, index);
        road.appendChild(goalNode);
        
        // Добавляем соединительную линию (кроме последней цели)
        if (index < goals.length - 1) {
            const connector = createConnector(goal, goals[index + 1], index);
            road.appendChild(connector);
        }
    });
    
    // Добавляем стартовую точку
    const startPoint = createStartPoint(user);
    road.insertBefore(startPoint, road.firstChild);
    
    mapContainer.appendChild(road);
    container.appendChild(mapContainer);
}

// Функция создания узла цели
function createGoalNode(goal, index) {
    const node = document.createElement('div');
    node.className = `duolingo-node ${goal.status}`;
    node.setAttribute('data-goal-id', goal.id);
    node.setAttribute('data-category', goal.category);
    
    // Определяем иконку в зависимости от статуса
    let icon = '';
    if (goal.status === 'completed') {
        icon = '✅';
        node.classList.add('completed');
    } else if (goal.status === 'current') {
        icon = '🔥';
        node.classList.add('current');
    } else {
        icon = getCategoryIcon(goal.category);
        node.classList.add('locked');
    }
    
    // Создаем содержимое узла
    node.innerHTML = `
        <div class="node-icon">${icon}</div>
        <div class="node-progress" style="--progress: ${goal.progress}%"></div>
        <div class="node-title">${goal.title}</div>
        <div class="node-category">${goal.category}</div>
    `;
    
    // Добавляем обработчик клика
    node.addEventListener('click', (e) => {
        console.log('Goal node clicked:', goal.title, 'Status:', goal.status);
        e.stopPropagation();
        
        // Показываем меню выбора для всех целей (включая заблокированные)
        console.log('Showing selection menu for goal:', goal.title);
        showGoalSelectionMenu(goal);
    });
    
    return node;
}

// Функция создания соединительной линии
function createConnector(currentGoal, nextGoal, index) {
    const connector = document.createElement('div');
    connector.className = 'duolingo-connector';
    
    // Определяем стиль соединителя в зависимости от статуса текущей цели
    if (currentGoal.status === 'completed') {
        connector.classList.add('completed');
    } else if (currentGoal.status === 'current') {
        connector.classList.add('active');
        } else {
        connector.classList.add('locked');
    }
    
    // Добавляем анимацию прогресса для активного соединителя
    if (currentGoal.status === 'current') {
        const progressBar = document.createElement('div');
        progressBar.className = 'connector-progress';
        progressBar.style.width = `${currentGoal.progress}%`;
        connector.appendChild(progressBar);
    }
    
    return connector;
}

// Функция создания стартовой точки
function createStartPoint(user) {
    const startPoint = document.createElement('div');
    startPoint.className = 'duolingo-start';
    
    startPoint.innerHTML = `
        <div class="start-avatar">${user?.avatar || '👤'}</div>
        <div class="start-label">Начало пути</div>
    `;
    
    return startPoint;
}

// Функция показа меню выбора цели
function showGoalSelectionMenu(selectedGoal) {
    console.log('Showing selection menu for:', selectedGoal.title);
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'goal-selection-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Выбрать цель</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="goal-info">
                        <div class="goal-icon-large">${
                            selectedGoal.status === 'completed' ? '✅' : 
                            selectedGoal.status === 'current' ? '🔥' : 
                            getCategoryIcon(selectedGoal.category)
                        }</div>
                        <h4>${selectedGoal.title}</h4>
                        <p>${selectedGoal.description}</p>
                        <div class="goal-stats">
                            <span class="stat">Категория: ${selectedGoal.category}</span>
                            <span class="stat">Прогресс: ${selectedGoal.progress}%</span>
                            <span class="stat">Дедлайн: ${selectedGoal.deadline}</span>
                            <span class="stat">Статус: ${
                                selectedGoal.status === 'completed' ? 'Выполнена' :
                                selectedGoal.status === 'current' ? 'Текущая' :
                                'Планируемая'
                            }</span>
                        </div>
                    </div>
                    <div class="selection-actions">
                        <button class="btn-secondary" id="view-details">Подробнее</button>
                        <button class="btn-primary" id="select-goal" ${
                            selectedGoal.status === 'current' ? 'disabled' : ''
                        }>${
                            selectedGoal.status === 'current' ? 'Уже текущая' :
                            selectedGoal.status === 'completed' ? 'Сделать текущей' :
                            'Сделать текущей'
                        }</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики событий
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('#view-details').addEventListener('click', () => {
        modal.remove();
        showGoalDetails(selectedGoal);
    });
    
    modal.querySelector('#select-goal').addEventListener('click', () => {
        console.log('Select goal button clicked for:', selectedGoal.title);
        console.log('Selected goal object:', selectedGoal);
        
        // Тест пройден, убираем alert
        
        // Проверяем, что у нас есть доступ к приложению
        if (!window.roadToDreamApp) {
            console.error('RoadToDreamApp not found!');
            alert('Ошибка: приложение не найдено');
            return;
        }
        
        if (!window.roadToDreamApp.demoData) {
            console.error('Demo data not found!');
            alert('Ошибка: данные не найдены');
            return;
        }
        
        selectGoal(selectedGoal);
        modal.remove();
    });
    
    // Закрытие по клику на overlay
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });
}

// Функция выбора цели
function selectGoal(goal) {
    console.log('Selecting goal:', goal.title);
    
    // Обновляем данные в приложении
    if (window.roadToDreamApp && window.roadToDreamApp.demoData) {
        console.log('Before update - goals:', window.roadToDreamApp.demoData.goals.map(g => ({title: g.title, status: g.status})));
        
        // Находим цель в данных приложения по ID
        const goalInData = window.roadToDreamApp.demoData.goals.find(g => g.id === goal.id);
        if (!goalInData) {
            console.error('Goal not found in data!', goal);
            return;
        }
        
        // Сбрасываем текущую цель
        window.roadToDreamApp.demoData.goals.forEach(g => {
            if (g.status === 'current') {
                console.log('Resetting current goal:', g.title);
                g.status = 'pending';
            }
        });
        
        // Устанавливаем новую текущую цель
        goalInData.status = 'current';
        console.log('Setting new current goal:', goalInData.title);
        
        // Обновляем информацию о пользователе
        window.roadToDreamApp.demoData.user.currentGoal = goalInData.title;
        window.roadToDreamApp.demoData.user.progress = goalInData.progress;
        
        console.log('After update - goals:', window.roadToDreamApp.demoData.goals.map(g => ({title: g.title, status: g.status})));
        
        // Перерисовываем карту
        console.log('Re-rendering screen...');
        
        // Принудительно обновляем текущий экран
        if (window.roadToDreamApp.currentScreen === 'map-screen') {
            renderMap(window.roadToDreamApp.demoData);
        } else if (window.roadToDreamApp.currentScreen === 'goals-screen') {
            renderPlan(window.roadToDreamApp.demoData);
        } else if (window.roadToDreamApp.currentScreen === 'profile-screen') {
            renderProfile(window.roadToDreamApp.demoData);
        }
        
        // Показываем уведомление
        showNotification(`Цель "${goalInData.title}" выбрана как текущая!`);
    } else {
        console.error('RoadToDreamApp or demoData not found!');
    }
}

// Функция показа уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функция создания сетки карты
function createMapGrid(mapCanvas) {
    const grid = document.createElement('div');
    grid.className = 'map-grid';
    
    // Создаем вертикальные линии
    for (let i = 0; i <= 10; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line vertical';
        line.style.left = `${i * 10}%`;
        grid.appendChild(line);
    }
    
    // Создаем горизонтальные линии
    for (let i = 0; i <= 10; i++) {
        const line = document.createElement('div');
        line.className = 'grid-line horizontal';
        line.style.top = `${i * 10}%`;
        grid.appendChild(line);
    }
    
    mapCanvas.appendChild(grid);
}

// Функция создания легенды карты
function createMapLegend(mapCanvas) {
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-dot current"></div>
            <span>Текущая цель</span>
        </div>
        <div class="legend-item">
            <div class="legend-dot completed"></div>
            <span>Выполнена</span>
        </div>
        <div class="legend-item">
            <div class="legend-dot pending"></div>
            <span>В планах</span>
        </div>
        <div class="legend-item">
            <div class="legend-avatar"></div>
            <span>Ваша позиция</span>
        </div>
    `;
    
    mapCanvas.appendChild(legend);
}

// Функция показа деталей цели
function showGoalDetails(goal) {
    // Создаем модальное окно с деталями цели
    const modal = document.createElement('div');
    modal.className = 'goal-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${goal.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p class="goal-description">${goal.description}</p>
                <div class="goal-meta">
                    <div class="meta-item">
                        <strong>Категория:</strong> ${goal.category}
                    </div>
                    <div class="meta-item">
                        <strong>Прогресс:</strong> ${goal.progress}%
                    </div>
                    <div class="meta-item">
                        <strong>Статус:</strong> ${goal.completed ? 'Выполнена' : (goal.current ? 'Текущая' : 'В планах')}
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-close">Закрыть</button>
                ${!goal.completed ? '<button class="btn-primary">Продолжить</button>' : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики закрытия модального окна
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Функция отрисовки плана
function renderPlan(data) {
    console.log('renderPlan called with data:', data);
    const planContent = document.getElementById('plan-content');
    if (!planContent) {
        console.error('plan-content element not found');
        return;
    }
    
    if (!data || !data.goals) {
        console.warn('No goals data available for plan rendering');
        console.log('Available data:', data);
        return;
    }
    
    // Используем данные из класса приложения
    const goals = data.goals;
    console.log('Goals for plan rendering:', goals);
    
    let planHTML = '<div class="plan-container">';
    
    planHTML += '<div class="plan-header">';
    planHTML += '<h2>🎯 Ваши цели</h2>';
    planHTML += '<p class="plan-subtitle">Ваш путь к мечте через достижимые этапы</p>';
    planHTML += '</div>';
    
    // Статистика
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const currentGoals = goals.filter(goal => goal.status === 'current').length;
    const overallProgress = Math.round((completedGoals / totalGoals) * 100);
    
    planHTML += '<div class="plan-stats">';
    planHTML += `
        <div class="stat-card">
            <div class="stat-number">${totalGoals}</div>
            <div class="stat-label">Всего целей</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${completedGoals}</div>
            <div class="stat-label">Выполнено</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${currentGoals}</div>
            <div class="stat-label">В работе</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${overallProgress}%</div>
            <div class="stat-label">Прогресс</div>
        </div>
    `;
    planHTML += '</div>';
    
    // Общий прогресс-бар
    planHTML += '<div class="overall-progress">';
    planHTML += '<div class="progress-label">Общий прогресс</div>';
    planHTML += `<div class="progress-bar"><div class="progress-fill" style="width: ${overallProgress}%"></div></div>`;
    planHTML += '</div>';
    
    // Список целей
    planHTML += '<div class="goals-section">';
    planHTML += '<h3>Ваши цели</h3>';
        planHTML += '<ul class="goals-list">';
        
    goals.forEach((goal, index) => {
        const statusClass = goal.status === 'completed' ? 'completed' : (goal.status === 'current' ? 'current' : 'pending');
        const statusIcon = goal.status === 'completed' ? '✅' : (goal.status === 'current' ? '🎯' : '⏳');
        const categoryIcon = getCategoryIcon(goal.category);
            
            planHTML += `
            <li class="goal-item ${statusClass}" data-goal-id="${goal.id}">
                    <div class="goal-header">
                        <span class="goal-icon">${statusIcon}</span>
                    <div class="goal-info">
                        <h4 class="goal-title">${goal.title}</h4>
                        <div class="goal-category">
                            <span class="category-icon">${categoryIcon}</span>
                            <span class="category-name">${goal.category}</span>
                    </div>
                    </div>
                    <div class="goal-priority priority-${goal.priority.toLowerCase()}">${goal.priority}</div>
                </div>
                <p class="goal-description">${goal.description}</p>
                
                <div class="goal-progress">
                    <div class="progress-info">
                        <span class="progress-text">Прогресс: ${goal.progress}%</span>
                        <span class="deadline">${goal.deadline}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%"></div>
                    </div>
                    </div>
                </li>
            `;
        });
        
        planHTML += '</ul>';
        planHTML += '</div>';
    
    planHTML += '</div>';
    
    console.log('Generated plan HTML:', planHTML);
    console.log('Setting planContent.innerHTML...');
    
    // Добавляем простой тест без CSS классов
    const simpleTest = `
        <div style="padding: 20px; color: white;">
            <h2>🎯 Ваши цели</h2>
            <p>Всего целей: ${totalGoals}</p>
            <p>Выполнено: ${completedGoals}</p>
            <p>В работе: ${currentGoals}</p>
            <div>
                ${goals.map(goal => `<p>${goal.title} - ${goal.progress}%</p>`).join('')}
            </div>
        </div>
    `;
    
    planContent.innerHTML = simpleTest;
    
    console.log('Simple test content set successfully');
}

// Функция для получения иконки категории
function getCategoryIcon(category) {
    const icons = {
        'Обучение': '📚',
        'Проекты': '🚀',
        'Творчество': '🎨',
        'Хобби': '🎸',
        'Развитие': '💪',
        'Карьера': '💼',
        'Дизайн': '🎨',
        'Образование': '📖',
        'Здоровье': '🏃‍♂️',
        'Финансы': '💰',
        'Отношения': '❤️'
    };
    return icons[category] || '🎯';
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
                    ${data.user.avatar || '👤'}
                </div>
                <h2>${data.user.name || 'Пользователь'}</h2>
                <p class="current-goal">Текущая цель: ${data.user.currentGoal || 'Не выбрана'}</p>
            </div>
        `;
    }
    
    // Статистика
    profileHTML += '<div class="stats-section">';
    profileHTML += '<h3>Статистика</h3>';
    
    const totalGoals = data.goals ? data.goals.length : 0;
    const completedGoals = data.goals ? data.goals.filter(goal => goal.status === 'completed').length : 0;
    const currentGoals = data.goals ? data.goals.filter(goal => goal.status === 'current').length : 0;
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

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoadToDreamApp;
}
