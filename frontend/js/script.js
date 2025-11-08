// JavaScript для Telegram Mini App "Road to Your Dream"
// ВЕРСИЯ: v33 - УДАЛЕН ТЕСТОВЫЙ КОД

console.log('🚀 Загружен script.js версии 33 - УДАЛЕН ТЕСТОВЫЙ КОД!');
console.log('🔧 УДАЛЕН ТЕСТОВЫЙ КОД КОТОРЫЙ ПЕРЕЗАПИСЫВАЛ НАЗВАНИЕ ЦЕЛИ!');

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        console.log('RoadToDreamApp constructor called');
        this.currentScreen = 'map';
        this.newGoalData = null; // Данные создаваемой цели
        this.currentMap = null; // Текущая карта
        this.maps = []; // Массив всех карт
        this.currentMapId = null; // ID текущей карты
        
        // Загружаем сохраненные карты
        this.loadMapsFromStorage();
        
        // Инициализируем модуль каравана
        console.log('🔧 Проверяем доступность CaravanModule:', typeof CaravanModule);
        if (typeof CaravanModule !== 'undefined') {
            this.caravanModule = new CaravanModule(this);
            console.log('✅ Модуль каравана инициализирован:', this.caravanModule);
        } else {
            console.error('❌ CaravanModule не найден! Проверьте загрузку caravan.js');
            this.caravanModule = null;
        }
        
        
        // Инициализируем модуль карты
        console.log('Проверяем доступность MapModule:', typeof MapModule);
        console.log('MapModule в window:', typeof window.MapModule);
        if (typeof MapModule !== 'undefined') {
            this.mapModule = new MapModule(this);
            console.log('Модуль карты инициализирован');
        } else {
            console.error('MapModule не найден! Проверьте загрузку map.js');
            console.log('Доступные глобальные объекты:', Object.keys(window).filter(key => key.includes('Module')));
            this.mapModule = null;
        }
        
        // Инициализируем модуль гаража
        console.log('Проверяем доступность GarageModule:', typeof GarageModule);
        console.log('GarageModule в window:', typeof window.GarageModule);
        if (typeof GarageModule !== 'undefined') {
            this.garageModule = new GarageModule(this);
            console.log('✅ Модуль гаража инициализирован');
        } else {
            console.error('❌ GarageModule не найден! Проверьте загрузку garage.js');
            console.log('Доступные глобальные объекты:', Object.keys(window).filter(key => key.includes('Module')));
            this.garageModule = null;
        }
        
        // Инициализируем модуль ИИ-менеджера
        console.log('Проверяем доступность initAIManagerUI:', typeof initAIManagerUI);
        if (typeof initAIManagerUI !== 'undefined') {
            this.aiManagerModule = initAIManagerUI(this);
            console.log('✅ Модуль ИИ-менеджера инициализирован');
        } else {
            console.error('❌ initAIManagerUI не найден! Проверьте загрузку ai_manager_ui.js');
            this.aiManagerModule = null;
        }
        
        this.init();
    }

    async init() {
        console.log('🚀 Инициализация приложения...');
        
        // Настраиваем Telegram WebApp
        this.setupTelegramWebApp();
        
        // Инициализируем модули (уже сделано в constructor)
        // this.initializeModules(); // Если нужна отдельная функция
        
        // Показываем главный экран
        this.showScreen(this.currentScreen);
        
        console.log('✅ Приложение инициализировано');
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
                if (this.mapModule) {
                    this.mapModule.renderMapScreen();
                } else {
                    console.error('Модуль карты не инициализирован!');
                    // Попытаемся инициализировать модуль карты если он доступен
                    if (typeof MapModule !== 'undefined') {
                        console.log('🔄 Попытка инициализации модуля карты...');
                        this.mapModule = new MapModule(this);
                        if (this.mapModule) {
                            console.log('✅ Модуль карты инициализирован, рендерим...');
                            this.mapModule.renderMapScreen();
                        } else {
                            this.renderMapScreen(); // Fallback
                        }
                    } else {
                        console.error('❌ MapModule недоступен, используем fallback');
                        this.renderMapScreen(); // Fallback
                    }
                }
                break;
            case 'caravan':
                if (this.caravanModule) {
                    this.caravanModule.renderCaravanScreen();
                } else {
                    console.error('Модуль каравана не инициализирован!');
                    this.renderGarageScreen(); // Fallback
                }
                break;
            case 'garage':
                console.log('🎯 Переключаемся на экран гаража...');
                if (this.garageModule) {
                    console.log('✅ Модуль гаража найден, рендерим...');
                    this.garageModule.renderGarageScreen();
                } else {
                    console.error('❌ Модуль гаража не инициализирован!');
                    this.renderGarageScreen(); // Fallback
                }
                break;
            case 'ai-manager':
                console.log('🤖 Переключаемся на экран ИИ-менеджера...');
                if (this.aiManagerModule) {
                    console.log('✅ Модуль ИИ-менеджера найден, рендерим...');
                    this.aiManagerModule.renderAIManagerScreen();
                } else {
                    console.error('❌ Модуль ИИ-менеджера не инициализирован!');
                    // Попытаемся инициализировать
                    if (typeof initAIManagerUI !== 'undefined') {
                        this.aiManagerModule = initAIManagerUI(this);
                        if (this.aiManagerModule) {
                            this.aiManagerModule.renderAIManagerScreen();
                        }
                    }
                }
                break;
        }
    }

    // Рендеринг экрана карты (fallback)
    renderMapScreen() {
        console.log('⚠️ Используется fallback renderMapScreen - модуль карты не загружен');
        const appContainer = document.getElementById('app-container');
        
        // Проверяем, есть ли созданные карты
        const hasMaps = this.maps && this.maps.length > 0;
        
        appContainer.innerHTML = `
            <div class="screen-content">
                <div class="map-screen">
                    <div class="map-header">
                        <h2 class="map-title">🗺️ Карта</h2>
                        <p class="map-subtitle">Ваши цели и прогресс</p>
                    </div>
                    
                    ${hasMaps ? `
                        <div class="maps-list">
                            <h3 class="maps-list-title">Ваши карты</h3>
                            ${this.maps.map(map => `
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
                                        <div class="map-card-date">Создано: ${new Date(map.createdAt).toLocaleDateString('ru-RU')}</div>
                                        <div class="map-card-type">${map.isCaravanGoal ? 'Цель каравана' : 'Личная цель'}</div>
                                    </div>
                                    <div class="map-card-actions">
                                        <button class="btn-map-action" data-map-id="${map.id}">
                                            Открыть
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="motivational-quote">
                            <div class="quote-text">Путешествие в тысячу миль начинается с одного шага.</div>
                            <div class="quote-author">— Лао-цзы</div>
                        </div>
                    `}
                    
                    <div class="call-to-action">
                        <div class="cta-question">${hasMaps ? 'Создать новую карту?' : 'Готов начать путь к своей мечте?'}</div>
                        <button class="create-map-button" id="create-map-btn">
                            <span class="plus-icon">+</span>
                            Создать новую карту
                        </button>
                        <div class="cta-description">Определи свою цель, разбей её на шаги и начни двигаться вперед</div>
                    </div>
                    
                    <div class="fallback-warning">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">
                            Модуль карты не загружен. Некоторые функции могут быть недоступны. 
                            Проверьте подключение файла map.js
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем обработчики для кнопок
        const createButton = document.getElementById('create-map-btn');
        if (createButton) {
            createButton.addEventListener('click', () => {
                this.addNewMap();
            });
        }
        
        // Добавляем обработчики для карт
        if (hasMaps) {
            const mapActionBtns = document.querySelectorAll('.btn-map-action');
            mapActionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mapId = e.target.dataset.mapId;
                    this.switchToMap(mapId);
                });
            });
        }
    }
    
    // Рендеринг карты с лентой шагов
    

    // Показать модальное окно создания карты
    showCreateMapModal() {
        console.log('🎯 showCreateMapModal вызван в script.js');
        
        // Определяем заголовок и подзаголовок в зависимости от контекста
        let title = 'Создание новой карты';
        let subtitle = 'Опишите свою цель';
        
        if (this.caravanCreationData && this.caravanCreationData.isCaravanGoal) {
            title = `Создание цели для каравана "${this.caravanCreationData.caravanName}"`;
            subtitle = 'Опишите общую цель для вашего каравана';
        }
        
        const modalHTML = `
            <div class="modal-overlay active" id="create-map-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <p class="modal-subtitle">${subtitle}</p>
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
                        <button class="btn btn-primary" id="next-btn" disabled style="opacity: 0.5;">Далее</button>
                    </div>
                </div>
            </div>
        `;

        // Добавляем модальное окно в body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Настраиваем обработчики событий с небольшой задержкой
        setTimeout(() => {
            this.setupCreateMapModalEvents();
        }, 50);
        
        // Проверяем начальное состояние после загрузки
        setTimeout(() => {
            const goalInput = document.getElementById('goal-title');
            const nextBtn = document.getElementById('next-btn');
            
            console.log('🔍 Проверка состояния после загрузки модального окна:');
            console.log('🔍 Поле ввода:', goalInput);
            console.log('🔍 Кнопка "Далее":', nextBtn);
            console.log('🔍 Значение поля:', goalInput?.value);
            console.log('🔍 Состояние кнопки:', {
                disabled: nextBtn?.disabled,
                opacity: nextBtn?.style.opacity,
                text: nextBtn?.textContent
            });
            
        }, 100);
    }

    // Настройка обработчиков событий для модального окна
    setupCreateMapModalEvents() {
        console.log('🔧 Настройка обработчиков событий для модального окна создания карты');
        
        // Ищем элементы внутри активного модального окна создания карты
        const createMapModal = document.getElementById('create-map-modal');
        const goalInput = createMapModal ? createMapModal.querySelector('#goal-title') : document.getElementById('goal-title');
        const nextBtn = createMapModal ? createMapModal.querySelector('#next-btn') : document.getElementById('next-btn');
        const cancelBtn = createMapModal ? createMapModal.querySelector('#cancel-btn') : document.getElementById('cancel-btn');
        
        console.log('🔍 Найденные элементы:', {
            modal: !!createMapModal,
            goalInput: !!goalInput,
            nextBtn: !!nextBtn,
            cancelBtn: !!cancelBtn,
            goalInputValue: goalInput?.value
        });

        console.log('Элементы найдены:', {
            goalInput: !!goalInput,
            nextBtn: !!nextBtn,
            cancelBtn: !!cancelBtn
        });

        // Обработчики кнопок
        if (nextBtn) {
            console.log('🔧 Устанавливаем обработчик клика для кнопки "Далее"');
            nextBtn.addEventListener('click', (e) => {
                console.log('🎯 Кнопка "Далее" нажата!');
                console.log('🎯 Event:', e);
                console.log('🎯 Target:', e.target);
                console.log('🎯 Кнопка disabled?', nextBtn.disabled);
                
                // Дополнительная проверка на случай если кнопка была активирована обходным путем
                // Ищем поле в активном модальном окне
                const createMapModal = document.getElementById('create-map-modal');
                let currentGoalInput = goalInput;
                if (createMapModal && createMapModal.classList.contains('active')) {
                    currentGoalInput = createMapModal.querySelector('#goal-title') || goalInput;
                }
                
                const currentValue = currentGoalInput ? currentGoalInput.value.trim() : '';
                console.log('🔍 Проверка при клике - значение поля:', currentValue);
                console.log('🔍 Элемент поля:', currentGoalInput);
                console.log('🔍 Кнопка disabled?', nextBtn.disabled);
                
                if (!currentValue || nextBtn.disabled) {
                    console.log('❌ Кнопка заблокирована или поле пустое, предотвращаем действие');
                    if (currentGoalInput) {
                        currentGoalInput.focus();
                        currentGoalInput.style.borderColor = '#ef4444';
                        setTimeout(() => {
                            currentGoalInput.style.borderColor = '';
                        }, 2000);
                    }
                    if (this.caravanModule && this.caravanModule.showNotification) {
                        this.caravanModule.showNotification('Пожалуйста, введите название цели', 'error');
                    } else {
                        alert('Пожалуйста, введите название цели');
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                this.nextStep();
            });
        } else {
            console.error('❌ Кнопка "Далее" не найдена!');
        }

        cancelBtn.addEventListener('click', () => {
            // Если это создание цели для каравана, возвращаемся к каравану
            if (this.caravanCreationData && this.caravanCreationData.isCaravanGoal) {
                this.currentScreen = 'caravan';
                this.renderCurrentScreen();
            }
            
            // Закрываем модальное окно и очищаем данные каравана
            this.closeCreateMapModal(true);
        });

        // Валидация ввода
        if (goalInput && nextBtn) {
            console.log('🔧 Устанавливаем обработчик валидации для поля ввода');
            console.log('🔧 Элементы для валидации:', {
                goalInput: goalInput,
                nextBtn: nextBtn,
                goalInputId: goalInput.id,
                nextBtnId: nextBtn.id
            });
            
            // Основной обработчик input
            if (goalInput) {
                goalInput.addEventListener('input', (e) => {
                    const value = e.target.value.trim();
                    console.log('📝 Ввод в поле цели:', value, 'длина:', value.length);
                    console.log('📝 Элемент поля:', e.target);
                    console.log('📝 ID поля:', e.target.id);
                    console.log('📝 Текущее состояние кнопки до изменения:', {
                        disabled: nextBtn.disabled,
                        opacity: nextBtn.style.opacity
                    });
                    
                    // Убрано минимальное ограничение символов - проверяем только что поле не пустое
                    const isEmpty = value.length === 0;
                    if (nextBtn) {
                        nextBtn.disabled = isEmpty;
                        
                        if (!isEmpty) {
                            nextBtn.style.opacity = '1';
                            // Убираем красную рамку если поле заполнено
                            if (e.target.style.borderColor === 'rgb(239, 68, 68)') {
                                e.target.style.borderColor = '';
                            }
                            console.log('✅ Кнопка "Далее" активирована');
                        } else {
                            nextBtn.style.opacity = '0.5';
                            console.log('❌ Кнопка "Далее" деактивирована');
                        }
                        
                        console.log('📝 Новое состояние кнопки:', {
                            disabled: nextBtn.disabled,
                            opacity: nextBtn.style.opacity
                        });
                    }
                });
            } else {
                console.error('❌ Поле goal-title не найдено для установки обработчика input');
            }
            
            // Дополнительный обработчик через делегирование событий
            document.addEventListener('input', (e) => {
                if (e.target && e.target.id === 'goal-title') {
                    console.log('🔄 Обработчик делегирования сработал для поля цели');
                    const value = e.target.value.trim();
                    const nextBtnDel = document.getElementById('next-btn');
                    if (nextBtnDel) {
                        // Убрано минимальное ограничение символов - проверяем только что поле не пустое
                        const isEmpty = value.length === 0;
                        nextBtnDel.disabled = isEmpty;
                        nextBtnDel.style.opacity = isEmpty ? '0.5' : '1';
                        // Убираем красную рамку если поле заполнено
                        if (!isEmpty && e.target.style.borderColor === 'rgb(239, 68, 68)') {
                            e.target.style.borderColor = '';
                        }
                        console.log('🔄 Делегирование: кнопка обновлена', {
                            disabled: nextBtnDel.disabled,
                            opacity: nextBtnDel.style.opacity,
                            isEmpty: isEmpty
                        });
                    }
                }
            });
            
            // Проверяем начальное состояние кнопки и устанавливаем его правильно
            const initialValue = goalInput.value.trim();
            nextBtn.disabled = initialValue.length === 0;
            nextBtn.style.opacity = initialValue.length > 0 ? '1' : '0.5';
            
            console.log('🔍 Начальное состояние кнопки "Далее":', {
                disabled: nextBtn.disabled,
                opacity: nextBtn.style.opacity,
                text: nextBtn.textContent,
                initialValue: initialValue,
                initialValueLength: initialValue.length
            });
        } else {
            console.error('❌ Не удалось установить валидацию:', {
                goalInput: !!goalInput,
                nextBtn: !!nextBtn
            });
        }

        // Обработка Enter
        if (goalInput) {
            console.log('🔧 Устанавливаем обработчик Enter для поля ввода');
            goalInput.addEventListener('keypress', (e) => {
                console.log('⌨️ Клавиша нажата:', e.key);
                if (e.key === 'Enter' && !nextBtn.disabled) {
                    console.log('⌨️ Enter нажат, кнопка активна, вызываем nextStep');
                    e.preventDefault();
                    this.nextStep();
                } else {
                    console.log('⌨️ Enter нажат, но кнопка неактивна или другая клавиша');
                }
            });
        }

        // Закрытие по клику на overlay
        const modal = document.getElementById('create-map-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCreateMapModal(true);
            }
        });
    }

    // Закрыть модальное окно создания карты
    closeCreateMapModal(clearCaravanData = false) {
        const modal = document.getElementById('create-map-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        // Очищаем данные каравана только если явно указано
        if (clearCaravanData) {
            console.log('🧹 Очищаем данные каравана при закрытии модального окна');
            this.caravanCreationData = null;
        }
    }

    // Переход к следующему шагу
    nextStep() {
        // Ищем поле в активном модальном окне создания карты
        const createMapModal = document.getElementById('create-map-modal');
        let goalTitleInput = null;
        let goalDescriptionInput = null;
        
        if (createMapModal && createMapModal.classList.contains('active')) {
            // Ищем поля внутри активного модального окна
            goalTitleInput = createMapModal.querySelector('#goal-title');
            goalDescriptionInput = createMapModal.querySelector('#goal-description');
        } else {
            // Fallback: ищем глобально, но предпочитаем поле из активного модального окна
            goalTitleInput = document.querySelector('#create-map-modal.active #goal-title') || 
                           document.getElementById('goal-title');
            goalDescriptionInput = document.querySelector('#create-map-modal.active #goal-description') || 
                                  document.getElementById('goal-description');
        }
        
        const goalTitle = goalTitleInput ? goalTitleInput.value.trim() : '';
        const goalDescription = goalDescriptionInput ? goalDescriptionInput.value.trim() : '';

        console.log('🎯 nextStep вызван');
        console.log('🎯 Найденное поле goal-title:', goalTitleInput);
        console.log('🎯 Значение из поля:', goalTitleInput?.value);
        console.log('🎯 После trim:', goalTitle);
        console.log('Название цели:', goalTitle);
        console.log('Описание цели:', goalDescription);
        console.log('Данные каравана:', this.caravanCreationData);

        // Убрано минимальное ограничение символов - проверяем только что поле не пустое
        if (!goalTitle) {
            console.log('❌ Название цели не может быть пустым');
            // Показываем пользователю понятное сообщение
            // Ищем поле в активном модальном окне
            const createMapModal = document.getElementById('create-map-modal');
            let goalInputForError = null;
            if (createMapModal && createMapModal.classList.contains('active')) {
                goalInputForError = createMapModal.querySelector('#goal-title');
            } else {
                goalInputForError = document.querySelector('#create-map-modal.active #goal-title') || 
                                  document.getElementById('goal-title');
            }
            
            if (goalInputForError) {
                goalInputForError.focus();
                goalInputForError.style.borderColor = '#ef4444';
                setTimeout(() => {
                    goalInputForError.style.borderColor = '';
                }, 2000);
            }
            // Показываем уведомление если есть метод
            if (this.caravanModule && this.caravanModule.showNotification) {
                this.caravanModule.showNotification('Пожалуйста, введите название цели', 'error');
            } else {
                alert('Пожалуйста, введите название цели');
            }
            return;
        }
    
        // Сохраняем данные цели
        this.newGoalData = {
            title: goalTitle,
            description: goalDescription
        };

        console.log('✅ Данные цели сохранены:', this.newGoalData);
        
        // Закрываем только модальное окно, но НЕ очищаем данные каравана
        const modal = document.getElementById('create-map-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        // Переходим к следующему шагу (выбор периода)
        console.log('🔄 Переходим к выбору периода...');
        this.showPeriodSelectionModal();
    }

    // Показать модальное окно выбора периода
    showPeriodSelectionModal() {
        // Определяем заголовок в зависимости от контекста
        let title = 'Срок достижения цели';
        let subtitle = 'Как вы хотите установить срок?';
        
        if (this.caravanCreationData && this.caravanCreationData.isCaravanGoal) {
            title = `Срок достижения цели для каравана "${this.caravanCreationData.caravanName}"`;
            subtitle = 'Установите общий срок для всех участников каравана';
        }
        
        const modalHTML = `
            <div class="modal-overlay active" id="period-selection-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <p class="modal-subtitle">${subtitle}</p>
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
        console.log('🔄 nextToPeriodBreakdown вызван');
        console.log('Данные цели:', this.newGoalData);
        console.log('Данные каравана:', this.caravanCreationData);
        
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
                        <div style="margin-bottom: 15px;">
                            <button class="btn btn-secondary" id="breakdown-ai-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <span>🤖</span>
                                <span>Заполнить периоды с помощью ИИ</span>
                            </button>
                        </div>
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
        
        // Добавляем обработчик для кнопки ИИ
        const aiBtn = document.getElementById('breakdown-ai-btn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => {
                this.useAIForPeriodBreakdown(breakdown);
            });
        }
        
        // Сохраняем breakdown в объекте для использования
        this.currentBreakdown = breakdown;
    }
    
    // Использование ИИ для заполнения периодов
    async useAIForPeriodBreakdown(breakdown) {
        const aiBtn = document.getElementById('breakdown-ai-btn');
        if (!aiBtn) return;
        
        // Проверяем наличие AIManager
        if (typeof getAIManager === 'undefined') {
            alert('ИИ-менеджер недоступен. Убедитесь, что все модули загружены. Перезагрузите страницу.');
            console.error('getAIManager не найден. Проверьте, что ai_manager_frontend.js загружен.');
            return;
        }
        
        // Получаем baseURL из константы или используем дефолтный
        const baseURL = typeof BACKEND_BASE_URL !== 'undefined' ? BACKEND_BASE_URL : "https://road-to-your-dream-app-imtd.onrender.com";
        const manager = getAIManager(baseURL);
        if (!manager) {
            alert('ИИ-менеджер не инициализирован. Попробуйте перезагрузить страницу.');
            console.error('Не удалось получить AIManager. baseURL:', baseURL);
            return;
        }
        
        console.log('✅ AIManager получен, baseURL:', manager.baseURL);
        
        // Сохраняем исходное состояние кнопки
        const originalText = aiBtn.innerHTML;
        aiBtn.disabled = true;
        aiBtn.innerHTML = '<span>⏳</span><span>ИИ анализирует цель...</span>';
        
        try {
            // Получаем данные цели
            const goalTitle = this.newGoalData.title || 'Цель';
            const goalDescription = this.newGoalData.description || '';
            const totalDays = this.newGoalData.periodDays;
            
            // Преобразуем breakdown в плоский список периодов для ИИ
            const periodStructure = this.flattenBreakdown(breakdown);
            
            // Вызываем ИИ
            const result = await manager.breakGoalIntoPeriods(
                goalTitle,
                goalDescription,
                totalDays,
                periodStructure
            );
            
            if (result && result.success) {
                // Если цель несерьезная, показываем предупреждение
                if (!result.is_serious && result.feedback) {
                    const useAnyway = confirm(
                        `ИИ считает, что цель может быть недостаточно серьезной:\n\n${result.feedback}\n\n` +
                        `Все равно заполнить периоды автоматически?`
                    );
                    if (!useAnyway) {
                        aiBtn.disabled = false;
                        aiBtn.innerHTML = originalText;
                        return;
                    }
                }
                
                // Заполняем периоды из ответа ИИ
                if (result.periods && result.periods.length > 0) {
                    console.log('📋 Периоды от ИИ:', result.periods);
                    this.applyAIPeriods(breakdown, result.periods);
                    console.log('✅ Периоды обновлены:', breakdown);
                    
                    // Обновляем отображение
                    const container = document.getElementById('breakdown-container');
                    if (container) {
                        container.innerHTML = this.renderBreakdownHTML(breakdown);
                        this.setupBreakdownItemHandlers();
                        this.currentBreakdown = breakdown;
                    }
                    
                    // Показываем совет ИИ если есть
                    if (result.advice) {
                        alert(`ИИ заполнил периоды!\n\nСовет: ${result.advice}`);
                    } else {
                        alert('ИИ успешно заполнил периоды задачами!');
                    }
                } else {
                    alert('ИИ не вернул периоды. Попробуйте еще раз.');
                }
            } else {
                alert('Не удалось получить ответ от ИИ. Попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Ошибка при использовании ИИ:', error);
            alert(`Ошибка при использовании ИИ: ${error.message || 'Неизвестная ошибка'}`);
        } finally {
            aiBtn.disabled = false;
            aiBtn.innerHTML = originalText;
        }
    }
    
    // Преобразование иерархической структуры breakdown в плоский список
    flattenBreakdown(breakdown, result = []) {
        for (const item of breakdown) {
            result.push({
                id: item.id,
                type: item.type,
                title: item.title,
                days: item.days,
                task: item.task || '',
                description: ''
            });
            if (item.children && item.children.length > 0) {
                this.flattenBreakdown(item.children, result);
            }
        }
        return result;
    }
    
    // Применение результатов ИИ к breakdown структуре
    applyAIPeriods(breakdown, aiPeriods) {
        // Создаем map для быстрого поиска
        const periodsMap = new Map();
        aiPeriods.forEach(p => {
            periodsMap.set(p.id, p);
        });
        
        // Рекурсивно обновляем breakdown
        const updateItem = (item) => {
            const aiPeriod = periodsMap.get(item.id);
            if (aiPeriod) {
                // Обновляем title, если ИИ предложил улучшенное название
                if (aiPeriod.title && aiPeriod.title.trim()) {
                    const oldTitle = item.title;
                    item.title = aiPeriod.title.trim();
                    if (oldTitle !== item.title) {
                        console.log(`📝 Обновлен title для ${item.id}: "${oldTitle}" → "${item.title}"`);
                    }
                }
                // Обновляем task
                if (aiPeriod.task && aiPeriod.task.trim()) {
                    item.task = aiPeriod.task.trim();
                    console.log(`✅ Обновлен task для ${item.id}: "${item.task}"`);
                }
                // Используем description как task, если task не задан
                if (aiPeriod.description && aiPeriod.description.trim() && !item.task) {
                    item.task = aiPeriod.description.trim();
                    console.log(`📝 Использован description как task для ${item.id}: "${item.task}"`);
                }
                // Обновляем days, если ИИ предложил изменить количество дней
                if (aiPeriod.days && aiPeriod.days > 0 && aiPeriod.days !== item.days) {
                    const oldDays = item.days;
                    item.days = aiPeriod.days;
                    console.log(`📅 Обновлены days для ${item.id}: ${oldDays} → ${aiPeriod.days}`);
                }
            }
            if (item.children && item.children.length > 0) {
                item.children.forEach(updateItem);
            }
        };
        
        breakdown.forEach(updateItem);
        
        // Обновляем currentBreakdown, чтобы изменения сохранились
        this.currentBreakdown = breakdown;
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
            // Сохраняем breakdown перед созданием карты
            if (this.currentBreakdown) {
                this.newGoalData.breakdown = JSON.parse(JSON.stringify(this.currentBreakdown));
                console.log('✅ Breakdown сохранен перед созданием карты:', this.newGoalData.breakdown);
            }
            
            if (this.mapModule && this.mapModule.createMap) {
                this.mapModule.createMap();
            } else {
                console.error('Модуль карты не найден или функция createMap недоступна');
            }
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
        // Сохраняем breakdown в newGoalData перед закрытием
        if (this.currentBreakdown) {
            this.newGoalData.breakdown = JSON.parse(JSON.stringify(this.currentBreakdown));
            console.log('✅ Breakdown сохранен в newGoalData:', this.newGoalData.breakdown);
        }
        
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
        console.log('🎯 ФУНКЦИЯ createMap ВЫЗВАНА!');
        console.log('Создание карты с данными:', this.newGoalData);
        console.log('Данные каравана:', this.caravanCreationData);
        
        // Создаем новую карту
        const newMap = {
            id: Date.now().toString(), // Уникальный ID
            goal: this.newGoalData.title,
            description: this.newGoalData.description,
            periodType: this.newGoalData.periodType,
            periodDays: this.newGoalData.periodDays,
            customPeriod: this.newGoalData.customPeriod,
            deadline: this.newGoalData.deadline,
            currentStep: 0,
            totalSteps: this.newGoalData.periodDays,
            steps: this.generateMapSteps(),
            createdAt: new Date().toISOString(),
            // Добавляем информацию о караване, если это цель каравана
            isCaravanGoal: this.caravanCreationData && this.caravanCreationData.isCaravanGoal,
            caravanName: this.caravanCreationData ? this.caravanCreationData.caravanName : null
        };
        
        // Добавляем карту в массив
        this.maps.push(newMap);
        
        // Делаем новую карту текущей
        this.currentMapId = newMap.id;
        this.currentMap = newMap;
        
        console.log('Карта создана. Всего карт:', this.maps.length);
        console.log('Текущая карта ID:', this.currentMapId);
        
        // Сохраняем карты в localStorage
        this.saveMapsToStorage();
        
        // Закрываем модальное окно
        this.closePeriodBreakdownModal();
        
        // Если это цель каравана, создаем караван и остаемся на вкладке караван
        console.log('🔍 Проверяем данные каравана в createMap:');
        console.log('🔍 this.caravanCreationData:', this.caravanCreationData);
        console.log('🔍 typeof this.caravanCreationData:', typeof this.caravanCreationData);
        console.log('🔍 this.caravanCreationData?.isCaravanGoal:', this.caravanCreationData?.isCaravanGoal);
        
        if (this.caravanCreationData && this.caravanCreationData.isCaravanGoal) {
            console.log('✅ Это цель каравана, создаем караван');
            // Сохраняем данные каравана перед очисткой
            const caravanData = { ...this.caravanCreationData };
            console.log('✅ Сохраняем данные каравана:', caravanData);
            this.createCaravanWithGoal(newMap, caravanData);
        } else {
            console.log('✅ Это личная цель, переходим к карте');
            
            // Проверяем и инициализируем модуль карты если нужно
            if (!this.mapModule && typeof MapModule !== 'undefined') {
                console.log('🔄 Инициализируем модуль карты...');
                this.mapModule = new MapModule(this);
            }
            
            // Переключаемся на экран карты и рендерим его
            this.currentScreen = 'map';
            this.renderCurrentScreen();
        }
        
        // Очищаем данные каравана
        this.caravanCreationData = null;
    }

    // Создать караван с целью
    createCaravanWithGoal(mapData, caravanCreationData = null) {
        console.log('🚐 Создание каравана с целью:', mapData);
        console.log('🚐 Данные каравана из параметра:', caravanCreationData);
        console.log('🚐 Проверяем caravanModule:', this.caravanModule);
        console.log('🚐 Тип caravanModule:', typeof this.caravanModule);
        
        if (this.caravanModule) {
            // Создаем караван с привязанной картой
            const caravanData = {
                name: mapData.caravanName || caravanCreationData?.caravanName || 'Новый караван',
                type: 'goal',
                goal: mapData.goal,
                description: mapData.description,
                mapId: mapData.id, // Привязываем карту к каравану
                createdAt: new Date().toISOString()
            };
            
            console.log('🚐 Создаем объект каравана:', caravanData);
            
            // Добавляем караван через модуль каравана
            const newCaravan = this.caravanModule.addCaravan(caravanData);
            
            console.log('Караван создан:', newCaravan);
            
            // Возвращаемся к списку караванов и перерендериваем экран
            this.currentScreen = 'caravan';
            this.renderCurrentScreen();
            
            // Обновляем активную вкладку в навигации
            const caravanNavButton = document.querySelector('[data-screen="caravan"]');
            if (caravanNavButton) {
                updateActiveNavButton(caravanNavButton);
            }
            
            // Перерендериваем экран каравана, чтобы показать новый караван в списке
            if (this.caravanModule) {
                this.caravanModule.renderCaravanScreen();
            }
            
            // Показываем уведомление об успехе
            if (this.caravanModule.showNotification) {
                this.caravanModule.showNotification(
                    `Караван "${newCaravan.name}" с целью "${mapData.goal}" успешно создан! Цель добавлена в раздел "Карта".`, 
                    'success'
                );
            }
            
            console.log('✅ Караван с целью создан. Возвращаемся к списку караванов.');
        } else {
            console.error('❌ Модуль каравана не найден!');
            console.error('❌ this.caravanModule:', this.caravanModule);
            console.error('❌ Доступные модули:', {
                mapModule: this.mapModule,
                garageModule: this.garageModule,
                caravanModule: this.caravanModule
            });
        }
    }
    
    // Добавить новую карту
    addNewMap() {
        console.log('Добавление новой карты');
        this.newGoalData = null;
        this.showCreateMapModal();
    }
    
    // Переключить на другую карту
    switchToMap(mapId) {
        const map = this.maps.find(m => m.id === mapId);
        if (map) {
            this.currentMapId = mapId;
            this.currentMap = map;
            this.saveMapsToStorage(); // Сохраняем текущую карту
            this.renderMapScreen();
            console.log('Переключились на карту:', map.goal);
        }
    }
    
    // Получить текущую карту
    getCurrentMap() {
        return this.maps.find(m => m.id === this.currentMapId);
    }
    
    // Сохранить карты в localStorage
    saveMapsToStorage() {
        try {
            localStorage.setItem('roadToDreamMaps', JSON.stringify(this.maps));
            localStorage.setItem('roadToDreamCurrentMapId', this.currentMapId || '');
            console.log('Карты сохранены в localStorage');
        } catch (error) {
            console.error('Ошибка сохранения карт:', error);
        }
    }
    
    // Загрузить карты из localStorage
    loadMapsFromStorage() {
        try {
            const savedMaps = localStorage.getItem('roadToDreamMaps');
            const savedCurrentMapId = localStorage.getItem('roadToDreamCurrentMapId');
            
            if (savedMaps) {
                this.maps = JSON.parse(savedMaps);
                console.log('Загружено карт из localStorage:', this.maps.length);
            }
            
            if (savedCurrentMapId && this.maps.length > 0) {
                this.currentMapId = savedCurrentMapId;
                this.currentMap = this.maps.find(m => m.id === this.currentMapId);
                if (this.currentMap) {
                    console.log('Восстановлена текущая карта:', this.currentMap.goal);
                } else {
                    // Если сохраненная карта не найдена, берем первую
                    this.currentMapId = this.maps[0].id;
                    this.currentMap = this.maps[0];
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки карт:', error);
            this.maps = [];
            this.currentMapId = null;
            this.currentMap = null;
        }
    }
    
    // Показать модальное окно выбора карт
    showMapSelectionModal() {
        console.log('Показать модальное окно выбора карт. Количество карт:', this.maps.length);
        
        // Используем модуль карты для показа модального окна
        if (this.mapModule && this.mapModule.showMapSelectionModal) {
            console.log('Используем модуль карты для показа модального окна');
            this.mapModule.showMapSelectionModal();
            return;
        }
        
        if (this.maps.length <= 1) {
            console.log('Карт мало, сразу создаем новую карту');
            this.addNewMap();
            return;
        }
        
        console.log('Показываем модальное окно выбора карт');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content map-selection-modal">
                <div class="modal-header">
                    <h3>Выберите карту</h3>
                    <button class="modal-close" id="close-map-selection">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="maps-list">
                        ${this.maps.map(map => `
                            <div class="map-item ${map.id === this.currentMapId ? 'current' : ''}" data-map-id="${map.id}">
                                <div class="map-item-header">
                                    <h4 class="map-item-title">${map.goal}</h4>
                                    <div class="map-item-progress">
                                        ${map.currentStep}/${map.totalSteps} дней
                                    </div>
                                </div>
                                <div class="map-item-description">${map.description}</div>
                                <div class="map-item-actions">
                                    <button class="select-map-btn" data-map-id="${map.id}">
                                        ${map.id === this.currentMapId ? 'Текущая' : 'Выбрать'}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="map-selection-actions">
                        <button class="add-new-map-btn" id="add-new-map-from-selection">
                            + Создать новую карту
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('Модальное окно добавлено в DOM');
        
        // Добавляем класс active для отображения модального окна
        setTimeout(() => {
            modal.classList.add('active');
            console.log('Класс active добавлен к модальному окну');
        }, 10);
        
        // Добавляем обработчики
        const closeBtn = document.getElementById('close-map-selection');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Закрытие модального окна');
                modal.remove();
            });
        } else {
            console.error('Кнопка закрытия не найдена!');
        }
        
        const selectButtons = modal.querySelectorAll('.select-map-btn');
        console.log('Найдено кнопок выбора:', selectButtons.length);
        selectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mapId = e.target.getAttribute('data-map-id');
                console.log('Выбрана карта с ID:', mapId);
                if (this.mapModule && this.mapModule.switchToMap) {
                    this.mapModule.switchToMap(mapId);
                } else {
                    this.switchToMap(mapId);
                }
                modal.remove();
            });
        });
        
        const addNewBtn = document.getElementById('add-new-map-from-selection');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => {
                console.log('Создание новой карты из модального окна');
                modal.remove();
                if (this.mapModule && this.mapModule.addNewMap) {
                    this.mapModule.addNewMap();
                } else {
                    this.addNewMap();
                }
            });
        } else {
            console.error('Кнопка создания новой карты не найдена!');
        }
        
        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Закрытие модального окна по клику на фон');
                modal.remove();
            }
        });
    }
    

    // Генерация шагов для карты
    generateMapSteps() {
        const steps = [];
        
        // Если есть breakdown, используем его для создания шагов
        if (this.newGoalData.breakdown && this.newGoalData.breakdown.length > 0) {
            // Преобразуем breakdown в плоский список шагов
            const flattenBreakdownToSteps = (breakdown, dayCounter = { value: 1 }) => {
                const result = [];
                for (const item of breakdown) {
                    // Если у элемента есть дети, обрабатываем их
                    if (item.children && item.children.length > 0) {
                        result.push(...flattenBreakdownToSteps(item.children, dayCounter));
                    } else {
                        // Это конечный элемент (день) - создаем шаг
                        const stepTitle = item.title || `День ${dayCounter.value}`;
                        const stepTask = item.task || '';
                        
                        result.push({
                            id: item.id || `step-${dayCounter.value - 1}`,
                            day: dayCounter.value,
                            title: stepTitle,
                            task: stepTask,
                            completed: false
                        });
                        dayCounter.value++;
                    }
                }
                return result;
            };
            
            const flattenedSteps = flattenBreakdownToSteps(this.newGoalData.breakdown);
            
            // Если получили шаги из breakdown, используем их
            if (flattenedSteps.length > 0) {
                return flattenedSteps;
            }
        }
        
        // Fallback: создаем шаги по дням, если breakdown нет или он пустой
        const totalDays = this.newGoalData.periodDays;
        for (let i = 0; i < totalDays; i++) {
            steps.push({
                id: `step-${i}`,
                day: i + 1,
                title: `День ${i + 1}`,
                task: '',
                completed: false
            });
        }
        
        return steps;
    }

    // Рендеринг ленты шагов (показываем только активный и следующие шаги)
    renderStepsStrip() {
        const visibleSteps = 4; // Количество видимых шагов
        const currentStepIndex = this.currentMap.currentStep;
        const steps = this.currentMap.steps;
        
        // Показываем только активный шаг и следующие (не показываем выполненные)
        let startIndex = currentStepIndex; // Начинаем с текущего шага
        let endIndex = Math.min(steps.length, startIndex + visibleSteps);
        
        let html = '';
        // Рендерим шаги в обратном порядке (сверху вниз: будущие -> текущий)
        for (let i = endIndex - 1; i >= startIndex; i--) {
            const step = steps[i];
            const isCurrent = i === currentStepIndex;
            const isCompleted = step.completed;
            
            // Пропускаем выполненные шаги
            if (isCompleted && !isCurrent) {
                continue;
            }
            
            html += `
                <div class="step-container">
                    <div class="step-square ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}" 
                         data-step="${i}">
                        <span class="step-number">${step.day}</span>
                        ${isCompleted ? '<div class="checkmark">✓</div>' : ''}
                    </div>
                    ${isCurrent && !isCompleted ? `
                        <button class="confirm-step-btn-inline" data-step-index="${i}">
                            Подтвердить шаг
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        return html;
    }
    
    // Показать модальное окно подтверждения шага
    showStepConfirmationModal() {
        const currentStepIndex = this.currentMap.currentStep;
        const currentStep = this.currentMap.steps[currentStepIndex];
        
        const modalHTML = `
            <div class="modal-overlay active" id="step-confirmation-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">Подтверждение выполнения</h2>
                        <p class="modal-subtitle">Вы действительно выполнили задачи дня ${currentStepIndex + 1}?</p>
                    </div>
                    <div class="modal-body">
                        <div class="step-confirmation-info">
                            <div class="step-confirmation-number">День ${currentStepIndex + 1}</div>
                            <div class="step-confirmation-task">${currentStep?.task || 'Запланированные действия для этого дня'}</div>
                        </div>
                        <div class="confirmation-warning">
                            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                            <div class="warning-text">Это действие нельзя отменить. Убедитесь, что вы действительно выполнили все запланированные задачи.</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="confirmation-cancel-btn">Отмена</button>
                        <button class="btn btn-primary" id="confirmation-confirm-btn">
                            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20,6 9,17 4,12"></polyline>
                            </svg>
                            Подтвердить
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Настройка обработчиков событий
        this.setupStepConfirmationEvents();
    }
    
    // Настройка обработчиков событий для подтверждения шага
    setupStepConfirmationEvents() {
        const cancelBtn = document.getElementById('confirmation-cancel-btn');
        const confirmBtn = document.getElementById('confirmation-confirm-btn');
        const modal = document.getElementById('step-confirmation-modal');
        
        cancelBtn.addEventListener('click', () => {
            this.closeStepConfirmationModal();
        });
        
        confirmBtn.addEventListener('click', () => {
            this.completeCurrentStep();
            this.closeStepConfirmationModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeStepConfirmationModal();
            }
        });
    }
    
    // Закрыть модальное окно подтверждения шага
    closeStepConfirmationModal() {
        const modal = document.getElementById('step-confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Завершение текущего шага
    completeCurrentStep() {
        if (this.currentMap.currentStep >= this.currentMap.totalSteps) {
            console.log('Все шаги завершены!');
            return;
        }
        
        console.log('Завершаем шаг:', this.currentMap.currentStep);
        
        // Отмечаем текущий шаг как завершенный
        this.currentMap.steps[this.currentMap.currentStep].completed = true;
        this.currentMap.currentStep++;
            
        // Сохраняем прогресс
        this.saveMapProgress();
            
        // Обновляем интерфейс сразу без анимации
        this.renderMapScreen();
    }
    
    
    // Сохранение прогресса карты
    saveMapProgress() {
        try {
            localStorage.setItem('currentMap', JSON.stringify(this.currentMap));
            console.log('Прогресс карты сохранен');
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
        }
    }
    
    // Загрузка прогресса карты
    loadMapProgress() {
        try {
            const savedMap = localStorage.getItem('currentMap');
            if (savedMap) {
                this.currentMap = JSON.parse(savedMap);
                console.log('Прогресс карты загружен');
                return true;
            }
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
        }
        return false;
    }
    
    // Сброс карты и возврат к созданию новой
    resetMap() {
        // Очищаем данные карты
        this.currentMap = null;
        
        // Очищаем localStorage
        try {
            localStorage.removeItem('currentMap');
            console.log('Карта сброшена');
        } catch (error) {
            console.error('Ошибка очистки localStorage:', error);
        }
        
        // Возвращаемся к пустому экрану карты
        this.renderMapScreen();
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


    // Рендеринг экрана гаража (fallback)
    renderGarageScreen() {
        console.log('⚠️ Используется fallback renderGarageScreen - модуль гаража не загружен');
        const appContainer = document.getElementById('app-container');
        if (!appContainer) {
            console.error('❌ Контейнер app-container не найден в fallback!');
            return;
        }
        
        appContainer.innerHTML = `
            <div class="garage-screen">
                <div class="profile-header-premium">
                    <div class="profile-background"></div>
                    <div class="profile-content">
                        <div class="profile-avatar-container">
                            <img id="user-avatar-img" class="profile-avatar" src="" alt="Аватар пользователя">
                            <div class="level-badge">
                                <span id="user-level">1</span>
                            </div>
                        </div>
                        <div class="profile-info">
                            <h1 id="user-name" class="profile-name">Пользователь</h1>
                            <p class="profile-subtitle">Исследователь целей</p>
                            <div class="level-progress-container">
                                <div class="level-info">
                                    <span>Уровень <span id="current-level">1</span></span>
                                    <span><span id="current-exp">0</span>/<span id="next-level-exp">100</span> опыта</span>
                                </div>
                                <div class="level-progress-bar">
                                    <div id="level-progress" class="level-progress-fill" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="quick-stats">
                    <div class="quick-stat-card">
                        <div class="stat-icon-new">🎯</div>
                        <div class="stat-value-new" id="completed-goals">0</div>
                        <div class="stat-label-new">Целей завершено</div>
                    </div>
                    <div class="quick-stat-card">
                        <div class="stat-icon-new">🔥</div>
                        <div class="stat-value-new" id="current-streak">0</div>
                        <div class="stat-label-new">Дней подряд</div>
                    </div>
                    <div class="quick-stat-card">
                        <div class="stat-icon-new">👣</div>
                        <div class="stat-value-new" id="total-steps">0</div>
                        <div class="stat-label-new">Всего шагов</div>
                    </div>
                </div>
                <div class="section-card">
                    <div class="section-header">
                        <h3>Модуль гаража не загружен</h3>
                        <span class="badge-count">Fallback</span>
                    </div>
                    <p>Проверьте загрузку garage.js файла</p>
                </div>
            </div>
        `;
        
        // Устанавливаем простой аватар
        const avatarImg = document.getElementById('user-avatar-img');
        if (avatarImg) {
            const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#f4bd41;stop-opacity:1" />
<stop offset="100%" style="stop-color:#007bff;stop-opacity:1" />
</linearGradient>
</defs>
<circle cx="50" cy="50" r="50" fill="url(#avatarGradient)"/>
<text x="50" y="60" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#1a1a1a">U</text>
</svg>`;
            avatarImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        }
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
            // Проверяем наличие API интеграции
            if (!window.apiIntegration) {
                console.warn('⚠️ API интеграция не загружена. Убедитесь, что frontend_integration.js подключен.');
                return;
            }
            
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
            // Проверяем наличие API интеграции
            if (!window.apiIntegration) {
                console.warn('⚠️ API интеграция не загружена.');
                return;
            }
            
            const userData = await window.apiIntegration.getUserData(this.user.telegram_id);
            
            if (userData) {
                // Обновляем данные в приложении
                this.userData = userData;
                
                // Загружаем карты в модуль карты
                if (this.mapModule && userData.cards) {
                    // Проверяем наличие метода загрузки карт
                    if (typeof this.mapModule.loadCardsFromAPI === 'function') {
                        this.mapModule.loadCardsFromAPI(userData.cards);
                    } else {
                        console.log('📊 Карты получены:', userData.cards);
                    }
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
        
        if (!window.apiIntegration) {
            console.error('❌ API интеграция не загружена');
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
        
        if (!window.apiIntegration) {
            console.error('❌ API интеграция не загружена');
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
        
        if (!window.apiIntegration) {
            console.error('❌ API интеграция не загружена');
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
        if (!window.apiIntegration) {
            console.warn('⚠️ API интеграция не загружена');
            return;
        }
        
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
        if (this.goals) {
            // Если есть массив целей, добавляем новые
            this.goals = this.goals.concat(goals);
        } else {
            this.goals = goals;
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
    
        // Если это кнопка карты, проверяем активна ли она
        if (targetScreenId === 'map' && window.roadToDreamApp) {
            // Если карта уже активна (показывает плюсик), создаем новую карту
            if (navButton.classList.contains('active')) {
                console.log('Клик по активной карте (плюсик) - создаем новую карту');
                if (window.roadToDreamApp.mapModule && window.roadToDreamApp.mapModule.addNewMap) {
                    window.roadToDreamApp.mapModule.addNewMap();
                } else {
                    window.roadToDreamApp.addNewMap();
                }
                return;
            } else {
                console.log('Клик по неактивной карте - переключаемся на карту');
                // Обычное переключение на экран карты
            }
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
        
        // Обновляем иконки после установки активной кнопки
        updateMapIcon();
    }
    
    // Функция обновления иконки карты
    function updateMapIcon() {
        const mapButton = document.querySelector('[data-screen="map"]');
        if (!mapButton) return;
        
        const icon = mapButton.querySelector('.nav-icon');
        if (!icon) return;
        
        if (mapButton.classList.contains('active')) {
            // Если карта активна - показываем плюсик
            icon.innerHTML = `
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            `;
        } else {
            // Если карта не активна - показываем обычную иконку карты
            icon.innerHTML = `
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9,22 9,12 15,12 15,22"></polyline>
            `;
        }
    }

// Функции будут добавлены по мере необходимости

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем экран загрузки и онбординга
    if (typeof LoadingScreen !== 'undefined') {
        const loadingScreen = new LoadingScreen();
        loadingScreen.init(() => {
            // После завершения загрузки и онбординга запускаем приложение
            initializeApp();
        });
    } else {
        // Если LoadingScreen не загружен, запускаем приложение сразу
        console.warn('⚠️ LoadingScreen не загружен, запускаем приложение без экрана загрузки');
        initializeApp();
    }
});

// Функция инициализации основного приложения
function initializeApp() {
    // Настраиваем навигацию
    setupNavigation();
    
    // Проверяем загрузку модулей перед инициализацией
    if (typeof window.apiIntegration === 'undefined') {
        console.warn('⚠️ frontend_integration.js не загружен. Проверьте подключение в index.html');
    }
    
    if (typeof initAIManagerUI === 'undefined') {
        console.warn('⚠️ ai_manager_ui.js не загружен. Проверьте подключение в index.html');
    }
        
    // Инициализируем основное приложение
    window.roadToDreamApp = new RoadToDreamApp();
    
    // Проверка после инициализации
    setTimeout(() => {
        console.log('🔍 Проверка загруженных модулей:');
        console.log('  - window.apiIntegration:', typeof window.apiIntegration !== 'undefined' ? '✅' : '❌');
        console.log('  - window.aiManagerUI:', typeof window.aiManagerUI !== 'undefined' ? '✅' : '❌');
        console.log('  - initAIManagerUI:', typeof initAIManagerUI !== 'undefined' ? '✅' : '❌');
        console.log('  - getAIManager:', typeof getAIManager !== 'undefined' ? '✅' : '❌');
    }, 1000);
}
