from pathlib import Path
from fastapi.testclient import TestClient

# ensure fresh DB
HERE = Path(__file__).resolve().parent
DB_PATH = (HERE / ".." / "app" / "sweetshop.db").resolve()
if DB_PATH.exists():
    try:
        DB_PATH.unlink()
    except Exception:
        pass


def obtain_token(client, email, password):
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    return r.json()["access_token"]


def test_post_requires_auth():
    from app.main import app
    client = TestClient(app)

    payload = {"name": "p-test", "category": "Test", "price": 1.0, "quantity": 1}
    r = client.post("/api/sweets/", json=payload)
    assert r.status_code == 401


def test_admin_and_billing_roles():
    from app.main import app
    client = TestClient(app)

    # Register admin and billing users
    admin = {"username": "admin1", "email": "admin1@example.com", "password": "pw", "role": "admin"}
    bill = {"username": "bill1", "email": "bill1@example.com", "password": "pw", "role": "billing"}

    r = client.post("/api/auth/register", json=admin)
    assert r.status_code == 200
    r = client.post("/api/auth/register", json=bill)
    assert r.status_code == 200

    admin_token = obtain_token(client, admin["email"], admin["password"])
    bill_token = obtain_token(client, bill["email"], bill["password"])

    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_bill = {"Authorization": f"Bearer {bill_token}"}

    # Admin can create sweet
    payload = {"name": "role-sweet", "category": "Role", "price": 5.0, "quantity": 10}
    r = client.post("/api/sweets/", json=payload, headers=headers_admin)
    assert r.status_code == 200
    sweet = r.json()
    sid = sweet["id"]

    # Billing user cannot create (admin-only)
    r2 = client.post("/api/sweets/", json={"name": "role-sweet-2", "category": "Role", "price": 2.0, "quantity": 1}, headers=headers_bill)
    assert r2.status_code == 403

    # Billing can sell
    r3 = client.post("/api/billing/sell", params={"sweet_id": sid, "quantity_sold": 2}, headers=headers_bill)
    assert r3.status_code == 200

    # Billing cannot restock (admin-only)
    r4 = client.post("/api/billing/restock", params={"sweet_id": sid, "amount": 5}, headers=headers_bill)
    assert r4.status_code == 403

    # Admin can delete
    r5 = client.delete(f"/api/sweets/{sid}", headers=headers_admin)
    assert r5.status_code == 200