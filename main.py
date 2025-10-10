from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import os
from dotenv import load_dotenv
import uvicorn

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
async def create_goals(goals_request: GoalsRequest):
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
            return {"message": f"Создано {len(result.data)} целей", "goals": result.data}
        else:
            raise HTTPException(status_code=500, detail="Ошибка при создании целей")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.post("/actions/complete")
async def complete_action(action_request: ActionCompleteRequest):
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
