from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse
from app.services import auth_service
from app.models import user as user_model

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ✅ Register new user (Admin or Billing)
@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth_service.hash_password(user.password)

    # ✅ Create new user with role (default to 'billing' if not specified)
    new_user = user_model.User(
        username=user.username,
        email=user.email,
        password=hashed_pw,
        role=user.role if user.role else "billing"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ✅ Login for both Admin and Billing Staff
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()

    if not db_user or not auth_service.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ Include role in token
    token = auth_service.create_access_token({
        "sub": db_user.email,
        "role": db_user.role
    })

    return {
        "access_token": token,
        "role": db_user.role,
        "token_type": "bearer"
    }
