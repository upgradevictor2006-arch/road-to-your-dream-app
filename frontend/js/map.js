// ============================================
//   МОДУЛЬ КАРТЫ МЕЧТЫ - ОТДЕЛЬНЫЙ ФАЙЛ
//   Отдельный файл для избежания конфликтов
// ============================================


class MapModule {
    constructor(app) {
        this.app = app;
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
        
        // Получаем все карты, включая цели караванов
        const allMaps = this.app.maps || [];
        const hasMaps = allMaps.length > 0;
        
        appContainer.innerHTML = `
            <div class="map-screen">
                <!-- Заголовок -->
                <div class="map-header">
                    <h2 class="map-title">🗺️ Карта</h2>
                    <p class="map-subtitle">Ваши цели и прогресс</p>
                </div>
                
                ${hasMaps ? `
                    <!-- Список карт -->
                    <div class="maps-list">
                        <h3 class="maps-list-title">Ваши карты</h3>
                        ${this.renderMapsList(allMaps)}
                    </div>
                ` : `
                    <!-- Мотивационная цитата -->
                    <div class="motivational-quote">
                        <div class="quote-text">Путешествие в тысячу миль начинается с одного шага.</div>
                        <div class="quote-author">— Лао-цзы</div>
                    </div>
                `}
                
                <!-- Призыв к действию -->
                <div class="call-to-action">
                    <div class="cta-question">${hasMaps ? 'Создать новую карту?' : 'Готов начать путь к своей мечте?'}</div>
                    <button class="create-map-button" id="create-map-btn">
                        <span class="plus-icon">+</span>
                        Создать новую карту
                    </button>
                    <div class="cta-description">Определи свою цель, разбей её на шаги и начни двигаться вперед</div>
                </div>
            </div>
        `;
        
        // Добавляем обработчики для карт
        if (hasMaps) {
            this.setupMapListEvents();
        }
        
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
        const appContainer = document.getElementById('app-container');
        const progress = Math.round((this.app.currentMap.currentStep / this.app.currentMap.totalSteps) * 100);
        const isCompleted = this.app.currentMap.currentStep >= this.app.currentMap.totalSteps;
        const currentStepData = this.app.currentMap.steps[this.app.currentMap.currentStep];
        
        
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
        if (!this.app.currentMap || !this.app.currentMap.steps) {
            return '';
        }
        
        const steps = this.app.currentMap.steps;
        const currentStepIndex = this.app.currentMap.currentStep;
        
        
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
                        <span class="step-number">${step.day || stepNumber}</span>
                    </div>
                    ${step.title ? `<div class="step-title">${step.title}</div>` : ''}
                    ${step.task ? `<div class="step-description">${step.task}</div>` : ''}
                    ${isCurrentStep ? `
                        <div class="current-step-details">
                            <h3>${step.title || `Шаг ${stepNumber}`}</h3>
                            <div class="step-info">
                                <span class="step-number-large">${step.day || stepNumber}</span>
                                <div class="step-description">${step.task || 'Выполните задачи этого шага'}</div>
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
        
        if (!this.app.currentMap || this.app.currentMap.currentStep >= this.app.currentMap.totalSteps) {
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
                            <div class="step-confirmation-number">${currentStep.day || (currentStepIndex + 1)}</div>
                            ${currentStep.title ? `<div class="step-confirmation-title">${currentStep.title}</div>` : ''}
                            <div class="step-confirmation-task">${currentStep.task || 'Выполните задачи этого шага'}</div>
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
    async completeCurrentStep() {
        
        if (!this.app.currentMap || this.app.currentMap.currentStep >= this.app.currentMap.totalSteps) {
            return;
        }
        
        // Увеличиваем текущий шаг
        this.app.currentMap.currentStep++;
        
        // Сохраняем изменения в localStorage
        this.app.saveMapsToStorage();
        
        // Сохраняем действие в БД
        if (this.app.user?.telegram_id && window.apiIntegration) {
            try {
                await window.apiIntegration.completeAction(this.app.user.telegram_id);
                console.log('✅ Действие сохранено в БД');
            } catch (error) {
                console.error('❌ Ошибка сохранения действия в БД:', error);
            }
        }
        
        // Обновляем карту в БД
        await this.app.updateMapInDatabase(this.app.currentMap);
        
        // Перерендериваем карту
        this.renderMapScreen();
        
        // Показываем уведомление о прогрессе
        if (this.app.currentMap.currentStep >= this.app.currentMap.totalSteps) {
            this.showCompletionMessage();
        }
    }

    // Показать сообщение о завершении
    showCompletionMessage() {
        
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
        
        // Сразу показываем модальное окно создания карты
        this.addNewMap();
    }

    // Рендеринг списка карт
    renderMapsList(maps) {
        return maps.map(map => `
            <div class="map-card" data-map-id="${map.id}">
                <div class="map-card-header">
                    <div class="map-card-title">
                        ${map.isCaravanGoal ? '🚐' : '🎯'} ${map.goal}
                        ${map.isCaravanGoal ? `<span class="caravan-badge">Караван: ${map.caravanName}</span>` : ''}
                    </div>
                    <div class="map-card-progress">
                        <div class="progress-text">${map.currentStep}/${map.totalSteps} шагов</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(map.currentStep / map.totalSteps) * 100}%"></div>
                        </div>
                    </div>
                </div>
                ${map.description ? `<div class="map-card-description">${map.description}</div>` : ''}
                <div class="map-card-meta">
                    <div class="map-card-date">Создано: ${this.formatDate(map.createdAt)}</div>
                    <div class="map-card-type">${map.isCaravanGoal ? 'Цель каравана' : 'Личная цель'}</div>
                </div>
                <div class="map-card-actions">
                    <button class="btn-map-action" data-map-id="${map.id}">
                        Открыть
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Настройка обработчиков для списка карт
    setupMapListEvents() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        // Обработчик для кнопок открытия карт
        appContainer.addEventListener('click', (e) => {
            const mapActionBtn = e.target.closest('.btn-map-action');
            if (mapActionBtn) {
                const mapId = mapActionBtn.dataset.mapId;
                this.switchToMap(mapId);
            }
        });
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Показать модальное окно выбора карты
    showMapSelectionModal() {
        
        if (this.app.maps.length <= 1) {
            // Если карт мало, сразу создаем новую
            this.addNewMap();
            return;
        }
        
        
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
            } else {
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
                this.switchToMap(mapId); // Вызываем функцию из map.js, а не из app
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
        console.log('🗺️ MapModule.createMap() вызвана');
        
        if (!this.app.newGoalData) {
            console.log('❌ newGoalData не найдены');
            return;
        }
        
        // Вызываем основную функцию создания карты из приложения
        console.log('🔄 Вызываем this.app.createMap() для обработки логики каравана');
        this.app.createMap();
    }

    // Добавление новой карты
    addNewMap() {
        
        // Показываем модальное окно создания карты
        if (this.app && this.app.showCreateMapModal) {
            this.app.showCreateMapModal();
        } else {
        }
    }

    // Переключение на карту
    switchToMap(mapId) {
        
        const map = this.app.maps.find(m => m.id === mapId);
        if (map) {
            this.app.currentMap = map;
            this.app.currentMapId = mapId;
            this.app.saveMapsToStorage();
            
            // Рендерим карту после переключения
            this.renderMapScreen();
        } else {
        }
    }
}

// Экспортируем класс для использования в основном приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapModule;
} else if (typeof window !== 'undefined') {
    window.MapModule = MapModule;
}
