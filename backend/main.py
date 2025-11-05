from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import os
from dotenv import load_dotenv
import uvicorn
import httpx
import random
import logging

# Импортируем новый личный менеджер
from ai_personal_manager import PersonalAIManager

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загружаем переменные окружения
load_dotenv()

# Инициализация FastAPI
app = FastAPI(title="Dream App API", version="1.0.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Настройка подключения к Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL и SUPABASE_KEY должны быть установлены в .env файле")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# AI-агент класс
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

# Глобальный экземпляр личного менеджера
personal_manager = None

def get_personal_manager():
    """Получает экземпляр личного менеджера, создает его при необходимости"""
    global personal_manager
    if personal_manager is None:
        try:
            personal_manager = PersonalAIManager()
        except Exception as e:
            logger.error(f"Ошибка создания личного менеджера: {e}")
            return None
    return personal_manager

# Функции для проверки триггеров AI
async def check_ai_triggers(telegram_id: int, event_type: str = None):
    """Проверяет триггеры для вызова AI и отправляет мотивационные сообщения"""
    try:
        agent = get_ai_agent()
        if not agent:
            return None
        
        # Получаем данные пользователя
        user_data = await get_user_data_internal(telegram_id)
        if not user_data:
            return None
        
        # Проверяем различные триггеры
        triggers = []
        
        # 1. Проверяем 7-дневную серию
        if len(user_data['daily_actions']) >= 7:
            # Проверяем, что последние 7 дней подряд
            today = date.today()
            consecutive_days = 0
            for i in range(7):
                check_date = today - timedelta(days=i)
                if any(action['action_date'] == check_date.isoformat() for action in user_data['daily_actions']):
                    consecutive_days += 1
                else:
                    break
            
            if consecutive_days == 7:
                triggers.append('7_days_streak')
        
        # 2. Проверяем первую цель
        if len(user_data['goals']) == 1 and event_type == 'goal_created':
            triggers.append('first_goal')
        
        # 3. Проверяем завершение цели
        if event_type == 'goal_completed':
            triggers.append('goal_completed')
        
        # 4. Проверяем вехи (каждые 5 целей)
        if len(user_data['goals']) > 0 and len(user_data['goals']) % 5 == 0:
            triggers.append('milestone_reached')
        
        # 5. Проверяем недельный обзор (каждые 7 дней с последнего действия)
        if user_data['daily_actions']:
            last_action_date = datetime.fromisoformat(user_data['daily_actions'][0]['action_date']).date()
            days_since_last = (date.today() - last_action_date).days
            if days_since_last >= 7:
                triggers.append('weekly_review')
        
        # Генерируем мотивационные сообщения для каждого триггера
        motivations = []
        for trigger in triggers:
            motivation = await agent.get_ai_motivation(trigger)
            motivations.append({
                'trigger': trigger,
                'message': motivation
            })
        
        return motivations
        
    except Exception as e:
        logger.error(f"Ошибка при проверке AI триггеров: {e}")
        return None

