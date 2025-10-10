from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date, timedelta
import os
from dotenv import load_dotenv
import uvicorn
import httpx
import random
import logging

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
        
        return {
            'user': user_data,
            'goals': goals.data,
            'daily_actions': daily_actions.data
        }
        
    except Exception as e:
        logger.error(f"Ошибка при получении данных пользователя: {e}")
        return None

# Pydantic модели
class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None

class User(BaseModel):
    id: str
    telegram_id: int
    username: Optional[str] = None
    created_at: datetime

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

class UserData(BaseModel):
    user: User
    goals: List[Goal]
    daily_actions: List[DailyAction]

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
            # Пользователь существует, возвращаем его
            user = existing_user.data[0]
            return User(
                id=user["id"],
                telegram_id=user["telegram_id"],
                username=user["username"],
                created_at=datetime.fromisoformat(user["created_at"].replace('Z', '+00:00'))
            )
        else:
            # Создаем нового пользователя
            new_user = supabase.table("users").insert({
                "telegram_id": user_data.telegram_id,
                "username": user_data.username
            }).execute()
            
            if new_user.data:
                user = new_user.data[0]
                return User(
                    id=user["id"],
                    telegram_id=user["telegram_id"],
                    username=user["username"],
                    created_at=datetime.fromisoformat(user["created_at"].replace('Z', '+00:00'))
                )
            else:
                raise HTTPException(status_code=500, detail="Ошибка при создании пользователя")
                
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
        
        # Формируем ответ
        user_obj = User(
            id=user_data["id"],
            telegram_id=user_data["telegram_id"],
            username=user_data["username"],
            created_at=datetime.fromisoformat(user_data["created_at"].replace('Z', '+00:00'))
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
        
        return UserData(
            user=user_obj,
            goals=goals_list,
            daily_actions=actions_list
        )
        
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
