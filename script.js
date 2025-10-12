// JavaScript для Telegram Mini App "Road to Your Dream"

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        console.log('RoadToDreamApp constructor called');
        this.currentScreen = 'map';
        this.newGoalData = null; // Данные создаваемой цели
        this.customPeriods = []; // Кастомные периоды
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
                        <h2 class="modal-title">Срок достижения цели</h2>
                        <p class="modal-subtitle">Как вы хотите установить срок?</p>
                    </div>
                    <div class="modal-body">
                        <div class="period-type-selector">
                            <button class="period-type-btn active" id="deadline-btn">Дедлайн</button>
                            <button class="period-type-btn" id="duration-btn">Период</button>
                        </div>
                        
                        <div id="deadline-section">
                            <div class="date-input-group">
                                <label class="form-label" for="goal-deadline">Дата достижения цели</label>
                                <input type="date" id="goal-deadline" class="date-input" min="">
                            </div>
                        </div>
                        
                        <div id="duration-section" style="display: none;">
                            <div class="period-options">
                                <div class="period-option" data-period="week">
                                    <input type="radio" name="period" value="week" class="period-radio" id="period-week">
                                    <div class="period-info">
                                        <div class="period-title">1 неделя</div>
                                        <div class="period-description">Быстрая цель на неделю</div>
                                    </div>
                                </div>
                                <div class="period-option" data-period="month">
                                    <input type="radio" name="period" value="month" class="period-radio" id="period-month">
                                    <div class="period-info">
                                        <div class="period-title">1 месяц</div>
                                        <div class="period-description">Среднесрочная цель</div>
                                    </div>
                                </div>
                                <div class="period-option" data-period="quarter">
                                    <input type="radio" name="period" value="quarter" class="period-radio" id="period-quarter">
                                    <div class="period-info">
                                        <div class="period-title">3 месяца</div>
                                        <div class="period-description">Долгосрочная цель</div>
                                    </div>
                                </div>
                                <div class="period-option" data-period="half-year">
                                    <input type="radio" name="period" value="half-year" class="period-radio" id="period-half-year">
                                    <div class="period-info">
                                        <div class="period-title">6 месяцев</div>
                                        <div class="period-description">Серьезный проект</div>
                                    </div>
                                </div>
                                <div class="period-option" data-period="year">
                                    <input type="radio" name="period" value="year" class="period-radio" id="period-year">
                                    <div class="period-info">
                                        <div class="period-title">1 год</div>
                                        <div class="period-description">Масштабная цель</div>
                                    </div>
                                </div>
                                <div class="period-option" data-period="custom">
                                    <input type="radio" name="period" value="custom" class="period-radio" id="period-custom">
                                    <div class="period-info">
                                        <div class="period-title">Свой вариант</div>
                                        <div class="period-description">Укажите точный период</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Кастомный ввод периода -->
                            <div id="custom-period-section" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label">Добавить период</label>
                                    <div class="custom-period-input">
                                        <input type="number" id="custom-period-number" class="period-number-input" placeholder="0" min="1" max="999">
                                        <select id="custom-period-unit" class="period-unit-select">
                                            <option value="days">дней</option>
                                            <option value="weeks">недель</option>
                                            <option value="months">месяцев</option>
                                            <option value="years">лет</option>
                                        </select>
                                        <button class="custom-period-add" id="add-custom-period">Добавить</button>
                                    </div>
                                    <div class="custom-period-list" id="custom-period-list"></div>
                                </div>
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

        // Устанавливаем минимальную дату (сегодня)
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('goal-deadline').min = today;

        // Настраиваем обработчики событий
        this.setupPeriodSelectionEvents();
    }

    // Настройка обработчиков событий для выбора периода
    setupPeriodSelectionEvents() {
        const nextBtn = document.getElementById('period-next-btn');
        const backBtn = document.getElementById('period-back-btn');
        const deadlineBtn = document.getElementById('deadline-btn');
        const durationBtn = document.getElementById('duration-btn');
        const deadlineSection = document.getElementById('deadline-section');
        const durationSection = document.getElementById('duration-section');
        const deadlineInput = document.getElementById('goal-deadline');

        // Обработчики кнопок навигации
        nextBtn.addEventListener('click', () => {
            this.nextToPeriodBreakdown();
        });

        backBtn.addEventListener('click', () => {
            this.goBackToGoalInput();
        });

        // Переключение между дедлайном и периодом
        deadlineBtn.addEventListener('click', () => {
            deadlineBtn.classList.add('active');
            durationBtn.classList.remove('active');
            deadlineSection.style.display = 'block';
            durationSection.style.display = 'none';
            
            // Проверяем валидность дедлайна
            this.validateDeadline();
        });

        durationBtn.addEventListener('click', () => {
            durationBtn.classList.add('active');
            deadlineBtn.classList.remove('active');
            deadlineSection.style.display = 'none';
            durationSection.style.display = 'block';
            
            // Сбрасываем валидацию дедлайна
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
            
            // Настраиваем обработчики для выбора периода
            this.setupDurationSelection();
        });

        // Валидация дедлайна
        deadlineInput.addEventListener('change', () => {
            this.validateDeadline();
        });

        // Закрытие по клику на overlay
        const modal = document.getElementById('period-selection-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePeriodSelectionModal();
            }
        });
    }

    // Настройка обработчиков для выбора периода
    setupDurationSelection() {
        const periodOptions = document.querySelectorAll('.period-option');
        const nextBtn = document.getElementById('period-next-btn');
        const customPeriodSection = document.getElementById('custom-period-section');

        periodOptions.forEach(option => {
            const radio = option.querySelector('.period-radio');
            
            option.addEventListener('click', () => {
                // Снимаем выделение с других опций
                periodOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Выделяем выбранную опцию
                option.classList.add('selected');
                
                // Активируем радиокнопку
                radio.checked = true;
                
                // Показываем/скрываем кастомный ввод
                if (radio.value === 'custom') {
                    customPeriodSection.style.display = 'block';
                    this.setupCustomPeriodHandlers();
                } else {
                    customPeriodSection.style.display = 'none';
                }
                
                // Проверяем валидность
                this.validateDurationSelection();
            });

            radio.addEventListener('change', () => {
                if (radio.checked) {
                    periodOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    // Показываем/скрываем кастомный ввод
                    if (radio.value === 'custom') {
                        customPeriodSection.style.display = 'block';
                        this.setupCustomPeriodHandlers();
                    } else {
                        customPeriodSection.style.display = 'none';
                    }
                    
                    // Проверяем валидность
                    this.validateDurationSelection();
                }
            });
        });
    }

    // Настройка обработчиков для кастомных периодов
    setupCustomPeriodHandlers() {
        const addBtn = document.getElementById('add-custom-period');
        const numberInput = document.getElementById('custom-period-number');
        const unitSelect = document.getElementById('custom-period-unit');
        const customList = document.getElementById('custom-period-list');

        // Обработчик добавления периода
        addBtn.addEventListener('click', () => {
            this.addCustomPeriod();
        });

        // Обработчик Enter в поле числа
        numberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCustomPeriod();
            }
        });

        // Очищаем предыдущие обработчики
        addBtn.replaceWith(addBtn.cloneNode(true));
        numberInput.replaceWith(numberInput.cloneNode(true));
        unitSelect.replaceWith(unitSelect.cloneNode(true));
    }

    // Добавить кастомный период
    addCustomPeriod() {
        const numberInput = document.getElementById('custom-period-number');
        const unitSelect = document.getElementById('custom-period-unit');
        const customList = document.getElementById('custom-period-list');
        const nextBtn = document.getElementById('period-next-btn');

        const number = parseInt(numberInput.value);
        const unit = unitSelect.value;

        if (number < 1 || number > 999) {
            alert('Введите число от 1 до 999');
            return;
        }

        // Добавляем период в список
        const period = {
            id: Date.now(),
            number: number,
            unit: unit,
            days: this.convertToDays(number, unit)
        };

        this.customPeriods.push(period);
        
        // Обновляем список
        this.updateCustomPeriodList();
        
        // Активируем кнопку "Далее"
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        
        // Очищаем поля
        numberInput.value = '';
    }

    // Обновить список кастомных периодов
    updateCustomPeriodList() {
        const customList = document.getElementById('custom-period-list');
        
        if (this.customPeriods.length === 0) {
            customList.innerHTML = '';
            return;
        }

        const totalDays = this.customPeriods.reduce((sum, period) => sum + period.days, 0);
        
        customList.innerHTML = `
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
                Общий период: ${totalDays} дней
            </div>
            ${this.customPeriods.map(period => `
                <div class="custom-period-item">
                    <span>${period.number} ${this.getUnitName(period.unit)}</span>
                    <button class="custom-period-remove" data-period-id="${period.id}">Удалить</button>
                </div>
            `).join('')}
        `;
        
        // Добавляем обработчики для кнопок удаления
        customList.querySelectorAll('.custom-period-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const periodId = parseInt(btn.dataset.periodId);
                this.removeCustomPeriod(periodId);
            });
        });
    }

    // Удалить кастомный период
    removeCustomPeriod(periodId) {
        this.customPeriods = this.customPeriods.filter(p => p.id !== periodId);
        this.updateCustomPeriodList();
        
        // Проверяем валидность
        this.validateDurationSelection();
    }

    // Конвертировать в дни
    convertToDays(number, unit) {
        const conversions = {
            'days': 1,
            'weeks': 7,
            'months': 30, // Примерное значение
            'years': 365 // Примерное значение
        };
        return number * conversions[unit];
    }

    // Получить название единицы
    getUnitName(unit) {
        const names = {
            'days': 'дней',
            'weeks': 'недель',
            'months': 'месяцев',
            'years': 'лет'
        };
        return names[unit];
    }

    // Валидация выбора периода
    validateDurationSelection() {
        const selectedPeriod = document.querySelector('input[name="period"]:checked');
        const nextBtn = document.getElementById('period-next-btn');
        
        if (!selectedPeriod) {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
            return;
        }
        
        if (selectedPeriod.value === 'custom') {
            // Для кастомного периода нужны добавленные периоды
            nextBtn.disabled = this.customPeriods.length === 0;
            nextBtn.style.opacity = this.customPeriods.length === 0 ? '0.5' : '1';
        } else {
            // Для стандартных периодов все ОК
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }
    }

    // Валидация дедлайна
    validateDeadline() {
        const deadlineInput = document.getElementById('goal-deadline');
        const nextBtn = document.getElementById('period-next-btn');
        
        if (deadlineInput.value) {
            const selectedDate = new Date(deadlineInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate >= today) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
            } else {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.5';
            }
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        }
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
        const deadlineBtn = document.getElementById('deadline-btn');
        const isDeadlineMode = deadlineBtn.classList.contains('active');
        
        if (isDeadlineMode) {
            // Режим дедлайна
            const deadlineInput = document.getElementById('goal-deadline');
            if (!deadlineInput.value) return;
            
            const deadline = new Date(deadlineInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (deadline < today) return;
            
            // Сохраняем данные дедлайна
            this.newGoalData.periodType = 'deadline';
            this.newGoalData.deadline = deadlineInput.value;
            this.newGoalData.periodDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
            
            console.log('Выбран дедлайн:', this.newGoalData.deadline, 'дней до цели:', this.newGoalData.periodDays);
        } else {
            // Режим периода
            const selectedPeriod = document.querySelector('input[name="period"]:checked');
            if (!selectedPeriod) return;
            
            // Сохраняем данные периода
            this.newGoalData.periodType = 'duration';
            this.newGoalData.period = selectedPeriod.value;
            
            if (selectedPeriod.value === 'custom') {
                // Кастомный период
                this.newGoalData.customPeriods = [...this.customPeriods];
                this.newGoalData.periodDays = this.customPeriods.reduce((sum, period) => sum + period.days, 0);
                console.log('Выбран кастомный период:', this.newGoalData.customPeriods, 'дней:', this.newGoalData.periodDays);
            } else {
                // Стандартный период
                this.newGoalData.periodDays = this.getPeriodDays(selectedPeriod.value);
                console.log('Выбран период:', this.newGoalData.period, 'дней:', this.newGoalData.periodDays);
            }
        }
        
        // Закрываем текущее модальное окно
        this.closePeriodSelectionModal();
        
        // TODO: Переходим к разбивке на подпериоды
        const message = isDeadlineMode 
            ? `Дедлайн установлен на ${this.newGoalData.deadline}! Следующий шаг - разбивка на подпериоды.`
            : `Период "${this.newGoalData.period}" выбран! Следующий шаг - разбивка на подпериоды.`;
        alert(message);
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
