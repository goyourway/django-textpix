/**
 * 微信聊天渲染器
 * 将JSON数据渲染成微信聊天风格的HTML
 */

export class WechatRenderer {
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
   * 根据昵称生成头像背景色
   */
  getAvatarColor(nickname) {
    const colors = [
      '#1AAD19', '#FA9D3B', '#576B95', '#EE5253', 
      '#10AC84', '#5F27CD', '#00D2D3', '#FF6B6B'
    ];
    let hash = 0;
    for (let i = 0; i < nickname.length; i++) {
      hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * 获取昵称首字符（用于头像显示）
   */
  getAvatarText(nickname) {
    return nickname ? nickname.charAt(0) : '?';
  }

  /**
   * 渲染时间分隔线
   */
  renderTime(time) {
    return `            <div class="message-time">${this.escapeHtml(time)}</div>`;
  }

  /**
   * 渲染单条消息
   */
  renderMessage(message, isFirst = false) {
    const align = message.align || 'left';
    const nickname = message.nickname || message.sender || '';
    const text = message.text || message.content || '';
    const avatarColor = this.getAvatarColor(nickname);
    const avatarText = this.getAvatarText(nickname);
    
    // 是否显示昵称（同一个人连续发消息时可以隐藏）
    const showNickname = message.showNickname !== false;

    return `            <div class="message ${align}">
                <div class="avatar" style="background-color: ${avatarColor}">${this.escapeHtml(avatarText)}</div>
                <div class="message-content">
                    ${showNickname ? `<div class="nickname">${this.escapeHtml(nickname)}</div>` : ''}
                    <div class="message-bubble">
                        ${this.escapeHtml(text)}
                    </div>
                </div>
            </div>`;
  }

  /**
   * 渲染完整HTML
   * @param {Object} data - JSON数据
   * @returns {string} HTML字符串
   * 
   * 数据格式：
   * {
   *   "title": "页面标题",
   *   "chat_header": "聊天标题（群名/好友名）",
   *   "messages": [
   *     { "type": "time", "time": "10:30" },
   *     { "nickname": "张三", "text": "你好", "align": "left" },
   *     { "nickname": "我", "text": "你好啊", "align": "right" },
   *     { "type": "time", "time": "10:35" },
   *     { "nickname": "张三", "text": "在干嘛", "align": "left", "showNickname": false }
   *   ]
   * }
   */
  render(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('数据格式错误：必须是对象');
    }

    const title = this.escapeHtml(data.title || '微信聊天');
    const chatHeader = this.escapeHtml(data.chat_header || data.chatHeader || '聊天');
    const messages = data.messages || [];

    // 渲染所有消息
    const messagesHtml = messages.map((msg, index) => {
      if (msg.type === 'time') {
        return this.renderTime(msg.time);
      }
      return this.renderMessage(msg, index === 0);
    }).join('\n\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
            background: #ededed;
            padding: 20px;
        }

        .chat-container {
            max-width: 500px;
            margin: 0 auto;
            background: #f5f5f5;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .chat-header {
            background: #ededed;
            padding: 15px;
            text-align: center;
            font-size: 16px;
            color: #000;
            border-bottom: 1px solid #d9d9d9;
        }

        .chat-messages {
            padding: 20px 15px;
            background: #f5f5f5;
            min-height: 400px;
        }

        .message {
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
        }

        .message.left {
            flex-direction: row;
        }

        .message.right {
            flex-direction: row-reverse;
        }

        .avatar {
            width: 45px;
            height: 45px;
            border-radius: 5px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 18px;
            font-weight: 500;
        }

        .message-content {
            max-width: 70%;
            margin: 0 10px;
        }

        .message-bubble {
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
            position: relative;
        }

        .message.left .message-bubble {
            background: #fff;
            border-radius: 0 8px 8px 8px;
        }

        .message.right .message-bubble {
            background: #95ec69;
            border-radius: 8px 0 8px 8px;
        }

        .message-time {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin: 15px 0;
        }

        .nickname {
            font-size: 13px;
            color: #999;
            margin-bottom: 5px;
        }

        .message.right .nickname {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            ${chatHeader}
        </div>
        
        <div class="chat-messages">
${messagesHtml}
        </div>
    </div>
</body>
</html>`;
  }
}

// 创建并导出渲染器实例
const wechatRenderer = new WechatRenderer();
export default wechatRenderer;