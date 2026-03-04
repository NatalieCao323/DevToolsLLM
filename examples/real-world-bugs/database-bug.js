// 真实场景：数据库操作中的常见错误

const { Pool } = require('pg');

// Bug 1: 连接池没有错误处理
const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  // 问题：没有设置超时和重试
});

// Bug 2: SQL 注入风险
async function getUserByName(username) {
  // 问题：直接拼接 SQL，有注入风险
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  const result = await pool.query(query);
  return result.rows[0];
}

// Bug 3: 没有释放连接
async function updateUser(userId, data) {
  const client = await pool.connect();
  
  // 问题：如果查询失败，连接不会被释放
  const result = await client.query(
    'UPDATE users SET data = $1 WHERE id = $2',
    [data, userId]
  );
  
  client.release();
  return result;
}

// Bug 4: 事务处理不当
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 问题：如果第二个查询失败，第一个已经执行了
    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );
    
    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );
    
    await client.query('COMMIT');
  } catch (error) {
    // 问题：没有 ROLLBACK
    console.error(error);
  } finally {
    client.release();
  }
}

// Bug 5: N+1 查询问题
async function getUsersWithPosts() {
  const users = await pool.query('SELECT * FROM users');
  
  // 问题：为每个用户单独查询，应该用 JOIN
  for (const user of users.rows) {
    const posts = await pool.query(
      'SELECT * FROM posts WHERE user_id = $1',
      [user.id]
    );
    user.posts = posts.rows;
  }
  
  return users.rows;
}

// Bug 6: 没有处理连接池耗尽
async function manyQueries() {
  const promises = [];
  
  // 问题：同时发起 1000 个查询，会耗尽连接池
  for (let i = 0; i < 1000; i++) {
    promises.push(pool.query('SELECT * FROM users WHERE id = $1', [i]));
  }
  
  return Promise.all(promises);
}

// Bug 7: 没有验证数据
async function createUser(userData) {
  // 问题：没有验证 userData，可能插入非法数据
  const result = await pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [userData.name, userData.email]
  );
  
  return result.rows[0];
}

// Bug 8: 查询超时没有处理
async function slowQuery() {
  // 问题：没有设置查询超时
  const result = await pool.query(`
    SELECT * FROM large_table 
    WHERE complex_condition = true
    ORDER BY expensive_calculation
  `);
  
  return result.rows;
}

// Bug 9: 批量插入效率低
async function insertMany(items) {
  // 问题：逐个插入，应该用批量插入
  for (const item of items) {
    await pool.query(
      'INSERT INTO items (name, value) VALUES ($1, $2)',
      [item.name, item.value]
    );
  }
}

// Bug 10: 没有处理死锁
async function updateWithLock(id1, id2) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 问题：可能导致死锁
    await client.query('SELECT * FROM items WHERE id = $1 FOR UPDATE', [id1]);
    await client.query('SELECT * FROM items WHERE id = $1 FOR UPDATE', [id2]);
    
    // 更新操作...
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getUserByName,
  updateUser,
  transferMoney,
  getUsersWithPosts,
  manyQueries,
  createUser,
  slowQuery,
  insertMany,
  updateWithLock
};
