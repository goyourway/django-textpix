"""内容生成器测试"""
from django.test import TestCase, Client
from django.urls import reverse
import json


class ContentGeneratorTestCase(TestCase):
    """内容生成器测试用例"""
    
    def setUp(self):
        """测试初始化"""
        self.client = Client()
        self.test_data = {
            'title': '测试标题',
            'theme': '测试主题',
            'content': '这是测试内容描述',
            'images': []
        }
    
    def test_generate_content_success(self):
        """测试标准内容生成 - 成功"""
        response = self.client.post(
            '/api/generate',
            data=json.dumps(self.test_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('markdown', data)
        self.assertIn('title', data)
        self.assertIn('测试标题', data['markdown'])
    
    def test_generate_content_missing_fields(self):
        """测试标准内容生成 - 缺少必填字段"""
        invalid_data = {'title': '测试标题'}  # 缺少 theme 和 content
        
        response = self.client.post(
            '/api/generate',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])
    
    def test_generate_stream_success(self):
        """测试流式内容生成 - 成功"""
        response = self.client.post(
            '/api/generate-stream',
            data=json.dumps(self.test_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/event-stream')
        
        # 检查响应内容
        content = b''.join(response.streaming_content).decode('utf-8')
        self.assertIn('data:', content)
        self.assertIn('[DONE]', content)
    
    def test_optimize_content_success(self):
        """测试内容优化 - 成功"""
        optimize_data = {
            'markdown': '# 测试标题\n\n测试内容',
            'type': 'grammar'
        }
        
        response = self.client.post(
            '/api/optimize',
            data=json.dumps(optimize_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('markdown', data)
    
    def test_optimize_content_empty_markdown(self):
        """测试内容优化 - 空内容"""
        optimize_data = {
            'markdown': '',
            'type': 'grammar'
        }
        
        response = self.client.post(
            '/api/optimize',
            data=json.dumps(optimize_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data['success'])


class AIServiceTestCase(TestCase):
    """AI 服务测试用例"""
    
    def test_mock_generator(self):
        """测试模拟生成器"""
        from .ai_service import MockAIGenerator
        import asyncio
        
        generator = MockAIGenerator()
        
        # 测试标准生成
        loop = asyncio.new_event_loop()
        result = loop.run_until_complete(
            generator.generate_content('测试标题', '测试主题', '测试内容')
        )
        loop.close()
        
        self.assertIn('markdown', result)
        self.assertIn('测试标题', result['markdown'])
        self.assertIn('keywords', result)
        self.assertIsInstance(result['keywords'], list)
    
    def test_get_ai_generator(self):
        """测试获取 AI 生成器"""
        from .ai_service import get_ai_generator, MockAIGenerator
        
        generator = get_ai_generator()
        self.assertIsInstance(generator, MockAIGenerator)
