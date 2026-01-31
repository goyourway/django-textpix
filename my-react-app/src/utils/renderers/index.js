/**
 * 渲染器统一导出
 */

// 导入默认导出的渲染器实例
import normalRenderer from './normalRenderer';
import wechatRenderer from './wechatRenderer';

// 同时导入类以便重新导出
import { NormalRenderer } from './normalRenderer';
import { WechatRenderer } from './wechatRenderer';

// 模板类型枚举
export const TemplateType = {
  NORMAL: 'normal',
  WECHAT: 'wechat'
};

// 渲染器映射
const renderers = {
  [TemplateType.NORMAL]: normalRenderer,
  [TemplateType.WECHAT]: wechatRenderer
};

/**
 * 根据模板类型获取渲染器
 * @param {string} templateType - 模板类型
 * @returns {Object} 渲染器实例
 */
export function getRenderer(templateType) {
  const renderer = renderers[templateType];
  if (!renderer) {
    console.warn(`未知的模板类型: ${templateType}，使用默认渲染器`);
    return normalRenderer;
  }
  return renderer;
}

/**
 * 渲染JSON数据为HTML
 * @param {string} templateType - 模板类型
 * @param {Object} data - JSON数据
 * @returns {string} HTML字符串
 */
export function renderToHtml(templateType, data) {
  const renderer = getRenderer(templateType);
  
  // 调试：检查渲染器类型
  console.log('渲染器类型:', templateType);
  console.log('渲染器对象:', renderer);
  console.log('渲染器是否有render方法:', typeof renderer?.render);
  
  if (!renderer || typeof renderer.render !== 'function') {
    throw new Error(`渲染器无效或缺少render方法。渲染器类型: ${typeof renderer}, render方法类型: ${typeof renderer?.render}`);
  }
  
  return renderer.render(data);
}

/**
 * 修复JSON字符串中未转义的双引号
 * 例如: "intro": "当我们说"生活很大"时" -> "intro": "当我们说\"生活很大\"时"
 * @param {string} jsonStr - JSON字符串
 * @returns {string} 修复后的JSON字符串
 */
function fixUnescapedQuotes(jsonStr) {
  let result = '';
  let inString = false;
  let i = 0;
  
  while (i < jsonStr.length) {
    const char = jsonStr[i];
    const prevChar = i > 0 ? jsonStr[i - 1] : '';
    
    if (char === '"' && prevChar !== '\\') {
      if (!inString) {
        // 进入字符串
        inString = true;
        result += char;
      } else {
        // 检查这个引号是否是字符串的结束
        // 向后查找，看是否紧跟着 : , ] } 或空白字符后跟这些
        let j = i + 1;
        while (j < jsonStr.length && /\s/.test(jsonStr[j])) {
          j++;
        }
        const nextNonSpace = jsonStr[j];
        
        if (nextNonSpace === ':' || nextNonSpace === ',' || 
            nextNonSpace === ']' || nextNonSpace === '}' || 
            nextNonSpace === undefined) {
          // 这是字符串的结束引号
          inString = false;
          result += char;
        } else {
          // 这是字符串内部的引号，需要转义
          result += '\\"';
        }
      }
    } else {
      result += char;
    }
    i++;
  }
  
  return result;
}

/**
 * 尝试解析JSON并渲染
 * @param {string} templateType - 模板类型
 * @param {string} jsonString - JSON字符串
 * @returns {string} HTML字符串
 */
export function renderFromJson(templateType, jsonString) {
  try {
    // 清理JSON字符串
    let cleanJson = jsonString.trim();
    
    // 移除可能的markdown代码块标记
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();
    
    // 尝试找到JSON对象的开始和结束位置
    const startIndex = cleanJson.indexOf('{');
    let endIndex = cleanJson.lastIndexOf('}');
    
    // 如果没有找到结束的 }，说明JSON不完整，抛出特定错误
    if (startIndex === -1) {
      throw new Error('JSON_INCOMPLETE: 未找到JSON对象开始');
    }
    
    if (endIndex === -1 || endIndex <= startIndex) {
      throw new Error('JSON_INCOMPLETE: JSON对象不完整，等待更多数据');
    }
    
    cleanJson = cleanJson.slice(startIndex, endIndex + 1);
    
    // 修复常见的JSON格式问题
    
    // 1. 修复字符串内未转义的双引号
    // AI 有时会生成 "intro": "当我们说"生活很大"时" 这样的无效JSON
    // 需要将字符串内部的双引号转义为 \"
    cleanJson = fixUnescapedQuotes(cleanJson);
    
    // 2. 将中文引号转换为 JSON 转义的 Unicode 序列
    cleanJson = cleanJson.split(String.fromCharCode(0x201C)).join('\\u201c');
    cleanJson = cleanJson.split(String.fromCharCode(0x201D)).join('\\u201d');
    cleanJson = cleanJson.split(String.fromCharCode(0x2018)).join('\\u2018');
    cleanJson = cleanJson.split(String.fromCharCode(0x2019)).join('\\u2019');
    
    // 3. 处理字符串内的实际换行符
    cleanJson = cleanJson.replace(/"([^"]*)"/g, (match, content) => {
      const fixed = content.replace(/\r?\n/g, '\\n');
      return `"${fixed}"`;
    });
    
    // 4. 移除可能的尾随逗号
    cleanJson = cleanJson.replace(/,\s*([\]}])/g, '$1');

    const data = JSON.parse(cleanJson);
    return renderToHtml(templateType, data);
  } catch (error) {
    // 如果是不完整的JSON，向上抛出让调用者处理
    if (error.message.startsWith('JSON_INCOMPLETE:')) {
      throw error;
    }
    console.error('JSON解析失败:', error);
    console.error('原始JSON字符串 (前500字符):', jsonString);
    throw new Error(`JSON解析失败: ${error.message}`);
  }
}

/**
 * 获取所有可用的模板类型
 * @returns {Array} 模板类型列表
 */
export function getAvailableTemplates() {
  return [
    { type: TemplateType.NORMAL, name: '普通文章', description: '适合教程、分享类内容' },
    { type: TemplateType.WECHAT, name: '微信聊天', description: '模拟微信聊天记录' }
  ];
}

export {
  normalRenderer,
  wechatRenderer,
  NormalRenderer,
  WechatRenderer
};