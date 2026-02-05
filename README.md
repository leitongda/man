# MAN - AI漫画生成系统

一个完整的AI漫画生成Web应用，实现从一句话输入到完整漫画输出的全流程。

## 功能特性

- **故事扩写**：将简短描述扩展为完整故事（短/中/长版本）
- **世界观建档**：自动生成角色设定、世界观、风格指南
- **分镜脚本**：将故事自动拆解为场景和分镜
- **角色一致性**：生成角色设定图，保持画面一致性
- **图像生成**：支持多种AI服务（OpenAI、SD、Midjourney、ComfyUI）
- **排版合成**：自动排版、添加气泡文字、导出成品

## 项目结构

```
man/
├── frontend/          # React前端
├── backend/           # FastAPI后端
├── data/              # 项目数据存储
├── shared/            # 共享类型定义
└── docker-compose.yml # Docker编排
```

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Arco Design
- ReactFlow（节点编辑器）
- Zustand（状态管理）
- Fabric.js（画布排版）

### 后端
- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- Celery

### AI服务
- OpenAI / Claude（文本生成）
- Stable Diffusion（图像生成）
- Midjourney（图像生成）
- ComfyUI（工作流图像生成）

## 快速开始

### 环境要求
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### 开发环境启动

```bash
# 1. 启动数据库和Redis
docker-compose up -d postgres redis

# 2. 启动后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. 启动前端
cd frontend
pnpm install
pnpm dev
```

### Docker一键启动

```bash
docker-compose up -d
```

## 漫画生成流程

```
输入一句话 → 世界观建档 → 故事扩写 → 分章节 → 分镜脚本 → 一致性资产 → 分镜出图 → 排版合成 → 导出
```

1. **输入与目标定义**：用户输入故事梗概和项目配置
2. **故事理解与世界观建档**：生成StoryBible（角色/世界观/风格指南）
3. **故事扩写**：生成不同长度版本和结构化大纲
4. **分章节**：将大纲映射到章节
5. **分镜脚本**：每章拆分为场景和Panel
6. **一致性资产**：生成角色设定图和场景参考图
7. **分镜出图**：草稿→最终图→质检
8. **排版合成**：排版+气泡文字+导出

## 配置

### 环境变量

```bash
# 后端
DATABASE_URL=postgresql://user:pass@localhost:5432/man
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key

# 前端
VITE_API_BASE_URL=http://localhost:8000
```

## 开发

### 代码规范
- 前端：ESLint + Prettier
- 后端：Black + isort + mypy

### 测试
```bash
# 后端测试
cd backend && pytest

# 前端测试
cd frontend && pnpm test
```

## License

MIT