async def get_user_data_internal(telegram_id: int):
    """Внутренняя функция для получения данных пользователя без HTTP ответа"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("*").eq("telegram_id", telegram_id).execute()
        
        if not user.data:
            return None
        
        user_data = user.data[0]
        user_id = user_data["id"]
        
        # Получаем цели пользователя
        goals = supabase.table("goals").select("*").eq("user_id", user_id).execute()
        
        # Получаем ежедневные действия пользователя
        daily_actions = supabase.table("daily_actions").select("*").eq("user_id", user_id).order("action_date", desc=True).execute()
        
        # Получаем карты пользователя
        cards = supabase.table("cards").select("*").eq("user_id", user_id).execute()
        
        return {
            'user': user_data,
            'goals': goals.data,
            'daily_actions': daily_actions.data,
            'cards': cards.data
        }
        
    except Exception as e:
        logger.error(f"Ошибка при получении данных пользователя: {e}")
        return None

# Pydantic модели
class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None

class User(BaseModel):
    id: str
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class GoalCreate(BaseModel):
    goal_type: str
    description: Optional[str] = None

class GoalsRequest(BaseModel):
    telegram_id: int
    goals: List[GoalCreate]

class ActionCompleteRequest(BaseModel):
    telegram_id: int

class Goal(BaseModel):
    id: str
    user_id: str
    goal_type: str
    description: Optional[str] = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

class DailyAction(BaseModel):
    id: str
    user_id: str
    action_date: date
    created_at: datetime

class AIMotivationRequest(BaseModel):
    event: str

class AIMotivationResponse(BaseModel):
    message: str
    event: str

class AIStatsResponse(BaseModel):
    groq_success: int
    groq_failures: int
    huggingface_success: int
    huggingface_failures: int
    cohere_success: int
    cohere_failures: int
    fallback_used: int
    total_requests: int

# Модели для карт
class CardCreate(BaseModel):
    title: str
    description: Optional[str] = None
    card_type: str  # 'goal', 'habit', 'task', 'note', 'milestone'
    priority: Optional[int] = 1  # 1-5
    due_date: Optional[date] = None
    tags: Optional[List[str]] = []
    metadata: Optional[dict] = {}

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    card_type: Optional[str] = None
    status: Optional[str] = None  # 'active', 'completed', 'archived', 'deleted'
    priority: Optional[int] = None
    due_date: Optional[date] = None
    tags: Optional[List[str]] = None
    metadata: Optional[dict] = None

class Card(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    card_type: str
    status: str
    priority: int
    due_date: Optional[date] = None
    tags: List[str]
    metadata: dict
    created_at: datetime
    updated_at: datetime

class CardsRequest(BaseModel):
    telegram_id: int
    cards: List[CardCreate]

class TelegramAuthData(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: Optional[int] = None
    hash: Optional[str] = None

class UserData(BaseModel):
    user: User
    goals: List[Goal]
    daily_actions: List[DailyAction]
    cards: List[Card]

# Функции для работы с Telegram WebApp
def verify_telegram_auth(auth_data: TelegramAuthData) -> bool:
    """Проверяет подлинность данных авторизации Telegram WebApp"""
    # В реальном приложении здесь должна быть проверка подписи
    # Для упрощения пока возвращаем True
    return True

def extract_telegram_user_data(auth_data: TelegramAuthData) -> dict:
    """Извлекает данные пользователя из Telegram WebApp"""
    return {
        "telegram_id": auth_data.telegram_id,
        "username": auth_data.username,
        "first_name": auth_data.first_name,
        "last_name": auth_data.last_name,
        "photo_url": auth_data.photo_url
    }

# Эндпоинты
@app.get("/")
async def root():
    """Базовый эндпоинт для проверки статуса API"""
    return {"status": "ok"}

@app.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    """Регистрация пользователя или получение существующего"""
    try:
        # Проверяем, существует ли пользователь
        existing_user = supabase.table("users").select("*").eq("telegram_id", user_data.telegram_id).execute()
        
        if existing_user.data:
            # Пользователь существует, обновляем его данные если нужно
            user = existing_user.data[0]
            update_data = {}
            
            # Обновляем поля если они изменились
            if user_data.first_name and user_data.first_name != user.get("first_name"):
                update_data["first_name"] = user_data.first_name
            if user_data.last_name and user_data.last_name != user.get("last_name"):
                update_data["last_name"] = user_data.last_name
            if user_data.photo_url and user_data.photo_url != user.get("photo_url"):
                update_data["photo_url"] = user_data.photo_url
            if user_data.username and user_data.username != user.get("username"):
                update_data["username"] = user_data.username
            
            if update_data:
                update_data["updated_at"] = datetime.now().isoformat()
                updated_user = supabase.table("users").update(update_data).eq("id", user["id"]).execute()
                if updated_user.data:
                    user = updated_user.data[0]
            
            return User(
                id=user["id"],
                telegram_id=user["telegram_id"],
                username=user["username"],
                first_name=user.get("first_name"),
                last_name=user.get("last_name"),
                photo_url=user.get("photo_url"),
                created_at=datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(user["updated_at"].replace('Z', '+00:00'))
            )
        else:
            # Создаем нового пользователя
            new_user = supabase.table("users").insert({
                "telegram_id": user_data.telegram_id,
                "username": user_data.username,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "photo_url": user_data.photo_url
            }).execute()
            
            if new_user.data:
                user = new_user.data[0]
                return User(
                    id=user["id"],
                    telegram_id=user["telegram_id"],
                    username=user["username"],
                    first_name=user.get("first_name"),
                    last_name=user.get("last_name"),
                    photo_url=user.get("photo_url"),
                    created_at=datetime.fromisoformat(user["created_at"].replace('Z', '+00:00')),
                    updated_at=datetime.fromisoformat(user["updated_at"].replace('Z', '+00:00'))
                )
            else:
                raise HTTPException(status_code=500, detail="Ошибка при создании пользователя")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.post("/auth/telegram", response_model=User)
async def auth_telegram(auth_data: TelegramAuthData):
    """Авторизация через Telegram WebApp"""
    try:
        # Проверяем подлинность данных (в реальном приложении)
        if not verify_telegram_auth(auth_data):
            raise HTTPException(status_code=401, detail="Неверные данные авторизации")
        
        # Извлекаем данные пользователя
        user_data = extract_telegram_user_data(auth_data)
        
        # Регистрируем или обновляем пользователя
        user_create = UserCreate(**user_data)
        return await register_user(user_create)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.post("/goals")
async def create_goals(goals_request: GoalsRequest, background_tasks: BackgroundTasks):
    """Создание целей для пользователя"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("id").eq("telegram_id", goals_request.telegram_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        user_id = user.data[0]["id"]
        
        # Подготавливаем данные для вставки
        goals_to_insert = []
        for goal in goals_request.goals:
            goals_to_insert.append({
                "user_id": user_id,
                "goal_type": goal.goal_type,
                "description": goal.description,
                "is_completed": False
            })
        
        # Вставляем цели
        result = supabase.table("goals").insert(goals_to_insert).execute()
        
        if result.data:
            # Проверяем AI-триггеры в фоновом режиме
            background_tasks.add_task(check_ai_triggers, goals_request.telegram_id, "goal_created")
            
            return {"message": f"Создано {len(result.data)} целей", "goals": result.data}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при создании целей")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.post("/actions/complete")
