// ============================================
//   МОДУЛЬ КАРТЫ МЕЧТЫ - ОТДЕЛЬНЫЙ ФАЙЛ
//   Отдельный файл для избежания конфликтов
// ============================================

console.log('🗺️ Загружается map.js...');

class MapModule {
    constructor(app) {
        this.app = app;
        console.log('🗺️ MapModule инициализирован');
    }

    // Рендеринг экрана карты
    renderMapScreen() {
        const appContainer = document.getElementById('app-container');
        
        // Проверяем, есть ли созданная карта
        if (this.app.currentMap) {
            this.renderMapWithStepsStrip();
        } else {
            this.renderEmptyMapScreen();
        }
    }
    
    // Рендеринг пустого экрана карты
    renderEmptyMapScreen() {
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
                    <button class="create-map-button" id="create-map-btn">
                        <span class="plus-icon">+</span>
                        Создать новую карту
                    </button>
                    <div class="cta-description">Определи свою цель, разбей её на шаги и начни двигаться вперед</div>
                </div>
            </div>
        `;
        
        // Добавляем обработчик для кнопки
        const createButton = document.getElementById('create-map-btn');
        if (createButton) {
            createButton.addEventListener('click', () => {
                this.handleCreateMap();
            });
        }
    }
    
    // Рендеринг карты с лентой шагов
    renderMapWithStepsStrip() {
        console.log('🎯 ФУНКЦИЯ renderMapWithStepsStrip ВЫЗВАНА!');
        const appContainer = document.getElementById('app-container');
        const progress = Math.round((this.app.currentMap.currentStep / this.app.currentMap.totalSteps) * 100);
        const isCompleted = this.app.currentMap.currentStep >= this.app.currentMap.totalSteps;
        const currentStepData = this.app.currentMap.steps[this.app.currentMap.currentStep];
        
        console.log('Рендерим карту:', {
            currentStep: this.app.currentMap.currentStep,
            totalSteps: this.app.currentMap.totalSteps,
            isCompleted: isCompleted,
            progress: progress
        });
        
        appContainer.innerHTML = `
            <div class="map-screen">
                <!-- Заголовок карты -->
                <div class="map-header">
                    <h2 class="map-title clickable" id="map-title">${this.app.currentMap.goal}</h2>
                    <div class="map-progress">
                        <div class="progress-text">Прогресс: ${this.app.currentMap.currentStep}/${this.app.currentMap.totalSteps} дней (${progress}%)</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Область карты с лентой шагов -->
                <div class="map-container">
                    <div class="steps-strip" id="steps-strip">
                        ${this.renderStepsStrip()}
                    </div>
                </div>
                
                <!-- Кнопки управления -->
                <div class="map-actions">
                    ${isCompleted ? `
                    <div class="completion-message">
                        <div class="celebration-icon">🎉</div>
                        <div class="completion-text">Поздравляем! Цель достигнута!</div>
                    </div>
                    ` : ''}
                    <button class="reset-map-button" id="reset-map-btn">
                        Создать новую карту
                    </button>
                </div>
            </div>
        `;
        
        // Добавляем обработчики для встроенных кнопок подтверждения шагов
        const inlineButtons = document.querySelectorAll('.confirm-step-btn-inline');
        console.log('Найдено встроенных кнопок:', inlineButtons.length);
        inlineButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showStepConfirmationModal();
            });
        });
        
        // Добавляем обработчик для кнопки сброса карты
        const resetButton = document.getElementById('reset-map-btn');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.handleCreateMap();
            });
        }
        
        // Добавляем обработчик для клика по названию карты
        const mapTitle = document.getElementById('map-title');
        if (mapTitle) {
            mapTitle.addEventListener('click', () => {
                this.showMapSelectionModal();
            });
        }
    }

    // Рендеринг ленты шагов
    renderStepsStrip() {
        console.log('🎯 Рендерим ленту шагов...');
        if (!this.app.currentMap || !this.app.currentMap.steps) {
            return '';
        }
        
        const steps = this.app.currentMap.steps;
        const currentStepIndex = this.app.currentMap.currentStep;
        
        console.log('Данные для рендеринга ленты:', {
            totalSteps: steps.length,
            currentStepIndex: currentStepIndex,
            steps: steps
        });
        
        // Показываем только текущий и следующие шаги (убираем завершенные)
        const visibleSteps = steps.slice(currentStepIndex);
        const maxVisible = 5; // Максимум 5 шагов на экране
        const stepsToShow = visibleSteps.slice(0, maxVisible);
        
        return stepsToShow.map((step, index) => {
            const stepNumber = currentStepIndex + index + 1;
            const isCurrentStep = index === 0;
            const isCompleted = stepNumber <= currentStepIndex;
            
            if (isCompleted) {
                return ''; // Не показываем завершенные шаги
            }
            
            return `
                <div class="step-container">
                    <div class="step-square ${isCurrentStep ? 'current' : ''} ${isCompleted ? 'completed' : ''}" data-step="${stepNumber}">
                        <span class="step-number">${stepNumber}</span>
                    </div>
                    ${isCurrentStep ? `
                        <div class="current-step-details">
                            <h3>Шаг ${stepNumber}</h3>
                            <div class="step-info">
                                <span class="step-number-large">${stepNumber}</span>
                                <div class="step-description">${step.task}</div>
                            </div>
                            <button class="confirm-step-btn-inline">Подтвердить выполнение</button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Показать модальное окно подтверждения шага
    showStepConfirmationModal() {
        console.log('🎯 Показываем модальное окно подтверждения шага...');
        
        if (!this.app.currentMap || this.app.currentMap.currentStep >= this.app.currentMap.totalSteps) {
            console.log('Нет активного шага для подтверждения');
            return;
        }
        
        const currentStepIndex = this.app.currentMap.currentStep;
        const currentStep = this.app.currentMap.steps[currentStepIndex];
        
        const modalHTML = `
            <div class="modal-overlay active" id="step-confirmation-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Подтверждение выполнения</h2>
                        <p class="modal-subtitle">Вы действительно выполнили этот шаг?</p>
                    </div>
                    <div class="modal-body">
                        <div class="step-confirmation-info">
                            <div class="step-confirmation-number">${currentStepIndex + 1}</div>
                            <div class="step-confirmation-task">${currentStep.task}</div>
                        </div>
                        <div class="confirmation-warning">
                            <div class="warning-icon">⚠️</div>
                            <div class="warning-text">
                                После подтверждения этот шаг будет отмечен как выполненный и вы перейдете к следующему шагу.
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="step-confirmation-cancel">Отмена</button>
                        <button class="btn btn-primary" id="step-confirmation-confirm">Да, выполнил!</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Добавляем обработчики событий
        const modal = document.getElementById('step-confirmation-modal');
        const cancelBtn = document.getElementById('step-confirmation-cancel');
        const confirmBtn = document.getElementById('step-confirmation-confirm');
        
        const closeModal = () => {
            modal.remove();
        };
        
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            this.completeCurrentStep();
            closeModal();
        });
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Завершить текущий шаг
    completeCurrentStep() {
        console.log('🎯 Завершаем текущий шаг...');
        
        if (!this.app.currentMap || this.app.currentMap.currentStep >= this.app.currentMap.totalSteps) {
            console.log('Нет активного шага для завершения');
            return;
        }
        
        // Увеличиваем текущий шаг
        this.app.currentMap.currentStep++;
        
        console.log('Текущий шаг обновлен:', this.app.currentMap.currentStep);
        
        // Сохраняем изменения
        this.app.saveMapsToStorage();
        
        // Перерендериваем карту
        this.renderMapScreen();
        
        // Показываем уведомление о прогрессе
        if (this.app.currentMap.currentStep >= this.app.currentMap.totalSteps) {
            this.showCompletionMessage();
        }
    }

