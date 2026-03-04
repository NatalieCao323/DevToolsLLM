# LLM 集成指南 - AI 增强的自动修复

## 概述

DevToolsLLM 提供两种自动修复模式：

1. **基础模式（默认）** - 完全免费，基于规则引擎
2. **LLM 增强模式（可选）** - 使用 AI 模型生成更智能的建议

---

## 基础模式（推荐新手）

### 特点
- ✅ 完全免费
- ✅ 无需配置
- ✅ 即时响应
- ✅ 隐私安全
- ✅ 离线可用

### 使用方法

```javascript
const { AutoFixSuggester } = require('devtools-llm');

const fixer = new AutoFixSuggester();
const result = await fixer.suggestFix(error, toolCall, history);

console.log(result.fixes);
// [
//   {
//     title: "Implement retry with exponential backoff",
//     code: "async function retry(...) {...}",
//     confidence: 0.9
//   }
// ]
```

---

## LLM 增强模式

### 方案 1：Ollama（推荐 - 完全免费）

**Ollama** 是本地运行的 LLM，完全免费，无需 API Key。

#### 安装 Ollama

```bash
# macOS/Linux
curl https://ollama.ai/install.sh | sh

# Windows
# 从 https://ollama.ai 下载安装包

# 拉取模型（推荐 CodeLlama）
ollama pull codellama
ollama pull deepseek-coder  # 或者这个，更适合代码
```

#### 使用 Ollama

```javascript
const { LLMAutoFixSuggester } = require('devtools-llm');

const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'ollama',
  model: 'codellama',  // 或 'deepseek-coder'
  baseURL: 'http://localhost:11434',  // Ollama 默认端口
  fallbackToRules: true  // 如果 LLM 失败，回退到规则引擎
});

const result = await fixer.suggestFix(error, toolCall, history);
```

**优点：**
- ✅ 完全免费
- ✅ 数据不离开本地
- ✅ 无使用限制
- ✅ 支持多种模型

**缺点：**
- ⚠️ 需要本地硬件资源（建议 8GB+ RAM）
- ⚠️ 响应速度取决于硬件
- ⚠️ 质量可能不如 GPT-4

---

### 方案 2：自部署模型（完全免费）

使用 vLLM、text-generation-webui 等工具部署自己的模型。

#### 使用 vLLM 部署

```bash
# 安装 vLLM
pip install vllm

# 启动模型服务器
python -m vllm.entrypoints.openai.api_server \
  --model deepseek-ai/deepseek-coder-6.7b-instruct \
  --port 8000
```

#### 使用自部署模型

```javascript
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'local',
  model: 'deepseek-coder-6.7b',
  baseURL: 'http://localhost:8000',
  fallbackToRules: true
});
```

---

### 方案 3：OpenAI（付费，最强大）

如果你已经有 OpenAI API Key，可以使用最强大的模型。

#### 配置

```javascript
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'openai',
  model: 'gpt-3.5-turbo',  // 或 'gpt-4'
  apiKey: process.env.OPENAI_API_KEY,  // 从环境变量读取
  fallbackToRules: true
});
```

#### 设置环境变量

```bash
# .env 文件
OPENAI_API_KEY=sk-your-api-key-here

# 或者在命令行
export OPENAI_API_KEY=sk-your-api-key-here
```

**成本估算：**
- gpt-3.5-turbo: ~$0.001 每次修复建议
- gpt-4: ~$0.01 每次修复建议

---

### 方案 4：Anthropic Claude（付费）

```javascript
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',  // 最便宜的选项
  apiKey: process.env.ANTHROPIC_API_KEY,
  fallbackToRules: true
});
```

**成本估算：**
- claude-3-haiku: ~$0.0005 每次修复建议
- claude-3-sonnet: ~$0.005 每次修复建议

---

## 推荐配置

### 个人开发者（免费方案）

```javascript
// 方案 A：只用规则引擎（最简单）
const fixer = new AutoFixSuggester();

// 方案 B：本地 Ollama（更智能）
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'ollama',
  model: 'codellama',
  fallbackToRules: true
});
```

### 小团队（混合方案）

```javascript
// 优先使用免费的 Ollama，失败时回退到规则
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'ollama',
  model: 'deepseek-coder',
  fallbackToRules: true  // 关键！
});
```

### 企业用户（付费方案）

```javascript
// 使用 GPT-4 获得最佳质量
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  fallbackToRules: true
});
```

---

## 对比表格

