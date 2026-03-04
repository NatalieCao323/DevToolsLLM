# 启动完整 Web UI 指南

## 🎯 系统架构

DevToolsLLM 有两个部分：

### 1. 后端服务器（已运行 ✅）
- **端口：** 3000
- **功能：** WebSocket 数据推送、API 接口
- **状态：** 正在运行，实时生成工具调用数据

### 2. 前端 UI（需要启动）
- **端口：** 5173
- **功能：** 完整的交互界面，包括所有页面和设置
- **包含：** Dashboard, Error Analysis, Trace Viewer, Settings, Parameter Validation

---

## 🚀 启动完整 UI

### 在新终端运行：

```bash
cd /Users/caoqt1/.openclaw/workspace/DevToolsLLM
npm run dev:frontend
```

### 然后访问：
```
http://localhost:5173
```

---

## 📱 完整 UI 包含的所有页面

### 1. Dashboard（仪表盘）
- 实时统计卡片
- 最近调用列表
- 工具调用链可视化
- WebSocket 连接状态

### 2. Error Analysis（错误分析）
- 错误类型分布图表
- 最近错误列表
- AI 生成的修复建议
- 时间范围过滤器（1h/24h/7d/30d）

### 3. Trace Viewer（追踪查看）
- 工具调用历史
- 交互式调用树
- 性能时间线
- 状态过滤（All/Success/Error）

### 4. Parameter Validation（参数验证）
- JSON Schema 编辑器
- 实时参数验证
- 错误高亮显示
- 示例加载

### 5. Settings（设置）⚙️
**这就是你问的设置页面！**

包含 4 个配置部分：

#### 监控配置
- WebSocket 端口
- 刷新频率
- 历史记录大小
- 启用 ML 功能

#### 告警配置
- 错误阈值
- 超时阈值
- 启用通知
- 通知邮箱

#### 显示设置
- 主题（Dark/Light）
- 日期格式
- 时区

#### 性能设置
- 启用压缩
- 缓存大小
- 日志级别

**所有设置都会保存到：** `~/.devtools-llm/config.json`

---

## 🔄 数据流

```
工具调用发生
    ↓
后端服务器 (localhost:3000)
    ↓ WebSocket
前端 UI (localhost:5173)
    ↓
实时更新所有页面
```

---

## 🎬 当前演示内容

后端正在模拟真实的 LLM 工具调用：
- ✅ search (GPT-4) - 搜索操作
- ✅ analyze (GPT-3.5) - 分析操作
- ✅ translate (Claude-2) - 翻译操作
- ✅ classify (GPT-4) - 分类操作
- ✅ summarize (GPT-4) - 总结操作

每 2-5 秒生成一个新调用，85% 成功率。

---

## 📊 你能做什么

### 在 Dashboard：
- 查看实时统计
- 监控最近调用
- 观察数据实时更新

### 在 Error Analysis：
- 查看错误分类
- 获取 AI 修复建议
- 按时间过滤错误

### 在 Trace Viewer：
- 浏览调用历史
- 展开调用树
- 分析性能

### 在 Settings：
- 修改配置
- 点击 "Save Settings"
- 刷新页面验证保存成功

---

## 🧪 测试交互功能

1. **修改设置**
   - 进入 Settings 页面
   - 修改任意设置（如主题）
   - 点击 "Save Settings"
   - 刷新页面，设置保持

2. **过滤错误**
   - 进入 Error Analysis
   - 点击时间范围按钮
   - 观察数据过滤

3. **查看调用详情**
   - 进入 Trace Viewer
   - 点击任意调用
   - 查看详细信息

---

## 🛑 停止服务

```bash
# 停止后端服务器
Ctrl+C（在运行 realtime-demo.js 的终端）

# 停止前端
Ctrl+C（在运行 npm run dev:frontend 的终端）
```

---

## 💡 提示

- 后端和前端需要**同时运行**才能看到完整功能
- 后端提供数据，前端提供交互界面
- 所有设置和交互都是真实的，不是模拟
