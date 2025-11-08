// ============================================
//   МОДУЛЬ ГАРАЖА - ОБЪЕДИНЕННЫЙ ФАЙЛ
//   Включает функциональность профиля пользователя
// ============================================

class GarageModule {
    constructor(app) {
        this.app = app;
        console.log('🏠 GarageModule инициализирован');
    }

    // Рендеринг экрана гаража (использует функциональность профиля)
    renderGarageScreen() {
        console.log('🎯 Рендерим экран гаража...');
        const appContainer = document.getElementById('app-container');
        
        if (!appContainer) {
            console.error('❌ Контейнер app-container не найден!');
            return;
        }
        
        console.log('✅ Контейнер найден, начинаем рендеринг...');
        appContainer.innerHTML = `
            <div class="garage-screen">
                <!-- Премиальный Header Профиля -->
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
        
        console.log('✅ HTML рендеринг завершен, инициализируем профиль...');
        
        // Инициализируем профиль после рендеринга
        this.initializeUserProfile();
        
        console.log('✅ Рендеринг гаража полностью завершен');
    }

    // Получение аватара пользователя из Telegram
    getUserAvatar() {
        console.log('🔍 Получаем аватар пользователя из Telegram...');
        
        // Проверяем наличие Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            console.log('✅ Telegram WebApp найден');
            
            // Получаем данные пользователя
            const user = window.Telegram.WebApp.initDataUnsafe?.user;
            
            if (user) {
                console.log('👤 Данные пользователя:', user);
                
                // Проверяем наличие аватарки
                if (user.photo_url) {
                    console.log('📸 Найдена аватарка:', user.photo_url);
                    return user.photo_url;
                } else {
                    console.log('❌ Аватарка не найдена в данных пользователя');
                }
            } else {
                console.log('❌ Данные пользователя не найдены');
            }
        } else {
            console.log('❌ Telegram WebApp не найден');
        }
        
        // Fallback аватар - красивый SVG с инициалами или дефолтной иконкой
        return this.generateFallbackAvatar();
    }

    // Генерация fallback аватара
    generateFallbackAvatar() {
        // Пытаемся получить инициалы пользователя
        let initials = 'U';
        
        if (window.Telegram && window.Telegram.WebApp?.initDataUnsafe?.user) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user.first_name) {
                initials = user.first_name.charAt(0).toUpperCase();
                if (user.last_name) {
                    initials += user.last_name.charAt(0).toUpperCase();
                }
            }
        }
        
        // Создаем SVG аватар с инициалами (используем только Latin1 символы)
        const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#f4bd41;stop-opacity:1" />
<stop offset="100%" style="stop-color:#007bff;stop-opacity:1" />
</linearGradient>
</defs>
<circle cx="50" cy="50" r="50" fill="url(#avatarGradient)"/>
<text x="50" y="60" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#1a1a1a">${initials}</text>
</svg>`;
        
        try {
            return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        } catch (error) {
            console.error('Ошибка кодирования SVG:', error);
            // Возвращаем простой fallback аватар
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImF2YXRhckdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y0YmQ0MTtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDA3YmZmO3N0b3Atb3BhY2l0eToxIiAvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSJ1cmwoI2F2YXRhckdyYWRpZW50KSIvPgo8dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMxYTFhMWEiPlU8L3RleHQ+Cjwvc3ZnPgo=';
        }
    }

