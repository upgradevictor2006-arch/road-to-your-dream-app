// Модуль каравана для Telegram Mini App "Road to Your Dream"

console.log('caravan.js загружен');

class CaravanModule {
    constructor(mainApp) {
        console.log('CaravanModule constructor called');
        this.mainApp = mainApp;
        this.caravans = this.loadCaravans();
        this.caravanCreationData = null;
        this.currentEditingCaravan = null;
        this.currentManagingCaravan = null;
        this.currentSharingCaravan = null;
        this.currentShareUrl = null;
        this.caravanToDelete = null;
    }

    // Рендеринг экрана каравана
    renderCaravanScreen() {
        console.log('renderCaravanScreen вызвана');
        const appContainer = document.getElementById('app-container');
        console.log('app-container найден:', appContainer);
        appContainer.innerHTML = `
            <div class="caravan-screen">
                <!-- Заголовок экрана -->
                <div class="caravan-header">
                    <h2 class="caravan-title">🚐 Караван</h2>
                    <p class="caravan-subtitle">Создайте команду единомышленников для достижения общей цели</p>
                </div>
                
                <!-- Основной контент -->
                <div class="caravan-content">
                    <!-- Кнопка создания каравана -->
                    <div class="create-caravan-section">
                        <div class="caravan-cta">
                            <div class="cta-icon">🤝</div>
                            <h3 class="cta-title">Создать караван</h3>
                            <p class="cta-description">Объединитесь с друзьями для совместного достижения целей</p>
                            <button class="create-caravan-button" id="create-caravan-btn">
                                <span class="plus-icon">+</span>
                                Создать караван
                            </button>
                        </div>
                    </div>
                    
                    <!-- Список существующих караванов -->
                    <div class="existing-caravans">
                        <h4 class="caravans-title">Ваши караваны</h4>
                        <div class="caravans-list">
                            ${this.renderCaravansList()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Модальные окна каравана -->
            ${this.renderCaravanModals()}
        `;
        
        // Настраиваем обработчики событий только если они еще не настроены
        if (!this.eventListenersSetup) {
            setTimeout(() => {
                console.log('Устанавливаем обработчики событий каравана');
                this.setupCaravanEventListeners();
            }, 100);
        }
    }

