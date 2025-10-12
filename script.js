// JavaScript для Telegram Mini App "Road to Your Dream"

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        console.log('RoadToDreamApp constructor called');
        this.currentScreen = 'map';
        this.newGoalData = null; // Данные создаваемой цели
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
            <div class="empty-map-screen">
                <!-- Мотивационная цитата -->
                <div class="motivational-quote">
                    <div class="quote-text">Путешествие в тысячу миль начинается с одного шага.</div>
                    <div class="quote-author">— Лао-цзы</div>
                </div>
                
                <!-- Призыв к действию -->
                <div class="call-to-action">
                    <div class="cta-question">Готов начать путь к своей мечте?</div>
                    <button class="create-map-button" onclick="this.handleCreateMap()">
                        <span class="plus-icon">+</span>
                        Создать новую карту
                    </button>
                    <div class="cta-description">Определи свою цель, разбей её на шаги и начни двигаться вперед</div>
                </div>
            </div>
        `;
        
        // Добавляем обработчик для кнопки
        const createButton = appContainer.querySelector('.create-map-button');
        if (createButton) {
            createButton.addEventListener('click', () => {
                this.handleCreateMap();
            });
        }
    }
    
    // Обработчик создания новой карты
    handleCreateMap() {
        console.log('Создание новой карты...');
        this.showCreateMapModal();
    }

    // Показать модальное окно создания карты
    showCreateMapModal() {
        const modalHTML = `
            <div class="modal-overlay active" id="create-map-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Создание новой карты</h2>
                        <p class="modal-subtitle">Опишите свою цель</p>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label" for="goal-title">Название цели</label>
                            <input 
                                type="text" 
                                id="goal-title" 
                                class="form-input" 
                                placeholder="Например: Выучить английский язык"
                                maxlength="100"
                            >
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="goal-description">Описание (необязательно)</label>
                            <textarea 
                                id="goal-description" 
                                class="form-input" 
                                placeholder="Подробнее опишите свою цель..."
                                rows="3"
                                maxlength="500"
                                style="resize: none; min-height: 80px;"
                            ></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancel-btn">Отмена</button>
                        <button class="btn btn-primary" id="next-btn" disabled>Далее</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Настраиваем обработчики событий
        this.setupCreateMapModalEvents();
    }

    // Настройка обработчиков событий для модального окна
    setupCreateMapModalEvents() {
        const goalInput = document.getElementById('goal-title');
        const nextBtn = document.getElementById('next-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        // Обработчики кнопок
        nextBtn.addEventListener('click', () => {
            this.nextStep();
        });

        cancelBtn.addEventListener('click', () => {
            this.closeCreateMapModal();
        });

        // Валидация ввода
        goalInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            nextBtn.disabled = value.length < 3;
            
            if (value.length >= 3) {
                nextBtn.style.opacity = '1';
    } else {
                nextBtn.style.opacity = '0.5';
            }
        });

        // Обработка Enter
        goalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !nextBtn.disabled) {
                this.nextStep();
            }
        });

        // Закрытие по клику на overlay
        const modal = document.getElementById('create-map-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCreateMapModal();
            }
        });
    }

    // Закрыть модальное окно создания карты
    closeCreateMapModal() {
        const modal = document.getElementById('create-map-modal');
        if (modal) {
            modal.classList.remove('active');
                setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Переход к следующему шагу
    nextStep() {
        const goalTitle = document.getElementById('goal-title').value.trim();
        const goalDescription = document.getElementById('goal-description').value.trim();

        if (goalTitle.length < 3) {
        return;
    }
    
        // Сохраняем данные цели
        this.newGoalData = {
            title: goalTitle,
            description: goalDescription
        };

        console.log('Данные цели:', this.newGoalData);
        
        // Закрываем текущее модальное окно
        this.closeCreateMapModal();
        
        // Переходим к следующему шагу (выбор периода)
        this.showPeriodSelectionModal();
    }

    // Показать модальное окно выбора периода
    showPeriodSelectionModal() {
        const modalHTML = `
            <div class="modal-overlay active" id="period-selection-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Выберите период</h2>
                        <p class="modal-subtitle">За какой срок хотите достичь цель?</p>
                </div>
                    <div class="modal-body">
                        <div class="period-options">
                            <div class="period-option" data-period="week">
                                <input type="radio" name="period" value="week" class="period-radio" id="period-week">
                                <div class="period-info">
                                    <div class="period-title">1 неделя</div>
                                    <div class="period-description">Быстрая цель на неделю</div>
                </div>
                                <div class="period-badge">7 дней</div>
                </div>
                            <div class="period-option" data-period="month">
                                <input type="radio" name="period" value="month" class="period-radio" id="period-month">
                                <div class="period-info">
                                    <div class="period-title">1 месяц</div>
                                    <div class="period-description">Среднесрочная цель</div>
            </div>
                                <div class="period-badge">28 дней</div>
        </div>
                            <div class="period-option" data-period="quarter">
                                <input type="radio" name="period" value="quarter" class="period-radio" id="period-quarter">
                                <div class="period-info">
                                    <div class="period-title">3 месяца</div>
                                    <div class="period-description">Долгосрочная цель</div>
            </div>
                                <div class="period-badge">84 дня</div>
        </div>
                            <div class="period-option" data-period="half-year">
                                <input type="radio" name="period" value="half-year" class="period-radio" id="period-half-year">
                                <div class="period-info">
                                    <div class="period-title">6 месяцев</div>
                                    <div class="period-description">Серьезный проект</div>
                    </div>
                                <div class="period-badge">168 дней</div>
                        </div>
                            <div class="period-option" data-period="year">
                                <input type="radio" name="period" value="year" class="period-radio" id="period-year">
                                <div class="period-info">
                                    <div class="period-title">1 год</div>
                                    <div class="period-description">Масштабная цель</div>
                    </div>
                                <div class="period-badge">336 дней</div>
                </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="period-back-btn">Назад</button>
                        <button class="btn btn-primary" id="period-next-btn" disabled>Далее</button>
                    </div>
                </div>
        </div>
    `;
    
        // Добавляем модальное окно в body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Настраиваем обработчики событий
        this.setupPeriodSelectionEvents();
    }

    // Настройка обработчиков событий для выбора периода
    setupPeriodSelectionEvents() {
        const periodOptions = document.querySelectorAll('.period-option');
        const nextBtn = document.getElementById('period-next-btn');
        const backBtn = document.getElementById('period-back-btn');

        // Обработчики кнопок
        nextBtn.addEventListener('click', () => {
            this.nextToPeriodBreakdown();
        });

        backBtn.addEventListener('click', () => {
            this.goBackToGoalInput();
        });

        periodOptions.forEach(option => {
            const radio = option.querySelector('.period-radio');
            
            option.addEventListener('click', () => {
                // Снимаем выделение с других опций
                periodOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Выделяем выбранную опцию
                option.classList.add('selected');
                
                // Активируем радиокнопку
                radio.checked = true;
                
                // Активируем кнопку "Далее"
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
            });

            radio.addEventListener('change', () => {
                if (radio.checked) {
                    periodOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    nextBtn.disabled = false;
                    nextBtn.style.opacity = '1';
                }
            });
    });
    
    // Закрытие по клику на overlay
        const modal = document.getElementById('period-selection-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePeriodSelectionModal();
        }
    });
}

    // Закрыть модальное окно выбора периода
    closePeriodSelectionModal() {
        const modal = document.getElementById('period-selection-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Вернуться к вводу цели
    goBackToGoalInput() {
        this.closePeriodSelectionModal();
        this.showCreateMapModal();
    }

    // Переход к разбивке периода
    nextToPeriodBreakdown() {
        const selectedPeriod = document.querySelector('input[name="period"]:checked');
        if (!selectedPeriod) return;

        // Сохраняем выбранный период
        this.newGoalData.period = selectedPeriod.value;
        this.newGoalData.periodDays = this.getPeriodDays(selectedPeriod.value);

        console.log('Выбранный период:', this.newGoalData.period, 'дней:', this.newGoalData.periodDays);
        
        // Закрываем текущее модальное окно
        this.closePeriodSelectionModal();
        
        // TODO: Переходим к разбивке на подпериоды
        alert(`Период "${selectedPeriod.value}" выбран! Следующий шаг - разбивка на подпериоды.`);
    }

    // Получить количество дней для периода
    getPeriodDays(period) {
        const periodDays = {
            'week': 7,
            'month': 28,
            'quarter': 84,
            'half-year': 168,
            'year': 336
        };
        return periodDays[period] || 7;
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
            
            console.log('Telegram WebApp инициализирован');
        } else {
            console.log('Telegram WebApp не обнаружен, работаем в обычном браузере');
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
        
        // Инициализируем основное приложение
        window.roadToDreamApp = new RoadToDreamApp();
});
