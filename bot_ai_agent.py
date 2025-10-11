import asyncio
import logging
import aiohttp
import json
import os
import httpx
import random
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем токен из переменной окружения
BOT_TOKEN = os.getenv('BOT_TOKEN')

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не найден в .env файле!")

# URL для Telegram Bot API
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

class SimpleAIAgent:
    """Простой AI-модуль с бесплатными API"""
    
    def __init__(self):
        """Инициализация AI-агента"""
        # Проверяем доступные API ключи
        self.huggingface_key = os.getenv('HUGGINGFACE_API_KEY')
        self.cohere_key = os.getenv('COHERE_API_KEY')
        self.deepseek_key = os.getenv('DEEPSEEK_API_KEY')
        self.groq_key = os.getenv('GROQ_API_KEY')
        
        # Системный промпт для AI-попутчика
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
            'groq_success': 0,
            'groq_failures': 0,
            'huggingface_success': 0,
            'huggingface_failures': 0,
            'cohere_success': 0,
            'cohere_failures': 0,
            'fallback_used': 0
        }
    
    async def get_ai_motivation(self, event: str) -> str:
        """
        Генерирует мотивационное сообщение в зависимости от события
        
        Args:
            event (str): Тип события (например, '7_days_streak', 'first_goal', 'milestone_reached')
            
        Returns:
            str: Мотивационное сообщение от AI
        """
        # Генерируем пользовательский промпт в зависимости от события
        user_prompt = self._generate_user_prompt(event)
        
        # Пробуем Groq (если доступен) - основной бесплатный API
        if self.groq_key:
            result = await self._try_groq(user_prompt, event)
            if result:
                return result
        
        # Пробуем Hugging Face (если доступен) - резервный
        if self.huggingface_key:
            result = await self._try_huggingface(user_prompt, event)
            if result:
                return result
        
        # Пробуем Cohere (если доступен) - резервный
        if self.cohere_key:
            result = await self._try_cohere(user_prompt, event)
            if result:
                return result
        
        # Fallback на предустановленные сообщения
        logger.info(f"Используем fallback для события: {event}")
        self.stats['fallback_used'] += 1
        return self._get_fallback_motivation(event)
    
    async def _try_groq(self, prompt: str, event: str) -> str:
        """Попытка использования Groq API"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [
                            {"role": "system", "content": self.system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 150,
                        "temperature": 0.7
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if 'choices' in result and len(result['choices']) > 0:
                        text = result['choices'][0]['message']['content']
                        if text:
                            self.stats['groq_success'] += 1
                            logger.info(f"Groq сгенерировал мотивацию для события: {event}")
                            return text.strip()
                
                self.stats['groq_failures'] += 1
                logger.warning(f"Groq недоступен: {response.status_code}")
                return None
                
        except Exception as e:
            self.stats['groq_failures'] += 1
            logger.warning(f"Groq недоступен: {e}")
            return None
    
    async def _try_huggingface(self, prompt: str, event: str) -> str:
        """Попытка использования Hugging Face API"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
                    headers={"Authorization": f"Bearer {self.huggingface_key}"},
                    json={"inputs": prompt}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        text = result[0].get('generated_text', '')
                        if text:
                            self.stats['huggingface_success'] += 1
                            logger.info(f"Hugging Face сгенерировал мотивацию для события: {event}")
                            return text.strip()
                
                self.stats['huggingface_failures'] += 1
                logger.warning(f"Hugging Face недоступен: {response.status_code}")
                return None
                
        except Exception as e:
            self.stats['huggingface_failures'] += 1
            logger.warning(f"Hugging Face недоступен: {e}")
            return None
    
    async def _try_cohere(self, prompt: str, event: str) -> str:
        """Попытка использования Cohere API"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.cohere.ai/v1/generate",
                    headers={
                        "Authorization": f"Bearer {self.cohere_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "command",
                        "prompt": f"{self.system_prompt}\n\n{prompt}",
                        "max_tokens": 150,
                        "temperature": 0.8
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if 'generations' in result and len(result['generations']) > 0:
                        text = result['generations'][0].get('text', '')
                        if text:
                            self.stats['cohere_success'] += 1
                            logger.info(f"Cohere сгенерировал мотивацию для события: {event}")
                            return text.strip()
                
                self.stats['cohere_failures'] += 1
                logger.warning(f"Cohere недоступен: {response.status_code}")
                return None
                
        except Exception as e:
            self.stats['cohere_failures'] += 1
            logger.warning(f"Cohere недоступен: {e}")
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
            'groq_success': 0,
            'groq_failures': 0,
            'huggingface_success': 0,
            'huggingface_failures': 0,
            'cohere_success': 0,
            'cohere_failures': 0,
            'fallback_used': 0
        }

# Глобальный экземпляр AI-агента
ai_agent = None

def get_ai_agent():
    """Получает экземпляр AI-агента, создает его при необходимости"""
    global ai_agent
    if ai_agent is None:
        try:
            ai_agent = SimpleAIAgent()
        except Exception as e:
            logger.error(f"Ошибка создания AI-агента: {e}")
            return None
    return ai_agent

# Асинхронная функция для удобного использования
async def get_ai_motivation(event: str) -> str:
    """
    Асинхронная функция для получения мотивационного сообщения
    
    Args:
        event (str): Тип события
        
    Returns:
        str: Мотивационное сообщение
    """
    agent = get_ai_agent()
    if agent is None:
        # Возвращаем fallback сообщение если нет API-ключа
        temp_agent = SimpleAIAgent.__new__(SimpleAIAgent)
        return temp_agent._get_fallback_motivation(event)
    
    return await agent.get_ai_motivation(event)

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

class SimpleBot:
    def __init__(self, token):
        self.token = token
        self.api_url = f"https://api.telegram.org/bot{token}"
        self.offset = 0
    
    async def get_updates(self):
        """Получаем обновления от Telegram"""
        url = f"{self.api_url}/getUpdates"
        params = {
            'offset': self.offset,
            'timeout': 30
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('result', [])
                return []
    
    async def send_message(self, chat_id, text, reply_markup=None):
        """Отправляем сообщение"""
        url = f"{self.api_url}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }
        
        if reply_markup:
            data['reply_markup'] = json.dumps(reply_markup)
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                return await response.json()
    
    async def answer_callback_query(self, callback_query_id):
        """Отвечаем на callback-запрос"""
        url = f"{self.api_url}/answerCallbackQuery"
        data = {
            'callback_query_id': callback_query_id
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                return await response.json()
    
    async def handle_start(self, chat_id):
        """Обработчик команды /start"""
        # Создаем инлайн-кнопки
        keyboard = {
            "inline_keyboard": [
                [
                    {
                        "text": "🚀 Открыть мой путь",
                        "web_app": {
                            "url": "https://upgradevictor2006-arch.github.io/road-to-your-dream-app/frontend/"
                        }
                    }
                ],
                [
                    {"text": "💪 Мотивация", "callback_data": "motivation"},
                    {"text": "🎯 Тест AI", "callback_data": "test_ai"}
                ],
                [
                    {"text": "📊 Статистика", "callback_data": "stats"},
                    {"text": "🔄 Сброс статистики", "callback_data": "reset_stats"}
                ]
            ]
        }
        
        message_text = (
            "👋 Привет! Добро пожаловать в простого бота!\n\n"
            "Я помогу тебе найти свой путь к мечте!\n\n"
            "Доступные команды:\n"
            "/start - главное меню\n"
            "/motivation - получить мотивацию\n"
            "/test_ai - протестировать AI\n"
            "/events - список событий для AI\n"
            "/stats - статистика использования API"
        )
        
        await self.send_message(chat_id, message_text, keyboard)
    
    async def handle_motivation(self, chat_id):
        """Обработчик команды мотивации"""
        try:
            # Генерируем мотивационное сообщение
            motivation = await get_ai_motivation('motivation_needed')
            await self.send_message(chat_id, f"💪 {motivation}")
            print(f"Отправлена мотивация пользователю {chat_id}")
        except Exception as e:
            await self.send_message(chat_id, "Извините, не удалось получить мотивацию. Попробуйте позже.")
            print(f"Ошибка при генерации мотивации: {e}")
    
    async def handle_test_ai(self, chat_id):
        """Обработчик тестирования AI"""
        events = [
            '7_days_streak',
            'first_goal', 
            'milestone_reached',
            'goal_completed',
            'motivation_needed'
        ]
        
        message_text = "🤖 Тестирование AI-модуля:\n\n"
        
        for i, event in enumerate(events, 1):
            try:
                motivation = await get_ai_motivation(event)
                message_text += f"{i}. **{event}**:\n{motivation}\n\n"
            except Exception as e:
                message_text += f"{i}. **{event}**: Ошибка - {str(e)}\n\n"
        
        await self.send_message(chat_id, message_text)
        print(f"Отправлен тест AI пользователю {chat_id}")
    
    async def handle_events_list(self, chat_id):
        """Показывает список доступных событий"""
        events_text = (
            "📋 Доступные события для AI:\n\n"
            "• 7_days_streak - 7-дневная серия\n"
            "• first_goal - первая цель\n"
            "• milestone_reached - достигнута веха\n"
            "• goal_completed - цель завершена\n"
            "• motivation_needed - нужна мотивация\n"
            "• weekly_review - недельный обзор\n\n"
            "Используйте: /test_ai для тестирования всех событий"
        )
        await self.send_message(chat_id, events_text)
    
    async def handle_stats(self, chat_id):
        """Показывает статистику использования API"""
        try:
            stats = get_ai_stats()
            if stats:
                total_requests = (stats['groq_success'] + stats['groq_failures'] + 
                                stats['huggingface_success'] + stats['huggingface_failures'] + 
                                stats['cohere_success'] + stats['cohere_failures'] + 
                                stats['fallback_used'])
                
                message_text = (
                    f"📊 Статистика использования AI:\n\n"
                    f"⚡ Groq (ОСНОВНОЙ БЕСПЛАТНЫЙ!):\n"
                    f"  ✅ Успешно: {stats['groq_success']}\n"
                    f"  ❌ Ошибок: {stats['groq_failures']}\n\n"
                    f"🤗 Hugging Face (резервный):\n"
                    f"  ✅ Успешно: {stats['huggingface_success']}\n"
                    f"  ❌ Ошибок: {stats['huggingface_failures']}\n\n"
                    f"🔮 Cohere (резервный):\n"
                    f"  ✅ Успешно: {stats['cohere_success']}\n"
                    f"  ❌ Ошибок: {stats['cohere_failures']}\n\n"
                    f"🔄 Fallback: {stats['fallback_used']}\n\n"
                    f"📈 Всего запросов: {total_requests}"
                )
            else:
                message_text = "Статистика недоступна"
            
            await self.send_message(chat_id, message_text)
        except Exception as e:
            await self.send_message(chat_id, f"Ошибка получения статистики: {e}")
    
    async def process_update(self, update):
        """Обрабатываем одно обновление"""
        if 'message' in update:
            message = update['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            
            if text == '/start':
                await self.handle_start(chat_id)
                print(f"Обработана команда /start от пользователя {chat_id}")
            elif text == '/motivation':
                await self.handle_motivation(chat_id)
                print(f"Обработана команда /motivation от пользователя {chat_id}")
            elif text == '/test_ai':
                await self.handle_test_ai(chat_id)
                print(f"Обработана команда /test_ai от пользователя {chat_id}")
            elif text == '/events':
                await self.handle_events_list(chat_id)
                print(f"Обработана команда /events от пользователя {chat_id}")
            elif text == '/stats':
                await self.handle_stats(chat_id)
                print(f"Обработана команда /stats от пользователя {chat_id}")
        
        # Обработка callback-кнопок
        elif 'callback_query' in update:
            callback = update['callback_query']
            chat_id = callback['message']['chat']['id']
            data = callback.get('data', '')
            
            if data == 'motivation':
                await self.handle_motivation(chat_id)
                print(f"Обработан callback motivation от пользователя {chat_id}")
            elif data == 'test_ai':
                await self.handle_test_ai(chat_id)
                print(f"Обработан callback test_ai от пользователя {chat_id}")
            elif data == 'stats':
                await self.handle_stats(chat_id)
                print(f"Обработан callback stats от пользователя {chat_id}")
            elif data == 'reset_stats':
                reset_ai_stats()
                await self.send_message(chat_id, "🔄 Статистика сброшена!")
            
            # Отвечаем на callback
            await self.answer_callback_query(callback['id'])
    
    async def run(self):
        """Основной цикл бота"""
        print("Простой бот запускается...")
        print("Ожидаем сообщения...")
        
        while True:
            try:
                updates = await self.get_updates()
                
                for update in updates:
                    self.offset = update['update_id'] + 1
                    await self.process_update(update)
                
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"Ошибка: {e}")
                await asyncio.sleep(5)

# Создаем и запускаем бота
bot = SimpleBot(BOT_TOKEN)

async def main():
    """Основная функция для запуска бота"""
    try:
        await bot.run()
    except KeyboardInterrupt:
        print("\nБот остановлен пользователем")
    except Exception as e:
        print(f"Ошибка при запуске бота: {e}")

if __name__ == "__main__":
    asyncio.run(main())
