import os
from pathlib import Path
import uuid

# Ensure sqlite DB is recreated with the updated models
HERE = Path(__file__).resolve().parent
DB_PATH = (HERE / ".." / "app" / "sweetshop.db").resolve()
if DB_PATH.exists():
    try:
        DB_PATH.unlink()
    except Exception:
        pass

from fastapi.testclient import TestClient


def test_add_and_search_sweet():
    # import app after deleting DB so tables are created fresh
    from app.main import app

    client = TestClient(app)

    # create admin and obtain token to authorize creating sweets
    admin = {"username": "admin_add", "email": "admin_add@example.com", "password": "pw", "role": "admin"}
    client.post("/api/auth/register", json=admin)
    tok = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"]}).json()["access_token"]
    headers = {"Authorization": f"Bearer {tok}"}

    unique_name = f"test-sweet-{uuid.uuid4().hex[:8]}"
    payload = {
        "name": unique_name,
        "category": "Ghee",
        "price": 199.5,
        "quantity": 5,
    }

    # Add sweet (admin)
    resp = client.post("/api/sweets/", json=payload, headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["name"] == unique_name
    assert data["category"] == "Ghee"

    sweet_id = data["id"]

    # Search by name
    resp2 = client.get(f"/api/sweets/search?q={unique_name}")
    assert resp2.status_code == 200, resp2.text
    results = resp2.json()
    assert any(s["id"] == sweet_id for s in results)

    # Search by category
    resp3 = client.get("/api/sweets/search?category=Ghee")
    assert resp3.status_code == 200
    assert any(s["id"] == sweet_id for s in resp3.json())

    # Search by price range
    resp4 = client.get("/api/sweets/search?min_price=100&max_price=300")
    assert resp4.status_code == 200
    assert any(s["id"] == sweet_id for s in resp4.json())

    # Attempt duplicate add (admin)
    resp_dup = client.post("/api/sweets/", json=payload, headers=headers)
    assert resp_dup.status_code == 400

    # Cleanup
    client.delete(f"/api/sweets/{sweet_id}", headers=headers)
