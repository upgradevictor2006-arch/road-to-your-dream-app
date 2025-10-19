// ============================================
//   ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ - ОТДЕЛЬНЫЙ ФАЙЛ
//   Отдельный файл для избежания конфликтов
// ============================================

class UserProfile {
    constructor(app) {
        this.app = app;
        console.log('👤 UserProfile инициализирован');
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

    // Загрузка профиля пользователя из Telegram
    loadUserProfile() {
        console.log('👤 Загружаем профиль пользователя из Telegram...');
        
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            
            if (user) {
                console.log('✅ Пользователь найден:', user);
                
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

    // Загрузка статистики пользователя
    loadUserStats() {
        console.log('📊 Загружаем статистику пользователя...');
        
        // Здесь можно добавить загрузку статистики из API
        // Пока используем демо-данные
        this.updateUserStats({
            completedGoals: 3,
            currentStreak: 7,
            totalSteps: 25,
            level: 1,
            currentExp: 35,
            nextLevelExp: 100,
            referralCount: 0,
            referralBonus: 0
        });
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

    // Инициализация профиля
    initialize() {
        console.log('🚀 Инициализируем профиль пользователя...');
        
        this.loadUserProfile();
        this.loadUserStats();
        this.setupProfileEventListeners();
        
        console.log('✅ Профиль пользователя инициализирован');
    }
}

// Экспортируем класс для использования в основном приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserProfile;
} else if (typeof window !== 'undefined') {
    window.UserProfile = UserProfile;
}
