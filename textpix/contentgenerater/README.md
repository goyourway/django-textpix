# Content Generator API

内容生成器 Django 应用

## 功能特性

- ✅ 标准内容生成（一次性返回）
- ✅ 流式内容生成（实时输出，SSE）
- ✅ 内容优化
- ✅ 支持多种 AI 模型（OpenAI、Ollama、Mock）
- ✅ 完整的错误处理
- ✅ 异步处理支持

## 安装配置

### 1. 安装依赖

```bash
pip install djangorestframework
```

### 2. 配置 settings.py

```python
# settings.py

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'corsheaders',  # 如果需要跨域支持
    'contentgenerater',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 添加在最前面
    # ...
]

# CORS 配置（允许前端访问）
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React 前端地址
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# AI 模型配置
AI_MODEL_TYPE = 'mock'  # mock | openai | ollama

# OpenAI 配置（如果使用）
OPENAI_API_KEY = 'your-api-key-here'
OPENAI_MODEL = 'gpt-3.5-turbo'

# Ollama 配置（如果使用）
OLLAMA_BASE_URL = 'http://localhost:11434'
OLLAMA_MODEL = 'llama2'

# 日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'contentgenerater': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
```

### 3. 配置主 urls.py

```python
# textpix/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('contentgenerater.urls')),  # 添加这行
]
```

### 4. 运行迁移

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. 启动服务

```bash
python manage.py runserver 8000
```

## API 接口

### 1. 标准内容生成

**接口**: `POST /api/generate`

**请求示例**:
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "人工智能的未来",
    "theme": "科技",
    "content": "探讨AI技术的发展趋势",
    "images": []
  }'
```

**响应示例**:
```json
{
  "success": true,
  "markdown": "# 人工智能的未来\n\n## 简介\n\n...",
  "title": "人工智能的未来",
  "summary": "这是关于科技的文章摘要",
  "keywords": ["科技", "AI生成", "内容创作"],
  "estimatedReadTime": 5
}
```

### 2. 流式内容生成（推荐）

**接口**: `POST /api/generate-stream`

**请求示例**:
```bash
curl -X POST http://localhost:8000/api/generate-stream \
  -H "Content-Type: application/json" \
  -d '{
    "title": "人工智能的未来",
    "theme": "科技",
    "content": "探讨AI技术的发展趋势"
  }'
```

**响应示例** (Server-Sent Events):
```
data: {"content": "#"}

data: {"content": " "}

data: {"content": "人"}

data: {"content": "工"}

...

data: [DONE]
```

### 3. 内容优化

**接口**: `POST /api/optimize`

**请求示例**:
```bash
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "markdown": "# 标题\n\n内容...",
    "type": "grammar"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "markdown": "# 标题\n\n优化后的内容..."
}
```

## 测试

### 使用 Python 测试

```python
import requests
import json

# 测试标准生成
response = requests.post(
    'http://localhost:8000/api/generate',
    json={
        'title': '测试标题',
        'theme': '测试主题',
        'content': '测试内容描述'
    }
)
print(response.json())

# 测试流式生成
response = requests.post(
    'http://localhost:8000/api/generate-stream',
    json={
        'title': '测试标题',
        'theme': '测试主题',
        'content': '测试内容描述'
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### 使用 curl 测试

```bash
# 测试标准生成
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"title":"测试","theme":"科技","content":"测试内容"}'

# 测试流式生成
curl -X POST http://localhost:8000/api/generate-stream \
  -H "Content-Type: application/json" \
  -d '{"title":"测试","theme":"科技","content":"测试内容"}'
```

## 接入真实 AI 模型

### 使用 OpenAI

1. 安装依赖:
```bash
pip install openai
```

2. 配置 settings.py:
```python
AI_MODEL_TYPE = 'openai'
OPENAI_API_KEY = 'your-api-key'
OPENAI_MODEL = 'gpt-3.5-turbo'
```

3. 更新 `ai_service.py` 中的 `OpenAIGenerator` 类，取消注释相关代码。

### 使用 Ollama（本地模型）

1. 安装 Ollama:
```bash
# 访问 https://ollama.ai/ 下载安装
```

2. 启动模型:
```bash
ollama run llama2
```

3. 配置 settings.py:
```python
AI_MODEL_TYPE = 'ollama'
OLLAMA_BASE_URL = 'http://localhost:11434'
OLLAMA_MODEL = 'llama2'
```

4. 更新 `ai_service.py` 中的 `OllamaGenerator` 类，取消注释相关代码。

## 项目结构

```
contentgenerater/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── views.py              # API 视图
├── urls.py               # 路由配置
├── serializers.py        # 数据序列化器
├── ai_service.py         # AI 服务层
├── config.py             # 配置文件
├── tests.py
├── README.md             # 本文档
└── migrations/
```

## 常见问题

### Q: CORS 错误

**A**: 确保安装并配置了 `django-cors-headers`:

```bash
pip install django-cors-headers
```

在 `settings.py` 中正确配置 CORS。

### Q: 流式生成不工作

**A**: 检查以下几点:
- 确保返回 `text/event-stream` 类型
- 检查是否有代理或缓存干扰
- 确保 `X-Accel-Buffering` 设置为 `no`

### Q: 如何切换 AI 模型

**A**: 在 `settings.py` 中修改 `AI_MODEL_TYPE`:

```python
AI_MODEL_TYPE = 'openai'  # 或 'ollama' 或 'mock'
```

## 性能优化

1. **使用异步处理**: 已实现异步生成
2. **添加缓存**: 可以使用 Redis 缓存相同请求
3. **限流**: 使用 Django REST framework 的限流功能
4. **日志记录**: 已配置详细日志

## 下一步开发

- [ ] 添加用户认证
- [ ] 实现内容缓存
- [ ] 添加速率限制
- [ ] 支持更多 AI 模型
- [ ] 添加内容历史记录
- [ ] 实现批量生成

## 许可证

MIT License
