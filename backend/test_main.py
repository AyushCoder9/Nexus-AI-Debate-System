from fastapi.testclient import TestClient
from main import app
from schema import DebateConfig

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_debate_start_validation():
    # Missing required 'topic' in body should fail
    response = client.post("/debate/start", json={"rounds": 3})
    assert response.status_code == 422 # Unprocessable Entity validation error

def test_debate_schema_defaults():
    config = DebateConfig(topic="AI Rights")
    assert config.rounds == 3
    assert config.proponent_model == "gpt-4o"
