"""Celery配置"""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "man",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.services.pipeline.story_bible",
        "app.services.pipeline.story_expand",
        "app.services.pipeline.chapter_plan",
        "app.services.pipeline.panel_script",
        "app.services.pipeline.consistency",
        "app.services.pipeline.image_gen",
        "app.services.pipeline.layout",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1小时超时
    worker_prefetch_multiplier=1,
)
