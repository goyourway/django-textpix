"""内容生成 API 视图"""
import json
import asyncio
import logging
from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import GenerateRequestSerializer
from .ai_service import get_ai_generator

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def generate_content_stream(request):
    """
    流式内容生成接口（推荐）- 真正的流式传输
    
    POST /api/generate-stream
    
        请求体:
    {
        "theme": "主题/关键词",
        "content": "内容描述",
        "images": ["image_url_1"],
        "templateType": "normal"  // normal | wechat
    }
    
    响应: Server-Sent Events (SSE)
    data: {"content": "{\"title\": ...}"}
    data: [DONE]
    
    注意: 返回的是JSON格式数据，前端负责渲染成HTML
    """
    
    def event_stream():
        """SSE 事件流生成器 - 实时流式传输"""
        try:
            # 解析请求数据
            data = json.loads(request.body)
            
            # 验证数据
            serializer = GenerateRequestSerializer(data=data)
            if not serializer.is_valid():
                error_msg = json.dumps({"error": "请求参数错误", "details": serializer.errors})
                yield f"data: {error_msg}\n\n"
                return
            
                                                                        # 获取参数
            validated_data = serializer.validated_data
            theme = validated_data['theme']
            content = validated_data['content']
            images = validated_data.get('images', [])
            template_type = validated_data.get('templateType', 'normal')
            
            logger.info(f"开始流式生成内容 - 主题: {theme}, 模板: {template_type}")
            
            # 调用 AI 生成服务
            generator = get_ai_generator()
            
            # 创建新的事件循环
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                                                                # 创建异步生成器（传入模板类型）
                async_gen = generator.generate_content_stream(theme, content, images, template_type)
                
                chunk_count = 0
                # 关键：逐个处理并立即 yield，不要等待全部完成
                while True:
                    try:
                        # 获取下一个块
                        chunk = loop.run_until_complete(async_gen.__anext__())
                        
                        if chunk:
                            chunk_count += 1
                            # 立即发送 SSE 格式的数据
                            data_json = json.dumps({"content": chunk})
                            yield f"data: {data_json}\n\n"
                    
                    except StopAsyncIteration:
                        # 异步迭代结束
                        break
                    except Exception as e:
                        logger.error(f"处理数据块失败: {e}")
                        break
                
                                # 发送完成信号
                yield "data: [DONE]\n\n"
                logger.info(f"流式生成完成 - 主题: {theme}, 共发送 {chunk_count} 个数据块")
                
            finally:
                loop.close()
                
        except json.JSONDecodeError:
            error_msg = json.dumps({"error": "无效的 JSON 数据"})
            yield f"data: {error_msg}\n\n"
        except Exception as e:
            logger.error(f"流式生成失败: {str(e)}", exc_info=True)
            error_msg = json.dumps({"error": str(e)})
            yield f"data: {error_msg}\n\n"
    
    # 返回 SSE 响应
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # 禁用 Nginx 缓冲
    # CORS 头（如果需要）
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type'
    
    return response


@csrf_exempt
@api_view(['POST'])
def optimize_content(request):
    """
    内容优化接口
    
    POST /api/optimize
    
    请求体:
    {
        "markdown": "要优化的内容",
        "type": "grammar"  // grammar | seo | readability | engagement
    }
    
    响应:
    {
        "success": true,
        "markdown": "优化后的内容"
    }
    """
    try:
        markdown = request.data.get('markdown', '')
        optimization_type = request.data.get('type', 'grammar')
        
        if not markdown:
            return Response(
                {
                    "success": False,
                    "message": "markdown 内容不能为空"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"开始优化内容 - 类型: {optimization_type}")
        
        # TODO: 实现内容优化逻辑
        # 这里可以调用 AI 模型进行内容优化
        optimized_markdown = markdown  # 暂时返回原内容
        
        return Response(
            {
                "success": True,
                "markdown": optimized_markdown
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"内容优化失败: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "message": f"优化失败: {str(e)}"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
