"""
内容生成 API 路由配置
"""
from django.urls import path
from . import views

app_name = 'contentgenerater'

urlpatterns = [
    # 流式内容生成
    path('generate-stream', views.generate_content_stream, name='generate-stream'),
    
    # 内容优化
    path('optimize', views.optimize_content, name='optimize'),
]
