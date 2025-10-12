// JavaScript для Telegram Mini App "Road to Your Dream"

const BACKEND_BASE_URL = "https://road-to-your-dream-app-imtd.onrender.com";

class RoadToDreamApp {
    constructor() {
        console.log('RoadToDreamApp constructor called');
        this.currentScreen = 'map';
        this.caravans = this.loadCaravans(); // Загружаем сохраненные караваны
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
        // TODO: Реализовать логику создания карты
        alert('Функция создания карты будет реализована позже!');
    }

    // Рендеринг экрана каравана
    renderCaravanScreen() {
        const appContainer = document.getElementById('app-container');
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
                            <button class="create-caravan-button" onclick="window.roadToDreamApp.showCreateCaravanModal()">
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
            
            <!-- Модальное окно создания каравана -->
            <div id="create-caravan-modal" class="modal-overlay hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Создать новый караван</h3>
                        <button class="modal-close" onclick="window.roadToDreamApp.closeCreateCaravanModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="create-caravan-form" class="caravan-form">
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
                            
                            <div class="form-group">
                                <label for="caravan-goal" class="form-label">Общая цель</label>
                                <select id="caravan-goal" class="form-select" required>
                                    <option value="">Выберите общую цель</option>
                                    <option value="fitness">💪 Фитнес и здоровье</option>
                                    <option value="career">🚀 Карьера и развитие</option>
                                    <option value="education">📚 Обучение и навыки</option>
                                    <option value="travel">✈️ Путешествия</option>
                                    <option value="business">💼 Бизнес и предпринимательство</option>
                                    <option value="creativity">🎨 Творчество и искусство</option>
                                    <option value="family">👨‍👩‍👧‍👦 Семья и отношения</option>
                                    <option value="finance">💰 Финансы и инвестиции</option>
                                    <option value="spirituality">🧘 Духовность и саморазвитие</option>
                                    <option value="other">🌟 Другое</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="caravan-description" class="form-label">Описание (необязательно)</label>
                                <textarea 
                                    id="caravan-description" 
                                    class="form-textarea" 
                                    placeholder="Расскажите подробнее о ваших планах..."
                                    maxlength="200"
                                    rows="3"
                                ></textarea>
                                <div class="form-hint">Максимум 200 символов</div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn-secondary" onclick="window.roadToDreamApp.closeCreateCaravanModal()">
                                    Отмена
                                </button>
                                <button type="submit" class="btn-primary">
                                    Создать караван
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем обработчик формы
        const form = appContainer.querySelector('#create-caravan-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateCaravan();
            });
        }
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

    // Показать модальное окно создания каравана
    showCreateCaravanModal() {
        const modal = document.getElementById('create-caravan-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Фокусируемся на первом поле
            const nameInput = document.getElementById('caravan-name');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        }
    }

    // Закрыть модальное окно создания каравана
    closeCreateCaravanModal() {
        const modal = document.getElementById('create-caravan-modal');
        if (modal) {
            modal.classList.add('hidden');
            // Очищаем форму
            const form = document.getElementById('create-caravan-form');
            if (form) {
                form.reset();
            }
        }
    }

    // Обработка создания каравана
    handleCreateCaravan() {
        const nameInput = document.getElementById('caravan-name');
        const goalSelect = document.getElementById('caravan-goal');
        const descriptionTextarea = document.getElementById('caravan-description');

        if (!nameInput || !goalSelect) {
            console.error('Не найдены поля формы');
            return;
        }

        const caravanData = {
            name: nameInput.value.trim(),
            goal: goalSelect.value,
            description: descriptionTextarea ? descriptionTextarea.value.trim() : ''
        };

        // Валидация
        if (!caravanData.name) {
            alert('Пожалуйста, введите название команды');
            nameInput.focus();
            return;
        }

        if (!caravanData.goal) {
            alert('Пожалуйста, выберите общую цель');
            goalSelect.focus();
            return;
        }

        if (caravanData.name.length > 50) {
            alert('Название команды не должно превышать 50 символов');
            nameInput.focus();
            return;
        }

        if (caravanData.description.length > 200) {
            alert('Описание не должно превышать 200 символов');
            descriptionTextarea.focus();
            return;
        }

        console.log('Создание каравана:', caravanData);

        // Добавляем караван в список
        const newCaravan = this.addCaravan(caravanData);
        
        // Закрываем модальное окно
        this.closeCreateCaravanModal();
        
        // Показываем уведомление об успехе
        this.showNotification('Караван "' + caravanData.name + '" успешно создан!', 'success');
        
        // Обновляем экран каравана для отображения нового каравана
        setTimeout(() => {
            this.renderCaravanScreen();
        }, 1000);
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
        return goals[goalValue] || '🌟 Другое';
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
                    <div class="caravan-status ${caravan.status}">${caravan.status === 'active' ? 'Активен' : 'Неактивен'}</div>
                </div>
                <div class="caravan-goal">${this.getGoalName(caravan.goal)}</div>
                ${caravan.description ? `<div class="caravan-description">${caravan.description}</div>` : ''}
                <div class="caravan-meta">
                    <div class="caravan-members">👥 ${caravan.members} участник${caravan.members === 1 ? '' : caravan.members < 5 ? 'а' : 'ов'}</div>
                    <div class="caravan-date">${this.formatDate(caravan.createdAt)}</div>
                </div>
                <div class="caravan-actions">
                    <button class="btn-caravan-action" onclick="window.roadToDreamApp.viewCaravan('${caravan.id}')">
                        Открыть
                    </button>
                    <button class="btn-caravan-action secondary" onclick="window.roadToDreamApp.editCaravan('${caravan.id}')">
                        Редактировать
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

    // Редактирование каравана (заглушка)
    editCaravan(caravanId) {
        const caravan = this.caravans.find(c => c.id === caravanId);
        if (caravan) {
            alert(`Редактирование каравана "${caravan.name}"\n\nФункция редактирования будет реализована позже!`);
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
