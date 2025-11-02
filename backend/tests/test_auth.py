from pathlib import Path

# ensure fresh DB
HERE = Path(__file__).resolve().parent
DB_PATH = (HERE / ".." / "app" / "sweetshop.db").resolve()
if DB_PATH.exists():
    try:
        DB_PATH.unlink()
    except Exception:
        pass

from fastapi.testclient import TestClient


def test_register_and_login():
    from app.main import app

    client = TestClient(app)

    payload = {
        "username": "tester",
        "email": "tester@example.com",
        "password": "secret",
        "role": "billing",
    }

    # Register
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == payload["email"]
    assert data["username"] == payload["username"]

    # Login
    r2 = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert r2.status_code == 200, r2.text
    token_data = r2.json()
    assert "access_token" in token_data
    assert token_data["role"] == payload["role"]


def test_duplicate_register():
    from app.main import app
    client = TestClient(app)

    payload = {
        "username": "dup",
        "email": "dup@example.com",
        "password": "secret",
        "role": "billing",
    }

    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 200

    # try again
    r2 = client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400
