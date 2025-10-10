import asyncio
import logging
import aiohttp
import json
from dotenv import load_dotenv
import os
from ai_agent import get_ai_motivation

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
                            "url": "https://google.com"
                        }
                    }
                ],
                [
                    {"text": "💪 Мотивация", "callback_data": "motivation"},
                    {"text": "🎯 Тест AI", "callback_data": "test_ai"}
                ]
            ]
        }
        
        message_text = (
            "👋 Привет! Добро пожаловать в бота!\n\n"
            "Я помогу тебе найти свой путь к мечте!\n\n"
            "Доступные команды:\n"
            "/start - главное меню\n"
            "/motivation - получить мотивацию\n"
            "/test_ai - протестировать AI\n"
            "/events - список событий для AI"
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
            
            # Отвечаем на callback
            await self.answer_callback_query(callback['id'])
    
    async def run(self):
        """Основной цикл бота"""
        print("Бот запускается...")
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
