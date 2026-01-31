"""
内容生成 API 序列化器
"""
from rest_framework import serializers


class GenerateRequestSerializer(serializers.Serializer):
    """内容生成请求序列化器"""
    theme = serializers.CharField(max_length=200, required=True, help_text="主题/关键词")
    content = serializers.CharField(required=True, help_text="内容描述")
    images = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        default=list,
        help_text="图片URL列表"
    )
    templateType = serializers.ChoiceField(
        choices=['normal', 'wechat'],
        required=False,
        default='normal',
        help_text="模板类型: normal(普通文章) | wechat(微信聊天)"
    )


class GenerateResponseSerializer(serializers.Serializer):
    """内容生成响应序列化器"""
    success = serializers.BooleanField(default=True)
    markdown = serializers.CharField(help_text="生成的Markdown内容")
    title = serializers.CharField(help_text="生成的标题")
    summary = serializers.CharField(required=False, help_text="内容摘要")
    keywords = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="关键词列表"
    )
    estimatedReadTime = serializers.IntegerField(required=False, help_text="预计阅读时间（分钟）")


class ErrorResponseSerializer(serializers.Serializer):
    """错误响应序列化器"""
    success = serializers.BooleanField(default=False)
    message = serializers.CharField(help_text="错误信息")
