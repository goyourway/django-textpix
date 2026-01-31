"""
内容生成器配置
从环境变量和 Django settings 读取配置
"""
from django.conf import settings
import os


def get_config(key, default=None):
    """
    优先从环境变量读取配置，其次从 Django settings
    """
    return os.environ.get(key, getattr(settings, key, default))


# ==================== AI 模型配置 ====================

# AI 模型类型: custom
AI_MODEL_TYPE = get_config('AI_MODEL_TYPE', 'custom')

# -------------------- 自定义 AI 服务配置 --------------------
CUSTOM_AI_BASE_URL = get_config('CUSTOM_AI_BASE_URL', '')
CUSTOM_AI_API_KEY = get_config('CUSTOM_AI_API_KEY', '')
CUSTOM_AI_MODEL = get_config('CUSTOM_AI_MODEL', '')
CUSTOM_AI_TIMEOUT = int(get_config('CUSTOM_AI_TIMEOUT', '60'))

# ==================== 内容生成配置 ====================

DEFAULT_LANGUAGE = get_config('CONTENT_LANGUAGE', 'zh-CN')
MAX_CONTENT_LENGTH = int(get_config('MAX_CONTENT_LENGTH', '10000'))
GENERATION_TIMEOUT = int(get_config('GENERATION_TIMEOUT', '60'))
ENABLE_CACHE = get_config('ENABLE_CACHE', 'True').lower() == 'true'

# ==================== 日志配置 ====================

LOG_LEVEL = get_config('LOG_LEVEL', 'INFO')
LOG_FILE = get_config('LOG_FILE', 'logs/contentgenerater.log')
