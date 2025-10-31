"""
Расширенный ИИ-агент - Личный менеджер
Обеспечивает навигацию, разбиение целей на этапы, мотивацию и советы
"""

import os
import httpx
import json
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, date, timedelta
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class PersonalAIManager:
    """
    Расширенный ИИ-агент, работающий как личный менеджер
    Предоставляет: навигацию, разбиение целей на этапы, мотивацию, советы
    """
    
    def __init__(self):
        """Инициализация личного менеджера"""
        # Проверяем доступные API ключи
        self.groq_key = os.getenv('GROQ_API_KEY')
        self.huggingface_key = os.getenv('HUGGINGFACE_API_KEY')
        self.cohere_key = os.getenv('COHERE_API_KEY')
        self.deepseek_key = os.getenv('DEEPSEEK_API_KEY')
        
        # Базовый системный промпт для личного менеджера
        self.base_system_prompt = (
            "Ты — личный менеджер и помощник в приложении для достижения целей. "
            "Ты помогаешь пользователям планировать, мотивировать и достигать их мечты. "
            "Используй метафоры путешествий: дорога, карта, навигатор, попутчик. "
            "Будь дружелюбным, поддерживающим и практичным. "
            "Отвечай на русском языке. "
            "Дай конкретные, применимые советы. "
        )
        
        # Статистика использования
        self.stats = {
            'groq_success': 0,
            'groq_failures': 0,
            'fallback_used': 0,
            'total_requests': 0
        }
    
    async def _call_ai(self, system_prompt: str, user_prompt: str, max_tokens: int = 500) -> Optional[str]:
        """
        Вызов ИИ API с fallback стратегией
        
        Args:
            system_prompt: Системный промпт
            user_prompt: Пользовательский промпт
            max_tokens: Максимальное количество токенов
            
        Returns:
            Ответ от ИИ или None
        """
        self.stats['total_requests'] += 1
        
        # Пробуем Groq (основной бесплатный API)
        if self.groq_key:
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
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": user_prompt}
                            ],
                            "max_tokens": max_tokens,
                            "temperature": 0.7
                        }
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'choices' in result and len(result['choices']) > 0:
                            text = result['choices'][0]['message']['content']
                            if text:
                                self.stats['groq_success'] += 1
                                logger.info(f"Groq успешно обработал запрос")
                                return text.strip()
                    
                    self.stats['groq_failures'] += 1
                    logger.warning(f"Groq недоступен: {response.status_code}")
            except Exception as e:
                self.stats['groq_failures'] += 1
                logger.warning(f"Groq ошибка: {e}")
        
        # Если Groq не сработал, используем fallback
        self.stats['fallback_used'] += 1
        logger.info("Используем fallback ответ")
        return None
    
    async def break_goal_into_steps(self, goal_title: str, goal_description: str = "", goal_type: str = "goal") -> Dict[str, Any]:
        """
        Разбивает цель на конкретные этапы
        
        Args:
            goal_title: Название цели
            goal_description: Описание цели
            goal_type: Тип цели
            
        Returns:
            Словарь с этапами и рекомендациями
        """
        system_prompt = (
            f"{self.base_system_prompt}"
            "Твоя задача — разбить цель на конкретные, измеримые этапы. "
            "Каждый этап должен быть:"
            "- Конкретным и понятным"
            "- Выполнимым за 1-2 недели"
            "- С измеримым результатом"
            "- С логической последовательностью"
            "Верни ответ ТОЛЬКО в формате JSON:"
            '{"steps": [{"title": "Название этапа", "description": "Описание", "estimated_days": число, "priority": число_1_5}], "advice": "общие рекомендации"}'
        )
        
        user_prompt = (
            f"Цель: {goal_title}\n"
            f"Описание: {goal_description or 'Нет описания'}\n"
            f"Тип: {goal_type}\n\n"
            "Разбей эту цель на конкретные этапы. Верни ТОЛЬКО JSON без дополнительного текста."
        )
        
        response = await self._call_ai(system_prompt, user_prompt, max_tokens=800)
        
        if response:
            try:
                # Пытаемся извлечь JSON из ответа
                # ИИ может добавить пояснения, ищем JSON блок
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    result = json.loads(json_str)
                    return result
            except json.JSONDecodeError:
                logger.warning(f"Не удалось распарсить JSON: {response}")
        
        # Fallback: создаем базовые этапы
        return self._get_fallback_steps(goal_title, goal_description)
    
    def _get_fallback_steps(self, goal_title: str, goal_description: str) -> Dict[str, Any]:
        """Fallback этапы если ИИ недоступен"""
        steps = [
            {
                "title": f"Изучить основы {goal_title}",
                "description": "Найти ресурсы и изучить основные концепции",
                "estimated_days": 7,
                "priority": 3
            },
            {
                "title": f"Составить план действий для {goal_title}",
                "description": "Детально расписать шаги и сроки",
                "estimated_days": 3,
                "priority": 4
            },
            {
                "title": f"Начать практическую реализацию {goal_title}",
                "description": "Приступить к выполнению первого практического шага",
                "estimated_days": 14,
                "priority": 5
            },
            {
                "title": f"Оценить прогресс в {goal_title}",
                "description": "Проанализировать результаты и скорректировать план",
                "estimated_days": 2,
                "priority": 2
            }
        ]
        
        return {
            "steps": steps,
            "advice": f"Разбей большую цель '{goal_title}' на небольшие шаги. Начни с изучения основ, затем составь план и приступай к практике. Регулярно оценивай прогресс."
        }
    
    async def get_navigation_advice(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Получает советы по навигации: что делать дальше
        
        Args:
            user_data: Данные пользователя (цели, карты, действия)
            
        Returns:
            Словарь с рекомендациями по навигации
        """
        # Анализируем данные пользователя
        active_goals = [g for g in user_data.get('goals', []) if not g.get('is_completed', False)]
        active_cards = [c for c in user_data.get('cards', []) if c.get('status') == 'active']
        recent_actions = user_data.get('daily_actions', [])[:7]  # Последние 7 дней
        
        # Если у пользователя нет активных целей - сразу возвращаем специальный ответ
        if len(active_goals) == 0:
            return {
                "next_actions": [{
                    "title": "🎯 Поставь свою первую цель",
                    "description": "Начни свой путь к мечте! Перейди на вкладку 'Карта' и создай свою первую цель. Без цели невозможно двигаться вперед.",
                    "priority": 5
                }],
                "focus": "Сначала нужно определить направление! Создай свою первую цель, чтобы понять, куда двигаться.",
                "warnings": ["У тебя еще нет активных целей. Без цели невозможно получить персональные рекомендации."],
                "no_goals": True  # Флаг для фронтенда
            }
        
        system_prompt = (
            f"{self.base_system_prompt}"
            "Ты навигатор на пути к мечте. Проанализируй ситуацию пользователя и дай конкретные рекомендации:"
            "- Что делать прямо сейчас (1-2 конкретных действия)"
            "- На чем сосредоточиться в ближайшие дни"
            "- Какие препятствия могут возникнуть и как их преодолеть"
            "Верни ответ в формате JSON:"
            '{"next_actions": [{"title": "Действие", "description": "Описание", "priority": число}], "focus": "на чем сосредоточиться", "warnings": ["предупреждения"]}'
        )
        
        user_prompt = (
            f"Активные цели: {len(active_goals)}\n"
            f"Активные карты: {len(active_cards)}\n"
            f"Действий за последние 7 дней: {len(recent_actions)}\n"
            f"Топ-3 активных цели: {', '.join([g.get('description', g.get('title', 'Цель'))[:50] for g in active_goals[:3]])}\n\n"
            "Что пользователю делать дальше? Верни ТОЛЬКО JSON без дополнительного текста."
        )
        
        response = await self._call_ai(system_prompt, user_prompt, max_tokens=600)
        
        if response:
            try:
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    result = json.loads(json_str)
                    return result
            except json.JSONDecodeError:
                logger.warning(f"Не удалось распарсить JSON: {response}")
        
        # Fallback рекомендации
        return self._get_fallback_navigation(active_goals, active_cards, recent_actions)
    
    def _get_fallback_navigation(self, active_goals: List, active_cards: List, recent_actions: List) -> Dict[str, Any]:
        """Fallback навигация"""
        next_actions = []
        
        if len(active_goals) == 0:
            next_actions.append({
                "title": "Поставь первую цель",
                "description": "Начни свой путь к мечте с постановки первой цели",
                "priority": 5
            })
        elif len(recent_actions) < 3:
            next_actions.append({
                "title": "Выполни ежедневное действие",
                "description": "Сделай хотя бы один маленький шаг к своей цели сегодня",
                "priority": 5
            })
        else:
            next_actions.append({
                "title": "Продолжай выполнять ежедневные действия",
                "description": "Твоя серия действий помогает двигаться к цели",
                "priority": 4
            })
        
        if len(active_cards) > 5:
            next_actions.append({
                "title": "Пересмотри приоритеты",
                "description": "У тебя много активных задач. Сосредоточься на самых важных",
                "priority": 3
            })
        
        return {
            "next_actions": next_actions[:3],
            "focus": "Сосредоточься на выполнении ежедневных действий и двигайся к своим целям маленькими шагами",
            "warnings": []
        }
    
    async def get_personal_advice(self, question: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Получает персональный совет по вопросу пользователя
        
        Args:
            question: Вопрос или запрос пользователя
            context: Контекст (цели, прогресс и т.д.)
            
        Returns:
            Словарь с советом и рекомендациями
        """
        context_str = ""
        if context:
            active_goals = [g for g in context.get('goals', []) if not g.get('is_completed', False)]
            context_str = f"У пользователя {len(active_goals)} активных целей. "
            if active_goals:
                context_str += f"Основные цели: {', '.join([g.get('description', g.get('title', ''))[:50] for g in active_goals[:3]])}"
        
        system_prompt = (
            f"{self.base_system_prompt}"
            "Ты мудрый наставник. Дай конкретный, практичный совет на основе вопроса пользователя. "
            "Верни ответ в формате JSON:"
            '{"advice": "основной совет", "steps": ["шаг 1", "шаг 2"], "motivation": "мотивирующая фраза"}'
        )
        
        user_prompt = f"Вопрос пользователя: {question}\n\nКонтекст: {context_str or 'Нет дополнительного контекста'}\n\nДай совет. Верни ТОЛЬКО JSON."
        
        response = await self._call_ai(system_prompt, user_prompt, max_tokens=500)
        
        if response:
            try:
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    result = json.loads(json_str)
                    return result
            except json.JSONDecodeError:
                logger.warning(f"Не удалось распарсить JSON: {response}")
        
        # Fallback совет
        return {
            "advice": "Продолжай двигаться к своей цели маленькими шагами каждый день. Постоянство важнее скорости.",
            "steps": [
                "Определи один конкретный шаг",
                "Выполни его сегодня",
                "Повторяй ежедневно"
            ],
            "motivation": "Каждое маленькое действие приближает тебя к большой мечте!"
        }
    
    async def get_motivation(self, context: Dict[str, Any] = None) -> str:
        """
        Получает мотивационное сообщение
        
        Args:
            context: Контекст (прогресс, достижения и т.д.)
            
        Returns:
            Мотивационное сообщение
        """
        context_str = ""
        if context:
            completed_goals = len([g for g in context.get('goals', []) if g.get('is_completed', False)])
            active_goals = len([g for g in context.get('goals', []) if not g.get('is_completed', False)])
            recent_actions = len(context.get('daily_actions', []))
            context_str = f"У пользователя {completed_goals} выполненных целей, {active_goals} активных целей, {recent_actions} выполненных действий."
        
        system_prompt = (
            f"{self.base_system_prompt}"
            "Дай короткое (2-3 предложения) вдохновляющее мотивационное сообщение, используя метафоры путешествия."
        )
        
        user_prompt = f"Контекст: {context_str or 'Пользователь на пути к своим целям'}\n\nДай мотивацию. Только текст, без JSON."
        
        response = await self._call_ai(system_prompt, user_prompt, max_tokens=200)
        
        if response:
            return response.strip()
        
        # Fallback мотивация
        fallback_messages = [
            "Каждый шаг приближает тебя к мечте! Ты как путешественник, который не останавливается перед трудностями. Вперед!",
            "Твой путь к цели продолжается! Помни: великие путешествия состоят из маленьких шагов. Продолжай!",
            "Ты на правильном пути! Как опытный навигатор, ты знаешь куда идешь. Не останавливайся!"
        ]
        import random
        return random.choice(fallback_messages)
    
    async def analyze_progress(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Анализирует прогресс пользователя на основе данных из базы данных
        
        Args:
            user_data: Данные пользователя из БД (goals, daily_actions, cards, user)
            
        Returns:
            Словарь с детальным анализом и рекомендациями
        """
        # Анализируем данные из БД
        all_goals = user_data.get('goals', [])
        completed_goals = [g for g in all_goals if g.get('is_completed', False)]
        active_goals = [g for g in all_goals if not g.get('is_completed', False)]
        
        # Обрабатываем действия из БД
        actions = user_data.get('daily_actions', [])
        all_cards = user_data.get('cards', [])
        active_cards = [c for c in all_cards if c.get('status') == 'active']
        completed_cards = [c for c in all_cards if c.get('status') == 'completed']
        
        # Получаем дату регистрации пользователя
        user = user_data.get('user', {})
        user_created = None
        if user.get('created_at'):
            try:
                if isinstance(user['created_at'], str):
                    user_created = datetime.fromisoformat(user['created_at'].replace('Z', '+00:00')).date()
                else:
                    user_created = user['created_at'].date() if hasattr(user['created_at'], 'date') else date.today()
            except:
                user_created = date.today()
        else:
            user_created = date.today()
        
        # Правильно вычисляем streak: последовательные дни от сегодня назад
        streak = 0
        today = date.today()
        
        if actions:
            # Преобразуем все даты действий в объекты date и сортируем по убыванию
            action_dates = []
            for action in actions:
                action_date = action.get('action_date')
                if isinstance(action_date, str):
                    try:
                        action_dates.append(datetime.fromisoformat(action_date).date())
                    except:
                        try:
                            action_dates.append(datetime.strptime(action_date, '%Y-%m-%d').date())
                        except:
                            pass
                elif hasattr(action_date, 'date'):
                    action_dates.append(action_date.date() if hasattr(action_date, 'date') else action_date)
                else:
                    action_dates.append(action_date)
            
            # Убираем дубликаты и сортируем
            action_dates = sorted(set(action_dates), reverse=True)
            
            # Вычисляем streak: идем от сегодня назад, проверяя последовательность
            check_date = today
            for action_date in action_dates:
                if action_date == check_date:
                    streak += 1
                    check_date = check_date - timedelta(days=1)
                elif action_date < check_date:
                    break
        
        # Дополнительная статистика из БД
        days_since_start = (today - user_created).days if user_created else 0
        total_actions = len(actions)
        avg_actions_per_week = (total_actions / max(1, days_since_start / 7)) if days_since_start > 0 else 0
        
        # Процент выполнения целей
        goal_completion_rate = (len(completed_goals) / len(all_goals) * 100) if len(all_goals) > 0 else 0
        
        # Статистика по картам
        high_priority_cards = len([c for c in active_cards if c.get('priority', 1) >= 4])
        
        # Формируем детальную статистику для ИИ
        stats_summary = (
            f"📊 Статистика пользователя:\n"
            f"- Дней с регистрации: {days_since_start}\n"
            f"- Всего целей: {len(all_goals)} (выполнено: {len(completed_goals)}, активно: {len(active_goals)})\n"
            f"- Процент выполнения целей: {goal_completion_rate:.1f}%\n"
            f"- Всего ежедневных действий: {total_actions}\n"
            f"- Серия дней (streak): {streak}\n"
            f"- Средняя активность: {avg_actions_per_week:.1f} действий/неделю\n"
            f"- Всего карт: {len(all_cards)} (активно: {len(active_cards)}, выполнено: {len(completed_cards)})\n"
            f"- Высокоприоритетных активных карт: {high_priority_cards}\n"
        )
        
        system_prompt = (
            f"{self.base_system_prompt}"
            "Ты аналитик прогресса. Проанализируй статистику пользователя из базы данных и дай детальный анализ. "
            "Учти: серия дней (streak) - это последовательные дни с момента последнего действия до сегодня. "
            "Верни в формате JSON:"
            '{"strength": "сильные стороны (конкретные факты из статистики)", "weaknesses": "слабые места и области для улучшения", "recommendations": ["конкретная рекомендация 1", "конкретная рекомендация 2", "конкретная рекомендация 3"], "score": число_от_0_до_100}'
        )
        
        user_prompt = (
            f"{stats_summary}\n"
            f"Детали:\n"
            f"- Активные цели: {', '.join([g.get('description', g.get('goal_type', 'Цель'))[:30] for g in active_goals[:3]]) if active_goals else 'Нет активных целей'}\n"
            f"- Выполненные цели: {', '.join([g.get('description', g.get('goal_type', 'Цель'))[:30] for g in completed_goals[:3]]) if completed_goals else 'Нет выполненных целей'}\n"
            f"- Последние действия: {min(7, len(actions))} дней назад\n\n"
            f"Дай детальный анализ прогресса на основе этих реальных данных из базы. Верни ТОЛЬКО JSON."
        )
        
        response = await self._call_ai(system_prompt, user_prompt, max_tokens=700)
        
        if response:
            try:
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    result = json.loads(json_str)
                    # Добавляем вычисленные значения из БД
                    result['streak'] = streak
                    result['days_since_start'] = days_since_start
                    result['total_actions'] = total_actions
                    result['avg_actions_per_week'] = round(avg_actions_per_week, 1)
                    result['goal_completion_rate'] = round(goal_completion_rate, 1)
                    return result
            except json.JSONDecodeError:
                logger.warning(f"Не удалось распарсить JSON: {response}")
        
        # Fallback анализ на основе данных из БД
        score = min(100, (
            len(completed_goals) * 15 +  # 15 баллов за каждую выполненную цель
            streak * 3 +  # 3 балла за каждый день серии
            min(30, total_actions // 2) +  # до 30 баллов за активность
            min(20, goal_completion_rate / 5)  # до 20 баллов за процент выполнения
        ))
        
        # Формируем детальные рекомендации на основе реальных данных
        recommendations = []
        if len(active_goals) == 0 and len(completed_goals) == 0:
            recommendations.append("Создай свою первую цель для начала пути к мечте")
        elif len(active_goals) == 0:
            recommendations.append("Создай новую цель - у тебя нет активных целей")
        
        if streak == 0:
            recommendations.append("Начни ежедневную серию - выполни действие сегодня")
        elif streak < 7:
            recommendations.append(f"Поддерживай свою серию из {streak} дней - не пропускай дни")
        
        if goal_completion_rate < 50 and len(all_goals) > 0:
            recommendations.append("Сфокусируйся на выполнении текущих целей")
        
        if high_priority_cards > 5:
            recommendations.append("У тебя много высокоприоритетных задач - расставь приоритеты")
        
        if not recommendations:
            recommendations = [
                "Продолжай в том же духе",
                "Регулярно анализируй свой прогресс",
                "Ставь новые цели после выполнения текущих"
            ]
        
        return {
            "strength": f"У тебя {len(completed_goals)} выполненных целей, серия из {streak} дней и {total_actions} выполненных действий" if streak > 0 and total_actions > 0 else f"У тебя {len(completed_goals)} выполненных целей и {total_actions} выполненных действий",
            "weaknesses": "Продолжай выполнять ежедневные действия для поддержания серии" if streak < 7 else "Отличная работа! Продолжай в том же духе",
            "recommendations": recommendations[:3],
            "score": int(score),
            "streak": streak,
            "days_since_start": days_since_start,
            "total_actions": total_actions,
            "avg_actions_per_week": round(avg_actions_per_week, 1),
            "goal_completion_rate": round(goal_completion_rate, 1)
        }
    
    def get_stats(self) -> Dict[str, int]:
        """Возвращает статистику использования"""
        return self.stats.copy()
    
    def reset_stats(self):
        """Сбрасывает статистику"""
        self.stats = {
            'groq_success': 0,
            'groq_failures': 0,
            'fallback_used': 0,
            'total_requests': 0
        }

