from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, sweets, billing
from fastapi.staticfiles import StaticFiles

# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize app
app = FastAPI(title="Sweet Shop Management System")

# ✅ Allow frontend (React) to access the backend (CORS)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # allow your React frontend
    allow_credentials=True,
    allow_methods=["*"],           # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],           # allow all headers
)

# Routers
app.include_router(auth.router)
app.include_router(sweets.router)
app.include_router(billing.router)

# Root route
@app.get("/")
def root():
    return {"message": "Sweet Shop API is running"}
