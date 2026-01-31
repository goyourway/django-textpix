import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import './PreviewPanel.css';

export const PreviewPanel = ({ htmlContent, isStreaming = false, onContentEdit }) => {
  const previewRef = useRef(null);
  const iframeRef = useRef(null);
  const contentRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const hasContent = htmlContent && htmlContent.trim().length > 0;

  // 检测是否是完整的 HTML 文档
  const isFullHtmlDocument = (html) => {
    if (!html) return false;
    const trimmed = html.trim().toLowerCase();
    return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
  };

  const useIframe = isFullHtmlDocument(htmlContent);

  // 更新 iframe 内容（编辑模式下不更新，避免丢失用户编辑）
  useEffect(() => {
    if (!useIframe || !iframeRef.current || !htmlContent || isEditing) return;
    
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      // 移除 iframe 内文档的所有边距
      if (doc.body) {
        doc.body.style.margin = '0';
        doc.body.style.padding = '0';
      }
      if (doc.documentElement) {
        doc.documentElement.style.margin = '0';
        doc.documentElement.style.padding = '0';
      }
    }
  }, [htmlContent, useIframe, isEditing]);

  // 处理 iframe 编辑模式
  useEffect(() => {
    if (!useIframe || !iframeRef.current) return;
    
    // 延迟执行，确保 iframe 内容已加载
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc && doc.body) {
        if (isEditing) {
          // 进入编辑模式：让 body 可编辑
          doc.body.contentEditable = 'true';
          doc.body.style.outline = '2px dashed #10b981';
          doc.body.style.outlineOffset = '-2px';
          doc.body.style.minHeight = '100%';
          doc.body.style.cursor = 'text';
          // 聚焦到 iframe 内容
          doc.body.focus();
        } else {
          // 退出编辑模式
          doc.body.contentEditable = 'false';
          doc.body.style.outline = 'none';
          doc.body.style.cursor = 'default';
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isEditing, useIframe, htmlContent]);

  const handleExportImage = async () => {
    if (!htmlContent) return;
    
    let elementToCapture;
    let doc = null;
    
    if (useIframe && iframeRef.current) {
      doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        // 尝试找到实际内容容器（常见的容器类名或ID）
        const contentSelectors = [
          '.chat-container',
          '.message-container', 
          '.chat-wrapper',
          '.messages',
          '.chat',
          '[class*="chat"]',
          '[class*="message"]',
          'main',
          '.container',
          '.wrapper',
          '.content'
        ];
        
        for (const selector of contentSelectors) {
          const container = doc.querySelector(selector);
          if (container && container.offsetWidth > 0) {
            elementToCapture = container;
            break;
          }
        }
        
        // 如果没找到特定容器，使用 body 的第一个有实际内容的子元素
        if (!elementToCapture) {
          const bodyChildren = doc.body.children;
          for (let i = 0; i < bodyChildren.length; i++) {
            const child = bodyChildren[i];
            if (child.offsetWidth > 0 && child.offsetHeight > 100) {
              elementToCapture = child;
              break;
            }
          }
        }
        
        // 最后回退到 body
        if (!elementToCapture) {
          elementToCapture = doc.body;
        }
      }
    } else if (contentRef.current) {
      elementToCapture = contentRef.current;
    }

    if (!elementToCapture) return;

    try {
      // 先生成完整的 canvas
      const fullCanvas = await html2canvas(elementToCapture, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // 分析 canvas 找到有效内容边界
      const ctx = fullCanvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, fullCanvas.width, fullCanvas.height);
      const pixels = imageData.data;
      
      let minX = fullCanvas.width;
      let maxX = 0;
      let minY = fullCanvas.height;
      let maxY = 0;
      
      // 背景色（白色）的阈值
      const bgThreshold = 250;
      
      // 扫描像素找到非背景区域
      for (let y = 0; y < fullCanvas.height; y++) {
        for (let x = 0; x < fullCanvas.width; x++) {
          const idx = (y * fullCanvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const a = pixels[idx + 3];
          
          // 检查是否是非白色/非透明像素
          if (a > 10 && (r < bgThreshold || g < bgThreshold || b < bgThreshold)) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      // 添加一些边距
      const padding = 40;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(fullCanvas.width, maxX + padding);
      maxY = Math.min(fullCanvas.height, maxY + padding);
      
      // 计算裁剪区域
      const cropWidth = maxX - minX;
      const cropHeight = maxY - minY;
      
      // 如果检测到有效区域，进行裁剪
      let finalCanvas = fullCanvas;
      if (cropWidth > 0 && cropHeight > 0 && cropWidth < fullCanvas.width * 0.95) {
        finalCanvas = document.createElement('canvas');
        finalCanvas.width = cropWidth;
        finalCanvas.height = cropHeight;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, cropWidth, cropHeight);
        finalCtx.drawImage(
          fullCanvas,
          minX, minY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
      }
      
      const image = finalCanvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `preview-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出图片失败');
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // 退出编辑模式时保存
      if (useIframe && iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc && onContentEdit) {
          const newHtml = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
          onContentEdit(newHtml);
        }
      }
    }
    setIsEditing(!isEditing);
  };


  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h2>效果预览</h2>
        <div className="preview-actions">
          <button 
            className={`action-btn ${isEditing ? 'active' : ''}`}
            onClick={toggleEditMode}
            disabled={!hasContent || isStreaming}
            title={isEditing ? "退出编辑模式" : "进入编辑模式"}
          >
            {isEditing ? '完成' : '编辑'}
          </button>

          <button 
            className="action-btn" 
            onClick={handleExportImage}
            disabled={!hasContent}
            title="导出为图片"
          >
            导出
          </button>
        </div>
      </div>

      <div className="preview-content" ref={previewRef}>
        {!hasContent ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ fontSize: '2rem', opacity: 0.2 }}>Waiting...</div>
            <p style={{ marginTop: '1rem', color: '#999' }}>在左侧输入内容开始生成</p>
          </div>
        ) : (
          <div className="html-preview">
            {isStreaming && (
              <div className="streaming-indicator">
                <span className="pulse">●</span> Generating...
              </div>
            )}
            {isEditing && (
              <div className="editing-indicator">
                <span>编辑模式</span>
                <span className="edit-hint">内容可直接修改</span>
              </div>
            )}
            {useIframe ? (
              <iframe
                ref={iframeRef}
                className="html-iframe"
                title="预览内容"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div 
                ref={contentRef}
                className={`html-content ${isEditing ? 'editable' : ''}`}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};