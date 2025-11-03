// Экран загрузки и онбординга для приложения "Road to Your Dream"
// Отдельный файл для избежания конфликтов

class LoadingScreen {
    constructor() {
        this.onboardingCompleted = localStorage.getItem('roadToDreamOnboardingCompleted') === 'true';
        this.currentOnboardingStep = 0;
        this.appTitle = 'ROAD TO YOUR DREAM';
        this.titleWords = this.appTitle.split(' ');
        this.onboardingSteps = [
            {
                highlightedWord: 0, // ROAD
                title: 'Добро пожаловать!',
                text: 'Создавайте карту своих целей и двигайтесь к мечте шаг за шагом. Каждая цель - это новая вершина на вашем пути.'
            },
            {
                highlightedWord: 1, // TO
                title: 'Стройте карту мечты',
                text: 'На карте вы можете видеть все свои цели и отслеживать прогресс. Добавляйте новые цели и планируйте шаги к их достижению.'
            },
            {
                highlightedWord: 2, // YOUR
                title: 'Собирайте караван',
                text: 'Объединяйтесь с друзьями и единомышленниками. Вместе достигать цели легче и интереснее!'
            },
            {
                highlightedWord: 3, // DREAM
                title: 'ИИ-помощник всегда рядом',
                text: 'Ваш персональный ИИ-менеджер поможет с планированием, мотивацией и советами на пути к цели.'
            },
            {
                highlightedWord: -1, // Все слова
                title: 'Готовы начать?',
                text: 'Начните свой путь к мечте прямо сейчас. Создайте первую цель и сделайте первый шаг!'
            }
        ];
    }

