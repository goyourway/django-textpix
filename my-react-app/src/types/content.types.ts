/**
 * 内容相关的 TypeScript 类型定义
 */

export interface FormData {
  title: string;
  theme: string;
  content: string;
  images: string[];
  markdown?: string;
}

export interface ContentGenerationOptions {
  style: 'professional' | 'casual' | 'creative' | 'technical';
  length: 'short' | 'medium' | 'long';
  language: string;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  streamedContent: string;
}

export const DEFAULT_GENERATION_OPTIONS: ContentGenerationOptions = {
  style: 'professional',
  length: 'medium',
  language: 'zh-CN',
};