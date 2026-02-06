## ENCRYPTION_KEY 重置指南

`ENCRYPTION_KEY` 用于加密存储在数据库中的 AI 模型 API 密钥。重置密钥需要注意：

> ⚠️ **重要提醒**：重置密钥后，之前加密的所有 API 密钥将**无法解密**，需要重新配置所有 AI 模型的 API 密钥。

---

### 重置步骤

**1. 生成新密钥**

```bash
# 方法一：使用 Python 命令
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# 方法二：在项目中使用内置函数
cd backend
python -c "from app.core.encryption import generate_encryption_key; print(generate_encryption_key())"
```

**2. 更新 `.env` 文件**

将生成的密钥填入 `.env` 文件：

```env
ENCRYPTION_KEY=你生成的新密钥（44个字符）
```

**3. 重新配置 AI 模型密钥**

由于旧密钥加密的数据无法解密，需要：
- 进入前端「设置 → AI 模型」页面
- 重新填写每个模型的 API Key 并保存

---

### 密钥格式说明

- Fernet 密钥是 **44 个字符**的 base64 编码字符串
- 示例格式：`dGhpcyBpcyBhIHZhbGlkIDMyIGJ5dGUga2V5IQ==`
- 如果填写的不是标准 Fernet 密钥，系统会自动从你的字符串派生一个有效密钥

---

### 如果忘记配置密钥

系统会使用默认密钥（仅适用于开发环境），但会输出警告：
```
ENCRYPTION_KEY 未配置，使用默认密钥。这在生产环境中是不安全的！
```

**生产环境必须配置 ENCRYPTION_KEY！**