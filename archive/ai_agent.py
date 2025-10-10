import asyncio
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
import logging
import google.generativeai as genai
import httpx

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIAgent:
    """AI-модуль для генерации мотивационных сообщений"""
    
    def __init__(self):
        """Инициализация AI-агента"""
        # Проверяем доступные API ключи
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.gemini_key = os.getenv('GEMINI_API_KEY')
        
        if not self.openai_key and not self.gemini_key:
            raise ValueError("Не найдены API ключи! Добавьте OPENAI_API_KEY или GEMINI_API_KEY в .env файл!")
        
        # Настройки прокси
        proxy_url = os.getenv('PROXY_URL')
        
        # Инициализируем OpenAI (если есть ключ)
        if self.openai_key:
            if proxy_url:
                # Создаем HTTP-клиент с прокси для OpenAI
                http_client = httpx.AsyncClient(
                    proxy=proxy_url,
                    timeout=30.0
                )
                self.openai_client = AsyncOpenAI(
                    api_key=self.openai_key,
                    http_client=http_client
                )
            else:
                self.openai_client = AsyncOpenAI(api_key=self.openai_key)
        else:
            self.openai_client = None
        
        # Инициализируем Gemini (если есть ключ)
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
        else:
            self.gemini_model = None
        
        # Системный промпт для AI-попутчика
        self.system_prompt = (
            "Ты — AI-попутчик в приложении для достижения целей. "
            "Ты позитивный и используешь метафоры путешествий. "
            "Твоя задача — мотивировать пользователей продолжать свой путь к мечте. "
            "Используй образы дороги, путешествия, восхождения на гору, плавания по морю. "
            "Будь вдохновляющим, но не слишком длинным (2-3 предложения). "
            "Пиши на русском языке."
        )
    
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
        full_prompt = f"{self.system_prompt}\n\n{user_prompt}"
        
        # Пробуем OpenAI (если доступен)
        if self.openai_client:
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
                logger.info(f"OpenAI сгенерировал мотивацию для события: {event}")
                return motivation_text
                
            except Exception as e:
                logger.warning(f"OpenAI недоступен: {e}")
        
        # Пробуем Gemini (если доступен)
        if self.gemini_model:
            try:
                response = self.gemini_model.generate_content(full_prompt)
                motivation_text = response.text.strip()
                logger.info(f"Gemini сгенерировал мотивацию для события: {event}")
                return motivation_text
                
            except Exception as e:
                logger.warning(f"Gemini недоступен: {e}")
        
        # Fallback на предустановленные сообщения
        logger.info(f"Используем fallback для события: {event}")
        return self._get_fallback_motivation(event)
    
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
        
        import random
        
        # Расширенная база fallback сообщений с несколькими вариантами для каждого события
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

# Глобальный экземпляр AI-агента (создается только при необходимости)
ai_agent = None

def get_ai_agent():
    """Получает экземпляр AI-агента, создает его при необходимости"""
    global ai_agent
    if ai_agent is None:
        try:
            ai_agent = AIAgent()
        except ValueError:
            # Если нет API-ключа, возвращаем None
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
        temp_agent = AIAgent.__new__(AIAgent)
        return temp_agent._get_fallback_motivation(event)
    
    return await agent.get_ai_motivation(event)

# Пример использования
async def main():
    """Пример использования AI-агента"""
    try:
        # Тестируем различные события
        events = [
            '7_days_streak',
            'first_goal', 
            'milestone_reached',
            'goal_completed',
            'motivation_needed'
        ]
        
        for event in events:
            print(f"\n--- Событие: {event} ---")
            motivation = await get_ai_motivation(event)
            print(f"Мотивация: {motivation}")
            print("-" * 50)
            
    except Exception as e:
        print(f"Ошибка: {e}")

# Демонстрация fallback сообщений без API
def demo_fallback_messages():
    """Демонстрация запасных мотивационных сообщений"""
    print("=== ДЕМОНСТРАЦИЯ AI-МОДУЛЯ ===")
    print("(Без реального API-ключа, показываем fallback сообщения)\n")
    
    events = [
        '7_days_streak',
        'first_goal', 
        'milestone_reached',
        'goal_completed',
        'motivation_needed',
        'weekly_review'
    ]
    
    # Создаем временный агент для демонстрации
    temp_agent = AIAgent.__new__(AIAgent)
    temp_agent._get_fallback_motivation = AIAgent._get_fallback_motivation.__get__(temp_agent)
    
    for event in events:
        print(f"--- Событие: {event} ---")
        motivation = temp_agent._get_fallback_motivation(event)
        print(f"Мотивация: {motivation}")
        print("-" * 50)

if __name__ == "__main__":
    # Запускаем демонстрацию fallback сообщений
    demo_fallback_messages()
