"""
URL configuration for textpix project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import include, path, re_path
from django.http import HttpResponse
from django.conf import settings
import os

def serve_react(request):
    """服务 React 前端的 index.html"""
    index_path = os.path.join(settings.BASE_DIR.parent, 'my-react-app', 'build', 'index.html')
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    except FileNotFoundError:
        return HttpResponse('React build not found. Run npm run build first.', status=404)

urlpatterns = [
    path('api/', include('contentgenerater.urls')),  
]

# 生产环境：让 Django 服务 React 前端
if os.path.exists(os.path.join(settings.BASE_DIR.parent, 'my-react-app', 'build', 'index.html')):
    urlpatterns += [
        # 所有非 API 路由都返回 React 的 index.html（支持前端路由）
        re_path(r'^(?!api/).*$', serve_react),
    ]
