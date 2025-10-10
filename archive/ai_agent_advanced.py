import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
import logging
import google.generativeai as genai
import httpx
import random

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedAIAgent:
    """Продвинутый AI-модуль с возможностью переключения между API"""
    
    def __init__(self):
        """Инициализация AI-агента"""
        # Проверяем доступные API ключи
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        
        # Настройки прокси
        self.proxy_url = os.getenv('PROXY_URL')
        
        # Инициализируем клиенты
        self.openai_client = None
        self.gemini_model = None
        
        # OpenAI временно отключен
        self.openai_client = None
        logger.info("OpenAI временно отключен")
        
        # Настройка Gemini
        if self.gemini_key:
            self._setup_gemini()
        
        # Системный промпт
        self.system_prompt = (
            "Ты — AI-попутчик в приложении для достижения целей. "
            "Ты позитивный и используешь метафоры путешествий. "
            "Твоя задача — мотивировать пользователей продолжать свой путь к мечте. "
            "Используй образы дороги, путешествия, восхождения на гору, плавания по морю. "
            "Будь вдохновляющим, но не слишком длинным (2-3 предложения). "
            "Пиши на русском языке."
        )
        
        # Статистика использования API
        self.stats = {
            'openai_success': 0,
            'openai_failures': 0,
            'gemini_success': 0,
            'gemini_failures': 0,
            'fallback_used': 0
        }
    
    def _setup_openai(self):
        """Настройка OpenAI клиента"""
        try:
            if self.proxy_url:
                # Создаем HTTP-клиент с прокси для OpenAI
                http_client = httpx.AsyncClient(
                    proxy=self.proxy_url,
                    timeout=30.0
                )
                self.openai_client = AsyncOpenAI(
                    api_key=self.openai_key,
                    http_client=http_client
                )
                logger.info("OpenAI настроен с прокси")
            else:
                self.openai_client = AsyncOpenAI(api_key=self.openai_key)
                logger.info("OpenAI настроен без прокси")
        except Exception as e:
            logger.error(f"Ошибка настройки OpenAI: {e}")
            self.openai_client = None
    
    def _setup_gemini(self):
        """Настройка Gemini клиента"""
        try:
            # Настраиваем Gemini с прокси если доступен
            if self.proxy_url:
                # Устанавливаем переменные окружения для прокси
                import os
                import urllib.parse
                
                # Парсим URL прокси
                if self.proxy_url.startswith('socks5://'):
                    # Для SOCKS5 прокси
                    proxy_parts = self.proxy_url.replace('socks5://', '').split('@')
                    if len(proxy_parts) == 2:
                        auth, host_port = proxy_parts
                        username, password = auth.split(':')
                        host, port = host_port.split(':')
                        
                        # Устанавливаем переменные окружения для SOCKS5
                        os.environ['HTTP_PROXY'] = f'socks5://{username}:{password}@{host}:{port}'
                        os.environ['HTTPS_PROXY'] = f'socks5://{username}:{password}@{host}:{port}'
                        logger.info(f"Установлен SOCKS5 прокси: {host}:{port}")
                    else:
                        # Без авторизации
                        host, port = proxy_parts[0].split(':')
                        os.environ['HTTP_PROXY'] = f'socks5://{host}:{port}'
                        os.environ['HTTPS_PROXY'] = f'socks5://{host}:{port}'
                        logger.info(f"Установлен SOCKS5 прокси без авторизации: {host}:{port}")
                elif self.proxy_url.startswith('http://') or self.proxy_url.startswith('https://'):
                    # Для HTTP/HTTPS прокси
                    os.environ['HTTP_PROXY'] = self.proxy_url
                    os.environ['HTTPS_PROXY'] = self.proxy_url
                    logger.info(f"Установлен HTTP прокси: {self.proxy_url}")
                else:
                    logger.warning(f"Неподдерживаемый тип прокси: {self.proxy_url}")
                
                # Настраиваем Gemini
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
                logger.info("Gemini настроен с прокси")
            else:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
                logger.info("Gemini настроен без прокси")
        except Exception as e:
            logger.error(f"Ошибка настройки Gemini: {e}")
            self.gemini_model = None
    
    async def get_ai_motivation(self, event: str, preferred_api: str = None) -> str:
        """
        Генерирует мотивационное сообщение с возможностью выбора API
        
        Args:
            event (str): Тип события
            preferred_api (str): Предпочтительный API ('openai', 'gemini', 'auto')
            
        Returns:
            str: Мотивационное сообщение от AI
        """
        user_prompt = self._generate_user_prompt(event)
        full_prompt = f"{self.system_prompt}\n\n{user_prompt}"
        
        # Определяем порядок попыток
        if preferred_api == 'openai':
            api_order = ['openai', 'gemini', 'fallback']
        elif preferred_api == 'gemini':
            api_order = ['gemini', 'openai', 'fallback']
        else:  # auto - умный выбор
            api_order = self._get_smart_api_order()
        
        # Пробуем API в указанном порядке
        for api in api_order:
            if api == 'openai' and self.openai_client:
                result = await self._try_openai(user_prompt, event)
                if result:
                    return result
            elif api == 'gemini' and self.gemini_model:
                result = await self._try_gemini(full_prompt, event)
                if result:
                    return result
            elif api == 'fallback':
                self.stats['fallback_used'] += 1
                logger.info(f"Используем fallback для события: {event}")
                return self._get_fallback_motivation(event)
        
        # Если ничего не сработало
        return self._get_fallback_motivation(event)
    
    def _get_smart_api_order(self):
        """Умный выбор порядка API на основе статистики"""
        # Если у нас есть статистика, используем её
        if self.stats['openai_success'] + self.stats['openai_failures'] > 0:
            openai_success_rate = self.stats['openai_success'] / (self.stats['openai_success'] + self.stats['openai_failures'])
        else:
            openai_success_rate = 0.5  # По умолчанию
        
        if self.stats['gemini_success'] + self.stats['gemini_failures'] > 0:
            gemini_success_rate = self.stats['gemini_success'] / (self.stats['gemini_success'] + self.stats['gemini_failures'])
        else:
            gemini_success_rate = 0.5  # По умолчанию
        
        # Выбираем API с лучшей статистикой
        if openai_success_rate >= gemini_success_rate:
            return ['openai', 'gemini', 'fallback']
        else:
            return ['gemini', 'openai', 'fallback']
    
    async def _try_openai(self, user_prompt: str, event: str) -> str:
        """Попытка использования OpenAI"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=150,
                temperature=0.8
            )
            
            motivation_text = response.choices[0].message.content.strip()
            self.stats['openai_success'] += 1
            logger.info(f"OpenAI сгенерировал мотивацию для события: {event}")
            return motivation_text
            
        except Exception as e:
            self.stats['openai_failures'] += 1
            logger.warning(f"OpenAI недоступен: {e}")
            return None
    
    async def _try_gemini(self, full_prompt: str, event: str) -> str:
        """Попытка использования Gemini"""
        try:
            response = self.gemini_model.generate_content(full_prompt)
            motivation_text = response.text.strip()
            self.stats['gemini_success'] += 1
            logger.info(f"Gemini сгенерировал мотивацию для события: {event}")
            return motivation_text
            
        except Exception as e:
            self.stats['gemini_failures'] += 1
            logger.warning(f"Gemini недоступен: {e}")
            return None
    
    def _generate_user_prompt(self, event: str) -> str:
        """Генерирует пользовательский промпт в зависимости от события"""
        
        event_prompts = {
            '7_days_streak': (
                "Пользователь достиг 7-дневной серии выполнения целей! "
                "Это как неделя путешествия по новой дороге. "
                "Напиши мотивационное сообщение, используя метафоры путешествия."
            ),
            'first_goal': (
                "Пользователь только что поставил свою первую цель! "
                "Это начало большого путешествия. "
                "Напиши вдохновляющее сообщение о старте пути."
            ),
            'milestone_reached': (
                "Пользователь достиг важной вехи в своем путешествии к цели! "
                "Это как достижение смотровой площадки на горной тропе. "
                "Поздравь и мотивируй продолжать."
            ),
            'goal_completed': (
                "Пользователь успешно завершил цель! "
                "Это как прибытие в пункт назначения после долгого путешествия. "
                "Отпразднуй это достижение и вдохнови на новые цели."
            ),
            'motivation_needed': (
                "Пользователь нуждается в мотивации для продолжения пути. "
                "Возможно, он устал или сомневается. "
                "Напиши ободряющее сообщение о том, что каждый путешественник проходит через трудные участки дороги."
            ),
            'weekly_review': (
                "Пользователь завершил неделю работы над целями. "
                "Это как завершение этапа путешествия. "
                "Подведи итоги и вдохнови на следующую неделю."
            )
        }
        
        return event_prompts.get(event, 
            f"Пользователь достиг события: {event}. "
            "Напиши мотивационное сообщение, используя метафоры путешествия и дороги."
        )
    
    def _get_fallback_motivation(self, event: str) -> str:
        """Возвращает запасное мотивационное сообщение при ошибке API"""
        
        # Расширенная база fallback сообщений
        fallback_messages = {
            '7_days_streak': [
                "Неделя подряд! Ты как опытный путешественник, который знает дорогу. Продолжай идти к своей мечте!",
                "Семь дней подряд - это серьезное достижение! Ты как караван, который не останавливается. Вперед!",
                "Неделя упорства! Ты как корабль, который нашел свой курс. Плыви к своей мечте!",
                "Семь дней пути! Ты как проводник, который ведет себя к цели. Не сворачивай с дороги!"
            ],
            'first_goal': [
                "Твой путь начинается! Каждое великое путешествие начинается с первого шага. Вперед к мечте!",
                "Первая цель достигнута! Ты как исследователь, который нашел первую тропу. Продолжай открывать новые горизонты!",
                "Начало положено! Ты как мореплаватель, который отправился в плавание. Плыви к своей мечте!",
                "Первый шаг сделан! Ты как альпинист, который начал восхождение. Поднимайся к вершине!"
            ],
            'milestone_reached': [
                "Ты достиг важной вехи! Как альпинист на смотровой площадке - видишь, как далеко зашел. Не останавливайся!",
                "Важная веха пройдена! Ты как путешественник на перевале - видишь весь пройденный путь. Вперед к новым высотам!",
                "Отличная работа! Ты как караван, достигший оазиса. Отдохни и продолжай путь к мечте!",
                "Веха достигнута! Ты как мореплаватель, который нашел остров. Исследуй новые земли!"
            ],
            'goal_completed': [
                "Пункт назначения достигнут! Ты успешно завершил этап своего путешествия. Время ставить новые цели!",
                "Цель выполнена! Ты как путешественник, который добрался до города. Планируй следующее приключение!",
                "Отлично! Ты как исследователь, который нашел сокровище. Ищи новые цели для покорения!",
                "Поздравляю! Ты как альпинист, который взошел на вершину. Спускайся и покоряй новые горы!"
            ],
            'motivation_needed': [
                "Каждый путешественник проходит через трудные участки. Помни: за каждым холмом открывается новая дорога!",
                "Трудный участок пути? Ты как караван в пустыне - знаешь, что за дюнами ждет оазис. Не останавливайся!",
                "Сложно? Ты как мореплаватель в шторме - знаешь, что за бурей ждет спокойное море. Плыви дальше!",
                "Тяжело? Ты как альпинист на крутом склоне - знаешь, что за подъемом ждет прекрасный вид. Карабкайся выше!"
            ],
            'weekly_review': [
                "Неделя завершена! Ты прошел еще один этап своего пути. Время планировать следующую неделю приключений!",
                "Неделя подошла к концу! Ты как путешественник, который завершил главу своего дневника. Пиши новую главу!",
                "Неделя пройдена! Ты как караван, который добрался до станции. Отдохни и планируй следующий переход!",
                "Неделя завершена! Ты как мореплаватель, который причалил к берегу. Планируй новое плавание!"
            ]
        }
        
        # Получаем список сообщений для события или общий список
        messages = fallback_messages.get(event, [
            "Твой путь к мечте продолжается! Каждый шаг приближает тебя к цели. Не останавливайся!",
            "Ты на правильном пути! Как путешественник, который знает направление. Иди к своей мечте!",
            "Продолжай движение! Ты как караван, который не останавливается. Вперед к цели!",
            "Твой путь продолжается! Каждый день - это новый шаг к мечте. Не сдавайся!"
        ])
        
        # Возвращаем случайное сообщение из списка
        return random.choice(messages)
    
    def get_stats(self):
        """Возвращает статистику использования API"""
        return self.stats.copy()
    
    def reset_stats(self):
        """Сбрасывает статистику"""
        self.stats = {
            'openai_success': 0,
            'openai_failures': 0,
            'gemini_success': 0,
            'gemini_failures': 0,
            'fallback_used': 0
        }

# Глобальный экземпляр AI-агента
ai_agent = None

def get_ai_agent():
    """Получает экземпляр AI-агента, создает его при необходимости"""
    global ai_agent
    if ai_agent is None:
        try:
            ai_agent = AdvancedAIAgent()
        except Exception as e:
            logger.error(f"Ошибка создания AI-агента: {e}")
            return None
    return ai_agent

# Асинхронная функция для удобного использования
async def get_ai_motivation(event: str, preferred_api: str = None) -> str:
    """
    Асинхронная функция для получения мотивационного сообщения
    
    Args:
        event (str): Тип события
        preferred_api (str): Предпочтительный API ('openai', 'gemini', 'auto')
        
    Returns:
        str: Мотивационное сообщение
    """
    agent = get_ai_agent()
    if agent is None:
        # Возвращаем fallback сообщение если нет API-ключа
        temp_agent = AdvancedAIAgent.__new__(AdvancedAIAgent)
        return temp_agent._get_fallback_motivation(event)
    
    return await agent.get_ai_motivation(event, preferred_api)

# Функция для получения статистики
def get_ai_stats():
    """Возвращает статистику использования AI"""
    agent = get_ai_agent()
    if agent:
        return agent.get_stats()
    return None

# Функция для сброса статистики
def reset_ai_stats():
    """Сбрасывает статистику AI"""
    agent = get_ai_agent()
    if agent:
        agent.reset_stats()

# Пример использования
async def main():
    """Пример использования продвинутого AI-агента"""
    try:
        # Тестируем различные события
        events = [
            '7_days_streak',
            'first_goal', 
            'milestone_reached',
            'goal_completed',
            'motivation_needed'
        ]
        
        print("=== ТЕСТИРОВАНИЕ ПРОДВИНУТОГО AI-АГЕНТА ===\n")
        
        for event in events:
            print(f"--- Событие: {event} ---")
            
            # Тестируем с автоматическим выбором API
            motivation = await get_ai_motivation(event, 'auto')
            print(f"Авто-выбор: {motivation}")
            
            # Показываем статистику
            stats = get_ai_stats()
            if stats:
                print(f"Статистика: OpenAI успех={stats['openai_success']}, "
                      f"Gemini успех={stats['gemini_success']}, "
                      f"Fallback={stats['fallback_used']}")
            
            print("-" * 50)
            
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(main())
