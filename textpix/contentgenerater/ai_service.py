"""AI 内容生成服务"""
import json
from typing import AsyncGenerator, List
import logging
import httpx


logger = logging.getLogger(__name__)


class AIContentGenerator:
    """AI 内容生成器基类"""
    
    def __init__(self):
        self.model_name = "default"
    
    async def generate_content_stream(self, theme: str, content: str, images: List[str] = None, template_type: str = 'normal') -> AsyncGenerator[str, None]:
        """
        流式生成内容（逐步返回）
        
        Args:
            theme: 主题/关键词
            content: 内容描述
            images: 图片URL列表
            template_type: 模板类型 (normal/wechat)
            
        Yields:
            内容片段
        """
        raise NotImplementedError("子类必须实现此方法")



# 全局生成器实例
_generator = None


def get_ai_generator() -> AIContentGenerator:
    """获取 AI 生成器实例（根据配置自动选择）"""
    global _generator
    
    if _generator is None:
        # 导入配置
        from . import config
        
        logger.info(f"初始化 AI 生成器，类型: {config.AI_MODEL_TYPE}")


        # 根据配置选择生成器
        if config.AI_MODEL_TYPE == 'custom':
            if not config.CUSTOM_AI_API_KEY or not config.CUSTOM_AI_BASE_URL:
                raise ValueError("自定义 AI 服务配置不完整")
            
            logger.info(f"使用自定义 AI 生成器: {config.CUSTOM_AI_BASE_URL}")
            _generator = CustomAIGenerator(
                base_url=config.CUSTOM_AI_BASE_URL,
                api_key=config.CUSTOM_AI_API_KEY,
                model=config.CUSTOM_AI_MODEL,
                timeout=config.CUSTOM_AI_TIMEOUT
            )
        
        else:
            raise ValueError(f"未识别的 AI 模型类型: {config.AI_MODEL_TYPE}")
            
    
    return _generator



class CustomAIGenerator(AIContentGenerator):
    """自定义 AI 服务生成器（兼容 OpenAI API 格式）"""
    
    def __init__(self, base_url: str, api_key: str, model: str, timeout: int = 60):
        super().__init__()
        self.base_url = base_url.rstrip('/')  # 移除末尾的斜杠
        self.api_key = api_key
        self.model_name = model
        self.timeout = timeout
        
        # 禁用 SSL 验证警告
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        logger.info(f"自定义 AI 生成器初始化: base_url={base_url}, model={model}, timeout={timeout}s")
    
    async def generate_content_stream(self, theme: str, content: str, images: List[str] = None, template_type: str = 'normal') -> AsyncGenerator[str, None]:
        try:
            prompt = self._build_prompt(theme, content, template_type)
            logger.info(f"使用模板类型: {template_type}")
            
            url = f"{self.base_url}/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            }
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": "你是一个专业的内容创作助手..."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2000,
                "stream": True
            }
            
            timeout = httpx.Timeout(10.0, read=180.0)
            
            async with httpx.AsyncClient(timeout=timeout, verify=False, proxy=None) as client:
                async with client.stream('POST', url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        raise Exception(f"API 请求失败: {response.status_code}")
                    
                    async for line in response.aiter_lines():
                        if not line or line == 'data: [DONE]':
                            continue
                        
                        if line.startswith('data: '):
                            try:
                                data = json.loads(line[6:])
                                if 'choices' in data and len(data['choices']) > 0:
                                    content_chunk = data['choices'][0].get('delta', {}).get('content', '')
                                    if content_chunk:
                                        yield content_chunk

                            except json.JSONDecodeError:
                                continue
        
        except httpx.ReadTimeout:
            raise Exception("流式请求超时，请稍后重试")
        except Exception as e:
            logger.error(f"流式生成失败: {str(e)}", exc_info=True)
            raise
        
    
    
    def _build_prompt(self, theme: str, content: str, template_type: str = 'normal') -> str:
        """构建提示词 - 根据模板类型返回不同的JSON格式要求"""
        
        if template_type == 'wechat':
            return self._build_wechat_prompt(theme, content)
        else:
            return self._build_normal_prompt(theme, content)
    
    def _build_normal_prompt(self, theme: str, content: str) -> str:
        """构建普通文章的提示词 - 返回JSON格式"""
        return f"""请根据以下信息生成一篇文章内容，以JSON格式返回：

主题：{theme}
内容描述：{content}

请严格按照以下JSON格式返回：
{{
  "title": "文章标题",
  "intro": "引导语简介，一段话即可",
  "sections": [
    {{
      "title": "版块标题",
      "items": ["要点1", "要点2", "要点3"]
    }}
  ],
  "footer": "结语文字"
}}

重要要求：
1. 必须返回合法的JSON格式，可以被JSON.parse()直接解析
2. 所有字符串值必须在同一行内，不要包含换行符
3. 不要在JSON外面包裹```json```代码块标记
4. sections数组可包含2-6个版块
5. 每个版块的items可包含2-8个要点
6. 内容专业、准确、有深度
7. 只输出JSON，不要有任何其他文字"""
    
    def _build_wechat_prompt(self, theme: str, content: str) -> str:
        """构建微信聊天的提示词 - 返回JSON格式"""
        return f"""请根据以下信息生成一段微信聊天记录，以JSON格式返回：

场景：{theme}
内容要求：{content}

请严格按照以下JSON格式返回：
{{
  "title": "页面标题",
  "chat_header": "聊天标题",
  "messages": [
    {{"type": "time", "time": "10:30"}},
    {{"nickname": "张三", "text": "消息内容", "align": "left"}},
    {{"nickname": "我", "text": "回复内容", "align": "right"}},
    {{"nickname": "张三", "text": "继续对话", "align": "left", "showNickname": false}}
  ]
}}

重要要求：
1. 必须返回合法的JSON格式，可以被JSON.parse()直接解析
2. 所有字符串值必须在同一行内，不要包含换行符
3. 不要在JSON外面包裹```json```代码块标记
4. messages数组包含5-15条消息
5. type为time表示时间分隔线，align为left表示对方，right表示自己
6. 对话内容自然真实
7. 只输出JSON，不要有任何其他文字"""
    
    