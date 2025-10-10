import asyncio
import logging
import aiohttp
import json
from dotenv import load_dotenv
import os
from ai_agent_advanced import get_ai_motivation, get_ai_stats, reset_ai_stats

# Загружаем переменные окружения из .env файла
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Получаем токен из переменной окружения
BOT_TOKEN = os.getenv('BOT_TOKEN')

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN не найден в .env файле!")

# URL для Telegram Bot API
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

class AdvancedBot:
    def __init__(self, token):
        self.token = token
        self.api_url = f"https://api.telegram.org/bot{token}"
        self.offset = 0
        self.current_api = 'auto'  # Текущий выбранный API
    
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
                            "url": "https://google.com"
                        }
                    }
                ],
                [
                    {"text": "💪 Мотивация", "callback_data": "motivation"},
                    {"text": "🎯 Тест AI", "callback_data": "test_ai"}
                ],
                [
                    {"text": "📊 Статистика", "callback_data": "stats"},
                    {"text": "⚙️ Настройки API", "callback_data": "api_settings"}
                ]
            ]
        }
        
        message_text = (
            "👋 Привет! Добро пожаловать в продвинутого бота!\n\n"
            "Я помогу тебе найти свой путь к мечте!\n\n"
            "Доступные команды:\n"
            "/start - главное меню\n"
            "/motivation - получить мотивацию\n"
            "/test_ai - протестировать AI\n"
            "/events - список событий для AI\n"
            "/stats - статистика использования API\n"
            "/switch_openai - переключиться на OpenAI\n"
            "/switch_gemini - переключиться на Gemini\n"
            "/switch_auto - автоматический выбор API"
        )
        
        await self.send_message(chat_id, message_text, keyboard)
    
    async def handle_motivation(self, chat_id):
        """Обработчик команды мотивации"""
        try:
            # Генерируем мотивационное сообщение с текущим API
            motivation = await get_ai_motivation('motivation_needed', self.current_api)
            await self.send_message(chat_id, f"💪 {motivation}")
            print(f"Отправлена мотивация пользователю {chat_id} (API: {self.current_api})")
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
        
        message_text = f"🤖 Тестирование AI-модуля (API: {self.current_api}):\n\n"
        
        for i, event in enumerate(events, 1):
            try:
                motivation = await get_ai_motivation(event, self.current_api)
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
                total_requests = (stats['openai_success'] + stats['openai_failures'] + 
                                stats['gemini_success'] + stats['gemini_failures'] + 
                                stats['fallback_used'])
                
                message_text = (
                    f"📊 Статистика использования AI:\n\n"
                    f"🤖 OpenAI:\n"
                    f"  ✅ Успешно: {stats['openai_success']}\n"
                    f"  ❌ Ошибок: {stats['openai_failures']}\n\n"
                    f"🔮 Gemini:\n"
                    f"  ✅ Успешно: {stats['gemini_success']}\n"
                    f"  ❌ Ошибок: {stats['gemini_failures']}\n\n"
                    f"🔄 Fallback: {stats['fallback_used']}\n\n"
                    f"📈 Всего запросов: {total_requests}\n"
                    f"🎯 Текущий API: {self.current_api}"
                )
            else:
                message_text = "Статистика недоступна"
            
            await self.send_message(chat_id, message_text)
        except Exception as e:
            await self.send_message(chat_id, f"Ошибка получения статистики: {e}")
    
    async def handle_api_settings(self, chat_id):
        """Показывает настройки API"""
        keyboard = {
            "inline_keyboard": [
                [
                    {"text": "🤖 OpenAI", "callback_data": "switch_openai"},
                    {"text": "🔮 Gemini", "callback_data": "switch_gemini"}
                ],
                [
                    {"text": "🎯 Авто", "callback_data": "switch_auto"},
                    {"text": "🔄 Сброс статистики", "callback_data": "reset_stats"}
                ]
            ]
        }
        
        message_text = (
            f"⚙️ Настройки API:\n\n"
            f"Текущий режим: {self.current_api}\n\n"
            f"Выберите предпочтительный API:"
        )
        
        await self.send_message(chat_id, message_text, keyboard)
    
    async def switch_api(self, api_type: str):
        """Переключает API"""
        if api_type in ['openai', 'gemini', 'auto']:
            self.current_api = api_type
            return f"API переключен на: {api_type}"
        return "Неверный тип API"
    
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
            elif text == '/switch_openai':
                result = await self.switch_api('openai')
                await self.send_message(chat_id, f"✅ {result}")
            elif text == '/switch_gemini':
                result = await self.switch_api('gemini')
                await self.send_message(chat_id, f"✅ {result}")
            elif text == '/switch_auto':
                result = await self.switch_api('auto')
                await self.send_message(chat_id, f"✅ {result}")
        
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
            elif data == 'api_settings':
                await self.handle_api_settings(chat_id)
                print(f"Обработан callback api_settings от пользователя {chat_id}")
            elif data == 'switch_openai':
                result = await self.switch_api('openai')
                await self.send_message(chat_id, f"✅ {result}")
            elif data == 'switch_gemini':
                result = await self.switch_api('gemini')
                await self.send_message(chat_id, f"✅ {result}")
            elif data == 'switch_auto':
                result = await self.switch_api('auto')
                await self.send_message(chat_id, f"✅ {result}")
            elif data == 'reset_stats':
                reset_ai_stats()
                await self.send_message(chat_id, "🔄 Статистика сброшена!")
            
            # Отвечаем на callback
            await self.answer_callback_query(callback['id'])
    
    async def run(self):
        """Основной цикл бота"""
        print("Продвинутый бот запускается...")
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
bot = AdvancedBot(BOT_TOKEN)

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
