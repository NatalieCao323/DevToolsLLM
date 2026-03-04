// 真实场景：OpenAI API 使用中的常见错误

const OpenAI = require('openai');

// Bug 1: 没有处理速率限制
async function generateText(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：遇到 429 错误就直接失败
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  
  return response.choices[0].message.content;
}

// Bug 2: 在循环中调用 API，没有速率控制
async function batchGenerate(prompts) {
  const results = [];
  
  // 问题：快速连续调用会触发速率限制
  for (const prompt of prompts) {
    const result = await generateText(prompt);
    results.push(result);
  }
  
  return results;
}

// Bug 3: 没有设置超时
async function longRunningGeneration(prompt) {
  const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY
    // 问题：没有设置 timeout，可能永久挂起
  });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4000 // 可能需要很长时间
  });
  
  return response.choices[0].message.content;
}

// Bug 4: 使用昂贵的模型做简单任务
async function isPositive(text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：用 GPT-4 做简单分类，应该用 GPT-3.5-turbo
  const response = await openai.chat.completions.create({
    model: 'gpt-4', // 贵 20 倍
    messages: [
      { role: 'user', content: `Is this positive or negative: ${text}` }
    ]
  });
  
  return response.choices[0].message.content.includes('positive');
}

// Bug 5: 没有缓存重复请求
async function translate(text, targetLang) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：相同的翻译会重复调用 API
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: `Translate to ${targetLang}: ${text}` }
    ]
  });
  
  return response.choices[0].message.content;
}

// Bug 6: 没有限制 token 数量
async function summarize(longText) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：没有 max_tokens，可能生成超长内容
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: `Summarize: ${longText}` }
    ]
    // 缺少 max_tokens
  });
  
  return response.choices[0].message.content;
}

// Bug 7: 错误的重试逻辑
async function retryGenerate(prompt, maxRetries = 3) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      // 问题：固定延迟，应该用指数退避
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Bug 8: 没有验证 API 响应
async function getCompletion(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  
  // 问题：没有检查 response.choices 是否存在
  return response.choices[0].message.content;
}

// Bug 9: 并发请求过多
async function parallelGenerate(prompts) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：同时发起所有请求，会触发速率限制
  const promises = prompts.map(prompt =>
    openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  );
  
  const responses = await Promise.all(promises);
  return responses.map(r => r.choices[0].message.content);
}

// Bug 10: 没有监控成本
let totalCost = 0;

async function expensiveOperation(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  
  // 问题：虽然记录成本，但没有告警
  totalCost += 0.03;
  
  return response.choices[0].message.content;
}

module.exports = {
  generateText,
  batchGenerate,
  longRunningGeneration,
  isPositive,
  translate,
  summarize,
  retryGenerate,
  getCompletion,
  parallelGenerate,
  expensiveOperation
};
