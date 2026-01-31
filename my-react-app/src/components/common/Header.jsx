import React from 'react';
import './Header.css';

export const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo">Red Generator</h1>
        </div>
        {/* 导航功能待开发
        <nav className="header-nav">
          <button className="nav-btn">首页</button>
          <button className="nav-btn">我的作品</button>
          <button className="nav-btn">模板库</button>
          <button className="nav-btn">设置</button>
        </nav>
        */}
        <div className="header-right">
          <button className="user-btn">Login</button>
        </div>
      </div>
    </header>
  );
};
