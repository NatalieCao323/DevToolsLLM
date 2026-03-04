// 真实场景：async/await 错误处理问题
// 来源：常见的 Stack Overflow 问题

// Bug 1: 忘记 await，导致 Promise pending
async function getUserData(userId) {
  const response = fetch(`https://api.example.com/users/${userId}`);
  // 问题：忘记 await，response 是 Promise 而不是实际数据
  return response.json();
}

// Bug 2: try-catch 无法捕获 Promise rejection
function processData() {
  try {
    const data = getUserData(123); // 没有 await
    console.log(data); // 打印 Promise { <pending> }
  } catch (error) {
    // 这里永远不会执行，因为 Promise rejection 不会被 try-catch 捕获
    console.error('Error:', error);
  }
}

// Bug 3: 并行请求但没有错误处理
async function fetchMultipleUsers(userIds) {
  // 问题：如果任何一个请求失败，整个 Promise.all 都会失败
  const promises = userIds.map(id => 
    fetch(`https://api.example.com/users/${id}`).then(r => r.json())
  );
  
  return await Promise.all(promises);
}

// Bug 4: 在循环中使用 async/await 但没有处理错误
async function updateUsers(users) {
  for (const user of users) {
    // 问题：如果某个更新失败，整个循环就停止了
    await fetch(`https://api.example.com/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user)
    });
  }
}

// Bug 5: 混用 async/await 和 .then()
async function mixedApproach(userId) {
  const user = await fetch(`https://api.example.com/users/${userId}`)
    .then(r => r.json())
    .catch(err => {
      // 问题：这里的错误处理不会影响外层的 async 函数
      console.error(err);
      return null;
    });
  
  // 如果上面失败了，user 是 null，但没有抛出错误
  return user.name; // 可能会报错：Cannot read property 'name' of null
}

// Bug 6: async 函数中返回 Promise 但没有 await
async function getAndProcess(userId) {
  // 问题：返回了 Promise 而不是实际值
  return fetch(`https://api.example.com/users/${userId}`)
    .then(r => r.json());
}

// Bug 7: 忘记处理 rejected Promise
async function dangerousOperation() {
  const promise = fetch('https://api.example.com/data');
  
  // 做其他事情...
  await someOtherOperation();
  
  // 问题：如果 promise 在这期间 reject 了，会有 unhandled rejection
  const data = await promise;
  return data;
}

// Bug 8: 在 forEach 中使用 async
async function processItems(items) {
  // 问题：forEach 不会等待 async 函数完成
  items.forEach(async (item) => {
    await processItem(item);
  });
  
  console.log('All done!'); // 实际上还没完成
}

// Bug 9: 错误的错误传播
async function chainedOperations() {
  try {
    const data = await fetchData();
    const processed = await processData(data);
    return processed;
  } catch (error) {
    // 问题：只是 log 了错误，但没有重新抛出
    console.error('Error:', error);
    // 函数返回 undefined 而不是抛出错误
  }
}

// Bug 10: 竞态条件
let cachedData = null;

async function getCachedData() {
  if (!cachedData) {
    // 问题：如果多次调用，会发起多个请求
    cachedData = await fetch('https://api.example.com/data').then(r => r.json());
  }
  return cachedData;
}

module.exports = {
  getUserData,
  processData,
  fetchMultipleUsers,
  updateUsers,
  mixedApproach,
  getAndProcess,
  dangerousOperation,
  processItems,
  chainedOperations,
  getCachedData
};
