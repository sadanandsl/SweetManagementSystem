from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app import database
from app.models.sweet import Sweet
from app.schemas.sweet_schema import SweetCreate, SweetResponse
from app.services import auth_service
from fastapi import Depends

router = APIRouter(prefix="/api/sweets", tags=["Sweets"])


# ✅ Get all sweets
@router.get("/", response_model=list[SweetResponse])
def get_all_sweets(db: Session = Depends(database.get_db)):
    sweets = db.query(Sweet).all()
    return sweets


# ✅ Add new sweet (JSON input)
@router.post("/", response_model=SweetResponse)
def add_sweet(sweet: SweetCreate, db: Session = Depends(database.get_db), current_user=Depends(auth_service.get_current_admin)):
    existing = db.query(Sweet).filter(Sweet.name == sweet.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sweet already exists")

    new_sweet = Sweet(
        name=sweet.name,
        category=sweet.category,
        price=sweet.price,
        quantity=sweet.quantity,
    )
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return new_sweet


# ✅ Search sweets by name, category, price range
@router.get("/search", response_model=list[SweetResponse])
def search_sweets(
    q: Optional[str] = Query(None, description="Search term for sweet name"),
    category: Optional[str] = Query(None, description="Category filter"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    db: Session = Depends(database.get_db),
):
    query = db.query(Sweet)
    if q:
        query = query.filter(Sweet.name.contains(q))
    if category:
        query = query.filter(Sweet.category == category)
    if min_price is not None:
        query = query.filter(Sweet.price >= min_price)
    if max_price is not None:
        query = query.filter(Sweet.price <= max_price)

    return query.all()


# ✅ Delete a sweet
@router.delete("/{sweet_id}")
def delete_sweet(sweet_id: int, db: Session = Depends(database.get_db), current_user=Depends(auth_service.get_current_admin)):
    sweet = db.query(Sweet).filter(Sweet.id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    db.delete(sweet)
    db.commit()
    return {"message": "Sweet deleted successfully"}
