/**
 * Скрипт для отладки интеграции
 * Выполните в консоли браузера после загрузки страницы
 */

console.log('🔍 Проверка интеграции...\n');

// Проверка загруженных скриптов
function checkIntegration() {
    console.log('📋 Проверка модулей:\n');
    
    // 1. Проверка API интеграции
    console.log('1. API интеграция (frontend_integration.js):');
    if (typeof window.apiIntegration !== 'undefined') {
        console.log('   ✅ Загружена');
        console.log('   - baseURL:', window.apiIntegration.baseURL);
        console.log('   - user:', window.apiIntegration.user);
    } else {
        console.log('   ❌ НЕ загружена');
        console.log('   ⚠️ Проверьте подключение frontend_integration.js в index.html');
    }
    
    // 2. Проверка ИИ-менеджера фронтенд
    console.log('\n2. ИИ-менеджер клиент (ai_manager_frontend.js):');
    if (typeof getAIManager !== 'undefined') {
        console.log('   ✅ Загружен');
        try {
            const manager = getAIManager();
            console.log('   - manager:', manager ? '✅' : '❌');
            console.log('   - telegramId:', manager?.telegramId || 'не установлен');
        } catch (e) {
            console.log('   ❌ Ошибка инициализации:', e.message);
        }
    } else {
        console.log('   ❌ НЕ загружен');
        console.log('   ⚠️ Проверьте подключение ai_manager_frontend.js в index.html');
    }
    
    // 3. Проверка ИИ UI
    console.log('\n3. ИИ-менеджер UI (ai_manager_ui.js):');
    if (typeof initAIManagerUI !== 'undefined') {
        console.log('   ✅ Загружен');
        console.log('   - aiManagerUI:', window.aiManagerUI ? '✅' : '❌ (еще не инициализирован)');
    } else {
        console.log('   ❌ НЕ загружен');
        console.log('   ⚠️ Проверьте подключение ai_manager_ui.js в index.html');
    }
    
    // 4. Проверка приложения
    console.log('\n4. Основное приложение (script.js):');
    if (typeof window.roadToDreamApp !== 'undefined') {
        console.log('   ✅ Загружено');
        console.log('   - текущий экран:', window.roadToDreamApp.currentScreen);
        console.log('   - пользователь:', window.roadToDreamApp.user ? '✅' : '❌');
    } else {
        console.log('   ❌ НЕ загружено');
    }
    
    // 5. Проверка Telegram WebApp
    console.log('\n5. Telegram WebApp:');
    if (window.Telegram && window.Telegram.WebApp) {
        console.log('   ✅ Обнаружен');
        const tg = window.Telegram.WebApp;
        console.log('   - версия:', tg.version);
        console.log('   - платформа:', tg.platform);
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            console.log('   - пользователь:', tg.initDataUnsafe.user.id);
        }
    } else {
        console.log('   ⚠️ Не обнаружен (работаете вне Telegram)');
    }
    
    // 6. Проверка API сервера
    console.log('\n6. Проверка API сервера:');
    fetch('https://road-to-your-dream-app-imtd.onrender.com/')
        .then(r => r.json())
        .then(data => {
            console.log('   ✅ API сервер доступен:', data);
            
            // Проверка ИИ-менеджера
            return fetch('https://road-to-your-dream-app-imtd.onrender.com/ai/manager/stats');
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log('   ✅ ИИ-менеджер на сервере работает');
            } else {
                console.log('   ❌ ИИ-менеджер на сервере не работает:', data);
            }
        })
        .catch(err => {
            console.log('   ❌ Ошибка проверки API:', err.message);
        });
    
    console.log('\n✅ Проверка завершена!');
    console.log('\n💡 Если что-то не работает:');
    console.log('   1. Обновите страницу с очисткой кэша (Ctrl+Shift+R)');
    console.log('   2. Проверьте Network tab в DevTools - все ли скрипты загрузились?');
    console.log('   3. Проверьте консоль на ошибки загрузки');
}

// Запускаем проверку
checkIntegration();

