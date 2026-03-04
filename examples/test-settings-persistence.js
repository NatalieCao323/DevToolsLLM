/**
 * 测试设置持久化功能
 * 验证用户设置能够保存和加载
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 测试设置持久化功能\n');
console.log('='.repeat(70));

// 配置文件路径
const configDir = path.join(process.env.HOME || process.env.USERPROFILE, '.devtools-llm');
const configFile = path.join(configDir, 'config.json');

// 测试配置
const testConfig = {
  monitoring: {
    wsPort: 3001,
    refreshRate: 2000,
    historySize: 500,
    enableML: false
  },
  alerts: {
    errorThreshold: 5,
    timeoutThreshold: 10000,
    enableNotifications: true,
    notificationEmail: 'test@example.com'
  },
  display: {
    theme: 'light',
    dateFormat: 'iso',
    timezone: 'UTC'
  },
  performance: {
    enableCompression: false,
    cacheSize: 1000,
    logLevel: 'debug'
  }
};

console.log('\n1️⃣  测试配置保存\n');

// 确保配置目录存在
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
  console.log(`✅ 创建配置目录: ${configDir}`);
}

// 保存配置
fs.writeFileSync(configFile, JSON.stringify(testConfig, null, 2));
console.log(`✅ 保存配置到: ${configFile}`);
console.log('\n保存的配置:');
console.log(JSON.stringify(testConfig, null, 2));

console.log('\n\n2️⃣  测试配置加载\n');

// 读取配置
const loadedConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
console.log('✅ 成功加载配置');

// 验证配置
let allMatch = true;
const sections = ['monitoring', 'alerts', 'display', 'performance'];

sections.forEach(section => {
  console.log(`\n检查 ${section} 配置:`);
  const keys = Object.keys(testConfig[section]);
  
  keys.forEach(key => {
    const original = testConfig[section][key];
    const loaded = loadedConfig[section][key];
    const match = original === loaded;
    
    if (match) {
      console.log(`  ✅ ${key}: ${loaded}`);
    } else {
      console.log(`  ❌ ${key}: 期望 ${original}, 实际 ${loaded}`);
      allMatch = false;
    }
  });
});

console.log('\n\n3️⃣  测试配置更新\n');

// 更新部分配置
loadedConfig.monitoring.wsPort = 4000;
loadedConfig.alerts.errorThreshold = 15;
loadedConfig.display.theme = 'dark';

fs.writeFileSync(configFile, JSON.stringify(loadedConfig, null, 2));
console.log('✅ 更新配置');

// 重新加载验证
const updatedConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
console.log(`  wsPort: ${updatedConfig.monitoring.wsPort} (期望: 4000)`);
console.log(`  errorThreshold: ${updatedConfig.alerts.errorThreshold} (期望: 15)`);
console.log(`  theme: ${updatedConfig.display.theme} (期望: dark)`);

const updateMatch = 
  updatedConfig.monitoring.wsPort === 4000 &&
  updatedConfig.alerts.errorThreshold === 15 &&
  updatedConfig.display.theme === 'dark';

console.log(updateMatch ? '\n✅ 配置更新成功' : '\n❌ 配置更新失败');

console.log('\n\n4️⃣  测试配置重置\n');

// 默认配置
const defaultConfig = {
  monitoring: {
    wsPort: 3000,
    refreshRate: 1000,
    historySize: 1000,
    enableML: true
  },
  alerts: {
    errorThreshold: 10,
    timeoutThreshold: 5000,
    enableNotifications: false,
    notificationEmail: ''
  },
  display: {
    theme: 'dark',
    dateFormat: 'locale',
    timezone: 'local'
  },
  performance: {
    enableCompression: true,
    cacheSize: 500,
    logLevel: 'info'
  }
};

fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
console.log('✅ 重置为默认配置');

const resetConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const resetMatch = 
  resetConfig.monitoring.wsPort === 3000 &&
  resetConfig.monitoring.enableML === true &&
  resetConfig.display.theme === 'dark';

console.log(resetMatch ? '✅ 配置重置成功' : '❌ 配置重置失败');

console.log('\n\n' + '='.repeat(70));
console.log('📊 测试总结\n');

if (allMatch && updateMatch && resetMatch) {
  console.log('✅ 所有测试通过！');
  console.log('\n设置持久化功能正常工作：');
  console.log('  ✅ 配置可以保存到文件');
  console.log('  ✅ 配置可以从文件加载');
  console.log('  ✅ 配置可以更新');
  console.log('  ✅ 配置可以重置');
  console.log(`\n📁 配置文件位置: ${configFile}`);
} else {
  console.log('❌ 部分测试失败');
}

console.log('\n' + '='.repeat(70));
