"""FastAPI 应用入口"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, projects, presets, story_bible, stories, chapters, storyboard, assets, generation, export, ai_models
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    print("MAN Backend starting...")
    yield
    # 关闭时
    print("MAN Backend shutting down...")


app = FastAPI(
    title="MAN - AI漫画生成系统",
    description="从一句话输入到完整漫画输出的全流程AI漫画生成系统",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由 - 认证和用户管理
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

# 注册路由 - 业务功能
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(presets.router, prefix="/api/presets", tags=["presets"])
app.include_router(story_bible.router, prefix="/api/projects", tags=["story-bible"])
app.include_router(stories.router, prefix="/api/projects", tags=["stories"])
app.include_router(chapters.router, prefix="/api/projects", tags=["chapters"])
app.include_router(storyboard.router, prefix="/api/projects", tags=["storyboard"])
app.include_router(assets.router, prefix="/api/projects", tags=["assets"])
app.include_router(generation.router, prefix="/api/projects", tags=["generation"])
app.include_router(export.router, prefix="/api/projects", tags=["export"])
app.include_router(ai_models.router, prefix="/api/ai-models", tags=["ai-models"])


@app.get("/")
async def root():
    """健康检查"""
    return {"status": "ok", "service": "MAN Backend", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}