    // Рендеринг модальных окон каравана
    renderCaravanModals() {
        return `
            <!-- Модальное окно создания каравана - Шаг 1: Название -->
            <div id="create-caravan-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Шаг 1: Название каравана</h3>
                    </div>
                    <div class="modal-body">
                        <form id="create-caravan-step1-form" class="caravan-form">
                            <div class="form-group">
                                <label for="caravan-name" class="form-label">Название каравана</label>
                                <input 
                                    type="text" 
                                    id="caravan-name" 
                                    class="form-input" 
                                    placeholder="Введите название каравана"
                                    maxlength="50"
                                    required
                                >
                                <div class="form-hint">Максимум 50 символов</div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" data-action="close-create-caravan">
                                    Отмена
                                </button>
                                <button type="submit" class="btn-primary">
                                    Продолжить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно создания каравана - Шаг 2: Цель -->
            <div id="create-caravan-step2-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Шаг 2: Тип каравана</h3>
                    </div>
                    <div class="modal-body">
                        <div class="caravan-type-selection">
                            <div class="type-option" data-type="goal">
                                <div class="type-icon">🎯</div>
                                <h4 class="type-title">Цель</h4>
                                <p class="type-description">Путь который разбивается на этапы и строится маршрут. Долгосрочная задача с промежуточными шагами.</p>
                                <button type="button" class="btn-type-select" data-type="goal">Создать цель</button>
                            </div>
                            
                            <div class="type-option" data-type="challenge">
                                <div class="type-icon">⚡</div>
                                <h4 class="type-title">Челлендж</h4>
                                <p class="type-description">Одно задание которое нужно выполнять каждый день в течение определенного периода. Краткосрочная задача.</p>
                                <button type="button" class="btn-type-select" data-type="challenge">Создать челлендж</button>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" data-action="go-to-step1">
                                Назад
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Модальное окно создания цели -->
            <div id="create-goal-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Создание новой цели</h3>
                        <p class="modal-subtitle">Опишите свою цель для каравана</p>
                    </div>
                    <div class="modal-body">
                        <form id="create-goal-form" class="caravan-form">
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
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="goal-cancel-btn">Отмена</button>
                        <button class="btn btn-primary" id="goal-next-btn" disabled>Создать цель</button>
                    </div>
                </div>
            </div>

            <!-- Модальное окно создания каравана - Шаг 3: Описание -->
            <div id="create-caravan-step3-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Шаг 3: Описание</h3>
                    </div>
                    <div class="modal-body">
                        <form id="create-caravan-step3-form" class="caravan-form">
                            <div class="form-group">
                                <label for="caravan-description" class="form-label">Описание каравана</label>
                                <textarea 
                                    id="caravan-description" 
                                    class="form-textarea" 
                                    placeholder="Расскажите подробнее о ваших планах..."
                                    maxlength="200"
                                    rows="4"
                                ></textarea>
                                <div class="form-hint">Максимум 200 символов</div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" data-action="go-to-step2">
                                    Назад
                                </button>
                                <button type="submit" class="btn-primary">
                                    Продолжить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        
            <!-- Модальное окно редактирования описания -->
            <div id="edit-description-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Редактировать описание</h3>
                    </div>
                    <div class="modal-body">
                        <form id="edit-description-form" class="caravan-form">
                            <div class="form-group">
                                <label for="edit-description-text" class="form-label">Описание каравана</label>
                                <textarea 
                                    id="edit-description-text" 
                                    class="form-textarea" 
                                    placeholder="Расскажите подробнее о ваших планах..."
                                    maxlength="200"
                                    rows="4"
                                ></textarea>
                                <div class="form-hint">Максимум 200 символов</div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" data-action="close-edit-description">
                                    Отмена
                                </button>
                                <button type="submit" class="btn-primary">
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно управления участниками -->
            <div id="manage-members-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Управление участниками</h3>
                    </div>
                    <div class="modal-body">
                        <div class="members-section">
                            <div class="members-list" id="members-list">
                                <!-- Список участников будет добавлен динамически -->
                            </div>
                            
                            <div class="add-member-section">
                                <h4>Добавить участника</h4>
                                <div class="form-group">
                                    <input 
                                        type="text" 
                                        id="member-username" 
                                        class="form-input" 
                                        placeholder="Имя пользователя или ID"
                                    >
                                    <button class="btn-primary" id="add-member-btn">
                                        Добавить
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" data-action="close-manage-members">
                                Закрыть
                            </button>
                            <button type="button" class="btn-primary" id="finish-caravan-btn" style="display: none;">
                                Создать караван
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно поделиться ссылкой -->
            <div id="share-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Поделиться караваном</h3>
                    </div>
                    <div class="modal-body">
                        <div class="share-section">
                            <div class="share-info">
                                <h4 id="share-caravan-name">Название каравана</h4>
                                <p class="share-description">Скопируйте ссылку и поделитесь ею с друзьями, чтобы они могли присоединиться к вашему каравану.</p>
                            </div>
                            
                            <div class="share-link-container">
                                <input 
                                    type="text" 
                                    id="share-link-input" 
                                    class="form-input share-link-input" 
                                    readonly
                                    placeholder="Ссылка будет сгенерирована..."
                                >
                                <button class="btn-copy" id="copy-share-link-btn">
                                    📋 Копировать
                                </button>
                            </div>
                            
                            <div class="share-actions">
                                <button class="btn-share-action" id="share-telegram-btn">
                                    📱 Поделиться в Telegram
                                </button>
                                <button class="btn-share-action" id="share-other-btn">
                                    🌐 Поделиться в другом приложении
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" data-action="close-share">
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно подтверждения удаления -->
            <div id="delete-confirmation-modal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">🗑️ Удалить караван</h3>
                    </div>
                    <div class="modal-body">
                        <div class="delete-warning">
                            <div class="warning-icon">⚠️</div>
                            <h4 id="delete-caravan-name">Название каравана</h4>
                            <p class="warning-text">Вы собираетесь удалить караван. Это действие нельзя отменить.</p>
                            <p class="confirmation-text">Для подтверждения введите фразу:</p>
                            <div class="confirmation-phrase">
                                <strong>"Удалить караван"</strong>
                            </div>
                        </div>
                        
                        <form id="delete-confirmation-form" class="caravan-form">
                            <div class="form-group">
                                <label for="delete-confirmation-input" class="form-label">Подтверждение:</label>
                                <input 
                                    type="text" 
                                    id="delete-confirmation-input" 
                                    class="form-input" 
                                    placeholder="Введите: Удалить караван"
                                    required
                                >
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" data-action="close-delete-confirmation">
                                    Отмена
                                </button>
                                <button type="submit" class="btn-danger">
                                    Удалить караван
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    // Настройка обработчиков событий каравана
    setupCaravanEventListeners() {
        console.log('Настройка обработчиков событий каравана...');
        
        // Проверяем, не настроены ли уже обработчики
        if (this.eventListenersSetup) {
            console.log('Обработчики событий уже настроены');
            return;
        }
        
        // Используем делегирование событий для надежности
        const appContainer = document.getElementById('app-container');
        if (!appContainer) {
            console.error('app-container не найден!');
            return;
        }

        // Обработчик для кнопки создания каравана
        appContainer.addEventListener('click', (e) => {
            if (e.target.id === 'create-caravan-btn' || e.target.closest('#create-caravan-btn')) {
                console.log('Кнопка создания каравана нажата!');
                e.preventDefault();
                this.showCreateCaravanModal();
            }
        });

        // Обработчик для кнопок караванов
        appContainer.addEventListener('click', (e) => {
            const caravanBtn = e.target.closest('.btn-caravan-action');
            if (caravanBtn) {
                const caravanId = caravanBtn.dataset.caravanId;
                console.log('Кнопка каравана нажата, ID:', caravanId);
                this.viewCaravan(caravanId);
            }
        });

        // Обработчик для меню караванов
        appContainer.addEventListener('click', (e) => {
            const menuTrigger = e.target.closest('.caravan-menu-trigger');
            if (menuTrigger) {
                e.preventDefault();
                e.stopPropagation();
                const caravanId = menuTrigger.dataset.caravanId;
                console.log('Меню каравана нажато, ID:', caravanId);
                this.toggleCaravanMenu(caravanId);
            }
        });

        // Обработчик для пунктов меню
        appContainer.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                e.preventDefault();
                e.stopPropagation();
                const caravanId = menuItem.dataset.caravanId;
                console.log('Пункт меню нажат, ID:', caravanId);
                // Действие будет определено по тексту кнопки
                const action = menuItem.textContent.trim();
                this.handleCaravanMenuAction(caravanId, action);
            }
        });

        // Обработчики форм создания каравана (используем делегирование)
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'create-caravan-step1-form') {
                e.preventDefault();
                this.handleStep1();
            } else if (e.target.id === 'create-caravan-step2-form') {
                e.preventDefault();
                this.handleStep2();
            } else if (e.target.id === 'create-caravan-step3-form') {
                e.preventDefault();
                this.handleStep3();
            } else if (e.target.id === 'delete-confirmation-form') {
                e.preventDefault();
                this.handleDeleteConfirmation();
            }
        });

        // Обработчики для кнопок модальных окон
        document.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (!action) return;
            
            switch (action) {
                case 'close-create-caravan':
                    this.closeCreateCaravanModal();
                    break;
                case 'close-edit-description':
                    this.closeEditDescriptionModal();
                    break;
                case 'close-manage-members':
                    this.closeManageMembersModal();
                    break;
                case 'close-share':
                    this.closeShareModal();
                    break;
                case 'close-delete-confirmation':
                    this.closeDeleteConfirmationModal();
                    break;
                case 'go-to-step1':
                    this.goToStep1();
                    break;
                case 'go-to-step2':
                    this.goToStep2();
                    break;
            }
        });

        // Обработчики для специальных кнопок
        document.addEventListener('click', (e) => {
            if (e.target.id === 'finish-caravan-btn') {
                this.finishCaravanCreation();
            } else if (e.target.id === 'add-member-btn') {
                this.addMember();
            } else if (e.target.id === 'copy-share-link-btn') {
                this.copyShareLink();
            } else if (e.target.id === 'share-telegram-btn') {
                this.shareToTelegram();
            } else if (e.target.id === 'share-other-btn') {
                this.shareToOther();
            } else if (e.target.classList.contains('btn-type-select')) {
                const type = e.target.dataset.type;
                console.log('Выбран тип каравана:', type);
                this.handleCaravanTypeSelection(type);
            }
        });

        // Обработчик клика вне меню для его закрытия
        document.addEventListener('click', (e) => {
            // Проверяем, что клик не по кнопке меню или самому меню
            if (!e.target.closest('.caravan-menu') && !e.target.closest('.caravan-menu-trigger')) {
                this.closeAllMenus();
            }
        });
        
        // Отмечаем, что обработчики настроены
        this.eventListenersSetup = true;
        console.log('Обработчики событий каравана настроены');
    }

    // Обработка действий меню каравана
    handleCaravanMenuAction(caravanId, action) {
        console.log('Обработка действия меню:', action, 'для каравана:', caravanId);
        
        // Закрываем меню
        this.closeAllMenus();
        
        // Определяем действие по тексту
        if (action.includes('Редактировать описание')) {
            this.editCaravanDescription(caravanId);
        } else if (action.includes('Управление участниками')) {
            this.manageMembers(caravanId);
        } else if (action.includes('Поделиться ссылкой')) {
            this.shareCaravan(caravanId);
        } else if (action.includes('Удалить караван')) {
            this.deleteCaravan(caravanId);
        }
    }

    // Обработка выбора типа каравана
    handleCaravanTypeSelection(type) {
        console.log('Обработка выбора типа:', type);
        
        // Сохраняем выбранный тип
        this.caravanCreationData.type = type;
        
        if (type === 'goal') {
            // Для цели переходим к созданию цели (как в Моих целях)
            this.showGoalCreationModal();
        } else if (type === 'challenge') {
            // Для челленджа переходим к настройке периода и задания
            this.showChallengeCreationModal();
        }
    }

    // Показать модальное окно создания каравана
    showCreateCaravanModal() {
        console.log('showCreateCaravanModal вызвана');
        this.initCaravanCreation();
        const modal = document.getElementById('create-caravan-modal');
        console.log('Найдено модальное окно:', modal);
        if (modal) {
            console.log('Добавляем класс active');
            modal.classList.add('active');
            // Фокусируемся на поле ввода
            setTimeout(() => {
                const input = document.getElementById('caravan-name');
                if (input) {
                    input.focus();
                }
            }, 100);
        } else {
            console.error('Модальное окно create-caravan-modal не найдено!');
        }
    }

    // Показать шаг 2
    showStep2() {
        const modal1 = document.getElementById('create-caravan-modal');
        const modal2 = document.getElementById('create-caravan-step2-modal');
        
        if (modal1) modal1.classList.remove('active');
        if (modal2) {
            modal2.classList.add('active');
            // Фокусируемся на поле ввода цели
            setTimeout(() => {
                const input = document.getElementById('caravan-goal');
                if (input) {
                    input.focus();
                }
            }, 100);
        }
    }

    // Показать шаг 3
    showStep3() {
        const modal2 = document.getElementById('create-caravan-step2-modal');
        const modal3 = document.getElementById('create-caravan-step3-modal');
        
        if (modal2) modal2.classList.remove('active');
        if (modal3) {
            modal3.classList.add('active');
            // Фокусируемся на поле ввода описания
            setTimeout(() => {
                const textarea = document.getElementById('caravan-description');
                if (textarea) {
                    textarea.focus();
                }
            }, 100);
        }
    }

    // Вернуться к шагу 1
    goToStep1() {
        const modal1 = document.getElementById('create-caravan-modal');
        const modal2 = document.getElementById('create-caravan-step2-modal');
        
        if (modal2) modal2.classList.remove('active');
        if (modal1) {
            modal1.classList.add('active');
            // Восстанавливаем введенное название
            const nameInput = document.getElementById('caravan-name');
            if (nameInput && this.caravanCreationData) {
                nameInput.value = this.caravanCreationData.name;
                nameInput.focus();
            }
        }
    }

    // Вернуться к шагу 2
    goToStep2() {
        const modal2 = document.getElementById('create-caravan-step2-modal');
        const modal3 = document.getElementById('create-caravan-step3-modal');
        
        if (modal3) modal3.classList.remove('active');
        if (modal2) {
            modal2.classList.add('active');
            // Восстанавливаем введенную цель
            const goalInput = document.getElementById('caravan-goal');
            if (goalInput && this.caravanCreationData) {
                goalInput.value = this.caravanCreationData.goal;
                goalInput.focus();
            }
        }
    }

    // Закрыть модальное окно создания каравана
    closeCreateCaravanModal() {
        const modals = [
            'create-caravan-modal',
            'create-caravan-step2-modal',
            'create-caravan-step3-modal',
            'create-goal-modal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                // Очищаем форму
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        });
        
        // Очищаем данные создания каравана
        this.caravanCreationData = null;
    }

    // Инициализация данных для создания каравана
    initCaravanCreation() {
        this.caravanCreationData = {
            name: '',
            type: '', // 'goal' или 'challenge'
            goal: '',
            description: ''
        };
    }

    // Показать модальное окно создания цели
    showGoalCreationModal() {
        console.log('Показываем создание цели для каравана');
        // Закрываем текущее модальное окно
        this.closeCreateCaravanModal();
        
        // Используем логику создания карты из основного приложения
        if (this.mainApp && this.mainApp.showCreateMapModal) {
            // Сохраняем информацию о караване для последующего использования
            this.mainApp.caravanCreationData = {
                caravanName: this.caravanCreationData.name,
                isCaravanGoal: true
            };
            
            // Запускаем процесс создания карты
            this.mainApp.showCreateMapModal();
        } else {
            console.error('Основное приложение не найдено!');
            // Fallback к старому методу
            this.showGoalCreationModalFallback();
        }
    }

    // Fallback метод для создания цели (старая логика)
    showGoalCreationModalFallback() {
        const modal = document.getElementById('create-goal-modal');
        if (modal) {
            modal.classList.add('active');
            // Предзаполняем название цели, если оно уже введено
            const goalTitleInput = document.getElementById('goal-title');
            if (goalTitleInput && this.caravanCreationData.name) {
                goalTitleInput.value = this.caravanCreationData.name;
                this.validateGoalForm();
            }
        } else {
            console.error('Модальное окно создания цели не найдено!');
        }
    }

    // Валидация формы создания цели
    validateGoalForm() {
        const goalTitle = document.getElementById('goal-title').value.trim();
        const nextBtn = document.getElementById('goal-next-btn');
        
        if (goalTitle.length >= 3) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
        }
    }

    // Закрыть модальное окно создания цели
    closeGoalModal() {
        const modal = document.getElementById('create-goal-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Показать модальное окно создания челленджа
    showChallengeCreationModal() {
        console.log('Показываем создание челленджа');
        // Закрываем шаг 2
        const modal2 = document.getElementById('create-caravan-step2-modal');
        if (modal2) modal2.classList.remove('active');
        
        // Показываем модальное окно создания челленджа
        this.showChallengePeriodModal();
    }

    // Показать модальное окно выбора периода для челленджа
    showChallengePeriodModal() {
        const modalHTML = `
            <div class="modal-overlay active" id="challenge-period-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Разбивка на периоды</h3>
                        <p class="modal-subtitle">Организуйте свой челлендж по периодам</p>
                    </div>
                    <div class="modal-body">
                        <div class="challenge-period-section">
                            <p class="period-description">Выберите период выполнения челленджа</p>
                            
                            <div class="period-type-selector">
                                <button class="period-type-btn active" id="challenge-deadline-btn">Дедлайн</button>
                                <button class="period-type-btn" id="challenge-duration-btn">Период</button>
                            </div>
                            
                            <div id="challenge-deadline-section">
                                <div class="form-group">
                                    <label for="challenge-deadline" class="form-label">Дата завершения челленджа</label>
                                    <input type="date" id="challenge-deadline" class="form-input" min="">
                                </div>
                            </div>
                            
                            <div id="challenge-duration-section" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label">Длительность</label>
                                    <div class="duration-options">
                                        <div class="duration-option" data-days="7">
                                            <input type="radio" name="duration" value="7" id="dur-7">
                                            <label for="dur-7">1 неделя</label>
                                        </div>
                                        <div class="duration-option" data-days="14">
                                            <input type="radio" name="duration" value="14" id="dur-14">
                                            <label for="dur-14">2 недели</label>
                                        </div>
                                        <div class="duration-option" data-days="21">
                                            <input type="radio" name="duration" value="21" id="dur-21">
                                            <label for="dur-21">3 недели</label>
                                        </div>
                                        <div class="duration-option" data-days="30">
                                            <input type="radio" name="duration" value="30" id="dur-30">
                                            <label for="dur-30">1 месяц</label>
                                        </div>
                                        <div class="duration-option" data-days="60">
                                            <input type="radio" name="duration" value="60" id="dur-60">
                                            <label for="dur-60">2 месяца</label>
                                        </div>
                                        <div class="duration-option" data-days="90">
                                            <input type="radio" name="duration" value="90" id="dur-90">
                                            <label for="dur-90">3 месяца</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Разбивка на периоды -->
                            <div id="challenge-breakdown-section" style="display: none;">
                                <div class="form-group">
                                    <label class="form-label">Разбивка на подпериоды</label>
                                    <div class="breakdown-container" id="challenge-breakdown-container">
                                        <!-- Разбивка будет добавлена динамически -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="challenge-period-back-btn">Назад</button>
                        <button class="btn btn-primary" id="challenge-period-next-btn">Далее</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Устанавливаем минимальную дату
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('challenge-deadline').min = today;
        
        // Настраиваем обработчики
        this.setupChallengePeriodEvents();
        this.setupGoalCreationEvents();
    }

