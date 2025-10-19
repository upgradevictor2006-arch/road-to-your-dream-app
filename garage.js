// ============================================
//   МОДУЛЬ ГАРАЖА - ОТДЕЛЬНЫЙ ФАЙЛ
//   Отдельный файл для избежания конфликтов
// ============================================

class GarageModule {
    constructor(app) {
        this.app = app;
        console.log('🏠 GarageModule инициализирован');
        
        // Инициализируем модуль профиля для функциональности
        if (typeof UserProfile !== 'undefined') {
            this.userProfileModule = new UserProfile(this);
            console.log('Модуль профиля инициализирован в гараже');
        } else {
            console.error('UserProfile не найден! Проверьте загрузку profile.js');
            this.userProfileModule = null;
        }
    }

    // Рендеринг экрана гаража (использует функциональность профиля)
    renderGarageScreen() {
        console.log('🎯 Рендерим экран гаража...');
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="garage-screen">
                <!-- Премиальный Header Профиля -->
                <div class="profile-header-premium">
                    <div class="profile-background"></div>
                    <div class="profile-content">
                        <div class="profile-avatar-container">
                            <div class="avatar-ring"></div>
                            <div class="avatar-ring-inner"></div>
                            <img id="user-avatar-img" class="profile-avatar" src="" alt="Аватар пользователя">
                            <div class="level-badge">
                                <span id="user-level">1</span>
                            </div>
                        </div>
                        <div class="profile-info">
                            <h1 id="user-name" class="profile-name">Загрузка...</h1>
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

                <!-- Быстрая статистика -->
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

                <!-- Календарь активности -->
                <div class="section-card">
                    <div class="section-header">
                        <h3>Активность</h3>
                        <span class="badge-count">7 дней</span>
                    </div>
                    <div class="week-calendar">
                        <div class="calendar-day">
                            <div class="day-label">Пн</div>
                            <div class="day-indicator active"></div>
                        </div>
                        <div class="calendar-day">
                            <div class="day-label">Вт</div>
                            <div class="day-indicator active"></div>
                        </div>
                        <div class="calendar-day">
                            <div class="day-label">Ср</div>
                            <div class="day-indicator active"></div>
                        </div>
                        <div class="calendar-day today">
                            <div class="day-label">Чт</div>
                            <div class="day-indicator"></div>
                        </div>
                        <div class="calendar-day">
                            <div class="day-label">Пт</div>
                            <div class="day-indicator"></div>
                        </div>
                        <div class="calendar-day">
                            <div class="day-label">Сб</div>
                            <div class="day-indicator"></div>
                        </div>
                        <div class="calendar-day">
                            <div class="day-label">Вс</div>
                            <div class="day-indicator"></div>
                        </div>
                    </div>
                </div>

                <!-- Достижения -->
                <div class="section-card">
                    <div class="section-header">
                        <h3>Достижения</h3>
                        <span class="badge-count">2/5</span>
                    </div>
                    <div class="achievements-grid">
                        <div class="achievement-card unlocked">
                            <div class="achievement-icon-large">🎯</div>
                            <div class="achievement-name">Первая цель</div>
                            <div class="achievement-desc">Завершите свою первую цель</div>
                            <div class="achievement-progress">Получено!</div>
                        </div>
                        <div class="achievement-card unlocked">
                            <div class="achievement-icon-large">🔥</div>
                            <div class="achievement-name">Страстный</div>
                            <div class="achievement-desc">7 дней активности подряд</div>
                            <div class="achievement-progress">Получено!</div>
                        </div>
                        <div class="achievement-card in-progress">
                            <div class="achievement-icon-large">💎</div>
                            <div class="achievement-name">Перфекционист</div>
                            <div class="achievement-desc">Завершите 10 целей</div>
                            <div class="progress-bar-small">
                                <div class="progress-fill-small" style="width: 30%"></div>
                            </div>
                            <div class="achievement-progress">3/10</div>
                        </div>
                        <div class="achievement-card locked">
                            <div class="achievement-icon-large">🏆</div>
                            <div class="achievement-name">Легенда</div>
                            <div class="achievement-desc">Достигните 10 уровня</div>
                            <div class="achievement-progress">Заблокировано</div>
                        </div>
                    </div>
                </div>

                <!-- Реферальная программа -->
                <div class="section-card referral-card-new">
                    <div class="referral-banner">
                        <div class="referral-icon">👥</div>
                        <div class="referral-content">
                            <h3>Пригласите друзей</h3>
                            <p>Получайте бонусы за каждого друга</p>
                        </div>
                    </div>
                    <div class="referral-stats">
                        <div class="referral-stat">
                            <span class="stat-number" id="referral-count">0</span>
                            <span class="stat-text">Друзей приглашено</span>
                        </div>
                        <div class="referral-stat">
                            <span class="stat-number" id="referral-bonus">0</span>
                            <span class="stat-text">Бонусов получено</span>
                        </div>
                    </div>
                    <button id="invite-btn" class="btn-premium">
                        <span class="btn-icon">📤</span>
                        Пригласить друзей
                    </button>
                </div>

                <!-- Мотивационная цитата -->
                <div class="quote-card">
                    <div class="quote-icon">💫</div>
                    <div class="quote-text-new">Путешествие в тысячу миль начинается с одного шага.</div>
                    <div class="quote-author-new">— Лао-цзы</div>
                </div>
            </div>
        `;
        
        // Инициализируем профиль после рендеринга
        if (this.userProfileModule) {
            this.userProfileModule.initialize();
        }
    }
}

// Экспортируем класс для использования в основном приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GarageModule;
} else if (typeof window !== 'undefined') {
    window.GarageModule = GarageModule;
}
