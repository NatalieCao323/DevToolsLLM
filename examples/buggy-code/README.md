# 故意写错的代码示例

这个目录包含了各种常见的 bug 示例，用于演示 DevToolsLLM 的自动修复功能。

## 📁 文件说明

### 1. `timeout-bug.js` - 超时和重试相关的 bug
包含 10 个常见的超时和错误处理问题：
- ❌ 没有设置超时时间
- ❌ 没有重试机制
- ❌ 并发请求太多
- ❌ 没有错误处理
- ❌ 内存泄漏（定时器未清理）
- ❌ 竞态条件
- ❌ 没有验证输入
- ❌ 硬编码 API Key
- ❌ 没有处理大数据量
- ❌ 回调地狱

### 2. `rate-limit-bug.js` - 速率限制相关的 bug
包含 10 个 API 调用和成本优化问题：
- ❌ 没有速率限制控制
- ❌ 遇到 429 就放弃
- ❌ 固定间隔重试（应该指数退避）
- ❌ 没有队列管理
- ❌ 使用昂贵模型做简单任务
- ❌ 没有缓存重复请求
- ❌ Token 数量没有限制
- ❌ 错误的批处理策略
- ❌ 没有监控成本
- ❌ 在循环中调用 API

### 3. `auth-bug.js` - 认证和安全相关的 bug
包含 15 个安全漏洞：
- ❌ API Key 硬编码
- ❌ 密码明文存储
- ❌ JWT Token 没有过期时间
- ❌ 使用弱密钥
- ❌ 没有验证 Token
- ❌ SQL 注入风险
- ❌ 没有速率限制的登录接口
- ❌ Session 没有过期
- ❌ 权限检查不完整
- ❌ CORS 配置过于宽松
- ❌ 敏感信息泄露
- ❌ 没有 HTTPS 检查
- ❌ 弱随机数生成
- ❌ 没有二次验证
- ❌ OAuth 回调没有验证 state

## 🧪 如何测试

运行自动修复演示：

```bash
cd /Users/caoqt1/.openclaw/workspace/DevToolsLLM
node examples/test-autofix.js
```

这会展示 DevToolsLLM 如何：
1. 识别错误类型
2. 分析根本原因
3. 生成修复建议
4. 提供可执行的代码示例

## 💡 学习要点

这些 bug 示例展示了：

### 性能问题
- 超时设置
- 重试策略
- 并发控制
- 资源清理

### 成本优化
- 模型选择
- 请求缓存
- 批处理策略
- Token 限制

### 安全问题
- 密钥管理
- 认证授权
- 数据验证
- 安全配置

## 🔧 DevToolsLLM 能做什么

对于这些 bug，DevToolsLLM 会：

1. **自动识别** - 检测错误类型和严重程度
2. **根因分析** - 找出问题的根本原因
3. **生成修复** - 提供可执行的代码修复方案
4. **评估置信度** - 告诉你修复的可靠性
5. **估算工作量** - 评估修复需要的时间

## 📊 修复示例

### 超时错误修复

**原始代码（有 bug）：**
```javascript
const response = await axios.get(url);
```

**DevToolsLLM 建议：**
```javascript
const response = await axios.get(url, {
  timeout: 30000,
  retry: 3,
  retryDelay: 1000
});
```

### 速率限制修复

**原始代码（有 bug）：**
```javascript
const promises = items.map(item => callAPI(item));
await Promise.all(promises);
```

**DevToolsLLM 建议：**
```javascript
const pLimit = require('p-limit');
const limit = pLimit(5); // 限制并发数
const promises = items.map(item => limit(() => callAPI(item)));
await Promise.all(promises);
```

### 认证错误修复

**原始代码（有 bug）：**
```javascript
const API_KEY = 'sk-1234567890';
```

**DevToolsLLM 建议：**
```javascript
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}
```

## 🎯 使用场景

这些示例适合：
- 学习常见的编程错误
- 测试自动修复工具
- 代码审查培训
- 安全意识教育

## ⚠️ 警告

**不要在生产环境使用这些代码！**

这些都是故意写错的示例，仅用于演示和学习目的。

---

**创建时间：** 2026-03-04  
**用途：** DevToolsLLM 功能演示