async def complete_action(action_request: ActionCompleteRequest, background_tasks: BackgroundTasks):
    """Отметить выполнение ежедневного действия"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("id").eq("telegram_id", action_request.telegram_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        user_id = user.data[0]["id"]
        today = date.today()
        
        # Проверяем, есть ли уже запись на сегодня
        existing_action = supabase.table("daily_actions").select("*").eq("user_id", user_id).eq("action_date", today.isoformat()).execute()
        
        if existing_action.data:
            return {"message": "Действие уже отмечено на сегодня", "action": existing_action.data[0]}
        
        # Создаем новую запись
        new_action = supabase.table("daily_actions").insert({
            "user_id": user_id,
            "action_date": today.isoformat()
        }).execute()
        
        if new_action.data:
            # Проверяем AI-триггеры в фоновом режиме
            background_tasks.add_task(check_ai_triggers, action_request.telegram_id, "action_completed")
            
            return {"message": "Действие успешно отмечено", "action": new_action.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при создании записи о действии")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.get("/users/{telegram_id}/data", response_model=UserData)
async def get_user_data(telegram_id: int):
    """Получение всех данных пользователя"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("*").eq("telegram_id", telegram_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        user_data = user.data[0]
        user_id = user_data["id"]
        
        # Получаем цели пользователя
        goals = supabase.table("goals").select("*").eq("user_id", user_id).execute()
        
        # Получаем ежедневные действия пользователя
        daily_actions = supabase.table("daily_actions").select("*").eq("user_id", user_id).order("action_date", desc=True).execute()
        
        # Получаем карты пользователя
        cards = supabase.table("cards").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        # Формируем ответ
        user_obj = User(
            id=user_data["id"],
            telegram_id=user_data["telegram_id"],
            username=user_data["username"],
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            photo_url=user_data.get("photo_url"),
            created_at=datetime.fromisoformat(user_data["created_at"].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(user_data["updated_at"].replace('Z', '+00:00'))
        )
        
        goals_list = []
        for goal in goals.data:
            goals_list.append(Goal(
                id=goal["id"],
                user_id=goal["user_id"],
                goal_type=goal["goal_type"],
                description=goal["description"],
                is_completed=goal["is_completed"],
                created_at=datetime.fromisoformat(goal["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(goal["updated_at"].replace('Z', '+00:00'))
            ))
        
        actions_list = []
        for action in daily_actions.data:
            actions_list.append(DailyAction(
                id=action["id"],
                user_id=action["user_id"],
                action_date=datetime.fromisoformat(action["action_date"]).date(),
                created_at=datetime.fromisoformat(action["created_at"].replace('Z', '+00:00'))
            ))
        
        cards_list = []
        for card in cards.data:
            cards_list.append(Card(
                id=card["id"],
                user_id=card["user_id"],
                title=card["title"],
                description=card["description"],
                card_type=card["card_type"],
                status=card["status"],
                priority=card["priority"],
                due_date=datetime.fromisoformat(card["due_date"]).date() if card["due_date"] else None,
                tags=card["tags"] or [],
                metadata=card["metadata"] or {},
                created_at=datetime.fromisoformat(card["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(card["updated_at"].replace('Z', '+00:00'))
            ))
        
        return UserData(
            user=user_obj,
            goals=goals_list,
            daily_actions=actions_list,
            cards=cards_list
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

# Эндпоинты для работы с картами
@app.post("/cards")
async def create_cards(cards_request: CardsRequest, background_tasks: BackgroundTasks):
    """Создание карт для пользователя"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("id").eq("telegram_id", cards_request.telegram_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        user_id = user.data[0]["id"]
        
        # Подготавливаем данные для вставки
        cards_to_insert = []
        for card in cards_request.cards:
            cards_to_insert.append({
                "user_id": user_id,
                "title": card.title,
                "description": card.description,
                "card_type": card.card_type,
                "priority": card.priority,
                "due_date": card.due_date.isoformat() if card.due_date else None,
                "tags": card.tags,
                "metadata": card.metadata
            })
        
        # Вставляем карты
        result = supabase.table("cards").insert(cards_to_insert).execute()
        
        if result.data:
            return {"message": f"Создано {len(result.data)} карт", "cards": result.data}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при создании карт")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.get("/cards/{telegram_id}", response_model=List[Card])
async def get_user_cards(telegram_id: int, card_type: Optional[str] = None, status: Optional[str] = None):
    """Получение карт пользователя"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("id").eq("telegram_id", telegram_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        user_id = user.data[0]["id"]
        
        # Строим запрос
        query = supabase.table("cards").select("*").eq("user_id", user_id)
        
        if card_type:
            query = query.eq("card_type", card_type)
        if status:
            query = query.eq("status", status)
        
        # Выполняем запрос
        result = query.order("created_at", desc=True).execute()
        
        cards = []
        for card in result.data:
            cards.append(Card(
                id=card["id"],
                user_id=card["user_id"],
                title=card["title"],
                description=card["description"],
                card_type=card["card_type"],
                status=card["status"],
                priority=card["priority"],
                due_date=datetime.fromisoformat(card["due_date"]).date() if card["due_date"] else None,
                tags=card["tags"] or [],
                metadata=card["metadata"] or {},
                created_at=datetime.fromisoformat(card["created_at"].replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(card["updated_at"].replace('Z', '+00:00'))
            ))
        
        return cards
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.put("/cards/{card_id}")
async def update_card(card_id: str, card_update: CardUpdate):
    """Обновление карты"""
    try:
        # Проверяем существование карты
        existing_card = supabase.table("cards").select("*").eq("id", card_id).execute()
        
        if not existing_card.data:
            raise HTTPException(status_code=404, detail="Карта не найдена")
        
        # Подготавливаем данные для обновления
        update_data = {}
        
        if card_update.title is not None:
            update_data["title"] = card_update.title
        if card_update.description is not None:
            update_data["description"] = card_update.description
        if card_update.card_type is not None:
            update_data["card_type"] = card_update.card_type
        if card_update.status is not None:
            update_data["status"] = card_update.status
        if card_update.priority is not None:
            update_data["priority"] = card_update.priority
        if card_update.due_date is not None:
            update_data["due_date"] = card_update.due_date.isoformat()
        if card_update.tags is not None:
            update_data["tags"] = card_update.tags
        if card_update.metadata is not None:
            update_data["metadata"] = card_update.metadata
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Нет данных для обновления")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Обновляем карту
        result = supabase.table("cards").update(update_data).eq("id", card_id).execute()
        
        if result.data:
            return {"message": "Карта обновлена", "card": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при обновлении карты")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.delete("/cards/{card_id}")
async def delete_card(card_id: str):
    """Удаление карты (мягкое удаление - изменение статуса)"""
    try:
        # Проверяем существование карты
        existing_card = supabase.table("cards").select("*").eq("id", card_id).execute()
        
        if not existing_card.data:
            raise HTTPException(status_code=404, detail="Карта не найдена")
        
        # Мягкое удаление - меняем статус на deleted
        result = supabase.table("cards").update({
            "status": "deleted",
            "updated_at": datetime.now().isoformat()
        }).eq("id", card_id).execute()
        
        if result.data:
            return {"message": "Карта удалена"}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при удалении карты")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.get("/cards/{telegram_id}/stats")
async def get_cards_stats(telegram_id: int):
    """Получение статистики карт пользователя"""
    try:
        # Находим пользователя
        user = supabase.table("users").select("id").eq("telegram_id", telegram_id).execute()
        
        if not user.data:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        user_id = user.data[0]["id"]
        
        # Получаем все карты пользователя
        cards = supabase.table("cards").select("*").eq("user_id", user_id).execute()
        
        if not cards.data:
            return {
                "total_cards": 0,
                "by_type": {},
                "by_status": {},
                "by_priority": {}
            }
        
        # Подсчитываем статистику
        stats = {
            "total_cards": len(cards.data),
            "by_type": {},
            "by_status": {},
            "by_priority": {}
        }
        
        for card in cards.data:
            # По типам
            card_type = card["card_type"]
            stats["by_type"][card_type] = stats["by_type"].get(card_type, 0) + 1
            
            # По статусам
            status = card["status"]
            stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
            
            # По приоритетам
            priority = card["priority"]
            stats["by_priority"][str(priority)] = stats["by_priority"].get(str(priority), 0) + 1
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

# AI-эндпоинты
@app.post("/ai/motivation", response_model=AIMotivationResponse)
async def get_ai_motivation(request: AIMotivationRequest):
    """Получить мотивационное сообщение от AI"""
    try:
        agent = get_ai_agent()
        if not agent:
            raise HTTPException(status_code=503, detail="AI-агент недоступен")
        
        motivation = await agent.get_ai_motivation(request.event)
        
        return AIMotivationResponse(
            message=motivation,
            event=request.event
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при генерации мотивации: {str(e)}")

@app.get("/ai/triggers/{telegram_id}")
async def check_user_triggers(telegram_id: int):
    """Проверить AI-триггеры для пользователя"""
    try:
        motivations = await check_ai_triggers(telegram_id)
        
        if motivations:
            return {
                "triggers_found": len(motivations),
                "motivations": motivations
            }
        else:
            return {
                "triggers_found": 0,
                "motivations": []
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при проверке триггеров: {str(e)}")

@app.get("/ai/stats", response_model=AIStatsResponse)
async def get_ai_stats():
    """Получить статистику использования AI"""
    try:
        agent = get_ai_agent()
        if not agent:
            raise HTTPException(status_code=503, detail="AI-агент недоступен")
        
        stats = agent.get_stats()
        total_requests = (stats['groq_success'] + stats['groq_failures'] + 
                         stats['huggingface_success'] + stats['huggingface_failures'] + 
                         stats['cohere_success'] + stats['cohere_failures'] + 
                         stats['fallback_used'])
        
        return AIStatsResponse(
            groq_success=stats['groq_success'],
            groq_failures=stats['groq_failures'],
            huggingface_success=stats['huggingface_success'],
            huggingface_failures=stats['huggingface_failures'],
            cohere_success=stats['cohere_success'],
            cohere_failures=stats['cohere_failures'],
            fallback_used=stats['fallback_used'],
            total_requests=total_requests
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")

@app.post("/ai/reset-stats")
async def reset_ai_stats():
    """Сбросить статистику AI"""
    try:
        agent = get_ai_agent()
        if not agent:
            raise HTTPException(status_code=503, detail="AI-агент недоступен")
        
        agent.reset_stats()
        return {"message": "Статистика AI сброшена"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при сбросе статистики: {str(e)}")

@app.get("/ai/events")
async def get_available_events():
    """Получить список доступных событий для AI"""
    events = [
        {
            "event": "7_days_streak",
            "description": "7-дневная серия выполнения целей",
            "trigger": "Автоматически при 7 днях подряд"
        },
        {
            "event": "first_goal",
            "description": "Первая поставленная цель",
            "trigger": "При создании первой цели"
        },
        {
            "event": "milestone_reached",
            "description": "Достижение вехи (каждые 5 целей)",
            "trigger": "При достижении кратного 5 количества целей"
        },
        {
            "event": "goal_completed",
            "description": "Завершение цели",
            "trigger": "При завершении цели"
        },
        {
            "event": "motivation_needed",
            "description": "Нужна мотивация",
            "trigger": "По запросу пользователя"
        },
        {
            "event": "weekly_review",
            "description": "Недельный обзор",
            "trigger": "Каждые 7 дней с последнего действия"
        }
    ]
    
    return {
        "available_events": events,
        "total_events": len(events)
    }

# ========== НОВЫЕ ЭНДПОИНТЫ ДЛЯ ЛИЧНОГО МЕНЕДЖЕРА ==========

# Pydantic модели для новых эндпоинтов
class BreakGoalRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    goal_type: Optional[str] = "goal"

class PersonalAdviceRequest(BaseModel):
    question: str
    telegram_id: Optional[int] = None

class NavigationRequest(BaseModel):
    telegram_id: int

class ProgressAnalysisRequest(BaseModel):
    telegram_id: int

class MotivationRequest(BaseModel):
    telegram_id: Optional[int] = None

# Эндпоинты для разбиения целей на этапы
@app.post("/ai/manager/break-goal")
async def break_goal_into_steps(request: BreakGoalRequest):
    """
    Разбивает цель на конкретные этапы
    
    Args:
        request: Запрос с названием и описанием цели
        
    Returns:
        Словарь с этапами и рекомендациями
    """
    try:
        manager = get_personal_manager()
        if not manager:
            raise HTTPException(status_code=503, detail="Личный менеджер недоступен")
        
        result = await manager.break_goal_into_steps(
            goal_title=request.title,
            goal_description=request.description,
            goal_type=request.goal_type
        )
        
        return {
            "success": True,
            "steps": result.get("steps", []),
            "advice": result.get("advice", ""),
            "total_steps": len(result.get("steps", []))
        }
        
    except Exception as e:
        logger.error(f"Ошибка при разбиении цели: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при разбиении цели: {str(e)}")

# Эндпоинт для получения навигационных советов
@app.post("/ai/manager/navigation")
async def get_navigation(request: NavigationRequest):
    """
    Получает рекомендации по навигации: что делать дальше
    
    Args:
        request: Запрос с telegram_id пользователя
        
    Returns:
        Рекомендации по навигации
    """
    try:
        manager = get_personal_manager()
        if not manager:
            raise HTTPException(status_code=503, detail="Личный менеджер недоступен")
        
        # Получаем данные пользователя
        user_data_dict = await get_user_data_internal(request.telegram_id)
        if not user_data_dict:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        result = await manager.get_navigation_advice(user_data_dict)
        
        return {
            "success": True,
            "next_actions": result.get("next_actions", []),
            "focus": result.get("focus", ""),
            "warnings": result.get("warnings", []),
            "no_goals": result.get("no_goals", False)  # Передаем флаг на фронтенд
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении навигации: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении навигации: {str(e)}")

# Эндпоинт для получения персональных советов
@app.post("/ai/manager/advice")
async def get_personal_advice(request: PersonalAdviceRequest):
    """
    Получает персональный совет по вопросу пользователя
    
    Args:
        request: Запрос с вопросом и опциональным telegram_id
        
    Returns:
        Персональный совет
    """
    try:
        manager = get_personal_manager()
        if not manager:
            raise HTTPException(status_code=503, detail="Личный менеджер недоступен")
        
        context = None
        if request.telegram_id:
            user_data_dict = await get_user_data_internal(request.telegram_id)
            if user_data_dict:
                context = user_data_dict
        
        result = await manager.get_personal_advice(
            question=request.question,
            context=context
        )
        
        return {
            "success": True,
            "advice": result.get("advice", ""),
            "steps": result.get("steps", []),
            "motivation": result.get("motivation", "")
        }
        
    except Exception as e:
        logger.error(f"Ошибка при получении совета: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении совета: {str(e)}")

# Эндпоинт для анализа прогресса
@app.post("/ai/manager/analyze-progress")
async def analyze_user_progress(request: ProgressAnalysisRequest):
    """
    Анализирует прогресс пользователя
    
    Args:
        request: Запрос с telegram_id пользователя
        
    Returns:
        Анализ прогресса с рекомендациями
    """
    try:
        manager = get_personal_manager()
        if not manager:
            raise HTTPException(status_code=503, detail="Личный менеджер недоступен")
        
        # Получаем данные пользователя
        user_data_dict = await get_user_data_internal(request.telegram_id)
        if not user_data_dict:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        result = await manager.analyze_progress(user_data_dict)
        
        return {
            "success": True,
            "strength": result.get("strength", ""),
            "weaknesses": result.get("weaknesses", ""),
            "recommendations": result.get("recommendations", []),
            "score": result.get("score", 0),
            "streak": result.get("streak", 0),
            "days_since_start": result.get("days_since_start", 0),
            "total_actions": result.get("total_actions", 0),
            "avg_actions_per_week": result.get("avg_actions_per_week", 0),
            "goal_completion_rate": result.get("goal_completion_rate", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при анализе прогресса: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при анализе прогресса: {str(e)}")

# Эндпоинт для получения мотивации от личного менеджера
@app.post("/ai/manager/motivation")
async def get_manager_motivation(request: MotivationRequest):
    """
    Получает мотивационное сообщение от личного менеджера
    
    Args:
        request: Запрос с опциональным telegram_id для контекста
        
    Returns:
        Мотивационное сообщение
    """
    try:
        manager = get_personal_manager()
        if not manager:
            raise HTTPException(status_code=503, detail="Личный менеджер недоступен")
        
        context = None
        if request.telegram_id:
            user_data_dict = await get_user_data_internal(request.telegram_id)
            if user_data_dict:
                context = user_data_dict
        
        motivation = await manager.get_motivation(context)
        
        return {
            "success": True,
            "message": motivation
        }
        
    except Exception as e:
        logger.error(f"Ошибка при получении мотивации: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении мотивации: {str(e)}")

# Эндпоинт для статистики личного менеджера
@app.get("/ai/manager/stats")
async def get_manager_stats():
    """Получить статистику использования личного менеджера"""
    try:
        manager = get_personal_manager()
        if not manager:
            raise HTTPException(status_code=503, detail="Личный менеджер недоступен")
        
        stats = manager.get_stats()
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
