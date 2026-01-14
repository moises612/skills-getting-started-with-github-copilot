import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

# Puedes agregar más pruebas según los endpoints disponibles
def test_signup_activity():
    # Ajusta los datos según la actividad y lógica real
    response = client.post("/activities/Título%20de%20la%20Actividad/signup?email=test@example.com")
    assert response.status_code in (200, 400, 422)
    # El mensaje puede variar según la lógica de negocio
    assert "message" in response.json() or "detail" in response.json()
