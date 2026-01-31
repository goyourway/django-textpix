import React, { useState } from 'react';
import './InputPanel.css';
import { TemplateType } from '../../utils/renderers';

export const InputPanel = ({ 
  onContentChange, 
  onGenerate,
  isGenerating = false
}) => {
  const [formData, setFormData] = useState({
    theme: '',
    content: '',
    images: [],
    templateType: TemplateType.NORMAL
  });



  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
  };



  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    const newImages = [...formData.images, ...imageUrls];
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="input-panel">
      <div className="panel-header">
        <h2>内容配置</h2>
      </div>

      <div className="input-section">
        <label className="input-label">主题/关键词</label>
        <input
          type="text"
          className="input-field"
          placeholder="例如：科技、健康、旅游..."
          value={formData.theme}
          onChange={(e) => handleInputChange('theme', e.target.value)}
        />
      </div>

      <div className="input-section">
        <label className="input-label">内容描述</label>
        <textarea
          className="textarea-field"
          placeholder="请输入内容描述或要点..."
          rows="6"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
        />
      </div>

      <div className="input-section">
        <label className="input-label">模板类型</label>
        <select
          className="select-field"
          value={formData.templateType}
          onChange={(e) => handleInputChange('templateType', e.target.value)}
        >
          <option value={TemplateType.NORMAL}>普通文章</option>
          <option value={TemplateType.WECHAT}>微信聊天</option>
        </select>
      </div>

      <div className="input-section">
        <label className="input-label">上传图片</label>
        <div className="image-upload-area">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="image-upload" className="upload-btn">
            + 上传图片
          </label>
        </div>
        {formData.images.length > 0 && (
          <div className="image-preview-grid">
            {formData.images.map((img, index) => (
              <div key={index} className="image-preview-item">
                <img src={img} alt={`preview-${index}`} />
                <button
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>



      <button 
        className="generate-btn" 
        onClick={() => onGenerate(formData, '')}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="spinner-small"></span>
            正在生成...
          </>
        ) : (
          <>
            立即生成
          </>
        )}
      </button>
    </div>
  );
};