import asyncio
import logging
import aiohttp
import json
from dotenv import load_dotenv
import os

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
    
    async def handle_start(self, chat_id):
        """Обработчик команды /start"""
        # Создаем инлайн-кнопку с WebApp
        keyboard = {
            "inline_keyboard": [
                [
                    {
                        "text": "🚀 Открыть мой путь",
                        "web_app": {
                            "url": "https://google.com"
                        }
                    }
                ]
            ]
        }
        
        message_text = (
            "👋 Привет! Добро пожаловать в бота!\n\n"
            "Я помогу тебе найти свой путь к мечте!"
        )
        
        await self.send_message(chat_id, message_text, keyboard)
    
    async def process_update(self, update):
        """Обрабатываем одно обновление"""
        if 'message' in update:
            message = update['message']
            chat_id = message['chat']['id']
            text = message.get('text', '')
            
            if text == '/start':
                await self.handle_start(chat_id)
                print(f"Обработана команда /start от пользователя {chat_id}")
    
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
