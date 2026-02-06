"""用户相关Schema"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


# ===== 认证相关 =====

class UserRegister(BaseModel):
    """用户注册请求"""
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    nickname: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """用户登录请求"""
    username: str  # 支持用户名或邮箱
    password: str


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ===== 用户管理相关 =====

class UserUpdate(BaseModel):
    """更新用户信息"""
    nickname: Optional[str] = Field(None, max_length=100)
    avatar: Optional[str] = Field(None, max_length=500)
    email: Optional[str] = Field(None, max_length=255)


class UserUpdateByAdmin(BaseModel):
    """管理员更新用户信息"""
    nickname: Optional[str] = Field(None, max_length=100)
    avatar: Optional[str] = Field(None, max_length=500)
    email: Optional[str] = Field(None, max_length=255)
    role: Optional[Literal["admin", "user"]] = None
    is_active: Optional[bool] = None


class PasswordChange(BaseModel):
    """修改密码"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    """用户响应"""
    id: str
    username: str
    email: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """用户列表响应"""
    items: list[UserResponse]
    total: int
    page: int
    page_size: int


# 解决循环引用
TokenResponse.model_rebuild()