    // Загрузка профиля пользователя из Telegram или БД
    async loadUserProfile() {
        console.log('👤 Загружаем профиль пользователя...');
        
        // Сначала пытаемся загрузить из БД, если есть telegram_id
        if (this.app?.user?.telegram_id && window.apiIntegration) {
            try {
                const userData = await window.apiIntegration.getUserData(this.app.user.telegram_id);
                if (userData && userData.user) {
                    const dbUser = userData.user;
                    
                    // Обновляем имя пользователя из БД
                    const userNameElement = document.getElementById('user-name');
                    if (userNameElement) {
                        const displayName = (dbUser.first_name || '') + (dbUser.last_name ? ' ' + dbUser.last_name : '');
                        userNameElement.textContent = displayName || 'Пользователь';
                        console.log('📝 Имя пользователя из БД:', displayName);
                    }
                    
                    // Обновляем аватарку из БД
                    const avatarElement = document.getElementById('user-avatar-img');
                    if (avatarElement && dbUser.photo_url) {
                        avatarElement.src = dbUser.photo_url;
                        avatarElement.alt = `Аватар ${dbUser.first_name || 'пользователя'}`;
                        console.log('🖼️ Аватарка из БД обновлена');
                    } else if (avatarElement) {
                        // Используем fallback аватар
                        avatarElement.src = this.getUserAvatar();
                    }
                    
                    return;
                }
            } catch (error) {
                console.error('❌ Ошибка загрузки профиля из БД:', error);
            }
        }
        
        // Fallback: загружаем из Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            
            if (user) {
                console.log('✅ Пользователь найден в Telegram:', user);
                
                // Обновляем имя пользователя
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    const displayName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
                    userNameElement.textContent = displayName;
                    console.log('📝 Имя пользователя установлено:', displayName);
                }
                
                // Обновляем аватарку
                const avatarElement = document.getElementById('user-avatar-img');
                if (avatarElement) {
                    const avatarUrl = this.getUserAvatar();
                    avatarElement.src = avatarUrl;
                    avatarElement.alt = `Аватар ${user.first_name}`;
                    console.log('🖼️ Аватарка обновлена');
                }
                
                // Можно добавить дополнительную информацию о пользователе
                if (user.username) {
                    console.log('🔗 Username:', user.username);
                }
                
            } else {
                console.log('❌ Данные пользователя не найдены');
                // Устанавливаем дефолтное имя
                const userNameElement = document.getElementById('user-name');
                if (userNameElement) {
                    userNameElement.textContent = 'Пользователь';
                }
            }
        } else {
            console.log('❌ Telegram WebApp не найден, используем дефолтные данные');
            // Устанавливаем дефолтное имя
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = 'Пользователь';
            }
        }
    }

    // Загрузка статистики пользователя из базы данных
    async loadUserStats() {
        console.log('📊 Загружаем статистику пользователя из БД...');
        
        // Проверяем наличие пользователя и API интеграции
        if (!this.app?.user?.telegram_id) {
            console.log('⚠️ Telegram ID не найден, используем демо-данные');
            this.updateUserStats({
                completedGoals: 0,
                currentStreak: 0,
                totalSteps: 0,
                level: 1,
                currentExp: 0,
                nextLevelExp: 100,
                referralCount: 0,
                referralBonus: 0
            });
            return;
        }
        
        if (!window.apiIntegration) {
            console.log('⚠️ API интеграция не найдена, используем демо-данные');
            this.updateUserStats({
                completedGoals: 0,
                currentStreak: 0,
                totalSteps: 0,
                level: 1,
                currentExp: 0,
                nextLevelExp: 100,
                referralCount: 0,
                referralBonus: 0
            });
            return;
        }
        
        try {
            // Загружаем данные пользователя из БД
            const userData = await window.apiIntegration.getUserData(this.app.user.telegram_id);
            
            if (!userData) {
                console.log('⚠️ Данные пользователя не получены, используем демо-данные');
                this.updateUserStats({
                    completedGoals: 0,
                    currentStreak: 0,
                    totalSteps: 0,
                    level: 1,
                    currentExp: 0,
                    nextLevelExp: 100,
                    referralCount: 0,
                    referralBonus: 0
                });
                return;
            }
            
            // Вычисляем статистику из реальных данных
            const stats = this.calculateStatsFromUserData(userData);
            
            // Обновляем статистику в UI
            this.updateUserStats(stats);
            
            // Обновляем календарь активности
            this.updateActivityCalendar(userData.daily_actions || []);
            
            // Обновляем достижения
            this.updateAchievements(userData);
            
            console.log('✅ Статистика загружена из БД:', stats);
        } catch (error) {
            console.error('❌ Ошибка загрузки статистики:', error);
            // Используем демо-данные при ошибке
            this.updateUserStats({
                completedGoals: 0,
                currentStreak: 0,
                totalSteps: 0,
                level: 1,
                currentExp: 0,
                nextLevelExp: 100,
                referralCount: 0,
                referralBonus: 0
            });
        }
    }
    
    // Вычисление статистики из данных пользователя
    calculateStatsFromUserData(userData) {
        const goals = userData.goals || [];
        const dailyActions = userData.daily_actions || [];
        const cards = userData.cards || [];
        
        // Количество завершенных целей
        const completedGoals = goals.filter(g => g.is_completed).length;
        
        // Вычисляем streak (серию дней подряд)
        const currentStreak = this.calculateStreak(dailyActions);
        
        // Общее количество шагов (из карт или целей)
        const totalSteps = this.calculateTotalSteps(cards, goals);
        
        // Вычисляем уровень и опыт на основе активности
        const { level, currentExp, nextLevelExp } = this.calculateLevelAndExp(
            completedGoals,
            dailyActions.length,
            currentStreak
        );
        
        return {
            completedGoals,
            currentStreak,
            totalSteps,
            level,
            currentExp,
            nextLevelExp,
            referralCount: 0, // TODO: добавить реферальную систему
            referralBonus: 0  // TODO: добавить реферальную систему
        };
    }
    
    // Вычисление streak (серии дней подряд)
    calculateStreak(dailyActions) {
        if (!dailyActions || dailyActions.length === 0) return 0;
        
        // Сортируем действия по дате (от новых к старым)
        const sortedActions = [...dailyActions]
            .map(a => new Date(a.action_date))
            .sort((a, b) => b - a);
        
        if (sortedActions.length === 0) return 0;
        
        // Проверяем, есть ли действие сегодня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const latestAction = sortedActions[0];
        latestAction.setHours(0, 0, 0, 0);
        
        // Если последнее действие не сегодня, streak = 0
        if (latestAction.getTime() !== today.getTime()) {
            return 0;
        }
        
        // Считаем последовательные дни
        let streak = 1;
        let expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - 1);
        
        for (let i = 1; i < sortedActions.length; i++) {
            const actionDate = sortedActions[i];
            actionDate.setHours(0, 0, 0, 0);
            
            if (actionDate.getTime() === expectedDate.getTime()) {
                streak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Вычисление общего количества шагов
    calculateTotalSteps(cards, goals) {
        // Считаем шаги из карт (если есть метаданные с шагами)
        let totalSteps = 0;
        
        cards.forEach(card => {
            if (card.metadata && card.metadata.totalSteps) {
                totalSteps += card.metadata.totalSteps;
            }
        });
        
        // Если нет шагов в картах, считаем по количеству целей
        if (totalSteps === 0) {
            totalSteps = goals.length;
        }
        
        return totalSteps;
    }
    
    // Вычисление уровня и опыта
    calculateLevelAndExp(completedGoals, totalActions, streak) {
        // Базовая формула: опыт = завершенные цели * 50 + действия * 5 + streak * 10
        const baseExp = completedGoals * 50 + totalActions * 5 + streak * 10;
        
        // Уровень = квадратный корень от опыта / 10 (округлено вниз) + 1
        const level = Math.floor(Math.sqrt(baseExp / 10)) + 1;
        
        // Опыт для текущего уровня
        const expForCurrentLevel = Math.pow((level - 1) * 10, 2);
        const expForNextLevel = Math.pow(level * 10, 2);
        
        const currentExp = baseExp - expForCurrentLevel;
        const nextLevelExp = expForNextLevel - expForCurrentLevel;
        
        return {
            level: Math.max(1, level),
            currentExp: Math.max(0, currentExp),
            nextLevelExp: Math.max(100, nextLevelExp)
        };
    }
    
    // Обновление календаря активности
    updateActivityCalendar(dailyActions) {
        console.log('📅 Обновляем календарь активности...');
        
        // Создаем map дат для быстрого поиска
        const actionDates = new Set();
        dailyActions.forEach(action => {
            const date = new Date(action.action_date);
            date.setHours(0, 0, 0, 0);
            actionDates.add(date.getTime());
        });
        
        // Обновляем индикаторы дней
        const calendarDays = document.querySelectorAll('.calendar-day');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Получаем начало недели (понедельник)
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Понедельник = 0
        startOfWeek.setDate(today.getDate() - diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        calendarDays.forEach((dayElement, index) => {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + index);
            dayDate.setHours(0, 0, 0, 0);
            
            const indicator = dayElement.querySelector('.day-indicator');
            if (indicator) {
                // Убираем класс today, если он есть
                dayElement.classList.remove('today');
                
                // Проверяем, является ли день сегодняшним
                if (dayDate.getTime() === today.getTime()) {
                    dayElement.classList.add('today');
                }
                
                // Проверяем, есть ли активность в этот день
                if (actionDates.has(dayDate.getTime())) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            }
        });
        
        console.log('✅ Календарь активности обновлен');
    }
    
    // Обновление достижений
    updateAchievements(userData) {
        console.log('🏆 Обновляем достижения...');
        
        const goals = userData.goals || [];
        const dailyActions = userData.daily_actions || [];
        const completedGoals = goals.filter(g => g.is_completed).length;
        const streak = this.calculateStreak(dailyActions);
        const { level } = this.calculateLevelAndExp(completedGoals, dailyActions.length, streak);
        
        // Обновляем достижения
        const achievements = [
            {
                id: 'first-goal',
                unlocked: completedGoals >= 1,
                progress: completedGoals >= 1 ? 1 : 0,
                maxProgress: 1
            },
            {
                id: 'passionate',
                unlocked: streak >= 7,
                progress: Math.min(streak, 7),
                maxProgress: 7
            },
            {
                id: 'perfectionist',
                unlocked: completedGoals >= 10,
                progress: Math.min(completedGoals, 10),
                maxProgress: 10
            },
            {
                id: 'legend',
                unlocked: level >= 10,
                progress: Math.min(level, 10),
                maxProgress: 10
            }
        ];
        
        // Обновляем UI достижений
        const achievementsGrid = document.querySelector('.achievements-grid');
        if (achievementsGrid) {
            achievementsGrid.innerHTML = achievements.map(achievement => {
                const isUnlocked = achievement.unlocked;
                const isInProgress = !isUnlocked && achievement.progress > 0;
                const isLocked = !isUnlocked && achievement.progress === 0;
                
                let achievementHTML = '';
                
                if (achievement.id === 'first-goal') {
                    achievementHTML = `
                        <div class="achievement-card ${isUnlocked ? 'unlocked' : isInProgress ? 'in-progress' : 'locked'}">
                            <div class="achievement-icon-large">🎯</div>
                            <div class="achievement-name">Первая цель</div>
                            <div class="achievement-desc">Завершите свою первую цель</div>
                            ${isUnlocked ? '<div class="achievement-progress">Получено!</div>' : 
                              isInProgress ? `<div class="progress-bar-small"><div class="progress-fill-small" style="width: ${(achievement.progress / achievement.maxProgress) * 100}%"></div></div><div class="achievement-progress">${achievement.progress}/${achievement.maxProgress}</div>` :
                              '<div class="achievement-progress">Заблокировано</div>'}
                        </div>
                    `;
                } else if (achievement.id === 'passionate') {
                    achievementHTML = `
                        <div class="achievement-card ${isUnlocked ? 'unlocked' : isInProgress ? 'in-progress' : 'locked'}">
                            <div class="achievement-icon-large">🔥</div>
                            <div class="achievement-name">Страстный</div>
                            <div class="achievement-desc">7 дней активности подряд</div>
                            ${isUnlocked ? '<div class="achievement-progress">Получено!</div>' : 
                              isInProgress ? `<div class="progress-bar-small"><div class="progress-fill-small" style="width: ${(achievement.progress / achievement.maxProgress) * 100}%"></div></div><div class="achievement-progress">${achievement.progress}/${achievement.maxProgress}</div>` :
                              '<div class="achievement-progress">Заблокировано</div>'}
                        </div>
                    `;
                } else if (achievement.id === 'perfectionist') {
                    achievementHTML = `
                        <div class="achievement-card ${isUnlocked ? 'unlocked' : isInProgress ? 'in-progress' : 'locked'}">
                            <div class="achievement-icon-large">💎</div>
                            <div class="achievement-name">Перфекционист</div>
                            <div class="achievement-desc">Завершите 10 целей</div>
                            ${isUnlocked ? '<div class="achievement-progress">Получено!</div>' : 
                              isInProgress ? `<div class="progress-bar-small"><div class="progress-fill-small" style="width: ${(achievement.progress / achievement.maxProgress) * 100}%"></div></div><div class="achievement-progress">${achievement.progress}/${achievement.maxProgress}</div>` :
                              '<div class="achievement-progress">Заблокировано</div>'}
                        </div>
                    `;
                } else if (achievement.id === 'legend') {
                    achievementHTML = `
                        <div class="achievement-card ${isUnlocked ? 'unlocked' : isInProgress ? 'in-progress' : 'locked'}">
                            <div class="achievement-icon-large">🏆</div>
                            <div class="achievement-name">Легенда</div>
                            <div class="achievement-desc">Достигните 10 уровня</div>
                            ${isUnlocked ? '<div class="achievement-progress">Получено!</div>' : 
                              isInProgress ? `<div class="progress-bar-small"><div class="progress-fill-small" style="width: ${(achievement.progress / achievement.maxProgress) * 100}%"></div></div><div class="achievement-progress">${achievement.progress}/${achievement.maxProgress}</div>` :
                              '<div class="achievement-progress">Заблокировано</div>'}
                        </div>
                    `;
                }
                
                return achievementHTML;
            }).join('');
        }
        
        // Обновляем счетчик достижений
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        const badgeCount = document.querySelector('.section-header .badge-count');
        if (badgeCount) {
            badgeCount.textContent = `${unlockedCount}/${achievements.length}`;
        }
        
        console.log('✅ Достижения обновлены');
    }

    // Обновление статистики пользователя
    updateUserStats(stats) {
        // Обновляем уровень
        const levelElement = document.getElementById('user-level');
        const currentLevelElement = document.getElementById('current-level');
        if (levelElement) levelElement.textContent = stats.level;
        if (currentLevelElement) currentLevelElement.textContent = stats.level;

        // Обновляем прогресс опыта
        const currentExpElement = document.getElementById('current-exp');
        const nextLevelExpElement = document.getElementById('next-level-exp');
        const levelProgressElement = document.getElementById('level-progress');
        
        if (currentExpElement) currentExpElement.textContent = stats.currentExp;
        if (nextLevelExpElement) nextLevelExpElement.textContent = stats.nextLevelExp;
        if (levelProgressElement) {
            const progressPercent = (stats.currentExp / stats.nextLevelExp) * 100;
            levelProgressElement.style.width = `${Math.min(progressPercent, 100)}%`;
        }

        // Обновляем быструю статистику
        const completedGoalsElement = document.getElementById('completed-goals');
        const currentStreakElement = document.getElementById('current-streak');
        const totalStepsElement = document.getElementById('total-steps');
        
        if (completedGoalsElement) completedGoalsElement.textContent = stats.completedGoals;
        if (currentStreakElement) currentStreakElement.textContent = stats.currentStreak;
        if (totalStepsElement) totalStepsElement.textContent = stats.totalSteps;

        // Обновляем реферальную статистику
        const referralCountElement = document.getElementById('referral-count');
        const referralBonusElement = document.getElementById('referral-bonus');
        
        if (referralCountElement) referralCountElement.textContent = stats.referralCount;
        if (referralBonusElement) referralBonusElement.textContent = stats.referralBonus;

        console.log('✅ Статистика пользователя обновлена:', stats);
    }

    // Настройка обработчиков событий для профиля
    setupProfileEventListeners() {
        console.log('🎯 Настраиваем обработчики событий для профиля...');
        
        // Приглашение друзей
        const inviteBtn = document.getElementById('invite-btn');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', () => {
                this.showInviteModal();
            });
        }

        // Здесь можно добавить другие обработчики событий
        console.log('✅ Обработчики событий профиля настроены');
    }

    // Показать модальное окно приглашения
    showInviteModal() {
        console.log('📄 Показываем модальное окно приглашения...');
        
        // Здесь можно добавить логику показа модального окна приглашения
        // Пока просто показываем уведомление
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.showAlert('Функция приглашения друзей будет добавлена в следующем обновлении!');
        } else {
            alert('Функция приглашения друзей будет добавлена в следующем обновлении!');
        }
    }

    // Инициализация профиля пользователя
    async initializeUserProfile() {
        console.log('🚀 Инициализируем профиль пользователя...');
        
        // Проверяем наличие элементов перед инициализацией
        const userNameElement = document.getElementById('user-name');
        const avatarElement = document.getElementById('user-avatar-img');
        
        if (!userNameElement) {
            console.error('❌ Элемент user-name не найден!');
        }
        if (!avatarElement) {
            console.error('❌ Элемент user-avatar-img не найден!');
        }
        
        // Загружаем профиль и статистику асинхронно
        await this.loadUserProfile();
        await this.loadUserStats();
        this.setupProfileEventListeners();
        
        console.log('✅ Профиль пользователя инициализирован');
    }
}

// Экспортируем класс для использования в основном приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GarageModule;
} else if (typeof window !== 'undefined') {
    window.GarageModule = GarageModule;
}
