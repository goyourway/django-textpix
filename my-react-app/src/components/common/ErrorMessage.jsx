import React from 'react';
import './ErrorMessage.css';

export const ErrorMessage = ({ message, onRetry, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">生成失败</h4>
        <p className="error-text">{message}</p>
        <div className="error-actions">
          {onRetry && (
            <button className="error-btn retry-btn" onClick={onRetry}>
              🔄 重试
            </button>
          )}
          {onDismiss && (
            <button className="error-btn dismiss-btn" onClick={onDismiss}>
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
};