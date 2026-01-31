/**
 * AI 内容生成服务 - 对接 Python 后端
 */

import { renderFromJson, TemplateType } from '../utils/renderers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * 生成加载中的占位HTML
 * @param {string} partialJson - 部分JSON内容
 * @param {string} templateType - 模板类型
 * @returns {string} 加载中的HTML
 */
function generateLoadingHtml(partialJson, templateType) {
  const templateName = templateType === TemplateType.WECHAT ? '微信聊天' : '文章';
  const previewText = partialJson.length > 200 ? partialJson.slice(0, 200) + '...' : partialJson;
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>生成中...</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .loading-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .title {
            font-size: 18px;
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #999;
            margin-bottom: 20px;
        }
        .preview {
            background: #f9f9f9;
            border-radius: 8px;
            padding: 15px;
            font-size: 12px;
            color: #666;
            text-align: left;
            word-break: break-all;
            max-height: 150px;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="loading-container">
        <div class="spinner"></div>
        <div class="title">正在生成${templateName}内容...</div>
        <div class="subtitle">AI正在创作中，请稍候</div>
        <div class="preview">${previewText}</div>
    </div>
</body>
</html>`;
}

/**
 * 流式生成 HTML 内容（累积所有片段）
 * @param {Object} data - 表单数据
 * @param {string} data.theme - 主题
 * @param {string} data.content - 内容描述
 * @param {Array} data.images - 图片列表
 * @param {string} data.templateType - 模板类型 (normal/wechat)
 * @param {Function} onProgress - 进度回调函数，接收累积的 HTML 内容
 * @returns {Promise<Object>} 返回完整的 HTML 内容
 */
export const generateContentStream = async (data, onProgress) => {
  let fullJson = '';  // 累积JSON数据
  const templateType = data.templateType || TemplateType.NORMAL;
  
  try {
    const response = await fetch(`${API_BASE_URL}/generate-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        theme: data.theme,
        content: data.content,
        images: data.images || [],
        templateType: templateType,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '生成失败' }));
      throw new Error(error.message || '生成失败');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // 处理 SSE 格式: data: {"content": "..."}
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          
          // 检查是否是结束标记
          if (jsonStr === '[DONE]') {
            // 流结束，尝试渲染最终HTML
            try {
              const html = renderFromJson(templateType, fullJson);
              if (onProgress) {
                onProgress(html);
              }
              return {
                success: true,
                html: html,
              };
            } catch (e) {
              console.error('最终渲染失败:', e);
              return {
                success: false,
                error: '内容渲染失败: ' + e.message,
              };
            }
          }
          
          // 解析 JSON 并累积内容
          if (jsonStr) {
            try {
              const parsed = JSON.parse(jsonStr);
              const chunk = parsed.content || parsed.chunk || '';
              fullJson += chunk;
              
              // 不再尝试实时渲染，等待全部接收完成后再解析
              // 显示加载中的占位内容
              if (onProgress) {
                onProgress(generateLoadingHtml(fullJson, templateType));
              }
            } catch (e) {
              console.warn('解析 JSON 失败:', jsonStr, e);
            }
          }
        }
      }
    }
    
    // 流正常结束，尝试最终渲染
    try {
      const html = renderFromJson(templateType, fullJson);
      if (onProgress) {
        onProgress(html);
      }
      return {
        success: true,
        html: html,
      };
    } catch (e) {
      console.error('最终渲染失败:', e);
      return {
        success: false,
        error: '内容渲染失败: ' + e.message,
      };
    }
  } catch (error) {
    console.error('流式生成错误:', error);
    return {
      success: false,
      error: error.message || '生成失败',
    };
  }
};

/**
 * 优化内容
 * @param {string} html - 要优化的 HTML 内容
 * @param {string} type - 优化类型 (grammar/seo/readability)
 * @returns {Promise<Object>}
 */
export const optimizeContent = async (html, type = 'grammar') => {
  try {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('优化失败');
    }

    const result = await response.json();
    return {
      success: true,
      html: result.html || result.content,
    };
  } catch (error) {
    console.error('优化错误:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};