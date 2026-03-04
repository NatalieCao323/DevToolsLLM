// 这个文件故意写了很多 bug，用来测试 DevToolsLLM 的自动修复功能

const axios = require('axios');

// Bug 1: 没有设置超时时间，会一直等待
async function fetchUserData(userId) {
  try {
    // 问题：没有 timeout 配置，如果服务器无响应会永久挂起
    const response = await axios.get(`https://api.example.com/users/${userId}`);
    return response.data;
  } catch (error) {
    console.log('Error:', error.message);
    throw error;
  }
}

// Bug 2: 没有重试机制，一次失败就放弃
async function searchDatabase(query) {
  // 问题：网络抖动或临时故障会导致失败，应该重试
  const result = await fetch('https://db.example.com/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  return result.json();
}

// Bug 3: 并发请求太多，容易触发速率限制
async function batchProcess(items) {
  // 问题：同时发起 1000 个请求，会被 API 限流
  const promises = items.map(item => 
    fetch(`https://api.example.com/process/${item}`)
  );
  
  return Promise.all(promises);
}

// Bug 4: 没有错误处理，一个失败全部失败
async function processMultipleUsers(userIds) {
  const results = [];
  
  // 问题：如果某个用户数据获取失败，整个流程就中断了
  for (const userId of userIds) {
    const data = await fetchUserData(userId);
    results.push(data);
  }
  
  return results;
}

// Bug 5: 内存泄漏 - 没有清理定时器
function startPolling(callback) {
  // 问题：setInterval 没有被清理，会一直运行
  setInterval(async () => {
    const data = await fetchUserData(123);
    callback(data);
  }, 1000);
  
  // 没有返回清理函数
}

// Bug 6: 竞态条件
let cachedData = null;
let isLoading = false;

async function getCachedData() {
  // 问题：多个并发调用会导致重复请求
  if (!cachedData && !isLoading) {
    isLoading = true;
    cachedData = await fetchUserData(1);
    isLoading = false;
  }
  return cachedData;
}

// Bug 7: 没有验证输入
async function deleteUser(userId) {
  // 问题：没有验证 userId，可能传入 undefined 或非法值
  await fetch(`https://api.example.com/users/${userId}`, {
    method: 'DELETE'
  });
}

// Bug 8: 硬编码的 API Key（安全问题）
async function authenticatedRequest() {
  // 问题：API Key 不应该硬编码在代码中
  const apiKey = 'sk-1234567890abcdef';
  
  return fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
}

// Bug 9: 没有处理大数据量
async function loadAllUsers() {
  // 问题：如果有 100 万用户，会把内存撑爆
  const response = await fetch('https://api.example.com/users');
  const allUsers = await response.json();
  
  return allUsers;
}

// Bug 10: 回调地狱（虽然用了 async/await，但逻辑混乱）
async function complexOperation(data) {
  return new Promise((resolve, reject) => {
    fetchUserData(data.userId).then(user => {
      searchDatabase(user.name).then(results => {
        batchProcess(results).then(processed => {
          resolve(processed);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}

module.exports = {
  fetchUserData,
  searchDatabase,
  batchProcess,
  processMultipleUsers,
  startPolling,
  getCachedData,
  deleteUser,
  authenticatedRequest,
  loadAllUsers,
  complexOperation
};
