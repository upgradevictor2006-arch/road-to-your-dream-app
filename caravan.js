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
        
        this.setupCaravanEventListeners();
    }

    // Рендеринг модальных окон каравана
    renderCaravanModals() {
        return `
            <!-- Модальное окно создания каравана - Шаг 1: Название -->
            <div id="create-caravan-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Шаг 1: Название команды</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeCreateCaravanModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="create-caravan-step1-form" class="caravan-form">
                            <div class="form-group">
                                <label for="caravan-name" class="form-label">Название команды</label>
                                <input 
                                    type="text" 
                                    id="caravan-name" 
                                    class="form-input" 
                                    placeholder="Введите название вашей команды"
                                    maxlength="50"
                                    required
                                >
                                <div class="form-hint">Максимум 50 символов</div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.closeCreateCaravanModal()">
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
            <div id="create-caravan-step2-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Шаг 2: Общая цель</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeCreateCaravanModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="create-caravan-step2-form" class="caravan-form">
                            <div class="form-group">
                                <label for="caravan-goal" class="form-label">Общая цель</label>
                                <input 
                                    type="text" 
                                    id="caravan-goal" 
                                    class="form-input" 
                                    placeholder="Опишите общую цель вашей команды"
                                    maxlength="100"
                                    required
                                >
                                <div class="form-hint">Максимум 100 символов</div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.goToStep1()">
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
            
            <!-- Модальное окно создания каравана - Шаг 3: Описание -->
            <div id="create-caravan-step3-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Шаг 3: Описание</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeCreateCaravanModal()">×</button>
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
                                <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.goToStep2()">
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
            <div id="edit-description-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Редактировать описание</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeEditDescriptionModal()">×</button>
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
                                <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.closeEditDescriptionModal()">
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
            <div id="manage-members-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Управление участниками</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeManageMembersModal()">×</button>
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
                                    <button class="btn-primary" onclick="window.roadToDreamApp.caravanModule.addMember()">
                                        Добавить
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.closeManageMembersModal()">
                                Закрыть
                            </button>
                            <button type="button" class="btn-primary" onclick="window.roadToDreamApp.caravanModule.finishCaravanCreation()" id="finish-caravan-btn" style="display: none;">
                                Создать караван
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно поделиться ссылкой -->
            <div id="share-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Поделиться караваном</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeShareModal()">×</button>
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
                                <button class="btn-copy" onclick="window.roadToDreamApp.caravanModule.copyShareLink()">
                                    📋 Копировать
                                </button>
                            </div>
                            
                            <div class="share-actions">
                                <button class="btn-share-action" onclick="window.roadToDreamApp.caravanModule.shareToTelegram()">
                                    📱 Поделиться в Telegram
                                </button>
                                <button class="btn-share-action" onclick="window.roadToDreamApp.caravanModule.shareToOther()">
                                    🌐 Поделиться в другом приложении
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.closeShareModal()">
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Модальное окно подтверждения удаления -->
            <div id="delete-confirmation-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">🗑️ Удалить караван</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.caravanModule.closeDeleteConfirmationModal()">×</button>
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
                                <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.caravanModule.closeDeleteConfirmationModal()">
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
        // Обработчик для кнопки создания каравана
        const createCaravanBtn = document.getElementById('create-caravan-btn');
        console.log('Кнопка создания каравана найдена:', createCaravanBtn);
        if (createCaravanBtn) {
            createCaravanBtn.addEventListener('click', () => {
                console.log('Кнопка создания каравана нажата!');
                this.showCreateCaravanModal();
            });
        } else {
            console.error('Кнопка create-caravan-btn не найдена!');
        }

        // Обработчики форм создания каравана
        const form1 = document.getElementById('create-caravan-step1-form');
        if (form1) {
            form1.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStep1();
            });
        }
        
        const form2 = document.getElementById('create-caravan-step2-form');
        if (form2) {
            form2.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStep2();
            });
        }
        
        const form3 = document.getElementById('create-caravan-step3-form');
        if (form3) {
            form3.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStep3();
            });
        }
        
        const deleteForm = document.getElementById('delete-confirmation-form');
        if (deleteForm) {
            deleteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDeleteConfirmation();
            });
        }

        // Обработчик клика вне меню для его закрытия
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.caravan-menu')) {
                this.closeAllMenus();
            }
        });
    }

    // Показать модальное окно создания каравана
    showCreateCaravanModal() {
        console.log('showCreateCaravanModal вызвана');
        this.initCaravanCreation();
        const modal = document.getElementById('create-caravan-modal');
        console.log('Найдено модальное окно:', modal);
        if (modal) {
            console.log('Убираем класс hidden');
            modal.classList.remove('hidden');
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
        
        if (modal1) modal1.classList.add('hidden');
        if (modal2) {
            modal2.classList.remove('hidden');
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
        
        if (modal2) modal2.classList.add('hidden');
        if (modal3) {
            modal3.classList.remove('hidden');
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
        
        if (modal2) modal2.classList.add('hidden');
        if (modal1) {
            modal1.classList.remove('hidden');
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
        
        if (modal3) modal3.classList.add('hidden');
        if (modal2) {
            modal2.classList.remove('hidden');
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
            'create-caravan-step3-modal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('hidden');
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
            goal: '',
            description: ''
        };
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
                            <button class="caravan-menu-trigger" onclick="window.roadToDreamApp.caravanModule.toggleCaravanMenu('${caravan.id}')" aria-label="Меню каравана">
                                <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                            </button>
                            <div class="caravan-dropdown-menu" id="menu-${caravan.id}" style="display: none;">
                                <button class="menu-item" onclick="window.roadToDreamApp.caravanModule.editCaravanDescription('${caravan.id}')">
                                    <span class="menu-icon">✏️</span>
                                    Редактировать описание
                                </button>
                                <button class="menu-item" onclick="window.roadToDreamApp.caravanModule.manageMembers('${caravan.id}')">
                                    <span class="menu-icon">👥</span>
                                    Управление участниками
                                </button>
                                <button class="menu-item" onclick="window.roadToDreamApp.caravanModule.shareCaravan('${caravan.id}')">
                                    <span class="menu-icon">🔗</span>
                                    Поделиться ссылкой
                                </button>
                                <hr class="menu-divider">
                                <button class="menu-item danger" onclick="window.roadToDreamApp.caravanModule.deleteCaravan('${caravan.id}')">
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
                    <button class="btn-caravan-action" onclick="window.roadToDreamApp.caravanModule.viewCaravan('${caravan.id}')">
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
        // Закрываем все открытые меню
        document.querySelectorAll('.caravan-dropdown-menu').forEach(menu => {
            if (menu.id !== `menu-${caravanId}`) {
                menu.style.display = 'none';
            }
        });

        // Переключаем текущее меню
        const menu = document.getElementById(`menu-${caravanId}`);
        if (menu) {
            const isHidden = menu.style.display === 'none' || menu.style.display === '';
            
            if (isHidden) {
                // Показываем меню
                menu.style.display = 'block';
                
                // Простое позиционирование рядом с кнопкой
                menu.style.top = '100%';
                menu.style.bottom = 'auto';
            } else {
                menu.style.display = 'none';
            }
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
        document.querySelectorAll('.caravan-dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }

    // Показать модальное окно подтверждения удаления
    showDeleteConfirmationModal(caravan) {
        this.caravanToDelete = caravan;
        const modal = document.getElementById('delete-confirmation-modal');
        const caravanNameElement = document.getElementById('delete-caravan-name');
        
        if (modal && caravanNameElement) {
            caravanNameElement.textContent = `"${caravan.name}"`;
            modal.classList.remove('hidden');
            
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
            modal.classList.add('hidden');
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
            modal.classList.remove('hidden');
            
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
            modal.classList.add('hidden');
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
            modal.classList.remove('hidden');
            
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
            modal.classList.add('hidden');
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
            modal.classList.remove('hidden');
        }
    }

    // Закрыть модальное окно поделиться ссылкой
    closeShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.classList.add('hidden');
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
