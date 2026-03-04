# 📦 发布 DevToolsLLM v0.3.0 到 npm

## 🚀 发布步骤

### 1. 登录 npm（如果还没登录）

```bash
npm login
```

输入你的 npm 账号信息：
- Username
- Password
- Email
- 2FA code（如果启用了）

### 2. 发布 Beta 版本（推荐）

```bash
npm publish --tag beta
```

这会发布为 `devtools-llm@0.3.0-beta`，用户需要明确指定才能安装：

```bash
npm install devtools-llm@beta
```

### 3. 测试 Beta 版本

```bash
# 在另一个目录测试安装
mkdir test-install
cd test-install
npm install devtools-llm@beta

# 测试 CLI
npx devtools-llm --version

# 测试模块导入
node -e "const m = require('devtools-llm'); console.log(Object.keys(m));"
```

### 4. 收集反馈（1-2 周）

- 在 GitHub 创建 Discussion
- 在 Reddit/Twitter 分享
- 收集用户反馈和 bug 报告

### 5. 发布正式版本

如果 beta 测试顺利，移除 beta 标签：

```bash
npm dist-tag add devtools-llm@0.3.0 latest
```

或者直接发布正式版：

```bash
npm publish
```

---

## 📋 发布前检查清单

- ✅ 所有测试通过（npm test）
- ✅ package.json 版本正确（0.3.0）
- ✅ README.md 完整
- ✅ .npmignore 配置正确
- ✅ 所有代码已提交到 Git
- ✅ 创建 Git tag（v0.3.0）

---

## 🏷️ 创建 GitHub Release

```bash
# 创建并推送 tag
git tag -a v0.3.0 -m "Release v0.3.0 - AI-powered debugging tools"
git push origin v0.3.0
```

然后在 GitHub 上：
1. 进入 Releases 页面
2. 点击 "Draft a new release"
3. 选择 tag v0.3.0
4. 标题：DevToolsLLM v0.3.0 - AI-Powered LLM Debugging
5. 描述：复制 RELEASE_NOTES.md 的内容
6. 发布

---

## 📢 推广渠道

### Reddit
- r/javascript - "Show r/javascript: DevToolsLLM - AI-powered debugging for LLM apps"
- r/LangChain - "DevToolsLLM: Debug your LangChain apps with AI"
- r/MachineLearning - "Open source tool for debugging LLM applications"

### Hacker News
标题：Show HN: DevToolsLLM – AI-powered debugging and cost optimization for LLM apps

### Twitter/X
```
🚀 Launching DevToolsLLM v0.3.0!

✨ AI-powered auto-fix suggestions
💰 Save 20-50% on LLM costs
⏰ Time-travel debugging
🆓 100% free, local-first

Perfect for debugging LangChain, OpenAI, and other LLM apps.

npm install devtools-llm

#AI #LLM #OpenSource
```

### Product Hunt
准备：
- 产品描述
- 截图/GIF
- Logo
- 标语："AI-powered debugging tools for LLM applications"

---

## 📊 监控指标

发布后关注：
- npm 下载量
- GitHub Stars
- Issues/PRs
- 用户反馈

---

## 🐛 如果出现问题

### 撤销发布（24小时内）
```bash
npm unpublish devtools-llm@0.3.0
```

### 发布补丁版本
```bash
# 修复 bug
npm version patch  # 0.3.0 -> 0.3.1
npm publish
```

---

## 📞 需要帮助？

- npm 文档：https://docs.npmjs.com/cli/v10/commands/npm-publish
- GitHub Releases：https://docs.github.com/en/repositories/releasing-projects-on-github

---

**准备好了吗？运行：**

```bash
npm publish --tag beta
```

🎉 祝发布顺利！
