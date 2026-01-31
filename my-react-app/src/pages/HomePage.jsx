import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { InputPanel } from '../components/common/InputPanel';
import { PreviewPanel } from '../components/common/PreviewPanel';

import { ErrorMessage } from '../components/common/ErrorMessage';
import { useAIGeneration } from '../hooks/useAIGeneration';
import './HomePage.css';

export const HomePage = () => {
  const [content, setContent] = useState(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // 是否正在流式生成
  const [activeTab, setActiveTab] = useState('input'); // 移动端标签: 'input' | 'preview'

  // 使用 AI 生成 Hook
  const {
    isGenerating,
    error,
    generateStream,
    reset,
  } = useAIGeneration();



  const handleContentChange = (data) => {
    // 只在有 HTML 内容时更新（避免输入时频繁触发重渲染）
    if (data.html !== undefined) {
      setHtmlContent(data.html);
    }
    // 不再在输入时更新 content，只在生成时更新
  };

  const handleGenerate = async (formData, html) => {
    // 如果已有 HTML 内容，直接使用
    if (html && html.trim()) {
      setHtmlContent(html);
      setContent(formData);
      setIsGenerated(true);
      return;
    }

    // 验证必填字段
    if (!formData.title && !formData.theme && !formData.content) {
      alert('请至少填写标题、主题或内容描述');
      return;
    }

    try {
      setContent(formData);
      setHtmlContent(''); // 清空之前的内容
      
      // 使用流式生成（实时输出）
      setIsStreaming(true);
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // 每100ms更新一次UI
      let pendingHtml = '';
      
      await generateStream(formData, (accumulatedHtml) => {
        pendingHtml = accumulatedHtml;
        
        const now = Date.now();
        // 节流：每100ms更新一次，或者是最后一次更新
        if (now - lastUpdateTime >= UPDATE_INTERVAL) {
          setHtmlContent(accumulatedHtml);
          lastUpdateTime = now;
        }
      });
      
      // 确保最后一次更新被应用
      if (pendingHtml) {
        setHtmlContent(pendingHtml);
      }
      
      setIsStreaming(false);
      setIsGenerated(true);
    } catch (err) {
      console.error('生成失败:', err);
      setIsStreaming(false);
      // 错误已在 Hook 中处理
    }
  };

  const handlePreviewEdit = (newHtml) => {
    setHtmlContent(newHtml);
  };

  const handleRetry = () => {
    reset();
    if (content) {
      handleGenerate(content, '');
    }
  };

  const handleDismissError = () => {
    reset();
  };

  // 生成完成后自动切换到预览标签（移动端）
  useEffect(() => {
    if (isGenerated && htmlContent && window.innerWidth <= 768) {
      setActiveTab('preview');
    }
  }, [isGenerated, htmlContent]);

  return (
    <div className="home-page">
      <Header />
      {/* 移动端标签切换 */}
      <div className="mobile-tabs">
        <button
          className={`mobile-tab-btn ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          ✏️ 输入
        </button>
        <button
          className={`mobile-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ 预览
        </button>
      </div>
      <div className="main-content">
        <div className={`left-panel ${activeTab !== 'input' ? 'hidden' : ''}`}>
          <InputPanel
            onContentChange={handleContentChange}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
        <div className={`right-panel ${activeTab !== 'preview' ? 'hidden' : ''}`}>
          {error && (
            <ErrorMessage
              message={error}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />
          )}
          
          <PreviewPanel
            htmlContent={htmlContent}
            isStreaming={isStreaming}
            onContentEdit={handlePreviewEdit}
          />
        </div>
      </div>
    </div>
  );
};