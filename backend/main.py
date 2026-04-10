from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from schema import DebateConfig
from agents.debate_engine import DebateEngine
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Debate System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/debate/start")
async def start_debate(config: DebateConfig):
    engine = DebateEngine(config)
    
    async def event_generator():
        try:
            async for update in engine.run_debate():
                yield {
                    "event": "message",
                    "data": update
                }
            yield {
                "event": "done",
                "data": "Debate completed"
            }
        except Exception as e:
            yield {
                "event": "error",
                "data": str(e).replace("\n", " ")
            }

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
