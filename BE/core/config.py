import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "shop_manager_be"
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306")) 
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "321321..")
    DB_NAME: str = os.getenv("DB_NAME", "MANAGER_SHOP")
    
    # Đồng bộ tên biến có tiền tố JWT_
    JWT_SECRET_KEY: str = "DEFAULT_SUPER_SECRET_KEY_FALLBACK"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()