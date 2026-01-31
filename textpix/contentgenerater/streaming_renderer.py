"""
流式HTML渲染器
支持边解析JSON边渲染HTML，实现真正的流式输出
"""
import json
import re
from typing import AsyncGenerator, Dict, List
import logging

logger = logging.getLogger(__name__)


class StreamingHTMLRenderer:
    """流式HTML渲染器"""
    
    def __init__(self):
        self.html_sent = False
        self.sections_count = 0
    
    def get_html_header(self, title: str = "") -> str:
        """获取HTML头部"""
        return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self._escape(title)}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            min-height: 100vh;
        }}
        h1 {{
            font-size: 22px;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
            margin-top: 10px;
        }}
        .intro {{
            font-size: 15px;
            color: #555;
            margin-bottom: 30px;
            line-height: 1.6;
            white-space: pre-line;
        }}
        .section-block {{
            margin-bottom: 30px;
        }}
        .section-title {{
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 10px;
        }}
        .list-content {{
            margin: 0;
            padding: 0;
            list-style: none;
        }}
        .list-content li {{
            font-size: 15px;
            color: #555;
            margin-bottom: 5px;
            padding-left: 0;
        }}
        .footer-note {{
            font-size: 15px;
            color: #555;
            margin-top: 40px;
            margin-bottom: 20px;
            line-height: 1.6;
            white-space: pre-line;
        }}
    </style>
</head>
<body>
    <div class="container">
"""
    
    def get_html_footer(self) -> str:
        """获取HTML尾部"""
        return """    </div>
</body>
</html>"""
    
    def _escape(self, text: str) -> str:
        """转义HTML特殊字符"""
        if not text:
            return ""
        return (str(text)
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#039;'))
    
    def render_title(self, title: str) -> str:
        """渲染标题"""
        return f"        <h1>{self._escape(title)}</h1>\n"
    
    def render_intro(self, intro: str) -> str:
        """渲染简介"""
        return f"        <p class=\"intro\">{self._escape(intro)}</p>\n"
    
    def render_section(self, section: Dict, index: int) -> str:
        """渲染单个section"""
        section_number = str(index + 1).zfill(2)
        title = section.get('title', '')
        items = section.get('items', [])
        
        items_html = '\n'.join([
            f'                <li>- {self._escape(item)}</li>'
            for item in items
        ])
        
        return f"""        <div class="section-block">
            <div class="section-title">{section_number} {self._escape(title)}</div>
            <ul class="list-content">
{items_html}
            </ul>
        </div>
"""
    
    def render_footer_note(self, footer: str) -> str:
        """渲染结语"""
        return f"        <div class=\"footer-note\">{self._escape(footer)}</div>\n"


class JSONStreamParser:
    """JSON流式解析器 - 边接收边解析"""
    
    def __init__(self):
        self.buffer = ""
        self.in_string = False
        self.escape_next = False
        self.brace_count = 0
        self.bracket_count = 0
        
    def feed(self, chunk: str) -> List[Dict]:
        """
        喂入数据块，返回解析出的完整JSON对象列表
        
        Args:
            chunk: 新接收的数据块
            
        Returns:
            解析出的JSON对象列表
        """
        self.buffer += chunk
        results = []
        
        # 尝试提取完整的JSON对象
        try:
            # 简单策略：尝试解析整个buffer
            if self.buffer.strip():
                # 移除可能的markdown代码块标记
                clean_buffer = self.buffer.strip()
                if clean_buffer.startswith('```json'):
                    clean_buffer = clean_buffer[7:]
                if clean_buffer.endswith('```'):
                    clean_buffer = clean_buffer[:-3]
                
                clean_buffer = clean_buffer.strip()
                
                # 尝试解析
                if clean_buffer:
                    try:
                        obj = json.loads(clean_buffer)
                        results.append(obj)
                        self.buffer = ""  # 清空buffer
                    except json.JSONDecodeError:
                        # 还没接收完整，继续等待
                        pass
        except Exception as e:
            logger.warning(f"JSON解析警告: {e}")
        
        return results


async def stream_render_from_ai(
    ai_generator: AsyncGenerator[str, None],
    renderer: StreamingHTMLRenderer = None
) -> AsyncGenerator[str, None]:
    """
    从AI生成器流式渲染HTML
    
    Args:
        ai_generator: AI内容生成器（返回JSON格式）
        renderer: HTML渲染器实例
        
    Yields:
        HTML片段
    """
    if renderer is None:
        renderer = StreamingHTMLRenderer()
    
    parser = JSONStreamParser()
    json_buffer = ""
    html_header_sent = False
    data_parsed = False
    
    try:
        # 收集所有AI输出
        async for chunk in ai_generator:
            json_buffer += chunk
        
        # AI生成完毕，解析JSON
        logger.info(f"AI生成完毕，开始解析JSON，长度: {len(json_buffer)}")
        
        # 清理JSON字符串
        json_str = json_buffer.strip()
        
        # 移除可能的markdown代码块标记
        if json_str.startswith('```json'):
            json_str = json_str[7:]
        elif json_str.startswith('```'):
            json_str = json_str[3:]
        
        if json_str.endswith('```'):
            json_str = json_str[:-3]
        
        json_str = json_str.strip()
        
        # 解析JSON
        try:
            data = json.loads(json_str)
            logger.info(f"JSON解析成功: {data.keys()}")
            
            # 发送HTML头部
            title = data.get('title', '文章')
            yield renderer.get_html_header(title)
            
            # 发送标题
            if 'title' in data:
                yield renderer.render_title(data['title'])
            
            # 发送简介
            if 'intro' in data:
                yield renderer.render_intro(data['intro'])
            
            # 发送sections
            if 'sections' in data and isinstance(data['sections'], list):
                for i, section in enumerate(data['sections']):
                    yield renderer.render_section(section, i)
            
            # 发送结语
            if 'footer' in data:
                yield renderer.render_footer_note(data['footer'])
            
            # 发送HTML尾部
            yield renderer.get_html_footer()
            
            data_parsed = True
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")
            logger.error(f"JSON内容: {json_str[:500]}...")
            
            # 解析失败，返回原始内容
            if not html_header_sent:
                yield renderer.get_html_header("内容生成")
                html_header_sent = True
            
            yield f"        <div class=\"intro\">AI返回内容格式错误，原始内容：<br><pre>{renderer._escape(json_str[:1000])}</pre></div>\n"
            yield renderer.get_html_footer()
    
    except Exception as e:
        logger.error(f"流式渲染错误: {e}", exc_info=True)
        if not html_header_sent:
            yield renderer.get_html_header("错误")
        yield f"        <div class=\"intro\" style=\"color: red;\">渲染错误: {renderer._escape(str(e))}</div>\n"
        yield renderer.get_html_footer()


def extract_json_from_text(text: str) -> Dict:
    """
    从文本中提取JSON对象（处理AI可能返回的markdown格式）
    
    Args:
        text: 包含JSON的文本
        
    Returns:
        解析后的JSON对象
    """
    # 移除markdown代码块
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]
    elif text.startswith('```'):
        text = text[3:]
    
    if text.endswith('```'):
        text = text[:-3]
    
    text = text.strip()
    
    # 解析JSON
    return json.loads(text)