    // Показать сообщение о завершении
    showCompletionMessage() {
        console.log('🎉 Показываем сообщение о завершении цели!');
        
        const modalHTML = `
            <div class="modal-overlay active" id="completion-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">🎉 Поздравляем!</h2>
                        <p class="modal-subtitle">Вы успешно достигли своей цели!</p>
                    </div>
                    <div class="modal-body">
                        <div class="completion-message">
                            <div class="celebration-icon">🏆</div>
                            <div class="completion-text">
                                Вы прошли весь путь от начала до конца! 
                                Ваша цель "${this.app.currentMap.goal}" успешно достигнута.
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="completion-ok">Отлично!</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('completion-modal');
        const okBtn = document.getElementById('completion-ok');
        
        const closeModal = () => {
            modal.remove();
        };
        
        okBtn.addEventListener('click', closeModal);
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Обработка создания карты
    handleCreateMap() {
        console.log('🎯 Обработка создания новой карты...');
        console.log('handleCreateMap вызван из модуля карты');
        
        // Сразу показываем модальное окно создания карты
        this.addNewMap();
    }

    // Показать модальное окно выбора карты
    showMapSelectionModal() {
        console.log('🎯 Показываем модальное окно выбора карты...');
        console.log('Количество карт:', this.app.maps.length);
        console.log('Карты:', this.app.maps);
        console.log('Проверяем условие maps.length <= 1:', this.app.maps.length <= 1);
        
        if (this.app.maps.length <= 1) {
            console.log('Карт мало, сразу создаем новую');
            // Если карт мало, сразу создаем новую
            this.addNewMap();
            return;
        }
        
        console.log('Показываем модальное окно выбора карт');
        
        const modalHTML = `
            <div class="modal-overlay" id="map-selection-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Выберите карту</h2>
                        <p class="modal-subtitle">Выберите карту для просмотра или создайте новую</p>
                    </div>
                    <div class="modal-body">
                        <div class="maps-list">
                            ${this.app.maps.map(map => `
                                <div class="map-item ${map.id === this.app.currentMapId ? 'active' : ''}">
                                    <div class="map-item-header">
                                        <div class="map-item-title">${map.goal}</div>
                                        <div class="map-item-progress">${map.currentStep}/${map.totalSteps} шагов</div>
                                    </div>
                                    <div class="map-item-description">${map.description || 'Без описания'}</div>
                                    <div class="map-item-actions">
                                        <button class="select-map-btn" data-map-id="${map.id}">
                                            ${map.id === this.app.currentMapId ? 'continue' : 'Выбрать'}
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="map-selection-cancel">Отмена</button>
                        <button class="btn btn-primary" id="add-new-map-btn">Создать новую карту</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Добавляем класс active с задержкой для анимации
        setTimeout(() => {
            const modal = document.getElementById('map-selection-modal');
            if (modal) {
                modal.classList.add('active');
                console.log('Модальное окно активировано');
            } else {
                console.error('Модальное окно не найдено для активации');
            }
        }, 10);
        
        // Добавляем обработчики событий
        const modal = document.getElementById('map-selection-modal');
        const cancelBtn = document.getElementById('map-selection-cancel');
        const addNewBtn = document.getElementById('add-new-map-btn');
        const selectBtns = document.querySelectorAll('.select-map-btn');
        
        const closeModal = () => {
            modal.remove();
        };
        
        cancelBtn.addEventListener('click', closeModal);
        addNewBtn.addEventListener('click', () => {
            closeModal();
            this.app.addNewMap();
        });
        
        selectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mapId = btn.getAttribute('data-map-id');
                this.app.switchToMap(mapId);
                closeModal();
            });
        });
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Создание новой карты
    createMap() {
        console.log('🎯 ФУНКЦИЯ createMap ВЫЗВАНА!');
        console.log('Создание карты с данными:', this.app.newGoalData);
        
        if (!this.app.newGoalData) {
            console.error('Нет данных для создания карты');
            return;
        }
        
        // Создаем новую карту
        const newMap = {
            id: Date.now().toString(), // Уникальный ID
            goal: this.app.newGoalData.title,
            description: this.app.newGoalData.description,
            periodType: this.app.newGoalData.periodType,
            periodDays: this.app.newGoalData.periodDays,
            customPeriod: this.app.newGoalData.customPeriod,
            deadline: this.app.newGoalData.deadline,
            currentStep: 0,
            totalSteps: this.app.newGoalData.periodDays,
            steps: this.app.generateMapSteps(),
            createdAt: new Date().toISOString()
        };
        
        // Добавляем карту в массив
        this.app.maps.push(newMap);
        
        // Делаем новую карту текущей
        this.app.currentMapId = newMap.id;
        this.app.currentMap = newMap;
        
        console.log('Карта создана. Всего карт:', this.app.maps.length);
        console.log('Текущая карта ID:', this.app.currentMapId);
        
        // Сохраняем карты в localStorage
        this.app.saveMapsToStorage();
        
        // Закрываем модальное окно
        this.app.closePeriodBreakdownModal();
        
        // Возвращаемся на главный экран карты
        this.renderMapScreen();
    }

    // Добавление новой карты
    addNewMap() {
        console.log('🎯 Добавляем новую карту...');
        console.log('Проверяем доступность app:', !!this.app);
        console.log('Проверяем доступность showCreateMapModal:', !!this.app.showCreateMapModal);
        
        // Показываем модальное окно создания карты
        if (this.app && this.app.showCreateMapModal) {
            console.log('Вызываем showCreateMapModal...');
            this.app.showCreateMapModal();
        } else {
            console.error('showCreateMapModal не найден в основном приложении');
            console.log('Доступные методы app:', Object.getOwnPropertyNames(this.app));
        }
    }

    // Переключение на карту
    switchToMap(mapId) {
        console.log('🎯 Переключаемся на карту:', mapId);
        
        const map = this.app.maps.find(m => m.id === mapId);
        if (map) {
            this.app.currentMap = map;
            this.app.currentMapId = mapId;
            this.app.saveMapsToStorage();
            console.log('Переключились на карту:', map.goal);
            
            // Рендерим карту после переключения
            this.renderMapScreen();
        }
    }
}

// Экспортируем класс для использования в основном приложении
console.log('🗺️ Экспортируем MapModule...');
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapModule;
    console.log('🗺️ MapModule экспортирован через module.exports');
} else if (typeof window !== 'undefined') {
    window.MapModule = MapModule;
    console.log('🗺️ MapModule экспортирован в window.MapModule');
    console.log('🗺️ Проверка: window.MapModule =', typeof window.MapModule);
} else {
    console.error('🗺️ Не удалось экспортировать MapModule!');
}
