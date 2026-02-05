"""AI服务适配器"""

from app.services.ai.base import BaseAIAdapter
from app.services.ai.openai_adapter import OpenAIAdapter
from app.services.ai.claude_adapter import ClaudeAdapter

__all__ = [
    "BaseAIAdapter",
    "OpenAIAdapter",
    "ClaudeAdapter",
]
