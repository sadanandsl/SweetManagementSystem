from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class Sweet(Base):
    __tablename__ = "sweets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), nullable=True)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=0)
