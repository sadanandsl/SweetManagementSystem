from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import database
from app.models.sweet import Sweet
from app.services import auth_service

router = APIRouter(prefix="/api/billing", tags=["Billing"])


@router.post("/sell")
def sell_sweet(sweet_id: int, quantity_sold: float, db: Session = Depends(database.get_db), current_user=Depends(auth_service.get_current_billing)):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    if sweet.quantity < quantity_sold:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    # Calculate total price
    total_price = sweet.price * quantity_sold

    # Update remaining stock
    sweet.quantity -= quantity_sold
    db.commit()
    db.refresh(sweet)

    return {
        "message": "Billing successful",
        "sweet_name": sweet.name,
        "quantity_sold": quantity_sold,
        "total_price": total_price,
        "remaining_stock": sweet.quantity,
    }


@router.post("/restock")
def restock_sweet(sweet_id: int, amount: float, db: Session = Depends(database.get_db), current_user=Depends(auth_service.get_current_admin)):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    sweet.quantity += amount
    db.commit()
    db.refresh(sweet)

    return {"message": "Restocked", "sweet_id": sweet.id, "new_quantity": sweet.quantity}
