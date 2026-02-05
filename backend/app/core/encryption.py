"""API密钥加密工具"""

import os
import base64
from typing import Optional
from cryptography.fernet import Fernet

from app.core.config import settings


def _get_fernet() -> Fernet:
    """获取Fernet加密实例"""
    key = settings.ENCRYPTION_KEY
    if not key:
        # 如果没有配置加密密钥，生成一个警告并使用默认密钥
        # 生产环境中必须配置 ENCRYPTION_KEY
        import warnings
        warnings.warn(
            "ENCRYPTION_KEY 未配置，使用默认密钥。"
            "这在生产环境中是不安全的！"
        )
        # 使用固定的默认密钥（仅用于开发）
        key = "your-default-key-for-development-only-32b"
    
    # 确保密钥是有效的 Fernet 密钥格式
    # Fernet 需要 32 字节 base64 编码的密钥
    if len(key) != 44 or not _is_valid_fernet_key(key):
        # 如果不是有效的 Fernet 密钥，使用密钥派生
        key = _derive_fernet_key(key)
    
    return Fernet(key.encode() if isinstance(key, str) else key)


def _is_valid_fernet_key(key: str) -> bool:
    """检查是否是有效的 Fernet 密钥"""
    try:
        # Fernet 密钥必须是 32 字节的 base64 编码
        decoded = base64.urlsafe_b64decode(key)
        return len(decoded) == 32
    except Exception:
        return False


def _derive_fernet_key(password: str) -> str:
    """从密码派生 Fernet 密钥"""
    import hashlib
    # 使用 SHA256 哈希并取前 32 字节
    key_bytes = hashlib.sha256(password.encode()).digest()
    return base64.urlsafe_b64encode(key_bytes).decode()


def encrypt_api_key(api_key: str) -> str:
    """加密 API 密钥
    
    Args:
        api_key: 原始 API 密钥
        
    Returns:
        加密后的字符串
    """
    if not api_key:
        return ""
    
    fernet = _get_fernet()
    encrypted = fernet.encrypt(api_key.encode())
    return encrypted.decode()


def decrypt_api_key(encrypted_key: str) -> Optional[str]:
    """解密 API 密钥
    
    Args:
        encrypted_key: 加密后的密钥字符串
        
    Returns:
        解密后的原始 API 密钥，如果解密失败返回 None
    """
    if not encrypted_key:
        return None
    
    try:
        fernet = _get_fernet()
        decrypted = fernet.decrypt(encrypted_key.encode())
        return decrypted.decode()
    except Exception:
        # 解密失败，可能是密钥变更或数据损坏
        return None


def generate_encryption_key() -> str:
    """生成新的 Fernet 加密密钥
    
    用于首次部署时生成 ENCRYPTION_KEY
    
    Returns:
        base64 编码的 Fernet 密钥
    """
    return Fernet.generate_key().decode()