    // Показать экран загрузки
    show() {
        // Скрываем навигацию и другие элементы
        this.hideAppElements();
        
        const loadingHTML = `
            <div id="loading-screen">
                <div class="loading-icon-container">
                    <div class="loading-icon">
                        <img src="ico.svg" alt="Road to Your Dream" onerror="this.style.display='none';">
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
        
        // Имитация загрузки (минимум 1.5 секунды для красоты анимации)
        return new Promise((resolve) => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                    setTimeout(() => {
                        loadingScreen.remove();
                        resolve();
                    }, 500);
                } else {
                    resolve();
                }
            }, 1500);
        });
    }
    
    // Скрытие элементов приложения
    hideAppElements() {
        const nav = document.getElementById('navigation');
        const versionInfo = document.getElementById('version-info');
        const clearBtn = document.getElementById('clear-data-btn');
        const appContainer = document.getElementById('app-container');
        
        if (nav) nav.style.display = 'none';
        if (versionInfo) versionInfo.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        if (appContainer) appContainer.style.display = 'none';
        document.body.style.overflow = 'hidden';
    }
    
    // Показать элементы приложения
    showAppElements() {
        const nav = document.getElementById('navigation');
        const versionInfo = document.getElementById('version-info');
        const clearBtn = document.getElementById('clear-data-btn');
        const appContainer = document.getElementById('app-container');
        
        if (nav) nav.style.display = '';
        if (versionInfo) versionInfo.style.display = '';
        if (clearBtn) clearBtn.style.display = '';
        if (appContainer) appContainer.style.display = '';
        document.body.style.overflow = '';
    }

    // Показать онбординг
    showOnboarding() {
        return new Promise((resolve) => {
            // Убеждаемся, что элементы скрыты
            this.hideAppElements();
            
            const onboardingHTML = `
                <div id="onboarding-screen">
                    <div class="onboarding-content">
                        <div class="onboarding-title-container" id="onboarding-title-container"></div>
                        <div class="onboarding-text">
                            <h2 id="onboarding-title"></h2>
                            <p id="onboarding-text"></p>
                        </div>
                        <button class="onboarding-button" id="onboarding-button">Дальше</button>
                        <div class="onboarding-progress" id="onboarding-progress"></div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('afterbegin', onboardingHTML);
            
            const onboardingScreen = document.getElementById('onboarding-screen');
            const titleContainer = document.getElementById('onboarding-title-container');
            const onboardingTitle = document.getElementById('onboarding-title');
            const onboardingText = document.getElementById('onboarding-text');
            const onboardingButton = document.getElementById('onboarding-button');
            const onboardingProgress = document.getElementById('onboarding-progress');
            
            // Создаем название приложения с словами
            this.createTitleWords(titleContainer);
            
            // Создаем индикаторы прогресса
            for (let i = 0; i < this.onboardingSteps.length; i++) {
                const dot = document.createElement('div');
                dot.className = 'onboarding-progress-dot';
                if (i === 0) dot.classList.add('active');
                onboardingProgress.appendChild(dot);
            }
            
            // Показываем первый экран
            onboardingScreen.classList.add('active');
            
            // Инициализация для первого экрана (без анимации слайдера)
            const firstStepData = this.onboardingSteps[0];
            onboardingTitle.textContent = firstStepData.title;
            onboardingText.textContent = firstStepData.text;
            
            // Подсветка первого слова
            const words = titleContainer.querySelectorAll('.app-title-word');
            words.forEach((wordSpan, index) => {
                if (index === firstStepData.highlightedWord) {
                    setTimeout(() => {
                        wordSpan.classList.add('active');
                    }, 300);
                }
            });
            
            // Устанавливаем начальные стили
            titleContainer.style.transition = 'all 0.6s ease';
            onboardingTitle.style.transition = 'opacity 0.5s ease';
            onboardingText.style.transition = 'opacity 0.5s ease';
            
            // Обновляем текст кнопки
            onboardingButton.textContent = this.onboardingSteps.length > 1 ? 'Дальше' : 'Начать';
            
            // Плавное появление первого экрана
            setTimeout(() => {
                titleContainer.style.opacity = '1';
                onboardingTitle.style.opacity = '1';
                onboardingText.style.opacity = '1';
                onboardingButton.style.opacity = '1';
            }, 100);
            
            // Обработчик кнопки
            onboardingButton.addEventListener('click', () => {
                this.currentOnboardingStep++;
                
                if (this.currentOnboardingStep < this.onboardingSteps.length) {
                    this.updateOnboardingScreen(this.currentOnboardingStep, titleContainer, onboardingTitle, onboardingText, onboardingButton, onboardingProgress);
                } else {
                    // Завершение онбординга
                    this.completeOnboarding(onboardingScreen);
                    resolve();
                }
            });
        });
    }
    
    // Создание названия приложения со словами
    createTitleWords(container) {
        container.innerHTML = '';
        this.titleWords.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'app-title-word';
            wordSpan.textContent = word;
            wordSpan.dataset.wordIndex = index;
            container.appendChild(wordSpan);
        });
    }

    // Обновление экрана онбординга
    updateOnboardingScreen(step, titleContainer, titleEl, textEl, buttonEl, progressEl) {
        const stepData = this.onboardingSteps[step];
        
        // Анимация слайдера - уход влево
        titleContainer.style.transform = 'translateX(-30px)';
        titleContainer.style.opacity = '0.3';
        titleEl.style.transform = 'translateX(-30px)';
        titleEl.style.opacity = '0';
        textEl.style.transform = 'translateX(-30px)';
        textEl.style.opacity = '0';
        buttonEl.style.opacity = '0';
        
        setTimeout(() => {
            titleEl.textContent = stepData.title;
            textEl.textContent = stepData.text;
            
            // Обновляем подсветку слов с задержкой для эффекта
            const words = titleContainer.querySelectorAll('.app-title-word');
            words.forEach((wordSpan, index) => {
                wordSpan.classList.remove('active');
                
                // Если highlightedWord = -1, подсвечиваем все слова
                if (stepData.highlightedWord === -1) {
                    setTimeout(() => {
                        wordSpan.classList.add('active');
                    }, 200 + index * 100);
                } else if (index === stepData.highlightedWord) {
                    setTimeout(() => {
                        wordSpan.classList.add('active');
                    }, 200);
                }
            });
            
            // Обновляем текст кнопки
            if (step === this.onboardingSteps.length - 1) {
                buttonEl.textContent = 'Начать';
            } else {
                buttonEl.textContent = 'Дальше';
            }
            
            // Обновляем индикатор прогресса
            const dots = progressEl.querySelectorAll('.onboarding-progress-dot');
            dots.forEach((dot, index) => {
                if (index === step) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Анимация слайдера - появление справа
            setTimeout(() => {
                titleContainer.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                titleEl.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                textEl.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                buttonEl.style.transition = 'opacity 0.5s ease 0.2s';
                
                titleContainer.style.transform = 'translateX(0)';
                titleContainer.style.opacity = '1';
                titleEl.style.transform = 'translateX(0)';
                titleEl.style.opacity = '1';
                textEl.style.transform = 'translateX(0)';
                textEl.style.opacity = '1';
                buttonEl.style.opacity = '1';
            }, 50);
        }, 300);
    }

    // Завершение онбординга
    completeOnboarding(onboardingScreen) {
        onboardingScreen.style.opacity = '0';
        onboardingScreen.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            onboardingScreen.remove();
            localStorage.setItem('roadToDreamOnboardingCompleted', 'true');
            // Показываем элементы приложения обратно
            this.showAppElements();
        }, 500);
    }

    // Главная функция инициализации
    async init(callback) {
        // Сначала показываем экран загрузки
        await this.show();
        
        // Затем проверяем, нужно ли показывать онбординг
        if (!this.onboardingCompleted) {
            await this.showOnboarding();
        } else {
            // Если онбординг не нужен, показываем элементы приложения
            this.showAppElements();
        }
        
        // Вызываем callback для запуска основного приложения
        if (callback) {
            callback();
        }
    }
}

// Экспорт для использования в основном приложении
window.LoadingScreen = LoadingScreen;
