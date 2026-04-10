import os
import sys
import traceback
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from agents.prompts import (
    PROPONENT_SYSTEM_PROMPT,
    OPPONENT_SYSTEM_PROMPT,
    MODERATOR_SYSTEM_PROMPT,
    FACT_CHECKER_SYSTEM_PROMPT,
)
from schema import DebateConfig, Message
from typing import List, AsyncGenerator
import json
import uuid


def get_model(model_name: str):
    """Return a LangChain chat model based on model name."""
    name = model_name.lower()
    if "gpt" in name:
        return ChatOpenAI(model=model_name, streaming=True, max_tokens=300)
    elif "gemini" in name:
        return ChatGoogleGenerativeAI(model=model_name, streaming=True, max_output_tokens=300)
    elif "llama" in name or "mixtral" in name:
        return ChatGroq(model_name=model_name, streaming=True, max_tokens=300)
    else:
        return ChatOpenAI(model="gpt-3.5-turbo", streaming=True, max_tokens=300)


class DebateEngine:
    def __init__(self, config: DebateConfig):
        self.config = config
        self.messages: List[Message] = []
        self.session_id = str(uuid.uuid4())

    async def run_debate(self) -> AsyncGenerator[str, None]:
        for r in range(1, self.config.rounds + 1):
            # 1. Proponent
            pro = await self._generate_response(
                role="proponent",
                model_name=self.config.proponent_model,
                prompt_template=PROPONENT_SYSTEM_PROMPT,
                persona=self.config.proponent_persona,
                round_num=r,
            )
            yield json.dumps({"role": "proponent", "content": pro, "round": r})

            # 2. Opponent
            opp = await self._generate_response(
                role="opponent",
                model_name=self.config.opponent_model,
                prompt_template=OPPONENT_SYSTEM_PROMPT,
                persona=self.config.opponent_persona,
                round_num=r,
            )
            yield json.dumps({"role": "opponent", "content": opp, "round": r})

            # 3. Fact-Checker
            fact = await self._generate_response(
                role="fact_checker",
                model_name=self.config.fact_checker_model,
                prompt_template=FACT_CHECKER_SYSTEM_PROMPT,
                persona="Objective Fact Checker",
                round_num=r,
            )
            yield json.dumps({"role": "fact_checker", "content": fact, "round": r})

            # 4. Moderator
            mod = await self._generate_response(
                role="moderator",
                model_name=self.config.moderator_model,
                prompt_template=MODERATOR_SYSTEM_PROMPT,
                persona="Neutral Moderator",
                round_num=r,
            )
            yield json.dumps({"role": "moderator", "content": mod, "round": r})

    async def _generate_response(
        self,
        role: str,
        model_name: str,
        prompt_template: str,
        persona: str,
        round_num: int,
    ) -> str:
        model = get_model(model_name)

        # Keep context SHORT — only last 2 messages to save tokens
        context = "\n".join(
            [f"{m.role.upper()}: {m.content[:200]}" for m in self.messages[-2:]]
        ) or "None yet."

        round_messages = "\n".join(
            [f"{m.role.upper()}: {m.content[:200]}" for m in self.messages if m.round == round_num]
        ) or "None yet."

        recent_messages = "\n".join(
            [f"{m.role.upper()}: {m.content[:200]}" for m in self.messages[-2:]]
        ) or "None yet."

        prompt = prompt_template.format_map(
            {
                "topic": self.config.topic,
                "persona": persona,
                "context": context,
                "round_messages": round_messages,
                "recent_messages": recent_messages,
            }
        )

        full_content = ""
        try:
            async for chunk in model.astream(prompt):
                if hasattr(chunk, "content") and chunk.content:
                    full_content += chunk.content
        except Exception as e:
            print(f"[DebateEngine] ERROR {role}/{model_name}: {e}", file=sys.stderr)
            traceback.print_exc()
            raise

        new_msg = Message(role=role, content=full_content, round=round_num)
        self.messages.append(new_msg)
        return full_content