    // Настройка обработчиков для создания цели
    setupGoalCreationEvents() {
        const goalTitleInput = document.getElementById('goal-title');
        const goalCancelBtn = document.getElementById('goal-cancel-btn');
        const goalNextBtn = document.getElementById('goal-next-btn');

        if (goalTitleInput) {
            goalTitleInput.addEventListener('input', () => this.validateGoalForm());
        }

        if (goalCancelBtn) {
            goalCancelBtn.addEventListener('click', () => this.closeGoalModal());
        }

        if (goalNextBtn) {
            goalNextBtn.addEventListener('click', () => this.handleGoalCreation());
        }
    }

    // Обработка создания цели
    handleGoalCreation() {
        const goalTitle = document.getElementById('goal-title').value.trim();
        const goalDescription = document.getElementById('goal-description').value.trim();

        if (!goalTitle) {
            alert('Введите название цели');
            return;
        }

        // Сохраняем данные цели
        this.caravanCreationData.goalTitle = goalTitle;
        this.caravanCreationData.goalDescription = goalDescription;
        this.caravanCreationData.type = 'goal';

        console.log('Создана цель:', this.caravanCreationData);

        // Закрываем модальное окно создания цели
        this.closeGoalModal();

        // Показываем финальное окно добавления участников
        this.showStep3();
    }

