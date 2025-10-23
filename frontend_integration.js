// Интеграция фронтенда с новым API
// Добавьте эти функции в ваш script.js

class APIIntegration {
    constructor() {
        this.baseURL = "https://road-to-your-dream-app-imtd.onrender.com";
        this.user = null;
    }

    // 1. Авторизация через Telegram WebApp
    async authWithTelegram() {
        try {
            if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
                console.log('Telegram WebApp данные недоступны');
                return null;
            }

            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            
            const authData = {
                telegram_id: tgUser.id,
                username: tgUser.username,
                first_name: tgUser.first_name,
                last_name: tgUser.last_name,
                photo_url: tgUser.photo_url
            };

            console.log('🔐 Отправляем данные авторизации:', authData);

            const response = await fetch(`${this.baseURL}/auth/telegram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authData)
            });

            if (response.ok) {
                const userData = await response.json();
                this.user = userData;
                console.log('✅ Пользователь авторизован:', userData);
                return userData;
            } else {
                console.error('❌ Ошибка авторизации:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при авторизации:', error);
            return null;
        }
    }

    // 2. Получение всех данных пользователя
    async getUserData(telegramId) {
        try {
            const response = await fetch(`${this.baseURL}/users/${telegramId}/data`);
            
            if (response.ok) {
                const userData = await response.json();
                console.log('📊 Данные пользователя получены:', userData);
                return userData;
            } else {
                console.error('❌ Ошибка получения данных:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при получении данных:', error);
            return null;
        }
    }

    // 3. Создание целей
    async createGoals(telegramId, goals) {
        try {
            const response = await fetch(`${this.baseURL}/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: telegramId,
                    goals: goals
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('🎯 Цели созданы:', result);
                return result;
            } else {
                console.error('❌ Ошибка создания целей:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при создании целей:', error);
            return null;
        }
    }

    // 4. Создание карт
    async createCards(telegramId, cards) {
        try {
            const response = await fetch(`${this.baseURL}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: telegramId,
                    cards: cards
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('🃏 Карты созданы:', result);
                return result;
            } else {
                console.error('❌ Ошибка создания карт:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при создании карт:', error);
            return null;
        }
    }

    // 5. Отметка выполнения действия
    async completeAction(telegramId) {
        try {
            const response = await fetch(`${this.baseURL}/actions/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: telegramId
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Действие отмечено:', result);
                return result;
            } else {
                console.error('❌ Ошибка отметки действия:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при отметке действия:', error);
            return null;
        }
    }

    // 6. Получение мотивации от AI
    async getAIMotivation(event) {
        try {
            const response = await fetch(`${this.baseURL}/ai/motivation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: event
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('🤖 AI мотивация получена:', result);
                return result;
            } else {
                console.error('❌ Ошибка получения мотивации:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при получении мотивации:', error);
            return null;
        }
    }

    // 7. Получение карт пользователя
    async getUserCards(telegramId, cardType = null, status = null) {
        try {
            let url = `${this.baseURL}/cards/${telegramId}`;
            const params = new URLSearchParams();
            
            if (cardType) params.append('card_type', cardType);
            if (status) params.append('status', status);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await fetch(url);
            
            if (response.ok) {
                const cards = await response.json();
                console.log('🃏 Карты получены:', cards);
                return cards;
            } else {
                console.error('❌ Ошибка получения карт:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Ошибка при получении карт:', error);
            return null;
        }
    }
}

// Глобальный экземпляр API
window.apiIntegration = new APIIntegration();
