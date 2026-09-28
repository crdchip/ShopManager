import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from core.config import settings

from modules.products.models import Product
from modules.categories.models import Category
from modules.suppliers.models import Supplier

from core.database import Base

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Kết nối router chính
app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Welcome to Shop Manager API"}

if __name__ == "__main__":
    # ĐỔI host THÀNH "0.0.0.0" ĐỂ CHẠY ĐƯỢC CẢ TRÊN IP LAN 10.98.127.161
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)