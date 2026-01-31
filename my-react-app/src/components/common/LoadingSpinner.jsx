import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ progress = 0, message = '正在生成内容...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-wrapper">
        <div className="spinner"></div>
        <div className="spinner-glow"></div>
      </div>
      <p className="loading-message">{message}</p>
      {progress > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};