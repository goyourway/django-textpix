/**
 * 普通文章渲染器
 * 将JSON数据渲染成手机风格的文章HTML
 */

export class NormalRenderer {
  /**
   * 转义HTML特殊字符
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * 渲染单个section
   */
  renderSection(section, index) {
    const sectionNumber = String(index + 1).padStart(2, '0');
    const title = this.escapeHtml(section.title || '');
    const items = (section.items || [])
      .map(item => `                <li>- ${this.escapeHtml(item)}</li>`)
      .join('\n');

    return `        <div class="section-block">
            <div class="section-title">${sectionNumber} ${title}</div>
            <ul class="list-content">
${items}
            </ul>
        </div>`;
  }

  /**
   * 渲染完整HTML
   * @param {Object} data - JSON数据
   * @returns {string} HTML字符串
   */
  render(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('数据格式错误：必须是对象');
    }

    const title = this.escapeHtml(data.title || '');
    const intro = this.escapeHtml(data.intro || '');
    const footer = this.escapeHtml(data.footer || '');

    const sectionsHtml = (data.sections || [])
      .map((section, index) => this.renderSection(section, index))
      .join('\n\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            min-height: 100vh;
        }
        h1 {
            font-size: 22px;
            font-weight: bold;
            color: #000;
            margin-bottom: 15px;
            margin-top: 10px;
        }
        .intro {
            font-size: 15px;
            color: #555;
            margin-bottom: 30px;
            line-height: 1.6;
            white-space: pre-line;
        }
        .section-block {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 10px;
        }
        .list-content {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .list-content li {
            font-size: 15px;
            color: #555;
            margin-bottom: 5px;
            padding-left: 0;
        }
        .footer-note {
            font-size: 15px;
            color: #555;
            margin-top: 40px;
            margin-bottom: 20px;
            line-height: 1.6;
            white-space: pre-line;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p class="intro">${intro}</p>
${sectionsHtml}
        <div class="footer-note">${footer}</div>
    </div>
</body>
</html>`;
      }
}

// 创建并导出渲染器实例
const normalRenderer = new NormalRenderer();
export default normalRenderer;