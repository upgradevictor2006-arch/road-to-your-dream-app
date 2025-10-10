import asyncio
import os
import httpx
import json
import random
from dotenv import load_dotenv
import logging

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    
    async def _try_deepseek(self, prompt: str, event: str) -> str:
        """Попытка использования DeepSeek API"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.deepseek_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": self.system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 150,
                        "temperature": 0.8
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if 'choices' in result and len(result['choices']) > 0:
                        text = result['choices'][0]['message']['content']
                        if text:
                            self.stats['deepseek_success'] += 1
                            logger.info(f"DeepSeek сгенерировал мотивацию для события: {event}")
                            return text.strip()
                
                self.stats['deepseek_failures'] += 1
                logger.warning(f"DeepSeek недоступен: {response.status_code}")
                return None
                
        except Exception as e:
            self.stats['deepseek_failures'] += 1
            logger.warning(f"DeepSeek недоступен: {e}")
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

# Пример использования
async def main():
    """Пример использования простого AI-агента"""
    try:
        # Тестируем различные события
        events = [
            '7_days_streak',
            'first_goal', 
            'milestone_reached',
            'goal_completed',
            'motivation_needed'
        ]
        
        print("=== ТЕСТИРОВАНИЕ ПРОСТОГО AI-АГЕНТА ===\n")
        
        for event in events:
            print(f"--- Событие: {event} ---")
            motivation = await get_ai_motivation(event)
            print(f"Мотивация: {motivation}")
            print("-" * 50)
            
    except Exception as e:
        print(f"Ошибка: {e}")

if __name__ == "__main__":
    asyncio.run(main())
