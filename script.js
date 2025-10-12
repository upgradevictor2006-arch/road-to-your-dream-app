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
                                    <label class="form-label">Укажите точный период</label>
                                    <div class="custom-period-input">
                                        <div class="period-input-group">
                                            <div class="period-input-label">Годы</div>
                                            <input type="number" id="custom-years" class="period-number-input" placeholder="0" min="0" max="99">
                                        </div>
                                        <div class="period-input-group">
                                            <div class="period-input-label">Месяцы</div>
                                            <input type="number" id="custom-months" class="period-number-input" placeholder="0" min="0" max="11">
                                        </div>
                                        <div class="period-input-group">
                                            <div class="period-input-label">Недели</div>
                                            <input type="number" id="custom-weeks" class="period-number-input" placeholder="0" min="0" max="3">
                                        </div>
                                        <div class="period-input-group">
                                            <div class="period-input-label">Дни</div>
                                            <input type="number" id="custom-days" class="period-number-input" placeholder="0" min="0" max="6">
                                        </div>
                                    </div>
                                    <div class="period-total-display">
                                        <div class="period-total-label">Общий период</div>
                                        <div class="period-total-days" id="total-period-days">0 дней</div>
                                    </div>
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
        const yearInput = document.getElementById('custom-years');
        const monthInput = document.getElementById('custom-months');
        const weekInput = document.getElementById('custom-weeks');
        const dayInput = document.getElementById('custom-days');

        // Обработчики изменения значений
        [yearInput, monthInput, weekInput, dayInput].forEach(input => {
            input.addEventListener('input', () => {
                this.updateCustomPeriodTotal();
            });
        });

        // Очищаем предыдущие обработчики
        [yearInput, monthInput, weekInput, dayInput].forEach(input => {
            input.replaceWith(input.cloneNode(true));
        });
    }

    // Обновить общий период
    updateCustomPeriodTotal() {
        const yearInput = document.getElementById('custom-years');
        const monthInput = document.getElementById('custom-months');
        const weekInput = document.getElementById('custom-weeks');
        const dayInput = document.getElementById('custom-days');
        const totalDisplay = document.getElementById('total-period-days');
        const nextBtn = document.getElementById('period-next-btn');

        const years = parseInt(yearInput.value) || 0;
        const months = parseInt(monthInput.value) || 0;
        const weeks = parseInt(weekInput.value) || 0;
        const days = parseInt(dayInput.value) || 0;

        // Конвертируем в дни
        const totalDays = (years * 365) + (months * 30) + (weeks * 7) + days;

        // Обновляем отображение
        totalDisplay.textContent = `${totalDays} дней`;

        // Активируем/деактивируем кнопку "Далее"
        const hasValidPeriod = totalDays > 0;
        nextBtn.disabled = !hasValidPeriod;
        nextBtn.style.opacity = hasValidPeriod ? '1' : '0.5';
    }

    // Получить данные кастомного периода
    getCustomPeriodData() {
        const yearInput = document.getElementById('custom-years');
        const monthInput = document.getElementById('custom-months');
        const weekInput = document.getElementById('custom-weeks');
        const dayInput = document.getElementById('custom-days');

        const years = parseInt(yearInput.value) || 0;
        const months = parseInt(monthInput.value) || 0;
        const weeks = parseInt(weekInput.value) || 0;
        const days = parseInt(dayInput.value) || 0;

        return {
            years,
            months,
            weeks,
            days,
            totalDays: (years * 365) + (months * 30) + (weeks * 7) + days
        };
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
            // Для кастомного периода проверяем общий период
            const customData = this.getCustomPeriodData();
            nextBtn.disabled = customData.totalDays === 0;
            nextBtn.style.opacity = customData.totalDays === 0 ? '0.5' : '1';
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
                const customData = this.getCustomPeriodData();
                this.newGoalData.customPeriod = customData;
                this.newGoalData.periodDays = customData.totalDays;
                console.log('Выбран кастомный период:', customData);
            } else {
                // Стандартный период
                this.newGoalData.periodDays = this.getPeriodDays(selectedPeriod.value);
                console.log('Выбран период:', this.newGoalData.period, 'дней:', this.newGoalData.periodDays);
            }
        }
        
        // Закрываем текущее модальное окно
        this.closePeriodSelectionModal();
        
        // Переходим к разбивке на подпериоды
        this.showPeriodBreakdownModal();
    }

    // Показать модальное окно разбивки на подпериоды
    showPeriodBreakdownModal() {
        const totalDays = this.newGoalData.periodDays;
        const breakdown = this.generatePeriodBreakdown(totalDays);

        const modalHTML = `
            <div class="modal-overlay active" id="period-breakdown-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Разбивка на подпериоды</h2>
                        <p class="modal-subtitle">Организуйте свой путь к цели</p>
                    </div>
                    <div class="modal-body">
                        <div class="breakdown-container" id="breakdown-container">
                            ${this.renderBreakdownHTML(breakdown)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="breakdown-back-btn">Назад</button>
                        <button class="btn btn-primary" id="breakdown-next-btn">Создать карту</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Настраиваем обработчики событий
        this.setupBreakdownModalEvents();
        
        // Добавляем обработчики для кнопок разбивки
        this.setupBreakdownItemHandlers();
    }

    // Генерация структуры разбивки периода
    generatePeriodBreakdown(totalDays) {
        let breakdown = [];

        if (totalDays >= 365) {
            // Год и больше - разбиваем на месяцы
            const years = Math.floor(totalDays / 365);
            const remainingDays = totalDays % 365;
            
            for (let i = 0; i < years; i++) {
                const yearDays = Math.min(365, totalDays - (i * 365));
                breakdown.push({
                    id: `year-${i}`,
                    type: 'year',
                    title: `Год ${i + 1}`,
                    task: '',
                    days: yearDays,
                    children: this.generateMonthBreakdown(yearDays, i)
                });
            }
            
            if (remainingDays > 0) {
                breakdown.push({
                    id: 'remaining-period',
                    type: 'period',
                    title: 'Дополнительный период',
                    task: '',
                    days: remainingDays,
                    children: this.generateMonthBreakdown(remainingDays, years)
                });
            }
        } else if (totalDays >= 30) {
            // Месяц и больше - разбиваем на недели
            breakdown = this.generateMonthBreakdown(totalDays, 0);
        } else if (totalDays >= 7) {
            // Неделя и больше - разбиваем на дни
            breakdown = this.generateWeekBreakdown(totalDays);
        } else {
            // Меньше недели - только дни
            breakdown = this.generateDayBreakdown(totalDays);
        }

        return breakdown;
    }

    // Генерация разбивки месяцев
    generateMonthBreakdown(totalDays, yearIndex) {
        const months = Math.ceil(totalDays / 30);
        const breakdown = [];

        for (let i = 0; i < months; i++) {
            const monthDays = Math.min(30, totalDays - (i * 30));
            breakdown.push({
                id: `month-${yearIndex}-${i}`,
                type: 'month',
                title: this.getMonthName(i + 1),
                task: '',
                days: monthDays,
                children: monthDays >= 7 ? this.generateWeekBreakdown(monthDays, `${yearIndex}-${i}`) : this.generateDayBreakdown(monthDays, `${yearIndex}-${i}`)
            });
        }

        return breakdown;
    }

    // Генерация разбивки недель
    generateWeekBreakdown(totalDays, parentId = '') {
        const weeks = Math.ceil(totalDays / 7);
        const breakdown = [];

        for (let i = 0; i < weeks; i++) {
            const weekDays = Math.min(7, totalDays - (i * 7));
            breakdown.push({
                id: `week-${parentId}-${i}`,
                type: 'week',
                title: `Неделя ${i + 1}`,
                task: '',
                days: weekDays,
                children: this.generateDayBreakdown(weekDays, `${parentId}-${i}`)
            });
        }

        return breakdown;
    }

    // Генерация разбивки дней
    generateDayBreakdown(totalDays, parentId = '') {
        const breakdown = [];

        for (let i = 0; i < totalDays; i++) {
            breakdown.push({
                id: `day-${parentId}-${i}`,
                type: 'day',
                title: `День ${i + 1}`,
                task: '',
                days: 1,
                children: []
            });
        }

        return breakdown;
    }

    // Получить название месяца
    getMonthName(monthNumber) {
        return `${monthNumber}-й месяц`;
    }

    // Рендеринг HTML для разбивки
    renderBreakdownHTML(breakdown, level = 0) {
        return breakdown.map(item => {
            const hasChildren = item.children && item.children.length > 0;
            const childrenHTML = hasChildren ? this.renderBreakdownHTML(item.children, level + 1) : '';

            return `
                <div class="breakdown-item" data-id="${item.id}">
                    <div class="breakdown-header" data-toggle-id="${item.id}">
                        <div class="breakdown-left">
                            <svg class="breakdown-icon ${hasChildren ? '' : 'hidden'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9,18 15,12 9,6"></polyline>
                            </svg>
                            <div class="breakdown-content">
                                <div class="breakdown-title">${item.title}</div>
                                <div class="breakdown-task">${item.task || ''}</div>
                            </div>
                        </div>
                        <button class="breakdown-edit-btn" data-edit-id="${item.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                    ${hasChildren ? `
                        <div class="breakdown-children" id="children-${item.id}">
                            ${childrenHTML}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Настройка обработчиков событий для модального окна разбивки
    setupBreakdownModalEvents() {
        const backBtn = document.getElementById('breakdown-back-btn');
        const nextBtn = document.getElementById('breakdown-next-btn');

        // Обработчики кнопок навигации
        backBtn.addEventListener('click', () => {
            this.closePeriodBreakdownModal();
            this.showPeriodSelectionModal();
        });

        nextBtn.addEventListener('click', () => {
            this.createMap();
        });

        // Закрытие по клику на overlay
        const modal = document.getElementById('period-breakdown-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePeriodBreakdownModal();
            }
        });
    }

    // Настройка обработчиков для элементов разбивки
    setupBreakdownItemHandlers() {
        // Обработчики для раскрытия/скрытия
        document.querySelectorAll('[data-toggle-id]').forEach(header => {
            header.addEventListener('click', () => {
                const itemId = header.dataset.toggleId;
                this.toggleBreakdownItem(itemId);
            });
        });

        // Обработчики для редактирования
        document.querySelectorAll('[data-edit-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Предотвращаем срабатывание клика по header
                const itemId = btn.dataset.editId;
                this.editBreakdownItem(itemId);
            });
        });
    }

    // Переключение раскрытия/скрытия элемента разбивки
    toggleBreakdownItem(itemId) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        const children = document.getElementById(`children-${itemId}`);
        const icon = item.querySelector('.breakdown-icon');

        if (children) {
            children.classList.toggle('expanded');
            icon.classList.toggle('expanded');
        }
    }

    // Редактирование элемента разбивки
    editBreakdownItem(itemId) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        const titleElement = item.querySelector('.breakdown-title');
        const taskElement = item.querySelector('.breakdown-task');
        
        const currentTitle = titleElement.textContent;
        const currentTask = taskElement.textContent;

        this.showEditModal(itemId, currentTitle, currentTask);
    }

    // Показать модальное окно редактирования
    showEditModal(itemId, currentTitle, currentTask) {
        const modalHTML = `
            <div class="edit-modal active" id="edit-breakdown-modal">
                <div class="edit-modal-content">
                    <div class="edit-modal-header">
                        <h3 class="edit-modal-title">Редактировать</h3>
                        <p class="edit-modal-subtitle">Измените название и задачу</p>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label" for="edit-title">Название</label>
                            <input type="text" id="edit-title" class="form-input" value="${currentTitle}" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="edit-task">Задача</label>
                            <textarea id="edit-task" class="form-input" rows="3" maxlength="200" placeholder="Опишите задачу для этого периода...">${currentTask}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="edit-cancel-btn">Отмена</button>
                        <button class="btn btn-primary" id="edit-save-btn">Сохранить</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Настройка обработчиков
        const cancelBtn = document.getElementById('edit-cancel-btn');
        const saveBtn = document.getElementById('edit-save-btn');
        const modal = document.getElementById('edit-breakdown-modal');

        cancelBtn.addEventListener('click', () => {
            this.closeEditModal();
        });

        saveBtn.addEventListener('click', () => {
            const title = document.getElementById('edit-title').value.trim();
            const task = document.getElementById('edit-task').value.trim();
            
            if (title) {
                this.saveBreakdownItem(itemId, title, task);
                this.closeEditModal();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditModal();
            }
        });
    }

    // Сохранить изменения элемента разбивки
    saveBreakdownItem(itemId, title, task) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        const titleElement = item.querySelector('.breakdown-title');
        const taskElement = item.querySelector('.breakdown-task');
        
        titleElement.textContent = title;
        taskElement.textContent = task || '';
    }

    // Закрыть модальное окно редактирования
    closeEditModal() {
        const modal = document.getElementById('edit-breakdown-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Закрыть модальное окно разбивки
    closePeriodBreakdownModal() {
        const modal = document.getElementById('period-breakdown-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Создать карту
    createMap() {
        console.log('Создание карты с данными:', this.newGoalData);
        
        // Сохраняем данные карты
        this.currentMap = {
            goal: this.newGoalData.title,
            description: this.newGoalData.description,
            periodType: this.newGoalData.periodType,
            periodDays: this.newGoalData.periodDays,
            customPeriod: this.newGoalData.customPeriod,
            deadline: this.newGoalData.deadline,
            currentStep: 0,
            totalSteps: this.newGoalData.periodDays,
            steps: this.generateMapSteps(),
            visibleSteps: this.generateVisibleSteps()
        };
        
        // Закрываем модальное окно
        this.closePeriodBreakdownModal();
        
        // Показываем карту
        this.showMapScreen();
    }

    // Генерация шагов для карты
    generateMapSteps() {
        const steps = [];
        const totalDays = this.newGoalData.periodDays;
        
        for (let i = 0; i < totalDays; i++) {
            steps.push({
                id: `step-${i}`,
                day: i + 1,
                title: `День ${i + 1}`,
                task: '',
                completed: false,
                position: this.calculateStepPosition(i, totalDays)
            });
        }
        
        return steps;
    }

    // Генерация видимых шагов (только те, что видны на экране)
    generateVisibleSteps() {
        const visibleCount = 8; // Показываем 8 шагов одновременно
        const startIndex = Math.max(0, this.currentMap?.currentStep - 2 || 0);
        const endIndex = Math.min(this.currentMap?.totalSteps || 0, startIndex + visibleCount);
        
        return this.currentMap?.steps.slice(startIndex, endIndex) || [];
    }

    // Расчет позиции шага на зигзагообразной дороге
    calculateStepPosition(stepIndex, totalSteps) {
        const width = 350;
        const height = 400;
        
        // Зигзагообразный паттерн как на шаблоне
        // Дорога начинается справа вверху, идет вниз-влево, затем вправо, затем влево
        const positions = [
            { x: 300, y: 80 },   // 1 - справа вверху
            { x: 250, y: 150 },  // 2 - левее и ниже
            { x: 200, y: 220 },  // 3 - еще левее и ниже
            { x: 150, y: 290 },  // 4 - левее и ниже
            { x: 100, y: 360 },  // 5 - слева внизу
            { x: 150, y: 320 },  // 6 - немного вправо
            { x: 200, y: 280 },  // 7 - еще правее
            { x: 250, y: 240 },  // 8 - правее
            { x: 300, y: 200 },  // 9 - справа
            { x: 250, y: 160 },  // 10 - левее
            { x: 200, y: 120 },  // 11 - еще левее
            { x: 150, y: 80 },   // 12 - слева вверху
        ];
        
        // Используем позиции по циклу
        const positionIndex = stepIndex % positions.length;
        return positions[positionIndex];
    }

    // Показать экран карты
    showMapScreen() {
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = this.renderMapVisualization();
        
        // Настраиваем обработчики событий
        this.setupMapEventListeners();
    }

    // Рендеринг визуализации карты
    renderMapVisualization() {
        const progress = ((this.currentMap.currentStep + 1) / this.currentMap.totalSteps) * 100;
        
        return `
            <div class="map-container">
                <!-- Заголовок с названием цели -->
                <div class="goal-header">
                    <h2 class="goal-title">${this.currentMap.goal}</h2>
                    <div class="goal-progress">День ${this.currentMap.currentStep + 1} из ${this.currentMap.totalSteps}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <!-- Карта с зигзагообразной дорогой -->
                <div class="map-content">
                    <svg class="road-path" viewBox="0 0 400 500">
                        ${this.renderRoadPath()}
                        ${this.renderSteps()}
                    </svg>
                    
                    <!-- Кнопка подтверждения -->
                    <button class="confirm-step-btn" id="confirm-step-btn">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" fill="currentColor"/>
                        </svg>
                        ПОДТВЕРДИТЬ ШАГ
                    </button>
                </div>
                
                <!-- Детали текущего шага -->
                <div class="current-step-details">
                    <h3>${this.currentMap.steps[this.currentMap.currentStep].title}</h3>
                    <p>${this.currentMap.steps[this.currentMap.currentStep].task || 'Нажмите "Редактировать" чтобы добавить задачу'}</p>
                    <div class="step-actions">
                        <button class="btn btn-secondary" id="edit-step-btn">Редактировать</button>
                        <button class="btn btn-primary" id="skip-step-btn">Пропустить</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Рендеринг дороги
    renderRoadPath() {
        const visibleSteps = this.generateVisibleSteps();
        let pathElements = '';
        
        // Создаем зигзагообразную дорогу
        for (let i = 0; i < visibleSteps.length - 1; i++) {
            const currentStep = visibleSteps[i];
            const nextStep = visibleSteps[i + 1];
            
            const pathId = `path-${i}`;
            const pathD = `M${currentStep.position.x},${currentStep.position.y} L${nextStep.position.x},${nextStep.position.y}`;
            
            // Определяем, активна ли линия (до текущего шага включительно)
            const globalIndex = this.currentMap.currentStep - 2 + i;
            const isActive = globalIndex < this.currentMap.currentStep;
            
            pathElements += `
                <path class="road-line ${isActive ? 'active' : ''}" 
                      id="${pathId}" 
                      d="${pathD}"/>
            `;
        }
        
        return pathElements;
    }

    // Рендеринг шагов
    renderSteps() {
        const visibleSteps = this.generateVisibleSteps();
        return visibleSteps.map((step, index) => {
            const globalIndex = this.currentMap.currentStep - 2 + index;
            let className = 'step';
            
            if (globalIndex < this.currentMap.currentStep) {
                className += ' completed';
            } else if (globalIndex === this.currentMap.currentStep) {
                className += ' current';
            } else {
                className += ' pending';
            }
            
            // Овальные шаги как на шаблоне
            return `<ellipse class="${className}" 
                           cx="${step.position.x}" 
                           cy="${step.position.y}" 
                           rx="20" 
                           ry="12" 
                           data-step-id="${step.id}"/>`;
        }).join('');
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

    // Настройка обработчиков событий для карты
    setupMapEventListeners() {
        const confirmBtn = document.getElementById('confirm-step-btn');
        const editBtn = document.getElementById('edit-step-btn');
        const skipBtn = document.getElementById('skip-step-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmCurrentStep();
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editCurrentStep();
            });
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.skipCurrentStep();
            });
        }
    }

    // Подтвердить текущий шаг
    confirmCurrentStep() {
        if (this.currentMap.currentStep < this.currentMap.totalSteps - 1) {
            // Отмечаем текущий шаг как выполненный
            this.currentMap.steps[this.currentMap.currentStep].completed = true;
            
            // Анимация заполнения линии
            this.animateLineFill();
            
            // Переходим к следующему шагу
            setTimeout(() => {
                this.currentMap.currentStep++;
                this.updateMapInterface();
            }, 1000);
            
            console.log(`Шаг ${this.currentMap.currentStep} подтвержден`);
        } else {
            // Цель достигнута!
            this.showGoalCompleted();
        }
    }

    // Пропустить текущий шаг
    skipCurrentStep() {
        if (this.currentMap.currentStep < this.currentMap.totalSteps - 1) {
            // Переходим к следующему шагу без выполнения
            this.currentMap.currentStep++;
            this.updateMapInterface();
            console.log(`Шаг ${this.currentMap.currentStep} пропущен`);
        }
    }

    // Редактировать текущий шаг
    editCurrentStep() {
        const currentStep = this.currentMap.steps[this.currentMap.currentStep];
        this.showStepEditModal(currentStep);
    }

    // Анимация заполнения линии
    animateLineFill() {
        const currentPath = document.querySelector(`#path-${this.currentMap.currentStep}`);
        if (currentPath) {
            // Запускаем анимацию заполнения линии желтым цветом
            currentPath.style.strokeDasharray = '100 0';
            currentPath.style.stroke = 'var(--gold-primary)';
            currentPath.style.filter = 'drop-shadow(0 0 8px rgba(244, 189, 65, 0.6))';
            currentPath.classList.add('active');
        }
    }

    // Обновление интерфейса карты
    updateMapInterface() {
        // Обновляем видимые шаги
        this.currentMap.visibleSteps = this.generateVisibleSteps();
        
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = this.renderMapVisualization();
        this.setupMapEventListeners();
    }

    // Показать модальное окно редактирования шага
    showStepEditModal(step) {
        const modalHTML = `
            <div class="modal-overlay active" id="step-edit-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Редактировать шаг</h2>
                        <p class="modal-subtitle">${step.title}</p>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label" for="step-title">Название</label>
                            <input type="text" id="step-title" class="form-input" value="${step.title}" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="step-task">Задача</label>
                            <textarea id="step-task" class="form-input" rows="3" maxlength="200" placeholder="Опишите задачу для этого дня...">${step.task}</textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="step-edit-cancel">Отмена</button>
                        <button class="btn btn-primary" id="step-edit-save">Сохранить</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const cancelBtn = document.getElementById('step-edit-cancel');
        const saveBtn = document.getElementById('step-edit-save');
        const modal = document.getElementById('step-edit-modal');

        cancelBtn.addEventListener('click', () => {
            this.closeStepEditModal();
        });

        saveBtn.addEventListener('click', () => {
            const title = document.getElementById('step-title').value.trim();
            const task = document.getElementById('step-task').value.trim();
            
            if (title) {
                step.title = title;
                step.task = task;
                this.closeStepEditModal();
                this.updateMapInterface();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeStepEditModal();
            }
        });
    }

    // Закрыть модальное окно редактирования шага
    closeStepEditModal() {
        const modal = document.getElementById('step-edit-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Показать экран завершения цели
    showGoalCompleted() {
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="goal-completed-screen">
                <div class="celebration-content">
                    <div class="celebration-icon">🎉</div>
                    <h1 class="celebration-title">Поздравляем!</h1>
                    <h2 class="goal-achieved">Цель достигнута!</h2>
                    <p class="goal-name">"${this.currentMap.goal}"</p>
                    
                    <div class="completion-stats">
                        <div class="stat-item">
                            <div class="stat-number">${this.currentMap.totalSteps}</div>
                            <div class="stat-label">дней</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.getCompletedStepsCount()}</div>
                            <div class="stat-label">выполнено</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${Math.round((this.getCompletedStepsCount() / this.currentMap.totalSteps) * 100)}%</div>
                            <div class="stat-label">успех</div>
                        </div>
                    </div>
                    
                    <div class="completion-actions">
                        <button class="btn btn-primary" onclick="window.roadToDreamApp.createNewMap()">Создать новую карту</button>
                        <button class="btn btn-secondary" onclick="window.roadToDreamApp.viewMapHistory()">История карт</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Получить количество выполненных шагов
    getCompletedStepsCount() {
        return this.currentMap.steps.filter(step => step.completed).length;
    }

    // Создать новую карту
    createNewMap() {
        this.currentMap = null;
        this.newGoalData = null;
        this.showCreateMapModal();
    }

    // Просмотр истории карт
    viewMapHistory() {
        alert('История карт будет реализована позже!');
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
