// 速率限制相关的 bug 示例

const OpenAI = require('openai');

// Bug 1: 没有速率限制控制，疯狂调用 API
async function generateManyResponses(prompts) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：同时发起 100 个请求，会立即触发 429 错误
  const promises = prompts.map(prompt =>
    openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })
  );
  
  return Promise.all(promises);
}

// Bug 2: 遇到 429 就放弃，不重试
async function callAPI(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    });
    return response;
  } catch (error) {
    // 问题：遇到速率限制就直接抛出错误，不尝试重试
    if (error.status === 429) {
      throw new Error('Rate limit exceeded, giving up');
    }
    throw error;
  }
}

// Bug 3: 重试逻辑有问题 - 固定间隔，没有指数退避
async function retryWithFixedDelay(prompt, maxRetries = 3) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }]
      });
    } catch (error) {
      if (error.status === 429) {
        // 问题：每次都等 1 秒，应该用指数退避
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Bug 4: 没有队列管理，请求无序
const pendingRequests = [];

async function queueRequest(prompt) {
  // 问题：只是把请求加入数组，没有真正的队列处理逻辑
  pendingRequests.push(prompt);
  
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
}

// Bug 5: 使用昂贵的模型做简单任务
async function simpleClassification(text) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：用 GPT-4 做简单分类，应该用 GPT-3.5-turbo
  const response = await openai.chat.completions.create({
    model: 'gpt-4',  // 贵 20 倍！
    messages: [
      { role: 'user', content: `Classify this as positive or negative: ${text}` }
    ]
  });
  
  return response.choices[0].message.content;
}

// Bug 6: 没有缓存重复请求
async function translate(text, targetLang) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：相同的文本会重复翻译，浪费钱
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: `Translate to ${targetLang}: ${text}` }
    ]
  });
  
  return response.choices[0].message.content;
}

// Bug 7: Token 数量没有限制
async function generateLongContent(topic) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // 问题：没有设置 max_tokens，可能生成超长内容，费用失控
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: `Write a comprehensive guide about ${topic}` }
    ]
    // 缺少 max_tokens 限制
  });
  
  return response.choices[0].message.content;
}

// Bug 8: 错误的批处理策略
async function processBatch(items) {
  const results = [];
  
  // 问题：串行处理，太慢；应该批量但控制并发
  for (const item of items) {
    const result = await callAPI(item);
    results.push(result);
  }
  
  return results;
}

// Bug 9: 没有监控成本
let totalCost = 0;

async function expensiveOperation(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  
  // 问题：虽然记录了成本，但没有告警机制
  totalCost += 0.03; // 假设每次 $0.03
  
  return response;
}

// Bug 10: 在循环中调用 API
async function analyzeMultipleDocuments(documents) {
  const analyses = [];
  
  // 问题：在循环中调用 API，没有批处理
  for (const doc of documents) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: `Analyze: ${doc}` }]
    });
    analyses.push(response.choices[0].message.content);
  }
  
  return analyses;
}

module.exports = {
  generateManyResponses,
  callAPI,
  retryWithFixedDelay,
  queueRequest,
  simpleClassification,
  translate,
  generateLongContent,
  processBatch,
  expensiveOperation,
  analyzeMultipleDocuments
};
