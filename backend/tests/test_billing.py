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


def test_sell_and_insufficient_stock():
    from app.main import app
    client = TestClient(app)
    # create admin and billing users
    admin = {"username": "admin_b", "email": "admin_b@example.com", "password": "pw", "role": "admin"}
    bill = {"username": "bill_b", "email": "bill_b@example.com", "password": "pw", "role": "billing"}
    client.post("/api/auth/register", json=admin)
    client.post("/api/auth/register", json=bill)

    admin_token = client.post("/api/auth/login", json={"email": admin["email"], "password": admin["password"]}).json()["access_token"]
    bill_token = client.post("/api/auth/login", json={"email": bill["email"], "password": bill["password"]}).json()["access_token"]

    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_bill = {"Authorization": f"Bearer {bill_token}"}

    # create a sweet (admin)
    payload = {"name": "bill-sweet", "category": "Dry", "price": 10.0, "quantity": 3}
    r = client.post("/api/sweets/", json=payload, headers=headers_admin)
    assert r.status_code == 200
    sweet = r.json()
    sid = sweet["id"]

    # sell 2 units (billing)
    r2 = client.post("/api/billing/sell", params={"sweet_id": sid, "quantity_sold": 2}, headers=headers_bill)
    assert r2.status_code == 200
    data = r2.json()
    assert data["quantity_sold"] == 2
    assert data["remaining_stock"] == 1

    # try to sell more than available
    r3 = client.post("/api/billing/sell", params={"sweet_id": sid, "quantity_sold": 5}, headers=headers_bill)
    assert r3.status_code == 400
