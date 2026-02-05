"""应用配置"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置类"""
    
    # 基础配置
    APP_NAME: str = "MAN"
    DEBUG: bool = False
    
    # 数据库配置
    DATABASE_URL: str = "postgresql://man:man_password@localhost:5432/man"
    
    # Redis配置
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # AI服务配置
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    SD_API_URL: str = "http://localhost:7860"
    COMFYUI_API_URL: str = "http://localhost:8188"
    MIDJOURNEY_API_KEY: str = ""
    
    # 文件存储配置
    DATA_DIR: str = "./data"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
