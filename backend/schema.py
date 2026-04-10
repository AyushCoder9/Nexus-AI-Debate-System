from pydantic import BaseModel
from typing import List, Optional

class DebateConfig(BaseModel):
    topic: str
    rounds: int = 3
    proponent_model: str = "gpt-4o"
    opponent_model: str = "gpt-4o"
    moderator_model: str = "gpt-4o"
    fact_checker_model: str = "gpt-4o"
    proponent_persona: str = "Logical and Evidence-based"
    opponent_persona: str = "Skeptical and Critical"

class Message(BaseModel):
    role: str # 'proponent', 'opponent', 'moderator', 'fact_checker'
    content: str
    round: int

class DebateSession(BaseModel):
    session_id: str
    config: DebateConfig
    messages: List[Message] = []
    status: str = "idle" # 'idle', 'running', 'completed', 'failed'
