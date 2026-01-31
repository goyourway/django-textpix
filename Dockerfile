# 阶段1: 构建 React 前端
FROM node:18-slim AS frontend-builder

WORKDIR /app/my-react-app

# 复制 React 项目文件
COPY my-react-app/package*.json ./
RUN npm install

COPY my-react-app/ ./
RUN npm run build

# 阶段2: Python 后端
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制 React 构建产物
COPY --from=frontend-builder /app/my-react-app/build /app/my-react-app/build

# 复制 Django 项目
COPY textpix/ /app/textpix/

# 安装 Python 依赖
WORKDIR /app/textpix
RUN pip install --no-cache-dir -r requirements.txt

# 收集静态文件
RUN python manage.py collectstatic --noinput

# 设置环境变量
ENV DEBUG=false
ENV ALLOWED_HOSTS=*
ENV CORS_ALLOWED_ORIGINS=*
ENV PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 10000

# 启动命令
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-10000} --workers 2 --timeout 120 textpix.wsgi:application"]