    // Генерация разбивки на периоды для челленджа
    generateChallengeBreakdown(totalDays) {
        const breakdown = this.generatePeriodBreakdown(totalDays);
        const container = document.getElementById('challenge-breakdown-container');
        if (container) {
            container.innerHTML = this.renderBreakdownHTML(breakdown);
            this.setupBreakdownItemHandlers();
        }
    }

    // Генерация структуры разбивки периода (адаптировано из script.js)
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
                    children: this.generateMonthBreakdown(yearDays)
                });
            }
        } else if (totalDays >= 90) {
            // 3 месяца и больше - разбиваем на месяцы
            breakdown = this.generateMonthBreakdown(totalDays);
        } else if (totalDays >= 30) {
            // Месяц и больше - разбиваем на недели
            breakdown = this.generateWeekBreakdown(totalDays);
        } else if (totalDays >= 7) {
            // Неделя и больше - разбиваем на дни
            breakdown = this.generateDayBreakdown(totalDays);
        } else {
            // Менее недели - просто дни
            for (let i = 1; i <= totalDays; i++) {
                breakdown.push({
                    id: `day-${i}`,
                    type: 'day',
                    title: `День ${i}`,
                    task: '',
                    days: 1
                });
            }
        }

        return breakdown;
    }

    // Генерация разбивки по месяцам
    generateMonthBreakdown(totalDays) {
        const breakdown = [];
        const months = Math.ceil(totalDays / 30);
        
        for (let i = 0; i < months; i++) {
            const monthDays = Math.min(30, totalDays - (i * 30));
            breakdown.push({
                id: `month-${i}`,
                type: 'month',
                title: `Месяц ${i + 1}`,
                task: '',
                days: monthDays,
                children: this.generateWeekBreakdown(monthDays)
            });
        }
        
        return breakdown;
    }

    // Генерация разбивки по неделям
    generateWeekBreakdown(totalDays) {
        const breakdown = [];
        const weeks = Math.ceil(totalDays / 7);
        
        for (let i = 0; i < weeks; i++) {
            const weekDays = Math.min(7, totalDays - (i * 7));
            breakdown.push({
                id: `week-${i}`,
                type: 'week',
                title: `Неделя ${i + 1}`,
                task: '',
                days: weekDays,
                children: this.generateDayBreakdown(weekDays)
            });
        }
        
        return breakdown;
    }

    // Генерация разбивки по дням
    generateDayBreakdown(totalDays) {
        const breakdown = [];
        
        for (let i = 1; i <= totalDays; i++) {
            breakdown.push({
                id: `day-${i}`,
                type: 'day',
                title: `День ${i}`,
                task: '',
                days: 1
            });
        }
        
        return breakdown;
    }

    // Рендеринг HTML для разбивки (адаптировано из script.js)
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

    // Настройка обработчиков для элементов разбивки
    setupBreakdownItemHandlers() {
        // Обработчики для сворачивания/разворачивания
        document.querySelectorAll('.breakdown-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const toggleId = header.getAttribute('data-toggle-id');
                this.toggleBreakdownItem(toggleId);
            });
        });

        // Обработчики для редактирования
        document.querySelectorAll('.breakdown-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const editId = btn.getAttribute('data-edit-id');
                this.editBreakdownItem(editId);
            });
        });
    }

    // Переключение состояния элемента разбивки
    toggleBreakdownItem(itemId) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        const icon = item.querySelector('.breakdown-icon');
        const children = document.getElementById(`children-${itemId}`);
        
        if (children) {
            const isExpanded = children.classList.contains('expanded');
            if (isExpanded) {
                children.classList.remove('expanded');
                icon.classList.remove('expanded');
            } else {
                children.classList.add('expanded');
                icon.classList.add('expanded');
            }
        }
    }

    // Редактирование элемента разбивки
    editBreakdownItem(itemId) {
        const item = document.querySelector(`[data-id="${itemId}"]`);
        const taskElement = item.querySelector('.breakdown-task');
        const currentTask = taskElement.textContent;
        
        const newTask = prompt('Введите задачу для этого периода:', currentTask);
        if (newTask !== null) {
            taskElement.textContent = newTask;
        }
    }

    // Настройка обработчиков для периода челленджа
    setupChallengePeriodEvents() {
        const backBtn = document.getElementById('challenge-period-back-btn');
        const nextBtn = document.getElementById('challenge-period-next-btn');
        const deadlineBtn = document.getElementById('challenge-deadline-btn');
        const durationBtn = document.getElementById('challenge-duration-btn');
        const deadlineSection = document.getElementById('challenge-deadline-section');
        const durationSection = document.getElementById('challenge-duration-section');
        const breakdownSection = document.getElementById('challenge-breakdown-section');

        backBtn.addEventListener('click', () => {
            this.closeChallengePeriodModal();
            this.showStep2();
        });

        nextBtn.addEventListener('click', () => {
            this.handleChallengePeriodNext();
        });

        deadlineBtn.addEventListener('click', () => {
            deadlineBtn.classList.add('active');
            durationBtn.classList.remove('active');
            deadlineSection.style.display = 'block';
            durationSection.style.display = 'none';
            breakdownSection.style.display = 'none';
        });

        durationBtn.addEventListener('click', () => {
            durationBtn.classList.add('active');
            deadlineBtn.classList.remove('active');
            deadlineSection.style.display = 'none';
            durationSection.style.display = 'block';
            breakdownSection.style.display = 'none';
        });

        // Обработчики для радиокнопок длительности
        const durationOptions = document.querySelectorAll('input[name="duration"]');
        durationOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (option.checked) {
                    const days = parseInt(option.value);
                    this.generateChallengeBreakdown(days);
                    breakdownSection.style.display = 'block';
                }
            });
        });

        // Обработчик для поля даты дедлайна
        const deadlineInput = document.getElementById('challenge-deadline');
        deadlineInput.addEventListener('change', () => {
            if (deadlineInput.value) {
                const deadline = new Date(deadlineInput.value);
                const today = new Date();
                const days = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                if (days > 0) {
                    this.generateChallengeBreakdown(days);
                    breakdownSection.style.display = 'block';
                }
            }
        });
    }

    // Обработка следующего шага для периода челленджа
    handleChallengePeriodNext() {
        const deadlineBtn = document.getElementById('challenge-deadline-btn');
        const isDeadlineMode = deadlineBtn.classList.contains('active');
        
        if (isDeadlineMode) {
            const deadlineInput = document.getElementById('challenge-deadline');
            if (!deadlineInput.value) {
                alert('Выберите дату завершения челленджа');
                return;
            }
            this.caravanCreationData.deadline = deadlineInput.value;
        } else {
            const selectedDuration = document.querySelector('input[name="duration"]:checked');
            if (!selectedDuration) {
                alert('Выберите длительность челленджа');
                return;
            }
            this.caravanCreationData.duration = parseInt(selectedDuration.value);
        }
        
        this.closeChallengePeriodModal();
        this.showChallengeTaskModal();
    }

    // Показать модальное окно задания челленджа
    showChallengeTaskModal() {
        const modalHTML = `
            <div class="modal-overlay active" id="challenge-task-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Задание челленджа</h3>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="challenge-task" class="form-label">Что нужно делать каждый день?</label>
                            <textarea 
                                id="challenge-task" 
                                class="form-input" 
                                placeholder="Опишите задание для ежедневного выполнения..."
                                rows="4"
                                maxlength="200"
                            ></textarea>
                            <div class="form-hint">Максимум 200 символов</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="challenge-task-back-btn">Назад</button>
                        <button class="btn btn-primary" id="challenge-task-next-btn">Далее</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupChallengeTaskEvents();
    }

    // Настройка обработчиков для задания челленджа
    setupChallengeTaskEvents() {
        const backBtn = document.getElementById('challenge-task-back-btn');
        const nextBtn = document.getElementById('challenge-task-next-btn');

        backBtn.addEventListener('click', () => {
            this.closeChallengeTaskModal();
            this.showChallengePeriodModal();
        });

        nextBtn.addEventListener('click', () => {
            const taskInput = document.getElementById('challenge-task');
            const task = taskInput.value.trim();
            
            if (!task) {
                alert('Опишите задание для челленджа');
                return;
            }
            
            this.caravanCreationData.task = task;
            this.closeChallengeTaskModal();
            this.showMembersModal();
        });
    }

    // Закрыть модальное окно периода челленджа
    closeChallengePeriodModal() {
        const modal = document.getElementById('challenge-period-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // Закрыть модальное окно задания челленджа
    closeChallengeTaskModal() {
        const modal = document.getElementById('challenge-task-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // Обработка шага 1: Название команды
    handleStep1() {
        const nameInput = document.getElementById('caravan-name');

        if (!nameInput) {
            console.error('Не найдено поле названия');
            return;
        }

        const name = nameInput.value.trim();

        // Валидация
        if (!name) {
            alert('Пожалуйста, введите название команды');
            nameInput.focus();
            return;
        }

        if (name.length > 50) {
            alert('Название команды не должно превышать 50 символов');
            nameInput.focus();
            return;
        }

        // Сохраняем данные и переходим к следующему шагу
        this.caravanCreationData.name = name;
        this.showStep2();
    }

    // Обработка шага 2: Общая цель
    handleStep2() {
        const goalInput = document.getElementById('caravan-goal');

        if (!goalInput) {
            console.error('Не найдено поле цели');
            return;
        }

        const goal = goalInput.value.trim();

        // Валидация
        if (!goal) {
            alert('Пожалуйста, введите общую цель');
            goalInput.focus();
            return;
        }

        if (goal.length > 100) {
            alert('Общая цель не должна превышать 100 символов');
            goalInput.focus();
            return;
        }

        // Сохраняем данные и переходим к следующему шагу
        this.caravanCreationData.goal = goal;
        this.showStep3();
    }

    // Обработка шага 3: Описание
    handleStep3() {
        const descriptionTextarea = document.getElementById('caravan-description');

        if (!descriptionTextarea) {
            console.error('Не найдено поле описания');
            return;
        }

        const description = descriptionTextarea.value.trim();

        // Валидация
        if (description.length > 200) {
            alert('Описание не должно превышать 200 символов');
            descriptionTextarea.focus();
            return;
        }

        // Сохраняем данные и переходим к управлению участниками
        this.caravanCreationData.description = description;
        this.showManageMembersForNewCaravan();
    }

    // Показать управление участниками для нового каравана
    showManageMembersForNewCaravan() {
        // Закрываем шаг 3
        const modal3 = document.getElementById('create-caravan-step3-modal');
        if (modal3) modal3.classList.add('hidden');
        
        // Создаем временный караван для отображения в модальном окне управления участниками
        const tempCaravan = {
            id: 'temp-new-caravan',
            name: this.caravanCreationData.name,
            goal: this.caravanCreationData.goal,
            description: this.caravanCreationData.description,
            members: 1,
            status: 'active'
        };
        
        // Показываем модальное окно управления участниками
        this.showManageMembersModal(tempCaravan);
    }

    // Загрузить караваны из localStorage
    loadCaravans() {
        try {
            const saved = localStorage.getItem('roadToDreamCaravans');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Ошибка загрузки караванов:', error);
            return [];
        }
    }

    // Сохранить караваны в localStorage
    saveCaravans() {
        try {
            localStorage.setItem('roadToDreamCaravans', JSON.stringify(this.caravans));
        } catch (error) {
            console.error('Ошибка сохранения караванов:', error);
        }
    }

    // Добавить новый караван
    addCaravan(caravanData) {
        const newCaravan = {
            id: Date.now().toString(),
            name: caravanData.name,
            goal: caravanData.goal,
            description: caravanData.description,
            createdAt: new Date().toISOString(),
            members: 1, // Пока что только создатель
            status: 'active'
        };
        
        this.caravans.unshift(newCaravan); // Добавляем в начало списка
        this.saveCaravans();
        return newCaravan;
    }

    // Получить название цели по значению
    getGoalName(goalValue) {
        const goals = {
            'fitness': '💪 Фитнес и здоровье',
            'career': '🚀 Карьера и развитие',
            'education': '📚 Обучение и навыки',
            'travel': '✈️ Путешествия',
            'business': '💼 Бизнес и предпринимательство',
            'creativity': '🎨 Творчество и искусство',
            'family': '👨‍👩‍👧‍👦 Семья и отношения',
            'finance': '💰 Финансы и инвестиции',
            'spirituality': '🧘 Духовность и саморазвитие',
            'other': '🌟 Другое'
        };
        // Если это уже готовое название цели, возвращаем как есть
        if (goalValue && Object.values(goals).includes(goalValue)) {
            return goalValue;
        }
        // Если это ключ, возвращаем соответствующее название
        return goals[goalValue] || goalValue || '🌟 Другое';
    }

    // Рендеринг списка караванов
    renderCaravansList() {
        if (!this.caravans || this.caravans.length === 0) {
            return `
                <div class="empty-caravans">
                    <div class="empty-icon">📭</div>
                    <p class="empty-text">У вас пока нет караванов</p>
                    <p class="empty-hint">Создайте первый караван, чтобы начать!</p>
                </div>
            `;
        }

        return this.caravans.map(caravan => `
            <div class="caravan-card" data-caravan-id="${caravan.id}">
                <div class="caravan-card-header">
                    <div class="caravan-name">${caravan.name}</div>
                    <div class="caravan-header-right">
                        <div class="caravan-status ${caravan.status}">${caravan.status === 'active' ? 'Активен' : 'Неактивен'}</div>
                        <div class="caravan-menu">
                            <button class="caravan-menu-trigger" data-caravan-id="${caravan.id}" aria-label="Меню каравана">
                                <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                            </button>
                            <div class="caravan-dropdown-menu" id="menu-${caravan.id}" style="display: none;">
                                <button class="menu-item" data-caravan-id="${caravan.id}">
                                    <span class="menu-icon">✏️</span>
                                    Редактировать описание
                                </button>
                                <button class="menu-item" data-caravan-id="${caravan.id}">
                                    <span class="menu-icon">👥</span>
                                    Управление участниками
                                </button>
                                <button class="menu-item" data-caravan-id="${caravan.id}">
                                    <span class="menu-icon">🔗</span>
                                    Поделиться ссылкой
                                </button>
                                <hr class="menu-divider">
                                <button class="menu-item danger" data-caravan-id="${caravan.id}">
                                    <span class="menu-icon">🗑️</span>
                                    Удалить караван
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="caravan-goal">${this.getGoalName(caravan.goal)}</div>
                ${caravan.description ? `<div class="caravan-description">${caravan.description}</div>` : ''}
                <div class="caravan-meta">
                    <div class="caravan-members">👥 ${caravan.members} участник${caravan.members === 1 ? '' : caravan.members < 5 ? 'а' : 'ов'}</div>
                    <div class="caravan-date">${this.formatDate(caravan.createdAt)}</div>
                </div>
                <div class="caravan-actions">
                    <button class="btn-caravan-action" data-caravan-id="${caravan.id}">
                        Открыть
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Сегодня';
        } else if (diffDays === 2) {
            return 'Вчера';
        } else if (diffDays <= 7) {
            return `${diffDays} дн. назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
        }
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        `;

        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        // Добавляем уведомление на страницу
        document.body.appendChild(notification);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 300);
        }, 3000);

        // Добавляем анимацию исчезновения
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(fadeOutStyle);
    }

    // Просмотр каравана (заглушка)
    viewCaravan(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (caravan) {
            alert(`Просмотр каравана "${caravan.name}"\n\nЦель: ${this.getGoalName(caravan.goal)}\nОписание: ${caravan.description || 'Нет описания'}\n\nФункция просмотра будет реализована позже!`);
        }
    }

    // Переключение меню каравана
    toggleCaravanMenu(caravanId) {
        console.log('toggleCaravanMenu вызвана для ID:', caravanId);
        
        // Закрываем все открытые меню
        document.querySelectorAll('.caravan-dropdown-menu').forEach(menu => {
            if (menu.id !== `menu-${caravanId}`) {
                menu.classList.remove('show');
            }
        });

        // Переключаем текущее меню
        const menu = document.getElementById(`menu-${caravanId}`);
        console.log('Найдено меню:', menu);
        
        if (menu) {
            // Очищаем все inline стили
            menu.style.display = '';
            menu.style.position = '';
            menu.style.top = '';
            menu.style.right = '';
            menu.style.zIndex = '';
            
            const isShown = menu.classList.contains('show');
            console.log('Меню показано:', isShown);
            
            if (isShown) {
                // Скрываем меню
                menu.classList.remove('show');
                console.log('Меню скрыто');
            } else {
                // Показываем меню
                menu.classList.add('show');
                console.log('Меню показано');
            }
        } else {
            console.error('Меню не найдено для ID:', caravanId);
        }
    }

    // Редактирование описания каравана
    editCaravanDescription(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (!caravan) return;

        // Закрываем меню
        this.closeAllMenus();

        // Показываем модальное окно редактирования
        this.showEditDescriptionModal(caravan);
    }

    // Управление участниками
    manageMembers(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (!caravan) return;

        // Закрываем меню
        this.closeAllMenus();

        // Показываем модальное окно управления участниками
        this.showManageMembersModal(caravan);
    }

    // Поделиться ссылкой на караван
    shareCaravan(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (!caravan) return;

        // Закрываем меню
        this.closeAllMenus();

        // Генерируем ссылку (пока что заглушка)
        const shareUrl = `${window.location.origin}${window.location.pathname}?caravan=${caravanId}`;
        
        // Показываем модальное окно с ссылкой
        this.showShareModal(caravan, shareUrl);
    }

    // Удаление каравана
    deleteCaravan(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (!caravan) return;

        // Закрываем меню
        this.closeAllMenus();

        // Показываем модальное окно с подтверждением
        this.showDeleteConfirmationModal(caravan);
    }

    // Закрыть все открытые меню
    closeAllMenus() {
        console.log('Закрываем все меню');
        document.querySelectorAll('.caravan-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
            // Очищаем inline стили
            menu.style.display = '';
            menu.style.position = '';
            menu.style.top = '';
            menu.style.right = '';
            menu.style.zIndex = '';
        });
    }

    // Показать модальное окно подтверждения удаления
    showDeleteConfirmationModal(caravan) {
        this.caravanToDelete = caravan;
        const modal = document.getElementById('delete-confirmation-modal');
        const caravanNameElement = document.getElementById('delete-caravan-name');
        
        if (modal && caravanNameElement) {
            caravanNameElement.textContent = `"${caravan.name}"`;
            modal.classList.add('active');
            
            // Фокусируемся на поле ввода
            setTimeout(() => {
                const input = document.getElementById('delete-confirmation-input');
                if (input) {
                    input.focus();
                }
            }, 100);
        }
    }

    // Закрыть модальное окно подтверждения удаления
    closeDeleteConfirmationModal() {
        const modal = document.getElementById('delete-confirmation-modal');
        if (modal) {
            modal.classList.remove('active');
            // Очищаем форму
            const form = document.getElementById('delete-confirmation-form');
            if (form) {
                form.reset();
            }
        }
        this.caravanToDelete = null;
    }

    // Обработка подтверждения удаления
    handleDeleteConfirmation() {
        const input = document.getElementById('delete-confirmation-input');
        if (!input || !this.caravanToDelete) {
            return;
        }

        const confirmationText = input.value.trim();

        // Проверяем правильность введенной фразы
        if (confirmationText !== 'Удалить караван') {
            alert('Неверная фраза подтверждения. Введите точно: "Удалить караван"');
            input.focus();
            return;
        }

        // Удаляем караван
        this.caravans = this.caravans.filter(c => c.id !== this.caravanToDelete.id);
        this.saveCaravans();
        
        // Закрываем модальное окно
        this.closeDeleteConfirmationModal();
        
        // Обновляем экран и показываем уведомление
        this.renderCaravanScreen();
        this.showNotification('Караван удален', 'success');
    }

    // Показать модальное окно редактирования описания
    showEditDescriptionModal(caravan) {
        this.currentEditingCaravan = caravan;
        const modal = document.getElementById('edit-description-modal');
        const textarea = document.getElementById('edit-description-text');
        
        if (modal && textarea) {
            textarea.value = caravan.description || '';
            modal.classList.add('active');
            
            // Добавляем обработчик формы
            const form = document.getElementById('edit-description-form');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    this.saveCaravanDescription(textarea.value.trim());
                };
            }
        }
    }

    // Закрыть модальное окно редактирования описания
    closeEditDescriptionModal() {
        const modal = document.getElementById('edit-description-modal');
        if (modal) {
            modal.classList.remove('active');
            this.currentEditingCaravan = null;
        }
    }

    // Сохранить описание каравана
    saveCaravanDescription(newDescription) {
        if (this.currentEditingCaravan) {
            this.currentEditingCaravan.description = newDescription;
            this.saveCaravans();
            this.closeEditDescriptionModal();
            this.renderCaravanScreen();
            this.showNotification('Описание обновлено', 'success');
        }
    }

    // Показать модальное окно управления участниками
    showManageMembersModal(caravan) {
        this.currentManagingCaravan = caravan;
        const modal = document.getElementById('manage-members-modal');
        
        if (modal) {
            // Заполняем список участников
            this.renderMembersList(caravan);
            modal.classList.add('active');
            
            // Показываем кнопку "Создать караван" только для нового каравана
            const finishBtn = document.getElementById('finish-caravan-btn');
            if (finishBtn) {
                if (caravan.id === 'temp-new-caravan') {
                    finishBtn.style.display = 'inline-block';
                } else {
                    finishBtn.style.display = 'none';
                }
            }
        }
    }

    // Закрыть модальное окно управления участниками
    closeManageMembersModal() {
        const modal = document.getElementById('manage-members-modal');
        if (modal) {
            modal.classList.remove('active');
            this.currentManagingCaravan = null;
        }
    }

    // Рендеринг списка участников
    renderMembersList(caravan) {
        const membersList = document.getElementById('members-list');
        if (!membersList) return;

        // Пока что у нас только создатель, но в будущем здесь будет список участников
        const members = [
            { id: 'creator', name: 'Вы (создатель)', role: 'creator', canRemove: false }
        ];

        membersList.innerHTML = members.map(member => `
            <div class="member-item">
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role === 'creator' ? 'Создатель' : 'Участник'}</div>
                </div>
                ${member.canRemove ? `
                    <button class="btn-remove-member" onclick="window.roadToDreamApp.caravanModule.removeMember('${member.id}')">
                        Удалить
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    // Добавить участника (заглушка)
    addMember() {
        const usernameInput = document.getElementById('member-username');
        const username = usernameInput?.value.trim();
        
        if (!username) {
            alert('Введите имя пользователя или ID');
            return;
        }

        // Пока что просто показываем сообщение
        alert(`Добавление участника "${username}"\n\nФункция добавления участников будет реализована позже!`);
        usernameInput.value = '';
    }

    // Завершить создание каравана
    finishCaravanCreation() {
        if (!this.caravanCreationData) {
            console.error('Нет данных для создания каравана');
            return;
        }

        // Сохраняем данные перед закрытием модальных окон
        const caravanName = this.caravanCreationData.name;
        
        // Создаем караван
        const newCaravan = this.addCaravan(this.caravanCreationData);
        
        // Закрываем все модальные окна
        this.closeManageMembersModal();
        this.closeCreateCaravanModal();
        
        // Показываем уведомление об успехе
        this.showNotification('Караван "' + caravanName + '" успешно создан!', 'success');
        
        // Обновляем экран каравана для отображения нового каравана
        setTimeout(() => {
            this.renderCaravanScreen();
        }, 1000);
    }

    // Удалить участника (заглушка)
    removeMember(memberId) {
        alert(`Удаление участника\n\nФункция удаления участников будет реализована позже!`);
    }

    // Показать модальное окно поделиться ссылкой
    showShareModal(caravan, shareUrl) {
        this.currentSharingCaravan = caravan;
        this.currentShareUrl = shareUrl;
        
        const modal = document.getElementById('share-modal');
        const nameElement = document.getElementById('share-caravan-name');
        const linkInput = document.getElementById('share-link-input');
        
        if (modal && nameElement && linkInput) {
            nameElement.textContent = caravan.name;
            linkInput.value = shareUrl;
            modal.classList.add('active');
        }
    }

    // Закрыть модальное окно поделиться ссылкой
    closeShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.remove('active');
            this.currentSharingCaravan = null;
            this.currentShareUrl = null;
        }
    }

    // Копировать ссылку для поделиться
    copyShareLink() {
        const linkInput = document.getElementById('share-link-input');
        if (linkInput && this.currentShareUrl) {
            linkInput.select();
            linkInput.setSelectionRange(0, 99999); // Для мобильных устройств
            
            try {
                document.execCommand('copy');
                this.showNotification('Ссылка скопирована в буфер обмена!', 'success');
            } catch (err) {
                // Fallback для современных браузеров
                navigator.clipboard.writeText(this.currentShareUrl).then(() => {
                    this.showNotification('Ссылка скопирована в буфер обмена!', 'success');
                }).catch(() => {
                    this.showNotification('Не удалось скопировать ссылку', 'error');
                });
            }
        }
    }

    // Поделиться в Telegram (заглушка)
    shareToTelegram() {
        if (this.currentShareUrl) {
            const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(this.currentShareUrl)}&text=${encodeURIComponent(`Присоединяйтесь к каравану "${this.currentSharingCaravan.name}"!`)}`;
            window.open(telegramUrl, '_blank');
        }
    }

    // Поделиться в другом приложении (заглушка)
    shareToOther() {
        if (navigator.share && this.currentShareUrl) {
            navigator.share({
                title: `Караван "${this.currentSharingCaravan.name}"`,
                text: 'Присоединяйтесь к моему каравану!',
                url: this.currentShareUrl
            }).catch(() => {
                this.copyShareLink();
            });
        } else {
            this.copyShareLink();
        }
    }

    // Редактирование каравана (заглушка)
    editCaravan(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (caravan) {
            alert(`Редактирование каравана "${caravan.name}"\n\nФункция редактирования будет реализована позже!`);
        }
    }
}
