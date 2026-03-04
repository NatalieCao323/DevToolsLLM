// 认证和授权相关的 bug 示例

// Bug 1: API Key 硬编码
const API_KEY = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';

function getAPIKey() {
  // 问题：密钥硬编码在代码中，会被提交到 Git
  return API_KEY;
}

// Bug 2: 密码明文存储
const users = [
  { username: 'admin', password: 'admin123' },  // 问题：明文密码
  { username: 'user', password: 'password' }
];

function authenticate(username, password) {
  const user = users.find(u => u.username === username);
  // 问题：直接比较明文密码
  return user && user.password === password;
}

// Bug 3: JWT Token 没有过期时间
const jwt = require('jsonwebtoken');

function generateToken(userId) {
  // 问题：没有设置过期时间，token 永久有效
  return jwt.sign({ userId }, 'super-secret-key');
}

// Bug 4: 使用弱密钥
function createToken(data) {
  // 问题：密钥太简单，容易被破解
  return jwt.sign(data, '123456');
}

// Bug 5: 没有验证 Token
function protectedRoute(req, res) {
  const token = req.headers.authorization;
  
  // 问题：直接使用 token，没有验证
  const decoded = jwt.decode(token);
  
  return { userId: decoded.userId };
}

// Bug 6: SQL 注入风险
function getUserByUsername(username) {
  const db = require('./db');
  
  // 问题：直接拼接 SQL，有注入风险
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  return db.query(query);
}

// Bug 7: 没有速率限制的登录接口
const loginAttempts = {};

function login(username, password) {
  // 问题：没有限制登录尝试次数，容易被暴力破解
  const user = users.find(u => u.username === username);
  
  if (user && user.password === password) {
    return generateToken(user.id);
  }
  
  return null;
}

// Bug 8: Session 没有过期
const sessions = new Map();

function createSession(userId) {
  const sessionId = Math.random().toString(36);
  
  // 问题：session 永不过期，内存泄漏
  sessions.set(sessionId, { userId, createdAt: Date.now() });
  
  return sessionId;
}

// Bug 9: 权限检查不完整
function deleteUser(currentUserId, targetUserId) {
  // 问题：只检查是否登录，没有检查权限
  if (!currentUserId) {
    throw new Error('Not authenticated');
  }
  
  // 任何登录用户都能删除任何用户！
  return db.delete('users', targetUserId);
}

// Bug 10: CORS 配置过于宽松
function setupCORS(app) {
  app.use((req, res, next) => {
    // 问题：允许所有来源，不安全
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });
}

// Bug 11: 敏感信息泄露
function getUserProfile(userId) {
  const user = users.find(u => u.id === userId);
  
  // 问题：返回了密码等敏感信息
  return user;
}

// Bug 12: 没有 HTTPS 检查
function handlePayment(req, res) {
  const { cardNumber, cvv } = req.body;
  
  // 问题：没有强制 HTTPS，敏感数据可能被窃听
  processPayment(cardNumber, cvv);
}

// Bug 13: 弱随机数生成
function generateResetToken() {
  // 问题：Math.random() 不够安全，可预测
  return Math.random().toString(36).substring(7);
}

// Bug 14: 没有二次验证
function changePassword(userId, newPassword) {
  // 问题：修改密码不需要输入旧密码
  users.find(u => u.id === userId).password = newPassword;
}

// Bug 15: OAuth 回调没有验证 state
function handleOAuthCallback(code, state) {
  // 问题：没有验证 state 参数，容易被 CSRF 攻击
  const token = exchangeCodeForToken(code);
  return token;
}

module.exports = {
  getAPIKey,
  authenticate,
  generateToken,
  createToken,
  protectedRoute,
  getUserByUsername,
  login,
  createSession,
  deleteUser,
  setupCORS,
  getUserProfile,
  handlePayment,
  generateResetToken,
  changePassword,
  handleOAuthCallback
};
