# 📝 自媒体内容生成器

一个现代化的自媒体内容创作工具，支持实时 Markdown 编辑和预览。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.2.3-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 特性

- 🎨 **美观的界面设计** - 渐变色主题，现代化 UI
- 📝 **实时 Markdown 编辑** - 支持 GitHub Flavored Markdown
- 👁️ **即时预览** - 左侧编辑，右侧实时预览
- 📷 **图片上传** - 支持多图上传和预览
- 🔄 **智能交互** - 内容生成后自动展开编辑器
- 📱 **响应式设计** - 完美适配桌面、平板和移动设备

## 🚀 快速开始

### 前置要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装和启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

### Windows 快速启动

双击 `start.bat` 文件即可启动项目。

浏览器会自动打开 http://localhost:3000

## 📖 完整文档

- [📘 快速开始指南](./QUICK_START.md) - 5分钟上手教程
- [📗 功能详解](./FEATURES.md) - 完整功能说明
- [📙 开发者指南](./DEVELOPER_GUIDE.md) - 代码结构和开发规范
- [📕 故障排除](./TROUBLESHOOTING.md) - 常见问题解决方案
- [📔 项目总结](./PROJECT_SUMMARY.md) - 项目概览和规划

## 🎯 使用方法

### 1. 输入内容
在左侧面板输入标题、主题、内容描述，并可上传图片

### 2. 生成内容
点击「✨ 生成内容」按钮，系统会自动生成 Markdown 内容

### 3. 编辑和预览
在 Markdown 编辑器中修改内容，右侧预览会实时更新

### 4. 保存和导出
使用右上角的按钮保存、导出或分享内容

## 🛠️ 技术栈

- **前端框架**: React 19.2.3
- **Markdown 解析**: react-markdown + remark-gfm
- **样式**: 纯 CSS3
- **构建工具**: Create React App

## 📁 项目结构

```
my-react-app/
├── src/
│   ├── components/       # 组件
│   │   └── common/      # Header, InputPanel, PreviewPanel
│   ├── pages/           # HomePage
│   └── App.js           # 应用入口
├── public/              # 静态资源
└── docs/                # 完整文档
```

## 📜 可用脚本

### `npm start`

启动开发服务器。\
在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

修改代码后页面会自动重新加载。\
控制台会显示代码检查错误。

### `npm test`

启动测试运行器。\
查看 [运行测试文档](https://facebook.github.io/create-react-app/docs/running-tests) 了解更多。

### `npm run build`

构建生产版本到 `build` 文件夹。\
代码会被优化和压缩以获得最佳性能。

文件名包含哈希值。\
应用已准备好部署！

查看 [部署文档](https://facebook.github.io/create-react-app/docs/deployment) 了解更多。

## 🐛 问题反馈

如果遇到问题：

1. 查看 [故障排除文档](./TROUBLESHOOTING.md)
2. 搜索已知问题
3. 提交新的 Issue

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2024-01-21)

- ✨ 初始版本发布
- ✅ 完整的输入和预览功能
- ✅ Markdown 编辑器
- ✅ 图片上传功能
- ✅ 响应式设计
- ✅ 完善的文档

## 🔮 未来计划

- [ ] AI 内容生成集成
- [ ] 用户认证系统
- [ ] 云端存储
- [ ] 模板库
- [ ] PDF/Word 导出
- [ ] 协作编辑

## 📄 许可证

MIT License

## 🙏 致谢

本项目基于 [Create React App](https://github.com/facebook/create-react-app) 构建。

感谢所有开源项目的贡献者！

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