| 方案 | 成本 | 质量 | 速度 | 隐私 | 设置难度 |
|------|------|------|------|------|----------|
| **规则引擎** | 免费 | 中等 | 极快 | 完美 | 零配置 |
| **Ollama** | 免费 | 良好 | 中等 | 完美 | 简单 |
| **自部署** | 免费* | 良好 | 中等 | 完美 | 中等 |
| **OpenAI** | 付费 | 优秀 | 快 | 一般 | 简单 |
| **Anthropic** | 付费 | 优秀 | 快 | 一般 | 简单 |

*自部署需要硬件成本

---

## 最佳实践

### 1. 始终启用回退机制

```javascript
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'ollama',
  fallbackToRules: true  // 重要！
});
```

### 2. 使用环境变量管理 API Key

```javascript
// ❌ 不要硬编码
const fixer = new LLMAutoFixSuggester({
  apiKey: 'sk-1234567890'  // 危险！
});

// ✅ 使用环境变量
const fixer = new LLMAutoFixSuggester({
  apiKey: process.env.OPENAI_API_KEY
});
```

### 3. 根据场景选择模型

```javascript
// 开发阶段：使用免费的 Ollama
const devFixer = new LLMAutoFixSuggester({
  provider: 'ollama',
  model: 'codellama'
});

// 生产环境：使用更可靠的规则引擎
const prodFixer = new AutoFixSuggester();
```

### 4. 监控成本

```javascript
let totalCost = 0;

const fixer = new LLMAutoFixSuggester({
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  apiKey: process.env.OPENAI_API_KEY
});

// 每次调用后估算成本
const result = await fixer.suggestFix(error, toolCall, history);
totalCost += 0.001; // gpt-3.5-turbo 约 $0.001/次

console.log(`Total cost: $${totalCost.toFixed(4)}`);
```

---

## 常见问题

### Q: 我应该用哪个方案？

**A:** 推荐顺序：
1. **新手/个人** → 规则引擎（零配置）
2. **有硬件** → Ollama（免费 + 智能）
3. **有预算** → OpenAI gpt-3.5-turbo（最佳性价比）
4. **追求极致** → OpenAI gpt-4（最强）

### Q: Ollama 需要什么硬件？

**A:** 
- 最低：8GB RAM，可运行 7B 模型
- 推荐：16GB RAM，可运行 13B 模型
- 理想：32GB RAM + GPU，可运行 34B 模型

### Q: 规则引擎够用吗？

**A:** 对于常见错误（timeout, rate limit, auth, validation），规则引擎已经很好用了。只有遇到复杂或罕见错误时，LLM 才有明显优势。

### Q: 如何确保 API Key 安全？

**A:**
1. 使用环境变量，不要硬编码
2. 不要提交 .env 文件到 Git
3. 使用受限的 API Key（只读权限）
4. 定期轮换 API Key

### Q: LLM 模式会影响性能吗？

**A:**
- 规则引擎：<10ms
- Ollama：1-5 秒（取决于硬件）
- OpenAI API：0.5-2 秒（取决于网络）

建议在开发阶段使用 LLM，生产环境使用规则引擎。

---

## 示例：完整配置

```javascript
const { LLMAutoFixSuggester } = require('devtools-llm');

// 读取配置
const config = {
  llmEnabled: process.env.ENABLE_LLM === 'true',
  provider: process.env.LLM_PROVIDER || 'ollama',
  model: process.env.LLM_MODEL || 'codellama',
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
  fallbackToRules: true
};

const fixer = new LLMAutoFixSuggester(config);

// 使用
try {
  const result = await fixer.suggestFix(error, toolCall, history);
  
  console.log(`Found ${result.fixes.length} fixes`);
  console.log(`Source: ${result.source}`); // 'llm_enhanced' or 'rules'
  
  result.fixes.forEach((fix, i) => {
    console.log(`\n${i + 1}. ${fix.title}`);
    console.log(`   Confidence: ${(fix.confidence * 100).toFixed(0)}%`);
    console.log(`   Effort: ${fix.effort}`);
    console.log(`   Code:\n${fix.code}`);
  });
} catch (err) {
  console.error('Fix suggestion failed:', err);
}
```

---

## 总结

DevToolsLLM 的设计哲学是：

1. **默认免费** - 规则引擎满足 80% 需求
2. **可选增强** - LLM 提供额外 20% 价值
3. **灵活配置** - 支持多种模型和提供商
4. **优雅降级** - 始终有备用方案

你可以从最简单的规则引擎开始，需要时再升级到 LLM 增强模式。
