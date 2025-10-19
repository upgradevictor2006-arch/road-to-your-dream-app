// ============================================
//   МОДУЛЬ ГАРАЖА - ОТДЕЛЬНЫЙ ФАЙЛ
//   Отдельный файл для избежания конфликтов
// ============================================

class GarageModule {
    constructor(app) {
        this.app = app;
        console.log('🏠 GarageModule инициализирован');
    }

    // Рендеринг экрана гаража
    renderGarageScreen() {
        console.log('🎯 Рендерим экран гаража...');
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = `
            <div class="garage-screen">
                <h1>🏠 Гараж</h1>
                <p>Здесь будут инструменты и настройки</p>
                
                <!-- Планируемые функции гаража -->
                <div class="garage-features">
                    <div class="feature-card">
                        <div class="feature-icon">⚙️</div>
                        <div class="feature-title">Настройки</div>
                        <div class="feature-description">Персонализация приложения</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">Аналитика</div>
                        <div class="feature-description">Статистика достижений</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <div class="feature-title">Темы</div>
                        <div class="feature-description">Смена внешнего вида</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔧</div>
                        <div class="feature-title">Инструменты</div>
                        <div class="feature-description">Дополнительные функции</div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Экспортируем класс для использования в основном приложении
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GarageModule;
} else if (typeof window !== 'undefined') {
    window.GarageModule = GarageModule;
}
