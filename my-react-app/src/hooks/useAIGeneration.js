/**
 * AI 内容生成的自定义 Hook
 */

import { useState, useCallback } from 'react';
import { generateContentStream, optimizeContent } from '../services/aiService';

export const useAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(''); // HTML 内容

  /**
   * 流式生成 HTML（实时输出，累积所有片段）
   */
  const generateStream = useCallback(async (formData, onUpdate) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');

    try {
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // 每100ms更新一次
      let pendingHtml = '';
      
      // 调用流式生成服务，传入进度回调
      const result = await generateContentStream(formData, (accumulatedHtml) => {
        pendingHtml = accumulatedHtml;
        const now = Date.now();
        
        // 节流：每100ms更新一次
        if (now - lastUpdateTime >= UPDATE_INTERVAL) {
          // 更新生成的内容
          setGeneratedContent(accumulatedHtml);
          // 回调给外部组件
          onUpdate?.(accumulatedHtml);
          lastUpdateTime = now;
        }
      });
      
      // 确保最后一次更新被应用
      if (pendingHtml) {
        setGeneratedContent(pendingHtml);
        onUpdate?.(pendingHtml);
      }

      if (result.success) {
        setGeneratedContent(result.html);
        onUpdate?.(result.html);
        return result.html;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '流式生成失败');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * 优化内容
   */
  const optimize = useCallback(async (html, type) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await optimizeContent(html, type);
      
      if (result.success) {
        setGeneratedContent(result.html);
        return result.html;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || '优化失败');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setIsGenerating(false);
    setError(null);
    setGeneratedContent('');
  }, []);

  return {
    isGenerating,
    error,
    generatedContent,
    generateStream,
    optimize,
    reset,
  };
};